'use client';

import { useEffect } from 'react';
import useTimeSlotStore from '@/lib/store/useTimeSlotStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  Check, 
  Loader2,
  Lock,
  Unlock,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function TimeSlotsPage() {
  const {
    courts,
    selectedCourtId,
    schedules,
    isLoading,
    isSaving,
    fetchCourts,
    setSelectedCourtId,
    updateDaySchedule,
    toggleSlot,
    saveSchedules,
  } = useTimeSlotStore();

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  const handleSave = async () => {
    try {
      await saveSchedules();
      toast.success('Schedule updated successfully');
      fetchCourts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update schedule');
    }
  };

  const generateSlots = (openTime: string, closeTime: string) => {
    const openHour = parseInt(openTime.split(':')[0]);
    const closeHour = parseInt(closeTime.split(':')[0]);
    const slots = [];
    
    for (let hour = openHour; hour < closeHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  if (isLoading && courts.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">No Courts Found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          You need to add courts to your venue before managing time slots.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Time Slots Management</h2>
          <p className="text-muted-foreground">
            Configure opening hours and block specific slots for your courts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCourtId} onValueChange={setSelectedCourtId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Court" />
            </SelectTrigger>
            <SelectContent>
              {courts.map((court) => (
                <SelectItem key={court.id} value={court.id}>{court.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Save Schedule
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {DAYS.map((dayName, dayIndex) => {
          const schedule = schedules[dayIndex];
          if (!schedule) return null;

          const slots = generateSlots(schedule.openTime, schedule.closeTime);

          return (
            <Card key={dayName} className="overflow-hidden border-l-4 border-l-primary">
              <CardHeader className="bg-secondary/5 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{dayName}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs uppercase text-muted-foreground">Open</Label>
                      <Select 
                        value={schedule.openTime} 
                        onValueChange={(v) => updateDaySchedule(dayIndex, { openTime: v })}
                      >
                        <SelectTrigger className="h-8 w-[100px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs uppercase text-muted-foreground">Close</Label>
                      <Select 
                        value={schedule.closeTime} 
                        onValueChange={(v) => updateDaySchedule(dayIndex, { closeTime: v })}
                      >
                        <SelectTrigger className="h-8 w-[100px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {slots.map((slotTime) => {
                    const isBlocked = schedule.blockedSlots.includes(slotTime);
                    return (
                      <Button
                        key={slotTime}
                        variant={isBlocked ? "outline" : "secondary"}
                        size="sm"
                        className={isBlocked ? "opacity-50 border-red-200 bg-red-50 hover:bg-red-100" : "bg-green-50 hover:bg-green-100 text-green-700"}
                        onClick={() => toggleSlot(dayIndex, slotTime)}
                      >
                        {isBlocked ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                        {slotTime}
                      </Button>
                    );
                  })}
                  {slots.length === 0 && (
                    <p className="text-sm text-muted-foreground italic py-2">
                      No slots available for this time range.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}