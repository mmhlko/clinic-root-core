"use client";
import { RootApi } from "@/lib/api/root.api";
import type {
  Service,
  ServiceDirection,
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
import apiClient from "@/lib/api/client";

class ContentClientApi extends RootApi {
  constructor() {
    super(apiClient);
  }
  createDirection(body: {
    name: string;
    description?: string;
    sortOrder?: number;
  }) {
    return this.requestPost<ServiceDirection>("/service-directions", body);
  }
  updateDirection(id: string, body: Partial<ServiceDirection>) {
    return this.requestPatch<ServiceDirection>(`/service-directions/${id}`, body);
  }
  deleteDirection(id: string) {
    return this.requestDelete(`/service-directions/${id}`);
  }
  reorderDirections(ids: string[]) {
    return this.requestPatch<{ success: boolean }>("/service-directions/reorder", { ids });
  }
  createService(body: Partial<Service>) {
    return this.requestPost<Service>("/services", body);
  }
  reorderServices(ids: string[]) {
    return this.requestPatch<{ success: boolean }>("/services/reorder", { ids });
  }
  updateService(id: string, body: Partial<Service>) {
    return this.requestPatch<Service>(`/services/${id}`, body);
  }
  deleteService(id: string) {
    return this.requestDelete(`/services/${id}`);
  }
  setServiceActive(id: string, isActive: boolean) {
    return this.requestPut<Service>(`/services/${id}/active`, { isActive });
  }
  createPromotion(body: Partial<Promotion>) {
    return this.requestPost<Promotion>("/promotions", body);
  }
  reorderPromotions(ids: string[]) {
    return this.requestPatch<{ success: boolean }>("/promotions/reorder", { ids });
  }
  updatePromotion(id: string, body: Partial<Promotion>) {
    return this.requestPatch<Promotion>(`/promotions/${id}`, body);
  }
  setPromotionActive(id: string, isActive: boolean) {
    return this.requestPut<Promotion>(`/promotions/${id}/active`, { isActive });
  }
  deletePromotion(id: string) {
    return this.requestDelete(`/promotions/${id}`);
  }
  updateReview(id: string, body: Partial<Review>) {
    return this.requestPatch<Review>(`/reviews/${id}`, body);
  }
  createReview(body: Partial<Review>) {
    return this.requestPost<Review>("/reviews", body);
  }
  reorderReviews(ids: string[]) {
    return this.requestPatch<{ success: boolean }>("/reviews/reorder", { ids });
  }
  publishReview(id: string) {
    return this.requestPut<Review>(`/reviews/${id}/publish`);
  }
  rejectReview(id: string) {
    return this.requestPut<Review>(`/reviews/${id}/reject`);
  }
  setReviewActive(id: string, isActive: boolean) {
    return this.requestPut<Review>(`/reviews/${id}/active`, { isActive });
  }
  deleteReview(id: string) {
    return this.requestDelete(`/reviews/${id}`);
  }
  createDocument(form: FormData) {
    return this.requestPost<DocumentItem>("/documents", form);
  }
  updateDocument(id: string, form: FormData) {
    return this.requestPatch<DocumentItem>(`/documents/${id}`, form);
  }
  reorderDocuments(ids: string[]) {
    return this.requestPatch<{ success: boolean }>("/documents/reorder", { ids });
  }
  setDocumentActive(id: string, isActive: boolean) {
    return this.requestPut<DocumentItem>(`/documents/${id}/active`, {
      isActive,
    });
  }
  deleteDocument(id: string) {
    return this.requestDelete(`/documents/${id}`);
  }
  saveFaq(faqs: FaqItem[]) {
    return this.requestPut<FaqItem[]>("/faq", { faqs });
  }
  reorderFaq(ids: string[]) {
    return this.requestPatch<{ success: boolean }>("/faq/reorder", { ids });
  }
  createUser(body: Record<string, unknown>) {
    return this.requestPost<AdminUser>("/users", body);
  }
  updateUser(id: string, body: Record<string, unknown>) {
    return this.requestPatch<AdminUser>(`/users/${id}`, body);
  }
  setUserActive(id: string, isActive: boolean) {
    return this.requestPut<AdminUser>(`/users/${id}/active`, { isActive });
  }
  updateClinic(body: Partial<Clinic>) {
    return this.requestPatch<Clinic>("/clinic", body);
  }
  createLocation(body: Record<string, unknown>) {
    return this.requestPost<ClinicLocation>("/clinic/locations", body);
  }
  updateLocation(id: string, body: Record<string, unknown>) {
    return this.requestPatch<ClinicLocation>(`/clinic/locations/${id}`, body);
  }
  setLocationActive(id: string, isActive: boolean) {
    return this.requestPut<ClinicLocation>(`/clinic/locations/${id}/active`, {
      isActive,
    });
  }
  saveFeatures(features: ClinicFeature[]) {
    return this.requestPut<ClinicFeature[]>("/clinic/features", { features });
  }
  saveSocialLinks(socialLinks: ClinicSocialLink[]) {
    return this.requestPut<ClinicSocialLink[]>("/clinic/social-links", {
      socialLinks,
    });
  }
  saveStatistics(statistics: ClinicStatistic[]) {
    return this.requestPut<ClinicStatistic[]>("/clinic/statistics", {
      statistics,
    });
  }
}
export const contentClientApi = new ContentClientApi();
