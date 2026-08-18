export interface AlignedStandard {
  standardBody: string; // GAHAR 2025, CBAHI, JCI, OSHA, CDC, WHO, National IPC 2020
  clauseNumber?: string;
  description: string;
}

export interface PolicyCard {
  titleArabic: string;
  titleEnglish: string;
  policyCode: string;
  domain: string;
  departments: string[];
  effectiveDate?: string;
  reviewCycle?: string;
  alignedStandards: AlignedStandard[];
}

export interface PurposeAndScope {
  mainObjective: string;
  clinicalRationale: string;
  scope: string[];
  exclusions?: string[];
}

export interface ScientificDefinition {
  term: string;
  definition: string;
  clinicalSignificance?: string;
}

export interface TechnicalSpecification {
  techniqueName: string;
  agentAndConcentration: string;
  requiredVolume?: string;
  contactTime: string;
  indications: string[];
  contraindicationsOrLimitations?: string[];
}

export interface FiveMomentsDetail {
  momentNumber: number;
  momentName: string;
  timing: string;
  clinicalExamples: string[];
}

export interface SkinAndGloveCare {
  gloveProtocols: string[];
  skinProtectionAndDermatitis: string[];
  jewelryAndNailRegulations: string[];
}

export interface InfrastructureRequirements {
  sinkSpecifications: string[];
  dispenserAndConsumables: string[];
  maintenanceAndRefillRules: string[];
}

export interface RoleResponsibility {
  role: string;
  responsibilities: string[];
}

export interface SopStep {
  stepNumber: number;
  title: string;
  details: string;
  assignedTo?: string;
  keySafetyPoint?: string;
}

export interface SopPhases {
  preProcedure: SopStep[];
  execution: SopStep[];
  postProcedure: SopStep[];
}

export interface SafetyWarnings {
  criticalControlPoints: string[];
  dos: string[];
  donts: string[];
  emergencyIncidentProtocol: string;
}

export interface MermaidFlowchart {
  code: string;
  description: string;
}

export interface AuditChecklistItem {
  id: string;
  checkpoint: string;
  standardReference: string;
  evidenceRequired: string;
  frequency: string;
  status?: 'compliant' | 'partial' | 'non_compliant' | 'untested';
  notes?: string;
}

export interface KPIItem {
  name: string;
  formula: string;
  target: string;
  frequency: string;
  responsiblePerson?: string;
}

export interface ComplianceAndKPIs {
  auditChecklist: AuditChecklistItem[];
  kpis: KPIItem[];
  gapAnalysisAndRecommendations: string[];
}

export interface PolicyAnalysisResult {
  policyCard: PolicyCard;
  purposeAndScope: PurposeAndScope;
  scientificDefinitions?: ScientificDefinition[];
  technicalSpecifications?: TechnicalSpecification[];
  fiveMomentsDetails?: FiveMomentsDetail[];
  skinAndGloveCare?: SkinAndGloveCare;
  infrastructureRequirements?: InfrastructureRequirements;
  rolesAndResponsibilities: RoleResponsibility[];
  sopPhases: SopPhases;
  safetyWarningsAndCriticalSteps: SafetyWarnings;
  mermaidFlowchart: MermaidFlowchart;
  complianceAndKPIs: ComplianceAndKPIs;
  executiveSummarySnippet: string;
  analyzedAt?: string;
}

export interface SamplePolicy {
  id: string;
  title: string;
  category: string;
  accreditation: string[];
  summary: string;
  content: string;
}

