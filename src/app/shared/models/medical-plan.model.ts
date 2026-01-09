export interface MedicalPlan {
  id: string;
  code: string;
  name: string;
  coverageSummary: CoverageSummary[];
  active: boolean;
}

export type CoverageSummary =
  | 'Major Medical'
  | 'Hospitalization'
  | 'Prescription'
  | 'Dental'
  | 'Vision'
  | 'Other'
  | 'Waiver Plan'
  | 'Self Insured';

export interface CoverageConfiguration {
  type: CoverageSummary;
  employee: boolean;
  dependent: boolean;
}

export interface CoverageRate {
  coverageCodeId: string;
  rate: number;
  projectedRate?: number;
  districtPortionDollar?: number;
  districtPortionPercent?: number;
}

export type PlanContribution = 'Ch. 44' | 'Ch. 44-GSHP' | 'Ch. 78' | 'None';

export interface MedicalPlanDetail extends MedicalPlan {
  coverageConfiguration: CoverageConfiguration[];
  coverageRates: CoverageRate[];
  planContribution: PlanContribution;
}
