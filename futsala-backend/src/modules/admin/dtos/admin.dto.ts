export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface UpdateVenueDto {
  name?: string;
  address?: string;
  phoneNumber?: string;
  description?: string;
  amenities?: string[];
  courts?: {
    id?: string;
    name: string;
    pricePerHour: number;
  }[];
}

export interface UpdateBookingStatusDto {
  bookingId: string;
  status: string;
}

export interface UpdateTimeSlotDto {
  courtId: string;
  daySchedules: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    blockedSlots: string[];
  }[];
}

export interface UpdateAdminProfileDto {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UpdateAdminPasswordDto {
  currentPassword: string;
  newPassword: string;
}
