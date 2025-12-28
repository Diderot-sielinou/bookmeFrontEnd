/**
 * BookingPage Component
 * 
 * Multi-step booking flow with validation.
 * Features:
 * - Service selection (if not pre-selected)
 * - Calendar and time slot selection
 * - Booking confirmation
 * - Real-time validation
 * - Loading states
 * - Success feedback
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { format, addDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatPrice, formatDuration, formatTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { usePrestataire, usePrestataireServices } from '@/hooks/usePrestataires';
import { useAvailableSlots } from '@/hooks/useSlots';
import { useCreateAppointment } from '@/hooks/useAppointments';
import type { Service, Slot } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Avatar,
  Badge,
  Textarea,
  Label,
  Calendar as CalendarComponent,
  Separator,
} from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { ErrorState } from '@/components/shared';

// ==========================================
// TYPES
// ==========================================

type BookingStep = 'service' | 'slot' | 'confirm';

interface BookingState {
  service: Service | null;
  date: Date | null;
  slot: Slot | null;
  note: string;
}

// ==========================================
// STEP INDICATOR
// ==========================================

interface StepIndicatorProps {
  currentStep: BookingStep;
  hasService: boolean;
}

function StepIndicator({ currentStep, hasService }: StepIndicatorProps) {
  const steps = [
    { key: 'service', label: 'Service', show: !hasService },
    { key: 'slot', label: 'Time Slot' },
    { key: 'confirm', label: 'Confirmation' },
  ].filter((s) => s.show !== false);

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
              index < currentIndex
                ? 'bg-cyan-500 text-white'
                : index === currentIndex
                ? 'bg-cyan-500 text-white'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {index < currentIndex ? (
              <Check className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          <span
            className={cn(
              'ml-2 text-sm hidden sm:inline',
              index === currentIndex ? 'font-medium' : 'text-muted-foreground'
            )}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-8 sm:w-16 h-0.5 mx-2',
                index < currentIndex ? 'bg-cyan-500' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// SERVICE SELECTION STEP
// ==========================================

interface ServiceStepProps {
  services: Service[];
  selected: Service | null;
  onSelect: (service: Service) => void;
  onNext: () => void;
}

function ServiceStep({ services, selected, onSelect, onNext }: ServiceStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Choose a Service</h2>
        <p className="text-muted-foreground">
          Select the service you want to book
        </p>
      </div>

      <div className="grid gap-4">
        {services
          .filter((s) => s.isActive)
          .map((service) => (
            <Card
              key={service.id}
              className={cn(
                'cursor-pointer transition-all',
                selected?.id === service.id
                  ? 'border-cyan-500 ring-2 ring-cyan-500/20'
                  : 'hover:border-cyan-300'
              )}
              onClick={() => onSelect(service)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(service.duration)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-cyan-600">
                      {formatPrice(service.price)}
                    </p>
                    {selected?.id === service.id && (
                      <Badge className="mt-1">Selected</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!selected}>
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// SLOT SELECTION STEP
// ==========================================

interface SlotStepProps {
  prestataireId: string;
  service: Service;
  selectedDate: Date | null;
  selectedSlot: Slot | null;
  onDateChange: (date: Date) => void;
  onSlotSelect: (slot: Slot) => void;
  onBack: () => void;
  onNext: () => void;
}

function SlotStep({
  prestataireId,
  service,
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotSelect,
  onBack,
  onNext,
}: SlotStepProps) {
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 60); // 2 months ahead

  // Fetch available slots
  const startDate = selectedDate || today;
  const endDate = addDays(startDate, 7);

  const { data: slots = [], isLoading } = useAvailableSlots(prestataireId, {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  });

  // Filter slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return slots.filter((slot: Slot) => {
      const slotDate = parseISO(slot.date);
      if (!isSameDay(slotDate, selectedDate)) return false;
      
      // Check if slot duration is sufficient for service
      const slotMinutes =
        (parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1])) -
        (parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1]));
      return slotMinutes >= service.duration;
    });
  }, [slots, selectedDate, service.duration]);

  // Dates with available slots
  const datesWithSlots = useMemo(() => {
    const dates = new Set<string>();
    slots.forEach((slot: Slot) => dates.add(slot.date));
    return dates;
  }, [slots]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Choose a Time Slot</h2>
        <p className="text-muted-foreground">
          Select a date and time for your appointment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Date</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => date && onDateChange(date)}
              disabled={(date) =>
                date < today || date > maxDate
              }
              modifiers={{
                available: (date) =>
                  datesWithSlots.has(format(date, 'yyyy-MM-dd')),
              }}
              modifiersClassNames={{
                available: 'bg-cyan-100 text-cyan-900 font-medium',
              }}
              className="rounded-md border p-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Dates with available slots are highlighted
            </p>
          </CardContent>
        </Card>

        {/* Time slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate
                ? format(selectedDate, 'EEEE, MMMM d')
                : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-muted-foreground text-center py-8">
                Choose a date from the calendar
              </p>
            ) : isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  No slots available on this date
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => onSlotSelect(slot)}
                    className={cn(
                      'p-3 rounded-lg border text-center transition-all',
                      selectedSlot?.id === slot.id
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-medium'
                        : 'hover:border-cyan-300 hover:bg-cyan-50/50'
                    )}
                  >
                    <span className="text-sm">
                      {formatTime(slot.startTime)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedSlot}>
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// CONFIRMATION STEP
// ==========================================

interface ConfirmStepProps {
  prestataire: any;
  service: Service;
  slot: Slot;
  note: string;
  onNoteChange: (note: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function ConfirmStep({
  prestataire,
  service,
  slot,
  note,
  onNoteChange,
  onBack,
  onConfirm,
  isLoading,
}: ConfirmStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Confirm Booking</h2>
        <p className="text-muted-foreground">
          Review details and confirm your appointment
        </p>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider */}
          <div className="flex items-center gap-3">
            <Avatar
              src={prestataire?.avatar}
              firstName={prestataire?.firstName}
              lastName={prestataire?.lastName}
              size="lg"
            />
            <div>
              <p className="font-medium">{prestataire?.businessName}</p>
              {prestataire?.address && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {prestataire.address}, {prestataire.city}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Service */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-muted-foreground">
                Duration: {formatDuration(service.duration)}
              </p>
            </div>
            <p className="font-bold text-cyan-600">{formatPrice(service.price)}</p>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">
                {format(parseISO(slot.date), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Note for Provider</CardTitle>
          <CardDescription>
            Add any special requests or information (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., I prefer a short haircut, I have thick hair..."
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="bg-cyan-50 border-cyan-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-cyan-600">
              {formatPrice(service.price)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Payment on-site at the appointment
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// SUCCESS VIEW
// ==========================================

interface SuccessViewProps {
  prestataire: any;
  service: Service;
  slot: Slot;
}

function SuccessView({ prestataire, service, slot }: SuccessViewProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-muted-foreground mb-8">
        Your appointment has been successfully booked
      </p>

      <Card className="max-w-md mx-auto mb-8">
        <CardContent className="p-6 text-left space-y-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={prestataire?.avatar}
              firstName={prestataire?.firstName}
              lastName={prestataire?.lastName}
              size="lg"
            />
            <div>
              <p className="font-medium">{prestataire?.businessName}</p>
              <p className="text-sm text-muted-foreground">{service.name}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {format(parseISO(slot.date), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatTime(slot.startTime)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => navigate(ROUTES.CLIENT_APPOINTMENTS)}>
          View My Appointments
        </Button>
        <Button onClick={() => navigate(ROUTES.HOME)}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function BookingPage() {
  const { id: prestataireId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const preSelectedServiceId = searchParams.get('serviceId');

  // Fetch data
  const { data: prestataire, isLoading: loadingPrestataire, error: prestataireError } = usePrestataire(prestataireId!);
  const { data: services = [], isLoading: loadingServices } = usePrestataireServices(prestataireId!);

  // Booking state
  const [step, setStep] = useState<BookingStep>('service');
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    date: null,
    slot: null,
    note: '',
  });
  const [isSuccess, setIsSuccess] = useState(false);

  // Create appointment mutation
  const { mutateAsync: createAppointment, isPending: isCreating } = useCreateAppointment();

  // Pre-select service from URL
  useEffect(() => {
    if (preSelectedServiceId && services.length > 0) {
      const service = services.find((s: Service) => s.id === preSelectedServiceId);
      if (service) {
        setBooking((prev) => ({ ...prev, service }));
        setStep('slot');
      }
    }
  }, [preSelectedServiceId, services]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`${ROUTES.LOGIN}?redirect=/book/${prestataireId}`);
    }
  }, [isAuthenticated, navigate, prestataireId]);

  // Handlers
  const handleServiceSelect = (service: Service) => {
    setBooking((prev) => ({ ...prev, service }));
  };

  const handleDateChange = (date: Date) => {
    setBooking((prev) => ({ ...prev, date, slot: null }));
  };

  const handleSlotSelect = (slot: Slot) => {
    setBooking((prev) => ({ ...prev, slot }));
  };

  const handleNoteChange = (note: string) => {
    setBooking((prev) => ({ ...prev, note }));
  };

  const handleConfirm = async () => {
    if (!booking.service || !booking.slot) return;

    try {
      await createAppointment({
        slotId: booking.slot.id,
        serviceId: booking.service.id,
        clientNote: booking.note || undefined,
      });
      showSuccess('Appointment booked successfully!');
      setIsSuccess(true);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message;
      if (message?.toLowerCase().includes('already booked')) {
        showError('This time slot is no longer available. Please choose another.');
        setStep('slot');
      } else {
        showError('Unable to create booking. Please try again.');
      }
    }
  };

  // Loading state
  if (loadingPrestataire || loadingServices) {
    return (
      <div className="container max-w-4xl px-4 py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (prestataireError || !prestataire) {
    return (
      <div className="container max-w-4xl px-4 py-12">
        <ErrorState
          message="Unable to load provider information"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Success state
  if (isSuccess && booking.service && booking.slot) {
    return (
      <div className="container max-w-4xl px-4 py-12">
        <SuccessView
          prestataire={prestataire}
          service={booking.service}
          slot={booking.slot}
        />
      </div>
    );
  }

  const hasPreSelectedService = !!preSelectedServiceId;

  return (
    <div className="container max-w-4xl px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate(`/prestataires/${prestataireId}`)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Profile
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Book with {prestataire.businessName}</h1>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} hasService={hasPreSelectedService} />

      {/* Steps */}
      {step === 'service' && !hasPreSelectedService && (
        <ServiceStep
          services={services}
          selected={booking.service}
          onSelect={handleServiceSelect}
          onNext={() => setStep('slot')}
        />
      )}

      {step === 'slot' && booking.service && (
        <SlotStep
          prestataireId={prestataireId!}
          service={booking.service}
          selectedDate={booking.date}
          selectedSlot={booking.slot}
          onDateChange={handleDateChange}
          onSlotSelect={handleSlotSelect}
          onBack={() => hasPreSelectedService ? navigate(-1) : setStep('service')}
          onNext={() => setStep('confirm')}
        />
      )}

      {step === 'confirm' && booking.service && booking.slot && (
        <ConfirmStep
          prestataire={prestataire}
          service={booking.service}
          slot={booking.slot}
          note={booking.note}
          onNoteChange={handleNoteChange}
          onBack={() => setStep('slot')}
          onConfirm={handleConfirm}
          isLoading={isCreating}
        />
      )}
    </div>
  );
}

export default BookingPage;