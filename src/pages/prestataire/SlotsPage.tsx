/**
 * SlotsPage (Provider)
 *
 * Time slot management page for providers.
 * Allows creating, editing, and deleting availability slots.
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Ban,
} from "lucide-react";

import { formatTime } from "@/lib/utils";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { SlotStatus } from "@/types";
import type { Slot } from "@/types";
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Switch,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess, showError } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared";

// Hooks
import {
  useMySlots,
  useCreateSlot,
  useCreateRecurringSlots,
  useUpdateSlot,
  useDeleteSlot,
} from "@/hooks/useSlots";

// ==========================================
// VALIDATION
// ==========================================

const slotSchema = z
  .object({
    date: z.string().min(1, "Date required"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid format (HH:mm)"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid format (HH:mm)"),
  })
  .refine(
    (data) => {
      const [startH, startM] = data.startTime.split(":").map(Number);
      const [endH, endM] = data.endTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return endMinutes > startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

const recurringSchema = z.object({
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  daysOfWeek: z.array(z.number()).min(1, "Select at least one day"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid format"),
  slotDuration: z.number().min(15, "Minimum 15 minutes").max(480, "Maximum 8 hours"),
});

type SlotFormData = z.infer<typeof slotSchema>;
type RecurringFormData = z.infer<typeof recurringSchema>;

// ==========================================
// HELPERS
// ==========================================

const getStatusConfig = (status: SlotStatus) => {
  switch (status) {
    case SlotStatus.AVAILABLE:
      return { label: "Available", className: "bg-green-100 text-green-800" };
    case SlotStatus.RESERVED:
      return { label: "Reserved", className: "bg-blue-100 text-blue-800" };
    case SlotStatus.BLOCKED:
      return { label: "Blocked", className: "bg-gray-100 text-gray-800" };
    default:
      return { label: "Unknown", className: "bg-gray-100 text-gray-800" };
  }
};

// ==========================================
// WEEK VIEW COMPONENT
// ==========================================

interface WeekViewProps {
  weekStart: Date;
  slots: Slot[];
  onSlotClick: (slot: Slot) => void;
  onCreateSlot: (date: Date) => void;
}

function WeekView({ weekStart, slots, onSlotClick, onCreateSlot }: WeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSlotsByDate = (date: Date) => {
    return slots.filter((slot) => isSameDay(parseISO(slot.date), date));
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => {
        const daySlots = getSlotsByDate(day);
        const isToday = isSameDay(day, new Date());

        return (
          <div
            key={index}
            className={`border rounded-lg p-2 min-h-[200px] ${
              isToday ? "border-cyan-500 bg-cyan-50" : ""
            }`}
          >
            <div className="text-center mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                {format(day, "EEE", { locale: enUS })}
              </p>
              <p className={`text-lg font-bold ${isToday ? "text-cyan-600" : ""}`}>
                {format(day, "d")}
              </p>
            </div>

            <div className="space-y-1">
              {daySlots.map((slot) => {
                const config = getStatusConfig(slot.status);
                return (
                  <button
                    key={slot.id}
                    onClick={() => onSlotClick(slot)}
                    className={`w-full text-xs p-1.5 rounded ${config.className} hover:opacity-80 transition-opacity`}
                  >
                    <div className="font-medium">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    <div className="text-[10px]">{config.label}</div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onCreateSlot(day)}
              className="w-full mt-2 p-1.5 border border-dashed border-gray-300 rounded hover:border-cyan-500 hover:bg-cyan-50 transition-colors text-xs text-muted-foreground"
            >
              + Add slot
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// SLOT DIALOG
// ==========================================

interface SlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: Slot | null;
  initialDate?: Date;
  onSubmit: (data: SlotFormData) => Promise<void>;
  isLoading: boolean;
}

function SlotDialog({
  open,
  onOpenChange,
  slot,
  initialDate,
  onSubmit,
  isLoading,
}: SlotDialogProps) {
  const isEditing = !!slot;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SlotFormData>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      date: initialDate
        ? format(initialDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (slot) {
      reset({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    } else if (initialDate) {
      reset({
        date: format(initialDate, "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "10:00",
      });
    }
  }, [slot, initialDate, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Slot" : "New Slot"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify this time slot"
              : "Create a new availability slot"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
              error={!!errors.date}
              disabled={isEditing}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start time *</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                error={!!errors.startTime}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End time *</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                error={!!errors.endTime}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// RECURRING DIALOG
// ==========================================

interface RecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecurringFormData) => Promise<void>;
  isLoading: boolean;
}

function RecurringDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: RecurringDialogProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "18:00",
      daysOfWeek: [],
      slotDuration: 60,
    },
  });

  const toggleDay = (day: number) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day].sort();
    setSelectedDays(newDays);
    setValue("daysOfWeek", newDays);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Recurring Slots</DialogTitle>
          <DialogDescription>
            Create multiple slots with a recurring pattern
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                error={!!errors.startDate}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End date *</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                error={!!errors.endDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Days of week *</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedDays.includes(day.value)
                      ? "bg-cyan-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {day.shortLabel}
                </button>
              ))}
            </div>
            {errors.daysOfWeek && (
              <p className="text-sm text-destructive">
                {errors.daysOfWeek.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start time *</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                error={!!errors.startTime}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End time *</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                error={!!errors.endTime}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slotDuration">Slot duration (minutes) *</Label>
            <Input
              id="slotDuration"
              type="number"
              min={15}
              max={480}
              step={15}
              {...register("slotDuration", { valueAsNumber: true })}
              error={!!errors.slotDuration}
            />
            {errors.slotDuration && (
              <p className="text-sm text-destructive">
                {errors.slotDuration.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Duration of each individual slot (e.g., 60 minutes will create slots from 9:00-10:00, 10:00-11:00, etc.)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Slots
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export function SlotsPage() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [view, setView] = useState<"week" | "list">("week");

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    slot: Slot | null;
    initialDate?: Date;
  }>({ open: false, slot: null });

  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; slot: Slot | null }>({
    open: false,
    slot: null,
  });

  // Hooks
  const { data: slotsData, isLoading } = useMySlots();
  const { mutateAsync: createSlot, isPending: isCreating } = useCreateSlot();
  const { mutateAsync: createRecurring, isPending: isCreatingRecurring } =
    useCreateRecurringSlots();
  const { mutateAsync: updateSlot, isPending: isUpdating } = useUpdateSlot();
  const { mutateAsync: deleteSlot, isPending: isDeleting } = useDeleteSlot();

  const slots = slotsData?.data || [];

  const isSubmitting = isCreating || isUpdating || isCreatingRecurring;

  // Handlers
  const handleCreateSlot = (date: Date) => {
    setDialogState({ open: true, slot: null, initialDate: date });
  };

  const handleEditSlot = (slot: Slot) => {
    setDialogState({ open: true, slot, initialDate: undefined });
  };

  const handleDeleteSlot = (slot: Slot) => {
    setDeleteDialog({ open: true, slot });
  };

  const handleSlotSubmit = async (data: SlotFormData) => {
    try {
      if (dialogState.slot) {
        await updateSlot({ id: dialogState.slot.id, data });
      } else {
        await createSlot(data);
      }
      setDialogState({ open: false, slot: null });
    } catch (error) {
      // Error handled by hooks
    }
  };

  const handleRecurringSubmit = async (data: RecurringFormData) => {
    try {
      await createRecurring(data);
      setRecurringDialogOpen(false);
    } catch (error) {
      // Error handled by hooks
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.slot) return;
    try {
      await deleteSlot(deleteDialog.slot.id);
      setDeleteDialog({ open: false, slot: null });
    } catch (error) {
      // Error handled by hooks
    }
  };

  // Stats
  const availableCount = slots.filter((s) => s.status === SlotStatus.AVAILABLE).length;
  const reservedCount = slots.filter((s) => s.status === SlotStatus.RESERVED).length;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Time Slots</h1>
          <p className="text-muted-foreground">
            Manage your availability
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRecurringDialogOpen(true)}>
            <Copy className="h-4 w-4 mr-2" />
            Recurring
          </Button>
          <Button onClick={() => setDialogState({ open: true, slot: null })}>
            <Plus className="h-4 w-4 mr-2" />
            New Slot
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{slots.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableCount}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reservedCount}</p>
                <p className="text-sm text-muted-foreground">Reserved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(subWeeks(weekStart, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <p className="font-medium">
                {format(weekStart, "MMMM yyyy", { locale: enUS })}
              </p>
              <p className="text-sm text-muted-foreground">
                Week {format(weekStart, "w")}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Week View */}
      <Card>
        <CardContent className="p-4">
          <WeekView
            weekStart={weekStart}
            slots={slots}
            onSlotClick={handleEditSlot}
            onCreateSlot={handleCreateSlot}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SlotDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        slot={dialogState.slot}
        initialDate={dialogState.initialDate}
        onSubmit={handleSlotSubmit}
        isLoading={isSubmitting}
      />

      <RecurringDialog
        open={recurringDialogOpen}
        onOpenChange={setRecurringDialogOpen}
        onSubmit={handleRecurringSubmit}
        isLoading={isCreatingRecurring}
      />

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time slot? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, slot: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SlotsPage;