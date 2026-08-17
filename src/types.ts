export type SoilType = 'fill' | 'alluvium' | 'clay' | 'sand' | 'weathered_soil' | 'weathered_rock' | 'soft_rock' | 'hard_rock';

export interface SoilLayer {
  id: string;
  name: string;
  type: SoilType;
  depthTop: number; // m from GL
  depthBottom: number; // m from GL
  unitWeight: number; // kN/m³ (습윤/자연 단위중량)
  satUnitWeight: number; // kN/m³ (포화 단위중량)
  cohesion: number; // kN/m² (점착력 c)
  frictionAngle: number; // deg (내부마찰각 φ)
  subgradeReactionKh: number; // kN/m³ (수평지반반력계수)
  permeabilityK: number; // cm/s (투수계수)
  color: string;
  nValue: number; // SPT N치
}

export type WallStructureType = 'H_PILE_TIMBER' | 'CIP' | 'SCW' | 'SHEET_PILE' | 'DIAPHRAGM_WALL';

export interface WallSection {
  type: WallStructureType;
  name: string;
  totalLength: number; // m (총 말뚝/벽체 길이)
  embedmentDepth: number; // m (근입깊이)
  pileSpacing: number; // m (말뚝 설치 피치, e.g. 1.5m, 1.8m)
  elasticModulusE: number; // MPa (200,000 MPa for Steel)
  momentOfInertiaI: number; // cm4 (단위 또는 부재당 단면2차모멘트)
  sectionModulusZ: number; // cm³ (단면계수)
  crossSectionAreaA: number; // cm² (단면적)
  allowableBendingStress: number; // MPa (허용휨응력, e.g. 210 MPa for SM355)
  allowableShearStress: number; // MPa (허용전단응력, e.g. 120 MPa)
  corrosionAllowance: number; // mm
  description: string;
}

export type StrutType = 'PIPE_STRUT' | 'H_BEAM' | 'GROUND_ANCHOR';

export interface StrutTier {
  id: string;
  tier: number; // 1단, 2단, 3단...
  depth: number; // m (GL로부터 설치 깊이)
  type: StrutType;
  specName: string; // e.g. "Φ609.6×12t", "H-300×300×10×15"
  horizontalSpacing: number; // m (버팀보 수평 간격, e.g. 3.0m, 4.0m)
  excavationWidth: number; // m (정거장 굴착폭/버팀보 지간, e.g. 20.0m)
  hasCenterPost: boolean; // 중간말뚝 유무 (좌굴장 1/2 감소)
  preloadTon: number; // kN or tonf (초기 프리로드 선하중)
  crossSectionAreaA: number; // cm²
  momentOfInertiaI: number; // cm4
  elasticModulusE: number; // MPa
  allowableAxialStress: number; // MPa (허용압축응력)
  waleSpecName: string; // e.g. "2H-300×300×10×15"
  waleZ: number; // cm³ (띠장 단면계수)
  waleAllowableBending: number; // MPa
  installedAtStep: number; // 이 지보가 설치되는 단계
}

export interface ExcavationStage {
  step: number;
  name: string;
  excavationDepth: number; // m (현재 굴착 깊이)
  activeStrutIds: string[]; // 현재 활성화된 버팀보 ID 목록
  description: string;
  isCompleted: boolean;
}

export interface CenterPostConfig {
  enabled: boolean;
  count: number; // 1열(중앙 1본) or 2열
  specName: string; // e.g. "H-300×300×10×15 (SM355)" or "H-350×350×12×19"
  spacing: number; // m (종방향 설치간격, e.g. 3.0m, 4.0m)
  totalLength: number; // m (지표부터 지지암반까지 총길이, e.g. 28.0m)
  embedmentDepth: number; // m (굴착면 하부 근입장, e.g. 8.0m)
  crossSectionAreaA: number; // cm²
  momentOfInertiaI: number; // cm4
  elasticModulusE: number; // MPa
  allowableAxialStress: number; // MPa
  allowableBearingCapacity: number; // kN (지반 허용연직지지력 Qa, e.g. 1800 kN)
  deckGirderSpec: string; // 복공 주형보 규격 e.g. "H-400×400×13×21 (SM355)"
  trafficLoadType: 'DB-24' | 'KL-510' | 'STANDARD_URBAN'; // 도로교통하중 규준
  deckSelfWeight: number; // kN/m² (복공판+주형보 자중, 약 3.5 kN/m²)
  trafficWheelLoad: number; // kN (DB-24 후륜하중 96kN or KL-510)
  impactFactor: number; // 충격계수 i (e.g. 0.30)
}

export interface ProjectSettings {
  projectName: string;
  stationName: string;
  location: string;
  roadWidth: number; // m (도로 폭)
  stationWidth: number; // m (정거장 굴착폭)
  finalExcavationDepth: number; // m (최종 굴착 심도)
  groundWaterTable: number; // m (지하수위 GL -m)
  surchargeLoad: number; // kN/m² (상재하중: 도로교통하중 q)
  earthPressureTheory: 'PECK' | 'RANKINE' | 'TSCHEBOTARIOFF';
  seismicCoefficient: number; // kh (지진계수, 0.12 etc)
  deckHouseLoad: number; // kN/m (복공판 및 주형보 자중)
  centerPost?: CenterPostConfig; // 중간말뚝 (교통하중 지지용)
}

export interface DepthAnalysisPoint {
  depth: number; // m
  soilName: string;
  soilType: SoilType;
  activeEarthPressure: number; // kN/m²
  waterPressure: number; // kN/m²
  surchargePressure: number; // kN/m²
  totalLateralPressure: number; // kN/m²
  passiveResistance: number; // kN/m² (굴착면 하부)
  bendingMoment: number; // kN·m/m
  shearForce: number; // kN/m
  displacement: number; // mm (수평변위)
  strutReaction?: number; // kN/m (해당 깊이에 버팀보가 있을 경우)
}

export interface StrutResult {
  tier: number;
  depth: number;
  specName: string;
  spacing: number;
  reactionPerMeter: number; // kN/m
  totalAxialForce: number; // kN
  allowableForce: number; // kN
  effectiveLength: number; // m (좌굴 유효길이)
  slendernessRatio: number; // 세장비 λ
  actualStress: number; // MPa
  allowableStress: number; // MPa
  utilizationRatio: number; // %
  isSafe: boolean;
  waleMoment: number; // kN·m
  waleBendingStress: number; // MPa
  waleUtilizationRatio: number; // %
  isWaleSafe: boolean;
}

export interface CenterPostResult {
  enabled: boolean;
  totalVerticalLoad: number; // kN (복공자중 + 교통하중 + 버팀보 자중)
  deckDeadLoad: number; // kN
  trafficLiveLoad: number; // kN (차륜하중 * 충격계수)
  strutIncidentalLoad: number; // kN
  allowableBearingCapacity: number; // kN (지반 허용지지력 Qa)
  bearingSafetyFactor: number; // Fs = Qa / Pv
  isBearingSafe: boolean;
  unsupportedLength: number; // m (버팀보 단 사이 최대 비지지장)
  slendernessRatio: number; // λ = Lk / r
  actualAxialStress: number; // MPa
  allowableBucklingStress: number; // MPa
  stressUtilizationRatio: number; // %
  isStressSafe: boolean;
  strutBucklingReductionEffect: string; // e.g. "좌굴길이 50% 감소 (20m -> 10m)"
}

export interface SettlementPoint {
  distance: number; // m (벽체로부터의 수평거리)
  settlement: number; // mm (지표 침하량)
}

export interface GeotechnicalSafetyResults {
  // 1. 히빙 (Heaving)
  heavingFs: number;
  heavingRequiredFs: number;
  heavingSafe: boolean;
  heavingCriticalDepth: number; // m

  // 2. 보일링 (Boiling / Quick Sand)
  boilingFs: number;
  boilingRequiredFs: number;
  boilingSafe: boolean;
  criticalHydraulicGradient: number;
  actualHydraulicGradient: number;

  // 3. 파이핑 (Piping)
  pipingCreepRatio: number;
  pipingRequiredRatio: number;
  pipingSafe: boolean;

  // 4. 근입장 수동토압 안전율 (Embedment Overturning Fs)
  embedmentFs: number;
  embedmentRequiredFs: number;
  embedmentSafe: boolean;

  // 5. 벽체 최대 응력 및 변위
  maxBendingMoment: number; // kN·m/m
  maxBendingStress: number; // MPa
  allowableBendingStress: number; // MPa
  wallStressUtilization: number; // %
  isWallStressSafe: boolean;

  maxDisplacement: number; // mm
  allowableDisplacement: number; // mm (0.2% ~ 0.5% H)
  isDisplacementSafe: boolean;

  // 6. 배면 지표 침하 최대치
  maxSettlement: number; // mm
  settlementProfile: SettlementPoint[];

  // 7. 중간말뚝 (교통하중 지지용 King Post) 안정성
  centerPost?: CenterPostResult;
}

export interface AnchorTier {
  id: string;
  tier: number; // 1단, 2단, 3단...
  depth: number; // m (GL로부터 설치 깊이)
  angleDeg: number; // deg (설계 경사각, e.g. 20°)
  spacing: number; // m (수평 설치 간격 Sh, e.g. 1.5m, 2.0m)
  strutEquivalentReaction: number; // kN/m (대체할 스트럿 수평반력)
  designTensionTd: number; // kN (앵커 1공당 설계 축인장력: (R * Sh)/cos θ)
  horizontalForceTh: number; // kN (수평분력)
  verticalForceTv: number; // kN (연직하향분력: 벽체 추가 연직하중)
  freeLengthLf: number; // m (자유장: 가상파괴면 + 여유장 1.5m)
  bondLengthLe: number; // m (정착장: 지반 인발마찰저항 기준)
  totalLength: number; // m (총 천공장: Lf + Le + 두부 여유 1.0m)
  strandSpec: string; // e.g. "Φ12.7mm (SWPC 7B)"
  strandCount: number; // 본 (가닥수, e.g. 4가닥, 5가닥)
  strandTensileCapacity: number; // kN (강선 총 허용 인장내력)
  strandUtilizationRatio: number; // % (인장 응력비)
  bondSoilName: string; // 정착체 위치 지반명 (e.g. "풍화암", "연암", "경암")
  bondRockType?: 'weathered_rock' | 'soft_rock' | 'hard_rock' | 'AUTO'; // 선택된 정착암 종류
  bondSkinFrictionUlt: number; // kPa (지반 극한 마찰저항력)
  pulloutSafetyFactor: number; // Fs (인발안전율 >= 2.0)
  isPulloutSafe: boolean;
  isStrandSafe: boolean;
  drillingDiameter: number; // mm (천공경, e.g. 115mm, 135mm)
}

export interface AnchorSystemSummary {
  sectionLength: number; // m (산정 대상 가시설 연장, e.g. 50m / 100m)
  wallSides: 'BOTH' | 'SINGLE'; // 양측 벽체 or 편측 벽체
  totalAnchorCount: number; // EA (총 소요 앵커 공수)
  totalDrillingLength: number; // m (총 천공연장)
  totalStrandLength: number; // m (총 강선 소요연장)
  totalStrandWeightTon: number; // ton (PC강선 총 중량)
  totalGroutVolumeM3: number; // m³ (시멘트 그라우트 주입량)
  totalAnchorHeadSets: number; // Set (앵커헤드 및 지압판 수량)
  wallMaxBendingMoment: number; // kN·m/m
  wallBendingStress: number; // MPa
  wallStressUtilization: number; // %
  wallMaxDisplacement: number; // mm
  waleSpec: string; // 띠장 규격 (e.g. 2H-300x300x10x15)
  waleBendingStress: number; // MPa (2H 띠장 휨응력)
  waleStressUtilization: number; // % (띠장 응력비)
  isWaleSafe: boolean;
  pileBearingCapacity: number; // kN (말뚝 허용연직지지력)
  pileBearingFs: number; // 연직지지 안전율 (Fs >= 2.5)
  isPileBearingSafe: boolean;
  groupAnchorEfficiency: number; // 앵커 군효과 효율계수 (η >= 0.95)
  isEquallySafe: boolean;
  safetyMarginMatchRate: number; // % (스트럿 대비 안전율 일치도)
  totalSteelWeightTon: number; // Ton (앵커 강재 및 띠장 총 강재량)
}

export interface StageAnchorAnalysis {
  step: number;
  stageName: string;
  excavationDepth: number; // m
  activeAnchorTiers: AnchorTier[];
  newlyInstalledTier: AnchorTier | null;
  totalPreloadTension: number; // kN
  totalVerticalDownwardForce: number; // kN (엄지말뚝 작용 하향분력)
  pileBearingCapacity: number; // kN (엄지말뚝 허용연직지지력)
  pileBearingFs: number; // 연직지지 안전율 (Fs >= 2.5)
  isPileBearingSafe: boolean;
  maxBendingMoment: number; // kN·m/m
  maxWallDisplacement: number; // mm
  stepDrillingLength: number; // m (당해 단계 천공연장)
  stepStrandWeightTon: number; // Ton
  cumulativeAnchorCount: number; // EA
  cumulativeDrillingLength: number; // m
  cumulativeStrandWeightTon: number; // Ton
  cumulativeGroutVolumeM3: number; // m³
  stepDescription: string;
}

export interface CostItem {
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number; // 원
  amount: number; // 원
  note?: string;
}

export interface StrutCostBreakdown {
  deckGirderInstall?: CostItem; // 복공 주형보 제작·설치 및 해체
  deckGirderRental?: CostItem; // 복공 주형보 강재 손료 및 임대료
  deckPlateInstall?: CostItem; // 도로 복공판(2.0×0.75m) 가설 및 손료
  strutSteelRental: CostItem; // 버팀보 강재 손료/임대료 (6개월 기준)
  strutInstallDismantle: CostItem; // 버팀보 설치/해체
  strutWaleInstall: CostItem; // 띠장 및 브래킷 설치/해체
  hydraulicPrestress: CostItem; // 유압잭 프리스트레스 가압
  centerPostCost: CostItem; // 가설 중간말뚝 및 브레이싱
  excavationEfficiencyLoss: CostItem; // 버팀보 간섭에 따른 굴착·골조 능률 저하비용
  totalDirectCost: number; // 직접 공사비 (원)
  totalCostWithInterference: number; // 시공성 간섭비용 포함 총비용 (원)
  costPerMeter: number; // m당 공사비 (원/m)
}

export interface AnchorCostBreakdown {
  deckGirderInstall?: CostItem; // 복공 주형보 제작·설치 및 해체
  deckGirderRental?: CostItem; // 복공 주형보 강재 손료 및 임대료
  deckPlateInstall?: CostItem; // 도로 복공판(2.0×0.75m) 가설 및 손료
  anchorDrilling: CostItem; // 앵커 천공 (토사/암반 가압)
  pcStrandSupplyInstall: CostItem; // PC강선 자재 및 조립·삽입
  groutInjection: CostItem; // 시멘트 그라우트 재료 및 가압주입
  anchorHeadBearingPlate: CostItem; // 앵커헤드 및 지압판
  anchorWaleInstall: CostItem; // 2H-띠장 설치·해체
  tensioningTesting: CostItem; // 인장 긴장 및 확인시험
  workEfficiencySavings: CostItem; // 무지주 시공에 따른 굴착·골조 공기단축 절감액
  totalDirectCost: number; // 직접 공사비 (원)
  netTotalCost: number; // 공기단축/시공성 반영 순 총공사비 (원)
  costPerMeter: number; // m당 공사비 (원/m)
}

export interface CostComparisonSummary {
  strutCost: StrutCostBreakdown;
  anchorCost: AnchorCostBreakdown;
  costDifference: number; // 원 (절감액: 스트럿 - 앵커)
  costReductionRate: number; // % (절감율)
  costPerMStrut: number; // 원/m
  costPerMAnchor: number; // 원/m
  winnerMethod: 'ANCHOR' | 'STRUT' | 'EQUAL';
  economicVerdict: string;
}

export interface AngleSensitivityItem {
  angleDeg: number; // deg (15, 20, 25, 30, 35, 40)
  angleLabel: string;
  avgDesignTensionTd: number; // kN (평균 설계인장력)
  maxStrandCount: number; // 본 (최대 필요 강선 가닥수)
  totalDrillingLength: number; // m (총 천공연장)
  totalStrandWeightTon: number; // Ton (PC강선 총 중량)
  totalGroutVolumeM3: number; // m³ (시멘트 그라우트량)
  totalAnchorCost: number; // 원 (앵커 순 총공사비)
  costPerMeter: number; // 원/m
  costDifference: number; // 원 (스트럿 대비 절감액)
  costReductionRate: number; // % (절감율)
  pileBearingFs: number; // 엄지말뚝 연직지지 안전율
  isStructuralSafe: boolean; // 구조계산 100% OK 여부
  structuralVerdict: string; // "100% SAFE"
  characteristic: string; // 특성 및 장단점 가이드
  isRecommended: boolean; // 추천 여부 (20° 표준)
}

export interface HybridDesignParams {
  strutSpacing: number; // 광간격 버팀보 배치 간격 (m, e.g. 8, 10, 12, 15, 20)
  anchorsBetweenStruts: number; // 버팀보 사이 앵커 설치 공수 (공, e.g. 2, 3, 4, 5)
  anchorSpacing: number; // 중간 앵커 간격 (m, e.g. 2.0, 2.5)
  anchorLoadRatio: number; // 앵커 수평하중 분담율 (%, e.g. 65)
  strutLoadRatio: number; // 버팀보 수평하중 분담율 (%, e.g. 35)
  waleSpec: string; // 복합 띠장 규격 (e.g. 2H-350×350×12×19)
}

export interface HybridCostBreakdown {
  strutDirectCost: number; // 광간격 버팀보 직접비 (원)
  anchorDirectCost: number; // 중간 앵커 직접비 (원)
  deckTotalCost: number; // 복공 주형보/복공판 공사비 (원)
  totalDirectCost: number; // 직접 공사비 합계 (원)
  excavationSavings: number; // 대형 개구부(10m) 확보에 따른 토공비 절감액 (원)
  reStrutSavings: number; // 버팀보 관통/해체 감소에 따른 절감액 (원)
  scheduleSavings: number; // 공기 단축에 따른 간접경비 절감액 (원)
  netTotalCost: number; // LCC 순 총공사비 (원)
  costPerMeter: number; // 원/m
}

export interface HybridSystemResult {
  params: HybridDesignParams;
  strutCount: number; // 광간격 버팀보 설치 본수
  strutSteelWeightTon: number; // 버팀보 강재량 (Ton)
  anchorCount: number; // 중간 앵커 총 공수
  anchorDrillingLength: number; // 앵커 총 천공연장 (m)
  anchorStrandWeightTon: number; // PC강선 중량 (Ton)
  centerPostCount: number; // 중간말뚝 본수
  
  // 구조 안전성 검토 (동일 안전율 100% 만족)
  wallBendingStress: number; // MPa
  wallUtilization: number; // %
  waleBendingMoment: number; // kN·m
  waleBendingStress: number; // MPa
  waleUtilization: number; // %
  strutAxialForce: number; // kN (광간격 버팀보 1본당 축력)
  strutStressRatio: number; // %
  anchorDesignTensionTd: number; // kN (1공당 설계인장력)
  anchorStressRatio: number; // %
  isStructuralSafe: boolean; // 100% OK
  
  // 정량적 공기(Schedule) 분석
  excavationCycleSec: number; // 토공 사이클타임 (초)
  dailyExcavationM3: number; // 일일 토공 반출량 (m³/일)
  excavationDurationDays: number; // 토공 소요일수 (일)
  totalProjectDurationDays: number; // 총 가시설 공기 (일)
  durationSavingsDays: number; // 전구간 버팀보 대비 공기 단축 일수 (일)
  
  costBreakdown: HybridCostBreakdown;
  comparison3Way: {
    category: string;
    strutOnly: string;
    anchorOnly: string;
    hybridSystem: string;
    verdict: 'HYBRID' | 'ANCHOR' | 'STRUT';
    comment: string;
  }[];
}

export interface AnchorComparisonResult {
  tiers: AnchorTier[];
  fullStageTiers: AnchorTier[]; // 전체 완료 기준 모든 단 앵커
  stagesAnalysis: StageAnchorAnalysis[]; // 공정 단계별 앵커 설계 및 수량 매트릭스
  summary: AnchorSystemSummary;
  costComparison: CostComparisonSummary; // 정밀 공사비 및 경제성 비교
  angleSensitivityMatrix?: AngleSensitivityItem[]; // 앵커 각도별(15°~40°) 수량·공사비 감응도 비교
  hybridResult?: HybridSystemResult; // 제3안: 버팀보+앵커 복합공법 해석 결과
  strutSummary: {
    totalStrutTiers: number;
    totalStrutCount: number;
    totalSteelWeightTon: number;
    hasCenterPost: boolean;
    centerPostCount: number;
    maxDisplacement: number;
    wallBendingStress: number;
    wallUtilization: number;
    interferenceLevel: string;
  };
  comparisonPoints: {
    category: string;
    strutSystem: string;
    anchorSystem: string;
    advantage: 'ANCHOR' | 'STRUT' | 'EQUAL';
    description: string;
  }[];
}

export interface CalculationResult {
  step: number;
  currentExcavationDepth: number;
  points: DepthAnalysisPoint[];
  strutResults: StrutResult[];
  safety: GeotechnicalSafetyResults;
  summaryStatus: 'SAFE' | 'WARNING' | 'DANGER';
}
