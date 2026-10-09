import "server-only";
import type {
  ServiceDirection,
  Service,
  Promotion,
  Review,
  DocumentItem,
  FaqItem,
  AdminUser,
  Clinic,
  ClinicLocation,
  ClinicFeature,
  ClinicSocialLink,
  ClinicStatistic,
} from "../types/content.types";
import { RootApi } from "@/lib/api/root.api";
import serverApiClient from "@/lib/api/server-client";

class ContentServerApi extends RootApi {
  constructor() {
    super(serverApiClient);
  }
  platformClinics(token: string) {
    return this.requestGet<Clinic[]>("/clinic/root", {
      accessToken: token,
    });
  }
  directions(token: string) {
    return this.requestGet<ServiceDirection[]>("/service-directions/admin", {
      accessToken: token,
    });
  }
  services(token: string) {
    return this.requestGet<Service[]>("/services/admin", {
      accessToken: token,
    });
  }
  promotions(token: string) {
    return this.requestGet<Promotion[]>("/promotions/admin", {
      accessToken: token,
    });
  }
  reviews(token: string) {
    return this.requestGet<Review[]>("/reviews/admin", { accessToken: token });
  }
  documents(token: string) {
    return this.requestGet<DocumentItem[]>("/documents/admin", {
      accessToken: token,
    });
  }
  faq(token: string) {
    return this.requestGet<FaqItem[]>("/faq/admin", { accessToken: token });
  }
  users(token: string) {
    return this.requestGet<AdminUser[]>("/users", { accessToken: token });
  }
  currentUser(token: string) {
    return this.requestGet<AdminUser>("/users/me", { accessToken: token });
  }
  user(id: string, token: string) {
    return this.requestGet<AdminUser>(`/users/${id}`, { accessToken: token });
  }
  locations(token: string) {
    return this.requestGet<ClinicLocation[]>("/clinic/locations/admin", {
      accessToken: token,
    });
  }
  publicLocations() {
    return this.requestGet<ClinicLocation[]>("/clinic/locations");
  }
  clinic(token: string) {
    return this.requestGet<Clinic>("/clinic/admin", { accessToken: token });
  }
  features(token: string) {
    return this.requestGet<ClinicFeature[]>("/clinic/features/admin", {
      accessToken: token,
    });
  }
  socialLinks(token: string) {
    return this.requestGet<ClinicSocialLink[]>("/clinic/social-links/admin", {
      accessToken: token,
    });
  }
  statistics(token: string) {
    return this.requestGet<ClinicStatistic[]>("/clinic/statistics/admin", {
      accessToken: token,
    });
  }
}
export const contentServerApi = new ContentServerApi();
