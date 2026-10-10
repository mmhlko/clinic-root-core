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
  clinic(clinicSlug = "demo") {
    return this.requestGet<Clinic>("/clinic", { clinicSlug });
  }
  locations(clinicSlug = "demo") {
    return this.requestGet<ClinicLocation[]>("/clinic/locations", { clinicSlug });
  }
  directions(clinicSlug = "demo") {
    return this.requestGet<ServiceDirection[]>("/service-directions", { clinicSlug });
  }
  services(clinicSlug = "demo") {
    return this.requestGet<Service[]>("/services", { clinicSlug });
  }
  promotions(clinicSlug = "demo") {
    return this.requestGet<Promotion[]>("/promotions", { clinicSlug });
  }
  reviews(clinicSlug = "demo") {
    return this.requestGet<Review[]>("/reviews", { clinicSlug });
  }
  doctors(clinicSlug = "demo") {
    return this.requestGet<DoctorListItem[]>("/doctors", { clinicSlug });
  }
  documents(clinicSlug = "demo") {
    return this.requestGet<DocumentItem[]>("/documents", { clinicSlug });
  }
  faq(clinicSlug = "demo") {
    return this.requestGet<FaqItem[]>("/faq", { clinicSlug });
  }
}
export const publicServerApi = new PublicServerApi();
