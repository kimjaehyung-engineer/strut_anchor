import { CalculationResult, ProjectSettings, SoilLayer, StrutTier, WallSection } from '../types';
import { calculateExcavationAnalysis } from './geotechnicalEngine';

export type OptimizedAlternativeKey = 'STRUT' | 'STANDARD_ANCHOR' | 'HIGH_ANGLE_ANCHOR' | 'HYBRID';
export type SupportKind = 'STRUT' | 'STANDARD_ANCHOR' | 'HIGH_ANGLE_ANCHOR';

export interface OptimizedTierDesign {
  tier: number;
  depth: number;
  kind: SupportKind;
  reactionPerMeter: number;
  spacing: number;
  angleDeg: number;
  spec: string;
  designForce: number;
  utilizationPct: number;
  waleSpec: string;
  waleUtilizationPct: number;
  strandCount?: number;
  freeLength?: number;
  bondLength?: number;
  totalLength?: number;
  pulloutFs?: number;
  horizontalProjection?: number;
  count: number;
  steelWeightTon: number;
  drillingLength: number;
  groutVolume: number;
  directCost: number;
  safe: boolean;
}

export interface OptimizedQuantitySummary {
  soldierPileSpec: string;
  soldierPilePitch: number;
  soldierPileCount: number;
  soldierPileLength: number;
  soldierPileSteelTon: number;
  embedmentDepth: number;
  centerPostCount: number;
  deckArea: number;
  waleSteelTon: number;
  strutCount: number;
  strutSteelTon: number;
  anchorCount: number;
  drillingLength: number;
  strandWeightTon: number;
  groutVolume: number;
}

export interface OptimizedCostSummary {
  groundTreatment: number;
  wallAndPile: number;
  deckAndCenterPost: number;
  supportAndWale: number;
  directCost: number;
  durationDays: number;
  indirectCost: number;
  interferenceCost: number;
  provisionalLandRisk: number;
  lccWithoutLand: number;
  riskAdjustedLcc: number;
}

export interface OptimizedSafetySummary {
  wallUtilizationPct: number;
  maxSupportUtilizationPct: number;
  maxWaleUtilizationPct: number;
  minPulloutFs: number | null;
  pileVerticalFs: number;
  geotechnicalBaselineSafe: boolean;
  allChecksSafe: boolean;
}

export interface OptimizedAlternativeDesign {
  key: OptimizedAlternativeKey;
  name: string;
  description: string;
  tiers: OptimizedTierDesign[];
  quantities: OptimizedQuantitySummary;
  costs: OptimizedCostSummary;
  safety: OptimizedSafetySummary;
  maxHorizontalProjection: number;
  utilityConflictCount: number;
  feasibleCondition: string;
  optimizationNote: string;
}

export interface AlternativeOptimizationReport {
  basis: {
    excavationDepth: number;
    stationLength: number;
    stationWidth: number;
    supportDepths: number[];
    controlledGroundWaterTable: number;
    commonEmbedmentDepth: number;
    commonGroundTreatmentCost: number;
    groundActions: string[];
    designDate: string;
    criteria: string[];
    unitRates: string[];
  };
  alternatives: OptimizedAlternativeDesign[];
  lowestBaseLccKey: OptimizedAlternativeKey;
  lowestRiskAdjustedLccKey: OptimizedAlternativeKey;
  recommendedKey: OptimizedAlternativeKey;
  conclusion: string;
}

interface StrutSpec {
  name: string;
  areaCm2: number;
  inertiaCm4: number;
  weightKgM: number;
  allowableKN: number;
}

interface WaleSpec {
  name: string;
  zCm3: number;
  weightKgM: number;
}

interface PileSpec {
  name: string;
  zCm3: number;
  areaCm2: number;
  weightKgM: number;
  installCostPerM: number;
}

const STRUT_SPECS: StrutSpec[] = [
  { name: 'H-300×305×15×15 (SM355)', areaCm2: 134.8, inertiaCm4: 22400, weightKgM: 105.8, allowableKN: 1850 },
  { name: 'H-350×350×12×19 (SM355)', areaCm2: 173.9, inertiaCm4: 40300, weightKgM: 136.5, allowableKN: 2400 },
  { name: 'H-400×400×13×21 (SM355)', areaCm2: 218.7, inertiaCm4: 66600, weightKgM: 171.7, allowableKN: 3000 },
  { name: '강관 Φ609.6×12t (STK490)', areaCm2: 225.3, inertiaCm4: 99400, weightKgM: 176.8, allowableKN: 3200 },
];

const WALE_SPECS: WaleSpec[] = [
  { name: '2H-300×305×15×15', zCm3: 2940, weightKgM: 211.6 },
  { name: '2H-350×350×12×19', zCm3: 4560, weightKgM: 273.0 },
  { name: '2H-400×400×13×21', zCm3: 6660, weightKgM: 343.4 },
];

const PILE_SPECS: PileSpec[] = [
  { name: 'H-300×305×15×15 (SM355)', zCm3: 1470, areaCm2: 134.8, weightKgM: 105.8, installCostPerM: 105000 },
  { name: 'H-350×350×12×19 (SM355)', zCm3: 2280, areaCm2: 173.9, weightKgM: 136.5, installCostPerM: 120000 },
  { name: 'H-400×400×13×21 (SM355)', zCm3: 3330, areaCm2: 218.7, weightKgM: 171.7, installCostPerM: 142000 },
];

const round = (value: number, digits = 1) => {
  const p = Math.pow(10, digits);
  return Math.round(value * p) / p;
};

const getSoilAtDepth = (layers: SoilLayer[], depth: number) =>
  layers.find((layer) => depth >= layer.depthTop && depth < layer.depthBottom) || layers[layers.length - 1];

const skinFriction = (soil: SoilLayer | undefined) => {
  if (!soil) return 180;
  switch (soil.type) {
    case 'hard_rock': return 950;
    case 'soft_rock': return 750;
    case 'weathered_rock': return 580;
    case 'weathered_soil': return 350;
    case 'sand': return 260;
    case 'clay': return 170;
    default: return 150;
  }
};

const averagePhi = (layers: SoilLayer[], depth: number) => {
  const samples: number[] = [];
  for (let d = 0.5; d <= Math.max(1, depth); d += 0.5) samples.push(getSoilAtDepth(layers, d)?.frictionAngle || 28);
  return samples.reduce((a, b) => a + b, 0) / Math.max(1, samples.length);
};

function chooseWale(reaction: number, spacing: number): { spec: WaleSpec; stress: number; utilization: number } | null {
  const moment = reaction * spacing * spacing / 10;
  for (const spec of WALE_SPECS) {
    const stress = moment * 1e6 / (spec.zCm3 * 1000);
    const utilization = stress / 210 * 100;
    if (utilization <= 90) return { spec, stress, utilization };
  }
  return null;
}

function strutCapacity(spec: StrutSpec, width: number) {
  const effectiveLengthM = width / 2;
  const yieldAllowable = spec.areaCm2 * 16;
  const inertiaM4 = spec.inertiaCm4 * 1e-8;
  const euler = Math.PI * Math.PI * 205e6 * inertiaM4 / (effectiveLengthM * effectiveLengthM) / 1.5;
  return Math.min(yieldAllowable, euler, spec.allowableKN);
}

function makeStrutTier(
  tier: number,
  depth: number,
  reaction: number,
  spacing: number,
  spec: StrutSpec,
  length: number,
  width: number,
  preloadForce: number,
): OptimizedTierDesign | null {
  const wale = chooseWale(reaction, spacing);
  if (!wale) return null;
  const force = reaction * spacing + preloadForce;
  const capacity = strutCapacity(spec, width);
  const utilization = force / capacity * 100;
  if (utilization > 90) return null;
  const count = Math.ceil(length / spacing) + 1;
  const steelWeightTon = count * width * spec.weightKgM / 1000;
  const waleWeightTon = length * 2 * wale.spec.weightKgM / 1000;
  const directCost = steelWeightTon * 650000 + waleWeightTon * 600000 + count * 180000;
  return {
    tier, depth, kind: 'STRUT', reactionPerMeter: round(reaction), spacing, angleDeg: 0,
    spec: spec.name, designForce: round(force), utilizationPct: round(utilization),
    waleSpec: wale.spec.name, waleUtilizationPct: round(wale.utilization), count,
    steelWeightTon: round(steelWeightTon, 2), drillingLength: 0, groutVolume: 0,
    directCost: Math.round(directCost), safe: true,
  };
}

function anchorFreeLength(depth: number, excavationDepth: number, angleDeg: number, layers: SoilLayer[]) {
  const theta = angleDeg * Math.PI / 180;
  const alpha = (45 + averagePhi(layers, excavationDepth) / 2) * Math.PI / 180;
  const distanceToFailure = Math.max(0, excavationDepth - depth) /
    Math.max(0.2, Math.sin(theta) + Math.cos(theta) * Math.tan(alpha));
  return Math.max(4.5, Math.ceil((distanceToFailure + 1.5) * 2) / 2);
}

function makeAnchorTier(
  tier: number,
  depth: number,
  reaction: number,
  spacing: number,
  angleDeg: number,
  length: number,
  excavationDepth: number,
  layers: SoilLayer[],
  highAngle: boolean,
): OptimizedTierDesign | null {
  const wale = chooseWale(reaction, spacing);
  if (!wale) return null;
  const theta = angleDeg * Math.PI / 180;
  const force = reaction * spacing / Math.cos(theta);
  const strandCount = Math.max(3, Math.ceil(force / (110 * 0.90)));
  if (strandCount > 12) return null;
  const strandUtilization = force / (strandCount * 110) * 100;
  const freeLength = anchorFreeLength(depth, excavationDepth, angleDeg, layers);
  const trialCenterDepth = depth + (freeLength + 2.5) * Math.sin(theta);
  const tau = skinFriction(getSoilAtDepth(layers, trialCenterDepth));
  const drillDiameterM = 0.15;
  const requiredLe = force * 2.2 / (Math.PI * drillDiameterM * tau);
  const bondLength = Math.max(4.5, Math.ceil(requiredLe * 2) / 2);
  if (bondLength > 14) return null;
  const pulloutFs = Math.PI * drillDiameterM * bondLength * tau / force;
  if (pulloutFs < 2.2 || strandUtilization > 90) return null;
  const totalLength = freeLength + bondLength + 1;
  const count = (Math.ceil(length / spacing) + 1) * 2;
  const drillingLength = count * totalLength;
  const strandWeightTon = count * totalLength * strandCount * 0.787 / 1000;
  const groutVolume = count * Math.PI * Math.pow(drillDiameterM / 2, 2) * (freeLength + bondLength) * 1.25;
  const waleWeightTon = length * 2 * wale.spec.weightKgM / 1000;
  const drillingRate = highAngle ? 54000 : 48000;
  const highAngleCost = highAngle ? count * 450000 : 0;
  const directCost = drillingLength * drillingRate + strandWeightTon * 3300000 + groutVolume * 115000 +
    count * (145000 + 42000 + 35000) + highAngleCost + waleWeightTon * 600000;
  return {
    tier, depth, kind: highAngle ? 'HIGH_ANGLE_ANCHOR' : 'STANDARD_ANCHOR', reactionPerMeter: round(reaction),
    spacing, angleDeg, spec: `SWPC 7B Φ12.7mm × ${strandCount}본`, designForce: round(force),
    utilizationPct: round(strandUtilization), waleSpec: wale.spec.name,
    waleUtilizationPct: round(wale.utilization), strandCount, freeLength, bondLength,
    totalLength: round(totalLength), pulloutFs: round(pulloutFs, 2),
    horizontalProjection: round(totalLength * Math.cos(theta)), count,
    steelWeightTon: round(strandWeightTon, 2), drillingLength: round(drillingLength),
    groutVolume: round(groutVolume, 1), directCost: Math.round(directCost), safe: true,
  };
}

function wallDesign(
  settings: ProjectSettings,
  wall: WallSection,
  calcResult: CalculationResult,
  verticalLineLoad: number,
) {
  const length = settings.stationLength || 100;
  const h = settings.finalExcavationDepth;
  const baseStress = calcResult.safety.maxBendingStress;
  let best: null | {
    spec: PileSpec; pitch: number; embedment: number; count: number; totalLength: number;
    steelTon: number; stressUtilization: number; bearingFs: number; cost: number;
  } = null;
  for (const spec of PILE_SPECS) {
    for (const pitch of [1.2, 1.5, 1.8, 2.0]) {
      for (const embedment of [wall.embedmentDepth, wall.embedmentDepth + 1, wall.embedmentDepth + 2, wall.embedmentDepth + 4, wall.embedmentDepth + 6]) {
        const stress = baseStress * (pitch / Math.max(0.1, wall.pileSpacing)) * (wall.sectionModulusZ / spec.zCm3);
        const stressUtilization = stress / Math.max(1, wall.allowableBendingStress) * 100;
        const bearingCapacity = 2850 + Math.max(0, embedment - 2.5) * 300;
        const verticalLoad = verticalLineLoad * pitch + 120;
        const bearingFs = verticalLoad > 120 ? bearingCapacity / verticalLoad : 9.99;
        if (stressUtilization > 90 || bearingFs < 2.5) continue;
        const count = (Math.ceil(length / pitch) + 1) * 2;
        const pileLength = h + embedment;
        const totalLength = count * pileLength;
        const steelTon = totalLength * spec.weightKgM / 1000;
        const cost = totalLength * spec.installCostPerM;
        if (!best || cost < best.cost) {
          best = { spec, pitch, embedment, count, totalLength, steelTon, stressUtilization, bearingFs, cost };
        }
      }
    }
  }
  return best;
}

function utilityConflicts(settings: ProjectSettings, tiers: OptimizedTierDesign[]) {
  const utilities = settings.utilities || [];
  let conflicts = 0;
  for (const utility of utilities) {
    const hit = tiers.some((tier) => {
      if (tier.kind === 'STRUT' || !tier.totalLength) return false;
      const x = utility.offsetFromWall;
      if (x > (tier.horizontalProjection || 0)) return false;
      const anchorDepthAtX = tier.depth + x * Math.tan(tier.angleDeg * Math.PI / 180);
      return Math.abs(anchorDepthAtX - utility.depth) <= Math.max(0.75, utility.diameterMm / 1000 + 0.5);
    });
    if (hit) conflicts += 1;
  }
  return conflicts;
}

function finalizeAlternative(
  key: OptimizedAlternativeKey,
  name: string,
  description: string,
  tiers: OptimizedTierDesign[],
  settings: ProjectSettings,
  wall: WallSection,
  calcResult: CalculationResult,
) : OptimizedAlternativeDesign | null {
  const length = settings.stationLength || 100;
  const width = settings.stationWidth;
  const volume = length * width * settings.finalExcavationDepth;
  const verticalLineLoad = tiers.reduce((sum, tier) =>
    sum + (tier.kind === 'STRUT' ? 0 : tier.reactionPerMeter * Math.tan(tier.angleDeg * Math.PI / 180)), 0);
  const pile = wallDesign(settings, wall, calcResult, verticalLineLoad);
  if (!pile) return null;
  const centerPostCount = Math.ceil(length / 4) * (width >= 16 ? 2 : 1);
  const centerPostLength = centerPostCount * (settings.finalExcavationDepth + 2.5);
  const deckArea = length * width;
  const deckAndCenterPost = deckArea * 117550 + centerPostLength * 125000;
  const supportAndWale = tiers.reduce((sum, tier) => sum + tier.directCost, 0);
  const directCost = pile.cost + deckAndCenterPost + supportAndWale;
  const standardAnchorCount = tiers.filter((tier) => tier.kind === 'STANDARD_ANCHOR').reduce((sum, tier) => sum + tier.count, 0);
  const highAnchorCount = tiers.filter((tier) => tier.kind === 'HIGH_ANGLE_ANCHOR').reduce((sum, tier) => sum + tier.count, 0);
  const strutTierCount = tiers.filter((tier) => tier.kind === 'STRUT').length;
  const anchorTierCount = tiers.length - strutTierCount;
  const productivity = key === 'STRUT' ? 520 : key === 'HYBRID' ? 700 : key === 'HIGH_ANGLE_ANCHOR' ? 760 : 826;
  const earthDays = Math.ceil(volume / productivity);
  const supportDays = Math.ceil(strutTierCount * 5 + anchorTierCount * (key === 'HIGH_ANGLE_ANCHOR' ? 4.5 : 4));
  const durationDays = earthDays + supportDays + (key === 'STRUT' ? 25 : key === 'HYBRID' ? 12 : 7);
  const indirectCost = durationDays * 1325000;
  const interferenceCost = key === 'STRUT' ? volume * 2200 : key === 'HYBRID' ? volume * 600 : 0;
  const provisionalLandRisk = standardAnchorCount * 450000 + highAnchorCount * 100000;
  const lccWithoutLand = directCost + indirectCost + interferenceCost;
  const riskAdjustedLcc = lccWithoutLand + provisionalLandRisk;
  const allAnchorTiers = tiers.filter((tier) => tier.kind !== 'STRUT');
  const maxHorizontalProjection = Math.max(0, ...allAnchorTiers.map((tier) => tier.horizontalProjection || 0));
  const utilityConflictCount = utilityConflicts(settings, tiers);
  const geotechnicalBaselineSafe = calcResult.safety.heavingSafe && calcResult.safety.boilingSafe &&
    calcResult.safety.pipingSafe && calcResult.safety.embedmentSafe && calcResult.safety.isWallStressSafe &&
    calcResult.safety.isDisplacementSafe;
  const maxSupportUtilizationPct = Math.max(...tiers.map((tier) => tier.utilizationPct));
  const maxWaleUtilizationPct = Math.max(...tiers.map((tier) => tier.waleUtilizationPct));
  const pulloutValues = allAnchorTiers.map((tier) => tier.pulloutFs || 0);
  const minPulloutFs = pulloutValues.length ? Math.min(...pulloutValues) : null;
  const allChecksSafe = geotechnicalBaselineSafe && tiers.every((tier) => tier.safe) &&
    pile.stressUtilization <= 90 && pile.bearingFs >= 2.5 && maxSupportUtilizationPct <= 90 &&
    maxWaleUtilizationPct <= 90 && (minPulloutFs === null || minPulloutFs >= 2.2);
  const quantities: OptimizedQuantitySummary = {
    soldierPileSpec: pile.spec.name, soldierPilePitch: pile.pitch, soldierPileCount: pile.count,
    soldierPileLength: round(pile.totalLength), soldierPileSteelTon: round(pile.steelTon, 1),
    embedmentDepth: pile.embedment, centerPostCount, deckArea,
    waleSteelTon: round(tiers.reduce((sum, tier) => {
      const spec = WALE_SPECS.find((item) => item.name === tier.waleSpec) || WALE_SPECS[0];
      return sum + length * 2 * spec.weightKgM / 1000;
    }, 0), 1),
    strutCount: tiers.filter((tier) => tier.kind === 'STRUT').reduce((sum, tier) => sum + tier.count, 0),
    strutSteelTon: round(tiers.filter((tier) => tier.kind === 'STRUT').reduce((sum, tier) => sum + tier.steelWeightTon, 0), 1),
    anchorCount: allAnchorTiers.reduce((sum, tier) => sum + tier.count, 0),
    drillingLength: round(allAnchorTiers.reduce((sum, tier) => sum + tier.drillingLength, 0)),
    strandWeightTon: round(allAnchorTiers.reduce((sum, tier) => sum + tier.steelWeightTon, 0), 1),
    groutVolume: round(allAnchorTiers.reduce((sum, tier) => sum + tier.groutVolume, 0), 1),
  };
  const feasibleCondition = key === 'STANDARD_ANCHOR'
    ? `최대 수평투영 ${round(maxHorizontalProjection)}m 구간의 토지사용권 및 지장물 이설·회피가 선행조건`
    : key === 'HIGH_ANGLE_ANCHOR'
      ? `고각 전용장비 반입 및 최대 수평투영 ${round(maxHorizontalProjection)}m 범위 사용권 확인 필요`
      : key === 'HYBRID'
        ? `앵커 구간 최대 수평투영 ${round(maxHorizontalProjection)}m와 하부 버팀보 해체순서 확인 필요`
        : '굴착 내부 작업공간 및 버팀보 해체·재지보 공정 확보 필요';
  return {
    key, name, description, tiers, quantities,
    costs: { groundTreatment: 0, wallAndPile: Math.round(pile.cost), deckAndCenterPost: Math.round(deckAndCenterPost),
      supportAndWale: Math.round(supportAndWale), directCost: Math.round(directCost), durationDays,
      indirectCost: Math.round(indirectCost), interferenceCost: Math.round(interferenceCost),
      provisionalLandRisk: Math.round(provisionalLandRisk), lccWithoutLand: Math.round(lccWithoutLand),
      riskAdjustedLcc: Math.round(riskAdjustedLcc) },
    safety: { wallUtilizationPct: round(pile.stressUtilization), maxSupportUtilizationPct: round(maxSupportUtilizationPct),
      maxWaleUtilizationPct: round(maxWaleUtilizationPct), minPulloutFs: minPulloutFs === null ? null : round(minPulloutFs, 2),
      pileVerticalFs: round(pile.bearingFs, 2), geotechnicalBaselineSafe, allChecksSafe },
    maxHorizontalProjection: round(maxHorizontalProjection), utilityConflictCount, feasibleCondition,
    optimizationNote: '동일 단계별 수평반력을 유지하면서 안전 제약을 통과한 후보 중 위험조정 LCC 최소 조합',
  };
}

function reactionsFor(struts: StrutTier[], calcResult: CalculationResult) {
  return struts.map((strut, index) => ({
    tier: strut.tier || index + 1,
    depth: strut.depth,
    reaction: calcResult.strutResults.find((result) => result.tier === strut.tier)?.reactionPerMeter ||
      Math.max(90, (strut.preloadTon || 30) * 9.80665 / Math.max(1, strut.horizontalSpacing)),
    preloadForce: (strut.preloadTon || 30) * 9.80665 * 0.7,
  }));
}

function optimizeStrut(
  settings: ProjectSettings, layers: SoilLayer[], wall: WallSection, struts: StrutTier[], calcResult: CalculationResult,
) {
  void layers;
  const supports = reactionsFor(struts, calcResult);
  let best: OptimizedAlternativeDesign | null = null;
  for (const spacing of [3, 3.5, 4, 4.5]) {
    for (const spec of STRUT_SPECS) {
      const tiers = supports.map((support) => makeStrutTier(support.tier, support.depth, support.reaction, spacing, spec,
        settings.stationLength || 100, settings.stationWidth, support.preloadForce));
      if (tiers.some((tier) => !tier)) continue;
      const candidate = finalizeAlternative('STRUT', '1안 전구간 버팀보', '전 구간 압축 버팀보 지보', tiers as OptimizedTierDesign[], settings, wall, calcResult);
      if (candidate?.safety.allChecksSafe && (!best || candidate.costs.riskAdjustedLcc < best.costs.riskAdjustedLcc)) best = candidate;
    }
  }
  return best;
}

function optimizeAnchor(
  key: 'STANDARD_ANCHOR' | 'HIGH_ANGLE_ANCHOR', settings: ProjectSettings, layers: SoilLayer[], wall: WallSection,
  struts: StrutTier[], calcResult: CalculationResult,
) {
  const supports = reactionsFor(struts, calcResult);
  const angles = key === 'STANDARD_ANCHOR' ? [15, 20, 25, 30] : [45, 50, 55, 60];
  const spacings = key === 'STANDARD_ANCHOR' ? [1.5, 1.8, 2, 2.2, 2.5] : [1.5, 1.8, 2, 2.2];
  let best: OptimizedAlternativeDesign | null = null;
  for (const angle of angles) {
    for (const spacing of spacings) {
      const tiers = supports.map((support) => makeAnchorTier(support.tier, support.depth, support.reaction, spacing, angle,
        settings.stationLength || 100, settings.finalExcavationDepth, layers, key === 'HIGH_ANGLE_ANCHOR'));
      if (tiers.some((tier) => !tier)) continue;
      const candidate = finalizeAlternative(key,
        key === 'STANDARD_ANCHOR' ? '2안-A 표준 어스앵커' : '2안-B 고각 어스앵커',
        key === 'STANDARD_ANCHOR' ? '15°~30° 표준각 범위 최소비용 지보' : '45°~60° 고각 범위 최소비용 지보',
        tiers as OptimizedTierDesign[], settings, wall, calcResult);
      if (candidate?.safety.allChecksSafe && (!best || candidate.costs.riskAdjustedLcc < best.costs.riskAdjustedLcc)) best = candidate;
    }
  }
  return best;
}

function optimizeHybrid(
  settings: ProjectSettings, layers: SoilLayer[], wall: WallSection, struts: StrutTier[], calcResult: CalculationResult,
) {
  const supports = reactionsFor(struts, calcResult);
  let best: OptimizedAlternativeDesign | null = null;
  for (const highCount of [1, 2]) {
    for (const strutCount of [1, 2]) {
      if (highCount + strutCount >= supports.length) continue;
      for (const highAngle of [45, 50, 55]) {
        for (const anchorSpacing of [1.8, 2, 2.2]) {
          for (const strutSpacing of [3.5, 4, 4.5]) {
            for (const strutSpec of STRUT_SPECS) {
              const tiers = supports.map((support, index) => {
                if (index < highCount) return makeAnchorTier(support.tier, support.depth, support.reaction, anchorSpacing,
                  highAngle, settings.stationLength || 100, settings.finalExcavationDepth, layers, true);
                if (index >= supports.length - strutCount) return makeStrutTier(support.tier, support.depth, support.reaction,
                  strutSpacing, strutSpec, settings.stationLength || 100, settings.stationWidth, support.preloadForce);
                return makeAnchorTier(support.tier, support.depth, support.reaction, anchorSpacing, 20,
                  settings.stationLength || 100, settings.finalExcavationDepth, layers, false);
              });
              if (tiers.some((tier) => !tier)) continue;
              const candidate = finalizeAlternative('HYBRID', '3안 복합 지보공법',
                '상부 고각앵커·중부 표준앵커·하부 버팀보 조합', tiers as OptimizedTierDesign[], settings, wall, calcResult);
              if (candidate?.safety.allChecksSafe && (!best || candidate.costs.riskAdjustedLcc < best.costs.riskAdjustedLcc)) best = candidate;
            }
          }
        }
      }
    }
  }
  return best;
}

export function optimizeAllAlternatives(
  settings: ProjectSettings,
  layers: SoilLayer[],
  wall: WallSection,
  struts: StrutTier[],
  calcResult: CalculationResult,
): AlternativeOptimizationReport {
  const finalStage = {
    step: 999,
    name: '최종 굴착 및 전 지보 설치',
    excavationDepth: settings.finalExcavationDepth,
    activeStrutIds: struts.map((strut) => strut.id),
    description: '4대안 공통 지반안정 최적화 단계',
    isCompleted: false,
  };
  let groundBaseline: null | {
    settings: ProjectSettings;
    layers: SoilLayer[];
    wall: WallSection;
    calcResult: CalculationResult;
    cost: number;
  } = null;
  const originalGwt = settings.groundWaterTable;
  const originalEmbedment = wall.embedmentDepth;
  const improvedLayers = layers.map((layer) => {
    if (layer.depthBottom < settings.finalExcavationDepth - 3 || layer.depthTop > settings.finalExcavationDepth + 6) return layer;
    return {
      ...layer,
      name: `${layer.name} [저면·차수 보강]`,
      cohesion: Math.max(layer.cohesion, 80),
      frictionAngle: Math.max(layer.frictionAngle, 38),
      subgradeReactionKh: Math.max(layer.subgradeReactionKh, 100000),
      permeabilityK: Math.min(layer.permeabilityK, 1e-6),
    };
  });
  for (let embedment = Math.ceil(originalEmbedment); embedment <= 16; embedment += 1) {
    for (let controlledGwt = Math.ceil(originalGwt); controlledGwt <= settings.finalExcavationDepth - 4; controlledGwt += 1) {
      const candidateSettings = { ...settings, groundWaterTable: controlledGwt };
      const candidateWall = { ...wall, embedmentDepth: embedment, totalLength: settings.finalExcavationDepth + embedment };
      const candidateResult = calculateExcavationAnalysis(candidateSettings, improvedLayers, candidateWall, struts, finalStage);
      const geoSafe = candidateResult.safety.heavingSafe && candidateResult.safety.boilingSafe &&
        candidateResult.safety.pipingSafe && candidateResult.safety.embedmentSafe &&
        candidateResult.safety.isWallStressSafe && candidateResult.safety.isDisplacementSafe;
      if (!geoSafe) continue;
      const wallCount = (Math.ceil((settings.stationLength || 100) / Math.max(1.2, wall.pileSpacing)) + 1) * 2;
      const extensionCost = Math.max(0, embedment - originalEmbedment) * wallCount * 105000;
      const waterControlCost = Math.max(0, controlledGwt - originalGwt) * (settings.stationLength || 100) * 2 * 50000;
      const cutoffAndBottomGroutCost = (settings.stationLength || 100) * 2 * 4 * 250000;
      const cost = Math.round(extensionCost + waterControlCost + cutoffAndBottomGroutCost);
      if (!groundBaseline || cost < groundBaseline.cost) {
        groundBaseline = { settings: candidateSettings, layers: improvedLayers, wall: candidateWall, calcResult: candidateResult, cost };
      }
    }
  }
  if (!groundBaseline) throw new Error('파이핑·근입·벽체 안전을 동시에 만족하는 공통 지반보강 조합을 찾지 못했습니다.');
  const results = [
    optimizeStrut(groundBaseline.settings, groundBaseline.layers, groundBaseline.wall, struts, groundBaseline.calcResult),
    optimizeAnchor('STANDARD_ANCHOR', groundBaseline.settings, groundBaseline.layers, groundBaseline.wall, struts, groundBaseline.calcResult),
    optimizeAnchor('HIGH_ANGLE_ANCHOR', groundBaseline.settings, groundBaseline.layers, groundBaseline.wall, struts, groundBaseline.calcResult),
    optimizeHybrid(groundBaseline.settings, groundBaseline.layers, groundBaseline.wall, struts, groundBaseline.calcResult),
  ].filter((result): result is OptimizedAlternativeDesign => !!result);
  if (results.length !== 4) throw new Error(`구조안전 제약을 만족하는 4개 대안 조합을 모두 찾지 못했습니다. 검색 성공: ${results.map((item) => item.key).join(', ') || '없음'}`);
  for (const result of results) {
    result.costs.groundTreatment = groundBaseline.cost;
    result.costs.directCost += groundBaseline.cost;
    result.costs.lccWithoutLand += groundBaseline.cost;
    result.costs.riskAdjustedLcc += groundBaseline.cost;
  }
  const baseWinner = [...results].sort((a, b) => a.costs.lccWithoutLand - b.costs.lccWithoutLand)[0];
  const riskWinner = [...results].sort((a, b) => a.costs.riskAdjustedLcc - b.costs.riskAdjustedLcc)[0];
  const feasibleRiskWinner = [...results].sort((a, b) => {
    const conflictPenaltyA = a.utilityConflictCount * 100000000;
    const conflictPenaltyB = b.utilityConflictCount * 100000000;
    return (a.costs.riskAdjustedLcc + conflictPenaltyA) - (b.costs.riskAdjustedLcc + conflictPenaltyB);
  })[0];
  return {
    basis: {
      excavationDepth: settings.finalExcavationDepth,
      stationLength: settings.stationLength || 100,
      stationWidth: settings.stationWidth,
      supportDepths: struts.map((strut) => strut.depth),
      controlledGroundWaterTable: groundBaseline.settings.groundWaterTable,
      commonEmbedmentDepth: groundBaseline.wall.embedmentDepth,
      commonGroundTreatmentCost: groundBaseline.cost,
      groundActions: [
        `차수·저면보강 그라우팅: 굴착 양측 연장 ${(settings.stationLength || 100) * 2}m, 유효 보강폭 4.0m`,
        `단계별 수위관리: 관리수위 GL -${groundBaseline.settings.groundWaterTable.toFixed(1)}m`,
        `엄지말뚝 공통 최소 근입깊이: ${groundBaseline.wall.embedmentDepth.toFixed(1)}m`,
      ],
      designDate: '2026-08-20',
      criteria: [
        '벽체·지보재·띠장 허용내력 사용률 ≤ 90%',
        '앵커 극한 인발안전율 Fs ≥ 2.20 및 강선 허용내력 사용률 ≤ 90%',
        '엄지말뚝 연직지지 안전율 Fs ≥ 2.50',
        '기존 단계별 지반안정·벽체변위 검토가 SAFE인 동일 수평반력 유지',
      ],
      unitRates: [
        '표준/고각 천공 48,000/54,000원·m', 'PC강선 3,300,000원·ton',
        '강재 제작·손료 600,000~650,000원·ton', '현장간접비 1,325,000원·일',
        '토지사용 위험충당금: 표준앵커 450,000원·공, 고각앵커 100,000원·공(잠정)',
      ],
    },
    alternatives: results,
    lowestBaseLccKey: baseWinner.key,
    lowestRiskAdjustedLccKey: riskWinner.key,
    recommendedKey: feasibleRiskWinner.key,
    conclusion: `구조안전 제약을 통과한 조합 중 토지·지장물 위험 전 LCC 최저안은 ${baseWinner.name}, 잠정 위험비용과 지장물 충돌을 반영한 조건부 우선안은 ${feasibleRiskWinner.name}입니다.`,
  };
}
