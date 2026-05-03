export interface Hall {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  pricePerNight: number;
  depositAmount: number;
  images: string[];
  audioTermsUrl?: string;
  features: string[];
  rating: number;
  operatingHours?: string;
  contactPhone?: string;
  adminId?: string;
}

export interface Review {
  id: string;
  hallId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Booking {
  id: string;
  hallId: string;
  userId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  stripeSessionId?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
}
