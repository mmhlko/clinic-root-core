export enum DoctorEducationType {
  EDUCATION = "education",
  QUALIFICATION = "qualification",
  RETRAINING = "retraining",
  CERTIFICATION = "certification",
}

export interface DoctorEducation {
  id: string;
  type: DoctorEducationType;
  title: string;
  institution: string | null;
  year: number | null;
  description: string | null;
  sortOrder: number;
}

export interface DoctorDirection {
  id: string;
  name: string;
}

export interface DoctorSkill {
  id: string;
  name: string;
}

export interface DoctorListItem {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  specialization: string;
  experienceStartYear: number;
  photoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor extends DoctorListItem {
  description: string | null;
  educations: DoctorEducation[];
  directions: DoctorDirection[];
  skills: DoctorSkill[];
}

export interface CreateDoctorEducationRequest {
  type: DoctorEducationType;
  title: string;
  institution?: string;
  year?: number;
  description?: string;
  sortOrder?: number;
}

export interface CreateDoctorRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  specialization: string;
  experienceStartYear: number;
  description?: string;
  photoUrl?: string;
  educations?: CreateDoctorEducationRequest[];
  directionIds?: string[];
  skillIds?: string[];
}

export interface UpdateDoctorRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  specialization?: string;
  experienceStartYear?: number;
  description?: string | null;
  photoUrl?: string | null;
  educations?: CreateDoctorEducationRequest[];
  directionIds?: string[];
  skillIds?: string[];
}