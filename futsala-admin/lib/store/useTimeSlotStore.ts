import { create } from 'zustand'
import axiosInstance, { isAxiosError } from '@/lib/axios'

export interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  dayOfWeek: number
  isAvailable: boolean
}

export interface Court {
  id: string
  name: string
  timeSlots: TimeSlot[]
}

export interface DaySchedule {
  openTime: string
  closeTime: string
  blockedSlots: string[]
}

interface TimeSlotState {
  courts: Court[]
  selectedCourtId: string
  schedules: Record<number, DaySchedule>
  isLoading: boolean
  isSaving: boolean
  error: string | null

  fetchCourts: () => Promise<void>
  setSelectedCourtId: (courtId: string) => void
  initializeSchedules: (court: Court) => void
  updateDaySchedule: (day: number, data: Partial<DaySchedule>) => void
  toggleSlot: (day: number, slotTime: string) => void
  saveSchedules: () => Promise<void>
}

export const useTimeSlotStore = create<TimeSlotState>((set, get) => ({
  courts: [],
  selectedCourtId: '',
  schedules: {},
  isLoading: false,
  isSaving: false,
  error: null,

  setSelectedCourtId: (courtId: string) => {
    set({ selectedCourtId: courtId })
    const court = get().courts.find((c: Court) => c.id === courtId)
    if (court) {
      get().initializeSchedules(court)
    }
  },

  initializeSchedules: (court: Court) => {
    const newSchedules: Record<number, DaySchedule> = {}

    for (let day = 0; day < 7; day++) {
      const daySlots = court.timeSlots.filter((s) => s.dayOfWeek === day)
      if (daySlots.length > 0) {
        const sortedSlots = [...daySlots].sort((a, b) => a.startTime.localeCompare(b.startTime))
        newSchedules[day] = {
          openTime: sortedSlots[0].startTime,
          closeTime: sortedSlots[sortedSlots.length - 1].endTime,
          blockedSlots: sortedSlots.filter((s) => !s.isAvailable).map((s) => s.startTime),
        }
      } else {
        newSchedules[day] = {
          openTime: '08:00',
          closeTime: '20:00',
          blockedSlots: [],
        }
      }
    }
    set({ schedules: newSchedules })
  },

  fetchCourts: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await axiosInstance.get('/time-slots')
      const fetchedCourts: Court[] = response.data.courts || []
      set({ courts: fetchedCourts, isLoading: false })

      if (fetchedCourts.length > 0) {
        const firstCourt = fetchedCourts[0]
        set({ selectedCourtId: firstCourt.id })
        get().initializeSchedules(firstCourt)
      }
    } catch (err: any) {
      let message = 'Failed to load court schedules'
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message
      }
      set({ error: message, isLoading: false })
    }
  },

  updateDaySchedule: (day: number, data: Partial<DaySchedule>) => {
    const current = get().schedules
    const daySchedule = current[day] || { openTime: '08:00', closeTime: '20:00', blockedSlots: [] }
    set({
      schedules: {
        ...current,
        [day]: { ...daySchedule, ...data },
      },
    })
  },

  toggleSlot: (day: number, slotTime: string) => {
    const currentBlocked = get().schedules[day]?.blockedSlots || []
    const isCurrentlyBlocked = currentBlocked.includes(slotTime)
    const newBlocked = isCurrentlyBlocked
      ? currentBlocked.filter((t: string) => t !== slotTime)
      : [...currentBlocked, slotTime]

    get().updateDaySchedule(day, { blockedSlots: newBlocked })
  },

  saveSchedules: async () => {
    const { selectedCourtId, schedules } = get()
    if (!selectedCourtId) return

    set({ isSaving: true, error: null })
    try {
      const daySchedulesArray = Object.entries(schedules).map(([day, schedule]) => ({
        dayOfWeek: parseInt(day),
        ...schedule,
      }))

      await axiosInstance.post('/time-slots', {
        courtId: selectedCourtId,
        daySchedules: daySchedulesArray,
      })
      set({ isSaving: false })
    } catch (err: any) {
      let message = 'Failed to update time slots'
      if (isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message
      }
      set({ error: message, isSaving: false })
      throw new Error(message)
    }
  },
}))

export default useTimeSlotStore
