import { Doctor } from "@/features/doctors/types/doctors.types";

export const getDoctorFullName = (doctor: Partial<Doctor>): string => {
  return [doctor.lastName, doctor.firstName, doctor.middleName]
    .filter(Boolean)
    .join(" ");
};

export function getPersonName(
  firstName: string | null,
  lastName: string | null,
  middleName: string | null = null,
) {
  return [firstName, lastName, middleName]
    .filter(Boolean)
    .join(" ");
}