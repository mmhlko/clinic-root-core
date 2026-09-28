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

export interface DoctorDirectionRelation {
  id: string;
  doctorId: string;
  directionId: string;
  sortOrder: number;
  direction: DoctorSkill;
}

export interface DoctorSkillRelation {
  id: string;
  doctorId: string;
  skillId: string;
  sortOrder: number;
  skill: DoctorSkill;
}

export interface DoctorReferenceOption {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface MediaDbData {
  id: string;
  url: string;
}

export interface DoctorListItem {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  specialization: string;
  experienceStartYear: number;
  photoMedia?: MediaDbData;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor extends DoctorListItem {
  description: string | null;
  educations: DoctorEducation[];
  directions: DoctorDirectionRelation[];
  skills: DoctorSkillRelation[];
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
  photoMediaId?: string;
  isActive: boolean;
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
  photoMediaId?: string | null;
  educations?: UpdateDoctorEducationRequest[];
  directionIds?: string[];
  skillIds?: string[];
}

export interface UpdateDoctorEducationRequest extends CreateDoctorEducationRequest {
  id?: string;
}

export interface SkillCreateRequest {
  name: string;
}
