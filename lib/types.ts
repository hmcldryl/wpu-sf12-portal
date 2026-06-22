export type EmploymentType = "Faculty" | "Staff";

// Sex at birth, gender, age group, academic rank, and employment status are
// dropdowns with an "Other" choice that accepts free-text — so these are
// plain strings rather than closed unions. See lib/respondentOptions.ts for
// the preset option lists shown in the dropdowns.
export type SexAtBirth = string;

export type Gender = string;

export type AgeGroup = string;

export type AcademicRank = string;

export type TeachingLoad = number;

export type EmploymentStatus = string;

export type YesNo = "Yes" | "No";

export type ScoreBand = "Above Average" | "Average" | "Below Average";

export interface RespondentInfo {
  collegeUnit: string;
  campus: string;
  ageGroup: AgeGroup;
  sexAtBirth: SexAtBirth;
  gender: Gender;
  employmentType: EmploymentType;
  academicRank?: AcademicRank;
  teachingLoad?: TeachingLoad;
  employmentStatus: EmploymentStatus;
  salaryGrade: number;
  walkableSpaces: YesNo;
}

export type SF12RawResponses = Record<string, number>;

export interface SF12Submission {
  respondentInfo: RespondentInfo;
  rawResponses: SF12RawResponses;
  pcs12: number;
  mcs12: number;
}

export interface SF12Response {
  id: string;
  timestamp: string;
  collegeUnit: string;
  campus: string;
  ageGroup: AgeGroup;
  sexAtBirth: SexAtBirth;
  gender: Gender;
  employmentType: EmploymentType;
  academicRank?: AcademicRank;
  teachingLoad?: TeachingLoad;
  employmentStatus: EmploymentStatus;
  salaryGrade: number;
  walkableSpaces: YesNo;
  rawResponses: SF12RawResponses;
  pcs12: number;
  mcs12: number;
}
