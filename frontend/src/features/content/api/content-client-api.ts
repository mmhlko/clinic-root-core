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
  AdminUserCreateData,
  AdminUserUpdateData,
  CreateTenantClinicRequest,
  CreatedTenantClinic,
  ClinicStatus,
} from "../types/content.types";
import apiClient from "@/lib/api/client";

class ContentClientApi extends RootApi {
  constructor() {
    super(apiClient);
  }
  platformClinics() {
    return this.requestGet<Clinic[]>("/clinic/root");
  }
  createPlatformClinic(body: CreateTenantClinicRequest) {
    return this.requestPost<CreatedTenantClinic, CreateTenantClinicRequest>("/clinic", body);
  }
  updatePlatformClinic(id: string, body: { slug?: string; status?: ClinicStatus }) {
    return this.requestPatch<Clinic>(`/clinic/root/${id}`, body);
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
  createUser(body: AdminUserCreateData) {
    return this.requestPost<AdminUser>("/users", body);
  }
  updateUser(id: string, body: AdminUserUpdateData) {
    return this.requestPatch<AdminUser>(`/users/${id}`, body);
  }
  updateMyProfile(body: {
    firstName: string;
    lastName: string;
    email: string;
    photoMediaId?: string | null;
    password?: string;
  }) {
    return this.requestPatch<AdminUser>("/users/me", body);
  }
  setUserActive(id: string, isActive: boolean) {
    return this.requestPut<AdminUser>(`/users/${id}/active`, { isActive });
  }
  deleteUser(id: string) {
    return this.requestDelete<{ id: string }>(`/users/${id}`);
  }
  updateClinic(body: Partial<Omit<Clinic, "id">>) {
    return this.requestPatch<Clinic>("/clinic", body);
  }
  createLocation(body: Omit<ClinicLocation, "id">) {
    return this.requestPost<ClinicLocation>("/clinic/locations", body);
  }
  updateLocation(id: string, body: Partial<Omit<ClinicLocation, "id">>) {
    return this.requestPatch<ClinicLocation>(`/clinic/locations/${id}`, body);
  }
  setLocationActive(id: string, isActive: boolean) {
    return this.requestPut<ClinicLocation>(`/clinic/locations/${id}/active`, {
      isActive,
    });
  }
  reorderLocations(ids: string[]) {
    return this.requestPatch<{ success: boolean }>("/clinic/locations/reorder", {
      ids,
    });
  }
  deleteLocation(id: string) {
    return this.requestDelete<{ message: string }>(`/clinic/locations/${id}`);
  }
  saveFeatures(features: (Omit<ClinicFeature, "id"> & { id?: string })[]) {
    return this.requestPut<ClinicFeature[]>("/clinic/features", { features });
  }
  saveSocialLinks(socialLinks: (Omit<ClinicSocialLink, "id"> & { id?: string })[]) {
    return this.requestPut<ClinicSocialLink[]>("/clinic/social-links", {
      socialLinks,
    });
  }
  deleteSocialLink(id: string) {
    return this.requestDelete<{
      message: string;
    }>(`/clinic/social-links/${id}`);
  }
  saveStatistics(statistics: (Omit<ClinicStatistic, "id"> & { id?: string })[]) {
    return this.requestPut<ClinicStatistic[]>("/clinic/statistics", {
      statistics,
    });
  }
}
export const contentClientApi = new ContentClientApi();
