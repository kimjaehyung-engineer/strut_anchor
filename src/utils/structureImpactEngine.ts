import { ProjectSettings } from '../types';

export interface StructureImpactItem {
  category: string;
  subItem: string;
  unit: string;
  strutQty: number;
  strutUnitCost: number;
  strutAmount: number;
  strutDays: number;
  strutDescription: string;
  anchorQty: number;
  anchorUnitCost: number;
  anchorAmount: number;
  anchorDays: number;
  anchorDescription: string;
  hybridQty: number;
  hybridUnitCost: number;
  hybridAmount: number;
  hybridDays: number;
  hybridDescription: string;
  riskNote: string;
}

export interface StructureStageSim {
  stageNumber: number;
  stageName: string;
  stageSubtitle: string;
  strutStatus: string;
  strutWork: string;
  strutDays: number;
  strutInterference: string;
  strutRisk: string;
  anchorStatus: string;
  anchorWork: string;
  anchorDays: number;
  anchorInterference: string;
  anchorRisk: string;
  hybridStatus: string;
  hybridWork: string;
  hybridDays: number;
  hybridInterference: string;
  hybridRisk: string;
}

export interface StructureImpactResult {
  projectName: string;
  stationLength: number; // m
  stationWidth: number; // m
  excavationDepth: number; // m
  storyCount: number; // 층
  
  // 1. 중간말뚝(King Post) 관통 & 절단 분석
  kingPostAnalysis: {
    strutPostCount: number; // 본수
    strutPenetrationPoints: number; // 슬래브 관통 개소 (말뚝 * 슬래브층수)
    strutCutCost: number; // 원
    strutWaterproofingCost: number; // 원
    strutDays: number; // 일
    
    anchorPostCount: number; // 0
    anchorPenetrationPoints: number; // 0
    anchorCutCost: number; // 0
    anchorWaterproofingCost: number; // 0
    anchorDays: number; // 0
    
    hybridPostCount: number; // 본수 (광간격으로 60~70% 감소)
    hybridPenetrationPoints: number;
    hybridCutCost: number;
    hybridWaterproofingCost: number;
    hybridDays: number;
  };

  // 2. 외벽체(Side Wall) 2단 분할타설 vs 1단 일체타설 분석
  wallPouringAnalysis: {
    strutPouringType: '2-STAGE_SPLIT' | '1-STAGE_MONOLITHIC';
    strutJointCount: number; // 시공이음 발생 개소
    strutFormworkExtraCost: number; // 2단 분할 거푸집 추가비용
    strutWaterstopCost: number; // 지수판/방수처리비용
    strutDays: number; // 일
    strutColdJointRisk: 'HIGH' | 'MEDIUM' | 'NONE';

    anchorPouringType: '1-STAGE_MONOLITHIC';
    anchorJointCount: number; // 0
    anchorFormworkExtraCost: number; // 0
    anchorWaterstopCost: number; // 0
    anchorDays: number; // 0
    anchorColdJointRisk: 'NONE';

    hybridPouringType: 'PARTIAL_SPLIT';
    hybridJointCount: number;
    hybridFormworkExtraCost: number;
    hybridWaterstopCost: number;
    hybridDays: number;
    hybridColdJointRisk: 'LOW';
  };

  // 3. 슬래브 타설 시 버팀보 간섭 & 재지보(Re-strutting) 분석
  slabRestrutAnalysis: {
    strutRestrutBeamCount: number; // 재지보 빔 설치 개소
    strutRestrutCost: number; // 원
    strutFormworkInterferenceDays: number; // 동바리 조립 간섭 일수
    strutTotalDays: number; // 일

    anchorRestrutBeamCount: number; // 0
    anchorRestrutCost: number; // 0
    anchorFormworkInterferenceDays: number; // 0
    anchorTotalDays: number; // 0

    hybridRestrutBeamCount: number;
    hybridRestrutCost: number;
    hybridFormworkInterferenceDays: number;
    hybridTotalDays: number;
  };

  // 4. 총괄 비용 및 공기 집계
  costSummary: {
    strutStructureExtraCost: number; // 1안 본체 구조물 축조 추가 간섭비 (원)
    anchorStructureExtraCost: number; // 2안 (0원)
    hybridStructureExtraCost: number; // 3안 (원)
    
    strutStructureDurationDays: number; // 1안 구조물 공기 (일)
    anchorStructureDurationDays: number; // 2안 구조물 공기 (일)
    hybridStructureDurationDays: number; // 3안 구조물 공기 (일)
    
    durationSavingsAnchorVsStrut: number; // 2안 공기 단축일 (일)
    durationSavingsHybridVsStrut: number; // 3안 공기 단축일 (일)
    
    costSavingsAnchorVsStrut: number; // 2안 구조물 비용 절감액 (원)
    costSavingsHybridVsStrut: number; // 3안 구조물 비용 절감액 (원)
  };

  // 5. 세부 항목별 비교 매트릭스
  items: StructureImpactItem[];

  // 6. 4단계 상향식 시공 시뮬레이션
  stageSimulations: StructureStageSim[];
}

export function calculateStructureConstructionImpact(settings: ProjectSettings): StructureImpactResult {
  const L = settings.stationLength || 100.0;
  const B = settings.stationWidth || 20.0;
  const H = settings.finalExcavationDepth || 22.0;
  const stories = settings.storyCount || (H >= 24 ? 3 : 2); // 층수

  // 중간말뚝 본수 산정
  // 1안: 2열 배치, 종방향 3.5m 간격
  const strutPostRows = 2;
  const strutPostCount = Math.max(16, Math.round((L / 3.5) * strutPostRows));
  const strutPenetrations = strutPostCount * (stories + 1); // 바닥 + 중슬래브(들) + 지붕
  
  // 2안: 어스앵커 (무지주) -> 0본
  const anchorPostCount = 0;
  const anchorPenetrations = 0;

  // 3안: 10m 광간격 복합공법 -> 1열 또는 10m 간격 (약 65% 감소)
  const hybridPostCount = Math.max(6, Math.round((L / 10.0) * 1.5));
  const hybridPenetrations = hybridPostCount * (stories + 1);

  // 1. 중간말뚝 관통부 처리 및 사후 가스절단 비용
  // 개소당: 수팽창지수판(12만) + 슬리브(8만) + 철근보강(15만) + 사후 가스절단(25만) + 무수축몰탈/방수(25만) = 개소당 약 850,000원
  const costPerPenetration = 850000;
  const strutPostWaterproofingCost = strutPenetrations * 350000;
  const strutPostCutCost = strutPenetrations * 500000;
  const strutPostDays = Math.round(strutPenetrations * 0.15) + 6; // 관통부 처리 및 절단에 약 20~25일

  const anchorPostWaterproofingCost = 0;
  const anchorPostCutCost = 0;
  const anchorPostDays = 0;

  const hybridPostWaterproofingCost = hybridPenetrations * 350000;
  const hybridPostCutCost = hybridPenetrations * 500000;
  const hybridPostDays = Math.round(hybridPenetrations * 0.15) + 2; // 약 6~8일

  // 2. 벽체(Side Wall) 2단 분할타설 vs 1단 일체타설
  // 1안: 벽체 면적 2 * L * (H - 3) = 약 3,800m2. 2단 분할 타설 시 시공이음(지수판 200m) + 거푸집 2회 분할 조립 노무비증가
  const wallArea = 2 * L * (H - 2.5);
  const strutWallJointCount = Math.round(L / 20) * 2 * (stories); // 시공이음 개소
  const strutWallFormworkExtra = Math.round(wallArea * 8500); // 분할 거푸집 노무비 증가 (약 3,200만원)
  const strutWallWaterstop = Math.round(L * 2 * stories * 35000); // 시공이음 수팽창지수판/지수판 (약 1,400만원)
  const strutWallDays = 18; // 2단 분할타설 및 양생대기로 인한 지연 18일

  const anchorWallFormworkExtra = 0;
  const anchorWallWaterstop = 0;
  const anchorWallDays = 0;

  const hybridWallFormworkExtra = Math.round(strutWallFormworkExtra * 0.35); // 상부 앵커로 65% 절감
  const hybridWallWaterstop = Math.round(strutWallWaterstop * 0.35);
  const hybridWallDays = 6;

  // 3. 슬래브 타설 시 버팀보 간섭 & 재지보(Re-strutting)
  // 1안: 슬래브 층마다 버팀보 단 간섭 -> 임시 재지보 빔 설치/해체 (단당 약 20~30개소)
  const strutRestrutCount = Math.round((L / 4.0) * stories); // 재지보 빔 약 50개소
  const strutRestrutCost = strutRestrutCount * 650000; // 개소당 65만원 (약 3,250만원)
  const strutSlabDays = 16; // 동바리 조립 간섭 및 재지보 해체 16일

  const anchorRestrutCost = 0;
  const anchorSlabDays = 0;

  const hybridRestrutCount = Math.round((L / 10.0) * 1); // 하부 1개단만 국부적 재지보 (약 10개소)
  const hybridRestrutCost = hybridRestrutCount * 650000; // 약 650만원
  const hybridSlabDays = 4;

  // 총 추가 간섭비용 및 공기 집계
  const strutTotalExtraCost = strutPostWaterproofingCost + strutPostCutCost + strutWallFormworkExtra + strutWallWaterstop + strutRestrutCost;
  const anchorTotalExtraCost = 0;
  const hybridTotalExtraCost = hybridPostWaterproofingCost + hybridPostCutCost + hybridWallFormworkExtra + hybridWallWaterstop + hybridRestrutCost;

  const baseStructureDays = stories * 45; // 본체 구조물 기본 공기 (층당 45일)
  const strutTotalStructureDays = baseStructureDays + strutPostDays + strutWallDays + strutSlabDays;
  const anchorTotalStructureDays = baseStructureDays; // 무지주로 간섭 0일
  const hybridTotalStructureDays = baseStructureDays + hybridPostDays + hybridWallDays + hybridSlabDays;

  const durationSavingsAnchor = strutTotalStructureDays - anchorTotalStructureDays; // 약 54~60일 단축
  const durationSavingsHybrid = strutTotalStructureDays - hybridTotalStructureDays; // 약 38~44일 단축

  const costSavingsAnchor = strutTotalExtraCost - anchorTotalExtraCost; // 약 1.15억~1.35억원 절감
  const costSavingsHybrid = strutTotalExtraCost - hybridTotalExtraCost; // 약 7,500만~9,000만원 절감

  // 세부 항목별 리스트
  const items: StructureImpactItem[] = [
    {
      category: '1. 중간말뚝(King Post)',
      subItem: '슬래브 관통부 철근배근 & 수팽창지수판 방수처리',
      unit: '개소',
      strutQty: strutPenetrations,
      strutUnitCost: 350000,
      strutAmount: strutPostWaterproofingCost,
      strutDays: Math.round(strutPostDays * 0.45),
      strutDescription: `${strutPostCount}본 × ${stories + 1}개층 관통: 철근 배근 간섭 및 지수판 정밀 시공 필수`,
      anchorQty: 0,
      anchorUnitCost: 0,
      anchorAmount: 0,
      anchorDays: 0,
      anchorDescription: '무지주(Zero King Post)로 관통부 0개소, 철근 연속 배근',
      hybridQty: hybridPenetrations,
      hybridUnitCost: 350000,
      hybridAmount: hybridPostWaterproofingCost,
      hybridDays: Math.round(hybridPostDays * 0.45),
      hybridDescription: '10m 광간격으로 말뚝 수량 65% 감소, 관통부 최소화',
      riskNote: '관통부 시공 부실 시 지하수 누수 및 철근 부식 하자 발생 1순위 부위',
    },
    {
      category: '1. 중간말뚝(King Post)',
      subItem: '본체 완공 후 층별 중간말뚝 산소절단 & 무수축몰탈 마감',
      unit: '개소',
      strutQty: strutPenetrations,
      strutUnitCost: 500000,
      strutAmount: strutPostCutCost,
      strutDays: Math.round(strutPostDays * 0.55),
      strutDescription: '각 층별 협소공간 가스 산소절단 및 2차 무수축 그라우팅 마감',
      anchorQty: 0,
      anchorUnitCost: 0,
      anchorAmount: 0,
      anchorDays: 0,
      anchorDescription: '철거 및 사후 마감 공정 0건 (원천 배제)',
      hybridQty: hybridPenetrations,
      hybridUnitCost: 500000,
      hybridAmount: hybridPostCutCost,
      hybridDays: Math.round(hybridPostDays * 0.55),
      hybridDescription: '절단 개소 대폭 감소로 신속 마감',
      riskNote: '산소 절단 작업 중 화재/질식 위험 및 방수층 손상 우려',
    },
    {
      category: '2. 외벽체(Side Wall)',
      subItem: '버팀보 간섭에 따른 벽체 거푸집 2단 분할 조립/타설',
      unit: 'm²',
      strutQty: Math.round(wallArea),
      strutUnitCost: 8500,
      strutAmount: strutWallFormworkExtra,
      strutDays: 12,
      strutDescription: '버팀보 하부 1차 타설 ➔ 지지 하중전이 ➔ 2차 상부 분할 타설',
      anchorQty: Math.round(wallArea),
      anchorUnitCost: 0,
      anchorAmount: 0,
      anchorDays: 0,
      anchorDescription: '장애물 없는 전고(Full Height) 1단 일체 연속 타설 (시스템 갱폼)',
      hybridQty: Math.round(wallArea * 0.35),
      hybridUnitCost: 8500,
      hybridAmount: hybridWallFormworkExtra,
      hybridDays: 4,
      hybridDescription: '상부 앵커 구간은 1단 일체 타설, 하부 광간격만 부분 분할',
      riskNote: '2단 분할 타설 시 수평 콜드조인트(Cold Joint) 형성으로 누수 위험 급증',
    },
    {
      category: '2. 외벽체(Side Wall)',
      subItem: '외벽 수평 시공이음(콜드조인트) 수팽창 지수판 설치',
      unit: 'm',
      strutQty: Math.round(L * 2 * stories),
      strutUnitCost: 35000,
      strutAmount: strutWallWaterstop,
      strutDays: 6,
      strutDescription: '전구간 외벽체 수평 조인트 지수판 및 방수 테이핑 추가 시공',
      anchorQty: 0,
      anchorUnitCost: 0,
      anchorAmount: 0,
      anchorDays: 0,
      anchorDescription: '1단 통타설로 수평 시공이음 제로(Zero Cold Joint)',
      hybridQty: Math.round(L * 2 * stories * 0.35),
      hybridUnitCost: 35000,
      hybridAmount: hybridWallWaterstop,
      hybridDays: 2,
      hybridDescription: '상부 구간 시공이음 배제로 방수 안정성 우수',
      riskNote: '도심지 지하수압 작용 시 콜드조인트 누수 하자 보수비 막대',
    },
    {
      category: '3. 슬래브(Slab) 타설',
      subItem: '슬래브 높이 버팀보 해체 및 임시 재지보(Re-strutting) 빔 설치/철거',
      unit: '개소',
      strutQty: strutRestrutCount,
      strutUnitCost: 650000,
      strutAmount: strutRestrutCost,
      strutDays: 10,
      strutDescription: '슬래브 콘크리트 강도 발현 전까지 상하단 재지보 빔 설치·해체 반복',
      anchorQty: 0,
      anchorUnitCost: 0,
      anchorAmount: 0,
      anchorDays: 0,
      anchorDescription: '앵커는 지반 내부 정착으로 본체 슬래브와 간섭 제로',
      hybridQty: hybridRestrutCount,
      hybridUnitCost: 650000,
      hybridAmount: hybridRestrutCost,
      hybridDays: 3,
      hybridDescription: '10m 광간격으로 재지보 개소 80% 감소',
      riskNote: '재지보 시 토압 불균형에 따른 흙막이벽 순간 변위 발생 리스크',
    },
    {
      category: '3. 슬래브(Slab) 타설',
      subItem: '내부 지보재 간섭에 따른 거푸집·동바리 조립 및 펌프카 타설 능률 저하',
      unit: '식',
      strutQty: 1,
      strutUnitCost: 0,
      strutAmount: 0,
      strutDays: 6,
      strutDescription: '버팀보·말뚝 사이로 펌프카 붐대 진입 곤란 및 동바리 조립 동선 차단',
      anchorQty: 1,
      anchorUnitCost: 0,
      anchorAmount: 0,
      anchorDays: 0,
      anchorDescription: '무지주 광폭 공간에서 펌프카 붐대 자유 선회 및 대형 동바리 쾌속 시공',
      hybridQty: 1,
      hybridUnitCost: 0,
      hybridAmount: 0,
      hybridDays: 1,
      hybridDescription: '10m 개구부로 펌프카 진입 원활',
      riskNote: '콘크리트 타설 속도 저하에 따른 레미콘 콜드조인트 및 타설 불량',
    },
  ];

  // 4단계 상향식 시공 시뮬레이션 데이터
  const stageSimulations: StructureStageSim[] = [
    {
      stageNumber: 1,
      stageName: 'Stage 1: 최하부 기초 바닥슬래브(Mat Slab) 타설',
      stageSubtitle: 'GL -' + H.toFixed(1) + 'm 바닥 기초 콘크리트 및 지수판 시공',
      strutStatus: '버팀보 5단 지지 유지 + 중간말뚝 관통',
      strutWork: `중간말뚝 ${strutPostCount}본 위치마다 바닥 철근 절단·보강 배근 및 수팽창지수판 링 설치 후 타설`,
      strutDays: 32,
      strutInterference: '중간말뚝 주변 철근 밀집으로 콘크리트 충진 불량 우려, 펌프카 배관 이동 간섭',
      strutRisk: '바닥 지수판 불량 시 하부 지하수 용출 위험',
      anchorStatus: '어스앵커 지지 (내부 완전 무지주)',
      anchorWork: '장애물 없는 바닥 전구간에 대형 철근 선조립망 배치 및 펌프카 4대 동시 연속 타설',
      anchorDays: 18,
      anchorInterference: '간섭 제로 (100% 개방)',
      anchorRisk: '없음 (품질 최상)',
      hybridStatus: '하부 광간격(@10m) 버팀보 + 앵커 복합',
      hybridWork: '10m 광폭 작업구로 펌프카 진입, 중간말뚝 수량 최소화로 신속 타설',
      hybridDays: 22,
      hybridInterference: '최소 간섭 (10m 광폭 개구부)',
      hybridRisk: '매우 낮음',
    },
    {
      stageNumber: 2,
      stageName: 'Stage 2: 1층 외벽체(Side Wall) 및 하부 중간슬래브 타설',
      stageSubtitle: '하부 벽체 거푸집 조립 및 가시설 재지보(Re-strutting)',
      strutStatus: '4단·5단 버팀보 간섭 ➔ 2단 분할 타설 불가피',
      strutWork: '5단 버팀보 하부까지 1차 벽체 타설 ➔ 상부 재지보 설치 ➔ 5단 해체 ➔ 2차 벽체 및 중간슬래브 타설',
      strutDays: 45,
      strutInterference: '벽체 2단 분할타설로 시공이음 발생, 재지보 빔 설치/철거 반복으로 공기 지연',
      strutRisk: '벽체 수평 콜드조인트 누수 및 재지보 시 벽체 변위 발생',
      anchorStatus: '무지주 ➔ 1단 전고(Full Height) 일체 타설',
      anchorWork: '시스템 갱폼으로 바닥부터 중간슬래브 하단까지 1회 통타설 ➔ 중간슬래브 연속 타설',
      anchorDays: 26,
      anchorInterference: '간섭 제로, 재지보 공정 없음',
      anchorRisk: '없음 (일체 타설로 수밀성 완벽)',
      hybridStatus: '상부 앵커 + 하부 광간격 스트럿',
      hybridWork: '10m 간격 스트럿 위치만 국부적 슬리브 처리, 벽체 대부분 연속 타설',
      hybridDays: 30,
      hybridInterference: '국부적 10m 구간만 간섭',
      hybridRisk: '낮음',
    },
    {
      stageNumber: 3,
      stageName: 'Stage 3: 상부 외벽체 및 지붕슬래브(Roof Slab) 타설',
      stageSubtitle: '상부 지하정거장 본체 골조 완성',
      strutStatus: '1단·2단·3단 버팀보 순차 해체 및 재지지',
      strutWork: '복공 주형보 하부에서 벽체 분할 타설 및 중간말뚝 관통부 슬리브 마감 ➔ 지붕슬래브 타설',
      strutDays: 42,
      strutInterference: '상부 복공판/주형보 및 버팀보 1·2단 숲으로 펌프카 붐대 선회 불가, 배관 수동 연장',
      strutRisk: '복공판 하부 작업공간 협소로 안전사고 위험',
      anchorStatus: '상부 광폭 개방 공간 타설',
      anchorWork: '지붕슬래브 철근 쾌속 배근 및 펌프카 광폭 타설 ➔ 지붕 방수공사 즉시 착수',
      anchorDays: 24,
      anchorInterference: '간섭 제로',
      anchorRisk: '없음',
      hybridStatus: '상부 앵커 구간(무지주) 쾌속 타설',
      hybridWork: '상부 1·2단이 앵커로 처리되어 지붕슬래브 작업 시 버팀보 간섭 전혀 없음',
      hybridDays: 26,
      hybridInterference: '상부 무지주로 간섭 제로',
      hybridRisk: '없음',
    },
    {
      stageNumber: 4,
      stageName: 'Stage 4: 중간말뚝 사후 절단, 방수 마감 & 되메우기/복공 해체',
      stageSubtitle: '본체 구조물 축조 완료 후 가시설 정리 및 준공',
      strutStatus: '중간말뚝 산소절단 + 몰탈충진 + 가설재 반출',
      strutWork: `각 층별 중간말뚝 ${strutPostCount}본을 가스로 산소 절단 ➔ 관통 구멍 무수축몰탈 타설 및 3중 방수 마감 ➔ 복공 해체/되메우기`,
      strutDays: 28,
      strutInterference: '협소 실내 공간에서 산소절단 작업으로 유독가스 배출 및 방수보수 공기 과다',
      strutRisk: '사후 방수 마감 부실 시 장기 누수 하자 발생',
      anchorStatus: '말뚝 절단 공정 0건 ➔ 즉시 되메우기',
      anchorWork: '관통 말뚝이 없으므로 즉시 지붕 방수 및 상부 토사 되메우기 ➔ 도로 포장 복구',
      anchorDays: 14,
      anchorInterference: '절단/보수 공정 0건',
      anchorRisk: '없음',
      hybridStatus: '최소 말뚝 절단 후 신속 마감',
      hybridWork: '광간격 소수 말뚝만 신속 절단 마감 후 되메우기',
      hybridDays: 17,
      hybridInterference: '소수 말뚝만 절단',
      hybridRisk: '매우 낮음',
    },
  ];

  return {
    projectName: settings.projectName,
    stationLength: L,
    stationWidth: B,
    excavationDepth: H,
    storyCount: stories,
    kingPostAnalysis: {
      strutPostCount,
      strutPenetrationPoints: strutPenetrations,
      strutCutCost: strutPostCutCost,
      strutWaterproofingCost: strutPostWaterproofingCost,
      strutDays: strutPostDays,
      anchorPostCount,
      anchorPenetrationPoints: anchorPenetrations,
      anchorCutCost: anchorPostCutCost,
      anchorWaterproofingCost: anchorPostWaterproofingCost,
      anchorDays: anchorPostDays,
      hybridPostCount,
      hybridPenetrationPoints: hybridPenetrations,
      hybridCutCost: hybridPostCutCost,
      hybridWaterproofingCost: hybridPostWaterproofingCost,
      hybridDays: hybridPostDays,
    },
    wallPouringAnalysis: {
      strutPouringType: '2-STAGE_SPLIT',
      strutJointCount: strutWallJointCount,
      strutFormworkExtraCost: strutWallFormworkExtra,
      strutWaterstopCost: strutWallWaterstop,
      strutDays: strutWallDays,
      strutColdJointRisk: 'HIGH',
      anchorPouringType: '1-STAGE_MONOLITHIC',
      anchorJointCount: 0,
      anchorFormworkExtraCost: 0,
      anchorWaterstopCost: 0,
      anchorDays: 0,
      anchorColdJointRisk: 'NONE',
      hybridPouringType: 'PARTIAL_SPLIT',
      hybridJointCount: Math.round(strutWallJointCount * 0.35),
      hybridFormworkExtraCost: hybridWallFormworkExtra,
      hybridWaterstopCost: hybridWallWaterstop,
      hybridDays: hybridWallDays,
      hybridColdJointRisk: 'LOW',
    },
    slabRestrutAnalysis: {
      strutRestrutBeamCount: strutRestrutCount,
      strutRestrutCost,
      strutFormworkInterferenceDays: 6,
      strutTotalDays: strutSlabDays,
      anchorRestrutBeamCount: 0,
      anchorRestrutCost: 0,
      anchorFormworkInterferenceDays: 0,
      anchorTotalDays: 0,
      hybridRestrutBeamCount: hybridRestrutCount,
      hybridRestrutCost,
      hybridFormworkInterferenceDays: 1,
      hybridTotalDays: hybridSlabDays,
    },
    costSummary: {
      strutStructureExtraCost: strutTotalExtraCost,
      anchorStructureExtraCost: anchorTotalExtraCost,
      hybridStructureExtraCost: hybridTotalExtraCost,
      strutStructureDurationDays: strutTotalStructureDays,
      anchorStructureDurationDays: anchorTotalStructureDays,
      hybridStructureDurationDays: hybridTotalStructureDays,
      durationSavingsAnchorVsStrut: durationSavingsAnchor,
      durationSavingsHybridVsStrut: durationSavingsHybrid,
      costSavingsAnchorVsStrut: costSavingsAnchor,
      costSavingsHybridVsStrut: costSavingsHybrid,
    },
    items,
    stageSimulations,
  };
}
