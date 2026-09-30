export type UserRole = "root" | "admin" | "manager";
export type ReviewStatus = "pending" | "published" | "rejected";

export interface ServiceDirection {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}
export interface Service {
  id: string;
  directionId: string;
  name: string;
  description: string | null;
  price: number | null;
  isPriceFrom: boolean;
  sortOrder: number;
  isActive: boolean;
  direction?: ServiceDirection | null;
}
export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  oldPrice: number | null;
  newPrice: number | null;
  validFrom: string | null;
  validTo: string | null;
  serviceId: string | null;
  sortOrder: number;
  isActive: boolean;
  service?: Service | null;
}
export interface Review {
  id: string;
  authorName: string;
  text: string;
  rating: number;
  reviewDate: string | null;
  doctorId: string | null;
  sortOrder: number;
  isActive: boolean;
  status: ReviewStatus;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  } | null;
}
export interface DocumentItem {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  locationId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Clinic {
  id: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  slogan: string | null;
  phone: string | null;
  email: string | null;
  legalName: string | null;
  licenseNumber: string | null;
  licenseDate: string | null;
  inn: string | null;
  ogrn: string | null;
}
export interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  workingHours: Record<string, string> | null;
  mapUrl: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}
export interface ClinicFeature {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}
export interface ClinicSocialLink {
  id: string;
  platform: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
}
export interface ClinicStatistic {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
}
