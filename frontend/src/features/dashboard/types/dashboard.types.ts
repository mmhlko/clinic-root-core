export type DashboardRequestStatus =
  | "new"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface DashboardOverview {
  doctors: number;
  services: number;
  directions: number;
  reviews: number;
  promotions: number;
  documents: number;
  faqs: number;
}

export interface DashboardRequestCounts {
  total: number;
  new: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface DashboardRequestTrend {
  date: string;
  count: number;
}

export interface DashboardRecentRequest {
  id: string;
  name: string;
  phone: string;
  comment: string | null;
  status: DashboardRequestStatus;
  createdAt: string;
  service: { id: string; name: string } | null;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  } | null;
}

export interface DashboardResponse {
  overview: DashboardOverview;
  appointmentRequests: DashboardRequestCounts;
  requestTrend: DashboardRequestTrend[];
  moderation: {
    pendingReviews: number;
  };
  recentRequests: DashboardRecentRequest[];
}

export interface DashboardPromotion {
  id: string;
  title: string;
  isActive: boolean;
  validTo: string | null;
}
