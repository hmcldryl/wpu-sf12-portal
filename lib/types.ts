export type EmploymentType = "Faculty" | "Staff";

export type Sex = "Male" | "Female" | "Prefer not to say";

export type ScoreBand = "Above Average" | "Average" | "Below Average";

export interface RespondentInfo {
  name: string;
  employeeId?: string;
  department: string;
  employmentType: EmploymentType;
  age: number;
  sex: Sex;
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
  name: string;
  employeeId?: string;
  department: string;
  employmentType: EmploymentType;
  age: number;
  sex: string;
  rawResponses: SF12RawResponses;
  pcs12: number;
  mcs12: number;
}
