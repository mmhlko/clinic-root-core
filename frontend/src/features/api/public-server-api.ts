import "server-only";
import { RootApi } from "@/lib/api/root.api";
import serverApiClient from "@/lib/api/server-client";
import type {
  Clinic,
  ClinicLocation,
  Promotion,
  Review,
  Service,
  ServiceDirection,
  DocumentItem,
  FaqItem,
} from "@/features/content/types/content.types";
import type { DoctorListItem } from "@/features/doctors/types/doctors.types";

class PublicServerApi extends RootApi {
  constructor() {
    super(serverApiClient);
  }
  clinic() {
    return this.requestGet<Clinic>("/clinic");
  }
  locations() {
    return this.requestGet<ClinicLocation[]>("/clinic/locations");
  }
  directions() {
    return this.requestGet<ServiceDirection[]>("/service-directions");
  }
  services() {
    return this.requestGet<Service[]>("/services");
  }
  promotions() {
    return this.requestGet<Promotion[]>("/promotions");
  }
  reviews() {
    return this.requestGet<Review[]>("/reviews");
  }
  doctors() {
    return this.requestGet<DoctorListItem[]>("/doctors");
  }
  documents() {
    return this.requestGet<DocumentItem[]>("/documents");
  }
  faq() {
    return this.requestGet<FaqItem[]>("/faq");
  }
}
export const publicServerApi = new PublicServerApi();
