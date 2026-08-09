export interface SuperAdminLoginDto {
  email: string;
  password: string;
}

export interface CreateAdminDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface UpdateAdminDto {
  fullName?: string;
  phoneNumber?: string;
  password?: string;
}

export interface CreateOwnerDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface CreateSuperAdminVenueDto {
  name: string;
  description?: string;
  address: string;
  city: string;
  phoneNumber?: string;
  ownerId: string;
  amenities?: string[];
  images?: string[];
}

export interface UpdateSuperAdminBookingDto {
  status?: string;
  paymentStatus?: string;
  notes?: string;
}
