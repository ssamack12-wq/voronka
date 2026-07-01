export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Difficulty = 'low' | 'medium' | 'high';
export type StepStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'requires_attention';

export type ScenarioCategory = 'buy' | 'sell';

export interface ScenarioConditions {
  mortgage?: boolean;
  minors?: boolean;
  power_of_attorney?: boolean;
  inheritance?: boolean;
  matcapital?: boolean;
  less_than_3_years?: boolean;
  chain?: boolean;
  alternative?: boolean;
  multiple_owners?: boolean;
  cash_only?: boolean;
  newbuilding?: boolean;
  apartments?: boolean;
  share?: boolean;
  room?: boolean;
  urgent?: boolean;
  /** Есть ответы «Не знаю» — расширенные проверки */
  uncertainty?: boolean;
  verify_poa?: boolean;
  verify_minors?: boolean;
  verify_alternative?: boolean;
  verify_owners?: boolean;
}

export type PlanTier = 'base' | 'safe' | 'premium';

export type DealIntent =
  | 'buy_apartment'
  | 'sell_apartment'
  | 'buy_newbuilding'
  | 'buy_land'
  | 'sell_land';

export type LessThan3YearsAnswer = 'yes' | 'no' | 'unknown';

/** Уточнение для «Купить квартиру»: вторичка или новостройка */
export type HousingTypeAnswer = 'secondary' | 'newbuilding';

export interface QuizAnswers {
  intent: DealIntent;
  /** Заполняется при intent === buy_apartment */
  housingType?: HousingTypeAnswer;
  mortgage: boolean;
  matcapital: boolean;
  powerOfAttorney: boolean;
  minors: boolean;
  alternative: boolean;
  multipleOwners: boolean;
  lessThan3Years: LessThan3YearsAnswer;
  /** ID вопросов, на которые ответили «Не знаю» */
  unknownFields?: string[];
}

export interface DealWarning {
  id: string;
  title: string;
  body: string;
  severity: 'warning' | 'high';
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  mandatory: boolean;
  tutorialId?: string;
}

export interface DealStep {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  estimatedTime: string;
  difficulty: Difficulty;
  riskLevel: RiskLevel;
  required: boolean;
  phase: string;
  checklist: ChecklistItem[];
  tutorialIds: string[];
  documentIds: string[];
  warnings: string[];
  nextStepIds: string[];
}

export interface TutorialSection {
  title: string;
  content: string;
  links?: { label: string; url: string }[];
}

export interface TutorialSubtaskAction {
  afterStep: number;
  label: string;
  url: string;
}

export interface TutorialSubtask {
  id: string;
  title: string;
  purpose: string;
  requiredData: string[];
  steps: string[];
  stepActions?: TutorialSubtaskAction[];
  expectedResult: string[];
  redFlags: string[];
  whatToDoIfRiskFound: string[];
  estimatedTime: string;
  difficulty: string;
  links?: { label: string; url: string }[];
}

export interface Tutorial {
  id: string;
  checklistItemId?: string;
  stepId?: string;
  title: string;
  summary: string;
  whatIsIt: string;
  whyNeeded: string;
  requirements: string[];
  estimatedTime: string;
  steps: { order: number; title: string; description: string }[];
  subtasks?: TutorialSubtask[];
  commonMistakes: string[];
  redFlags: string[];
  nextActions: string[];
  links: { label: string; url: string }[];
  faq: { q: string; a: string }[];
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  scenarioTags: string[];
}

export interface Rule {
  id: string;
  label: string;
  when: Partial<ScenarioConditions>;
  addStepIds?: string[];
  removeStepIds?: string[];
  riskFactorIds?: string[];
}

export interface RiskFactor {
  id: string;
  label: string;
  level: RiskLevel;
  description: string;
}

export interface ScenarioDefinition {
  id: string;
  category: ScenarioCategory;
  title: string;
  description: string;
  complexity: number;
  baseRisk: RiskLevel;
  estimatedDuration: string;
  conditions: ScenarioConditions;
  baseStepIds: string[];
  icon?: string;
}

export interface ResolvedDeal {
  scenario: ScenarioDefinition;
  steps: DealStep[];
  riskFactors: RiskFactor[];
  aggregateRisk: RiskLevel;
  warnings: DealWarning[];
  riskScore: number;
  quizRiskLevel: 'low' | 'medium' | 'high';
  displayTitle: string;
  complexity: number;
}

export interface ChecklistProgress {
  [itemId: string]: boolean;
}

export interface SubtaskProgress {
  [subtaskId: string]: boolean;
}

export interface StepProgress {
  status: StepStatus;
  checklist: ChecklistProgress;
  subtasks?: SubtaskProgress;
}

export type DealStatus = 'active' | 'completed';

export interface DealProgress {
  id?: string;
  scenarioId: string;
  startedAt: string;
  updatedAt?: string;
  completedAt?: string;
  status?: DealStatus;
  percent?: number;
  steps: Record<string, StepProgress>;
  /** @deprecated use plan */
  isPremium?: boolean;
  plan: PlanTier;
  conditions?: ScenarioConditions;
  quizAnswers?: QuizAnswers;
  riskScore?: number;
  displayTitle?: string;
}

export interface DealSummary {
  id: string;
  scenarioId: string;
  displayTitle: string;
  status: DealStatus;
  percent: number;
  updatedAt: string;
  startedAt: string;
  currentStepTitle?: string;
  completedAt?: string;
}

export type NavigatorTab = 'deal' | 'deals' | 'calendar' | 'profile';
export type NavigatorScreen =
  | 'scenarios'
  | 'deal'
  | 'step'
  | 'checklist-item'
  | 'calendar'
  | 'profile'
  | 'lead';
