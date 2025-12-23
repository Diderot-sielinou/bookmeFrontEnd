/**
 * Page Mes Créneaux (Prestataire)
 * 
 * Gestion des disponibilités :
 * - Vue calendrier des créneaux
 * - Création manuelle ou récurrente
 * - Blocage de périodes
 */

import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Ban,
  RefreshCw,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';
import { useSlots } from '@/hooks/useSlots';
import { SlotStatus } from '@/types';
import type { Slot } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Checkbox,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/shared';

// ==========================================
// VALIDATION
// ==========================================

const slotSchema = z.object({
  date: z.date({ required_error: 'Date requise' }),
  startTime: z.string().min(1, 'Heure de début requise'),
  endTime: z.string().min(1, 'Heure de fin requise'),
});

const recurringSchema = z.object({
  startDate: z.date({ required_error: 'Date de début requise' }),
  endDate: z.date({ required_error: 'Date de fin requise' }),
  startTime: z.string().min(1, 'Heure de début requise'),
  endTime: z.string().min(1, 'Heure de fin requise'),
  slotDuration: z.number().min(15, 'Minimum 15 minutes'),
  breakDuration: z.number().min(0, 'Durée de pause invalide'),
  daysOfWeek: z.array(z.number()).min(1, 'Sélectionnez au moins un jour'),
});

type SlotFormData = z.infer<typeof slotSchema>;
type RecurringFormData = z.infer<typeof recurringSchema>;

// ==========================================
// STATUS CONFIG
// ==========================================

const statusConfig: Record<SlotStatus, { label: string; className: string }> = {
  [SlotStatus.AVAILABLE]: { label: 'Disponible', className: 'bg-green-100 text-green-700 border-green-200' },
  [SlotStatus.RESERVED]: { label: 'Réservé', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  [SlotStatus.BLOCKED]: { label: 'Bloqué', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

// ==========================================
// WEEK VIEW COMPONENT
// ==========================================

interface WeekViewProps {
  currentDate: Date;
  slots: Slot[];
  onSlotClick: (slot: Slot) => void;
  onDateClick: (date: Date) => void;
}

function WeekView({ currentDate, slots, onSlotClick, onDateClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, Slot[]> = {};
    slots.forEach((slot) => {
      const dateKey = format(parseISO(slot.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(slot);
    });
    // Sort slots by start time
    Object.values(grouped).forEach((daySlots) => {
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [slots]);

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const daySlots = slotsByDate[dateKey] || [];
        const isToday = isSameDay(day, new Date());

        return (
          <div
            key={dateKey}
            className={cn(
              'min-h-[200px] border rounded-lg p-2',
              isToday && 'border-cyan-500'
            )}
          >
            {/* Day header */}
            <button
              onClick={() => onDateClick(day)}
              className={cn(
                'w-full text-center p-2 rounded-md hover:bg-accent transition-colors',
                isToday && 'bg-cyan-50'
              )}
            >
              <p className="text-xs text-muted-foreground">
                {format(day, 'EEE', { locale: fr })}
              </p>
              <p className={cn('text-lg font-semibold', isToday && 'text-cyan-600')}>
                {format(day, 'd')}
              </p>
            </button>

            {/* Slots */}
            <div className="mt-2 space-y-1 max-h-[150px] overflow-y-auto">
              {daySlots.map((slot) => {
                const config = statusConfig[slot.status];
                return (
                  <button
                    key={slot.id}
                    onClick={() => onSlotClick(slot)}
                    className={cn(
                      'w-full text-left text-xs p-1.5 rounded border transition-colors hover:opacity-80',
                      config.className
                    )}
                  >
                    <span className="font-medium">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                  </button>
                );
              })}
            </div>
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
  selectedDate: Date | null;
  onSubmit: (data: SlotFormData) => Promise<void>;
  isLoading: boolean;
}

function SlotDialog({ open, onOpenChange, selectedDate, onSubmit, isLoading }: SlotDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SlotFormData>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      date: selectedDate || new Date(),
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  // Update date when selectedDate changes
  useState(() => {
    if (selectedDate) {
      setValue('date', selectedDate);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un créneau</DialogTitle>
          <DialogDescription>
            Créez un nouveau créneau de disponibilité
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch('date') ? format(watch('date'), 'PPP', { locale: fr }) : 'Sélectionner'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={watch('date')}
                  onSelect={(date) => date && setValue('date', date)}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Début</Label>
              <Input
                id="startTime"
                type="time"
                {...register('startTime')}
                error={!!errors.startTime}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Fin</Label>
              <Input
                id="endTime"
                type="time"
                {...register('endTime')}
                error={!!errors.endTime}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Créer le créneau
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// RECURRING SLOTS DIALOG
// ==========================================

interface RecurringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecurringFormData) => Promise<void>;
  isLoading: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

function RecurringDialog({ open, onOpenChange, onSubmit, isLoading }: RecurringDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: addWeeks(new Date(), 4),
      startTime: '09:00',
      endTime: '18:00',
      slotDuration: 60,
      breakDuration: 0,
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  });

  const selectedDays = watch('daysOfWeek') || [];

  const toggleDay = (day: number) => {
    const current = selectedDays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    setValue('daysOfWeek', updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Créneaux récurrents</DialogTitle>
          <DialogDescription>
            Générez automatiquement des créneaux sur une période
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('startDate') ? format(watch('startDate'), 'dd/MM/yy') : 'Début'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('startDate')}
                    onSelect={(date) => date && setValue('startDate', date)}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('endDate') ? format(watch('endDate'), 'dd/MM/yy') : 'Fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('endDate')}
                    onSelect={(date) => date && setValue('endDate', date)}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recStartTime">Heure de début</Label>
              <Input id="recStartTime" type="time" {...register('startTime')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recEndTime">Heure de fin</Label>
              <Input id="recEndTime" type="time" {...register('endTime')} />
            </div>
          </div>

          {/* Slot duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Durée des créneaux</Label>
              <Select
                value={String(watch('slotDuration'))}
                onValueChange={(v) => setValue('slotDuration', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1h</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2h</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pause entre créneaux</Label>
              <Select
                value={String(watch('breakDuration'))}
                onValueChange={(v) => setValue('breakDuration', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Aucune</SelectItem>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Days of week */}
          <div className="space-y-2">
            <Label>Jours de la semaine</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label.slice(0, 3)}
                </Button>
              ))}
            </div>
            {errors.daysOfWeek && (
              <p className="text-sm text-destructive">{errors.daysOfWeek.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Générer les créneaux
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

export function PrestataireSlotsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slotDialog, setSlotDialog] = useState<{ open: boolean; date: Date | null }>({
    open: false,
    date: null,
  });
  const [recurringDialog, setRecurringDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Calculate date range for current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const {
    slots,
    isLoading,
    create: createSlot,
    isCreating,
    createRecurring: createRecurringSlots,
    isCreatingRecurring,
    delete: deleteSlotFn,
    isDeleting,
  } = useSlots({
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
  });

  // Navigation
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Handlers
  const handleDateClick = (date: Date) => {
    setSlotDialog({ open: true, date });
  };

  const handleSlotClick = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  const handleCreateSlot = async (formData: SlotFormData) => {
    await createSlot({
      date: format(formData.date, 'yyyy-MM-dd'),
      startTime: formData.startTime,
      endTime: formData.endTime,
    });
    setSlotDialog({ open: false, date: null });
  };

  const handleCreateRecurring = async (formData: RecurringFormData) => {
    await createRecurringSlots({
      startDate: format(formData.startDate, 'yyyy-MM-dd'),
      endDate: format(formData.endDate, 'yyyy-MM-dd'),
      startTime: formData.startTime,
      endTime: formData.endTime,
      slotDuration: formData.slotDuration,
      breakDuration: formData.breakDuration,
      daysOfWeek: formData.daysOfWeek,
    });
    setRecurringDialog(false);
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;
    await deleteSlotFn(selectedSlot.id);
    setSelectedSlot(null);
  };

  // Stats
  const availableCount = slots.filter((s) => s.status === SlotStatus.AVAILABLE).length;
  const bookedCount = slots.filter((s) => s.status === SlotStatus.RESERVED).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mes créneaux</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos disponibilités
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRecurringDialog(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Récurrence
          </Button>
          <Button onClick={() => setSlotDialog({ open: true, date: new Date() })}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau créneau
          </Button>
        </div>
      </div>

      {/* Week navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={goToToday}>
                Aujourd'hui
              </Button>
            </div>

            <h2 className="text-lg font-semibold">
              {format(weekStart, 'd MMM', { locale: fr })} - {format(weekEnd, 'd MMM yyyy', { locale: fr })}
            </h2>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                Disponible ({availableCount})
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cyan-500" />
                Réservé ({bookedCount})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week view */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <WeekView
          currentDate={currentDate}
          slots={slots}
          onSlotClick={handleSlotClick}
          onDateClick={handleDateClick}
        />
      )}

      {/* Slot Dialog */}
      <SlotDialog
        open={slotDialog.open}
        onOpenChange={(open) => setSlotDialog({ ...slotDialog, open })}
        selectedDate={slotDialog.date}
        onSubmit={handleCreateSlot}
        isLoading={isCreating}
      />

      {/* Recurring Dialog */}
      <RecurringDialog
        open={recurringDialog}
        onOpenChange={setRecurringDialog}
        onSubmit={handleCreateRecurring}
        isLoading={isCreatingRecurring}
      />

      {/* Slot Detail Dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du créneau</DialogTitle>
          </DialogHeader>
          
          {selectedSlot && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={statusConfig[selectedSlot.status].className}>
                  {statusConfig[selectedSlot.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(parseISO(selectedSlot.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horaire</p>
                  <p className="font-medium">
                    {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </p>
                </div>
              </div>

              {selectedSlot.status === SlotStatus.RESERVED && selectedSlot.appointment && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Réservé par</p>
                  <p className="font-medium">
                    {selectedSlot.appointment.client?.firstName} {selectedSlot.appointment.client?.lastName}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlot(null)}>
              Fermer
            </Button>
            {selectedSlot?.status === SlotStatus.AVAILABLE && (
              <Button
                variant="destructive"
                onClick={handleDeleteSlot}
                isLoading={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PrestataireSlotsPage;
