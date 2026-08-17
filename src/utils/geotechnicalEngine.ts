import {
  CalculationResult,
  DepthAnalysisPoint,
  ExcavationStage,
  GeotechnicalSafetyResults,
  ProjectSettings,
  SettlementPoint,
  SoilLayer,
  StrutResult,
  StrutTier,
  WallSection,
} from '../types';

export function getSoilAtDepth(layers: SoilLayer[], depth: number): SoilLayer {
  for (const layer of layers) {
    if (depth >= layer.depthTop && depth <= layer.depthBottom) {
      return layer;
    }
  }
  // Default to bottom layer if deeper
  return layers[layers.length - 1] || {
    id: 'default',
    name: '풍화암',
    type: 'weathered_rock',
    depthTop: 0,
    depthBottom: 100,
    unitWeight: 20,
    satUnitWeight: 21,
    cohesion: 30,
    frictionAngle: 35,
    subgradeReactionKh: 50000,
    permeabilityK: 1e-4,
    color: '#857360',
    nValue: 50,
  };
}

export function calculateExcavationAnalysis(
  settings: ProjectSettings,
  layers: SoilLayer[],
  wall: WallSection,
  struts: StrutTier[],
  currentStage: ExcavationStage
): CalculationResult {
  const excavationDepth = currentStage.excavationDepth;
  const totalWallLength = wall.totalLength;
  const gwt = settings.groundWaterTable;
  const q = settings.surchargeLoad;

  // Analysis grid points (0.5m spacing along wall height)
  const dz = 0.5;
  const numPoints = Math.ceil(totalWallLength / dz) + 1;
  const points: DepthAnalysisPoint[] = [];

  // Active struts in this stage
  const activeStrutList = struts.filter((s) =>
    currentStage.activeStrutIds.includes(s.id) && s.depth <= excavationDepth + 0.1
  );

  // Determine average representative soil parameters above excavation
  let sumWeight = 0;
  let sumPhi = 0;
  let sumC = 0;
  let measuredDepth = 0;

  for (let d = 0.25; d <= Math.max(1, excavationDepth); d += 0.5) {
    const soil = getSoilAtDepth(layers, d);
    const gamma = d < gwt ? soil.unitWeight : soil.satUnitWeight - 9.81;
    sumWeight += gamma * 0.5;
    sumPhi += soil.frictionAngle * 0.5;
    sumC += soil.cohesion * 0.5;
    measuredDepth += 0.5;
  }

  const avgGamma = measuredDepth > 0 ? (sumWeight / measuredDepth) : 19.0;
  const avgPhi = measuredDepth > 0 ? (sumPhi / measuredDepth) : 30;
  const avgC = measuredDepth > 0 ? (sumC / measuredDepth) : 10;
  const phiRad = (avgPhi * Math.PI) / 180;
  const Ka = Math.tan(Math.PI / 4 - phiRad / 2) ** 2;

  // Peck Apparent Earth Pressure intensity (for staged strutted cuts)
  // Sand: 0.65 * gamma * H * Ka
  // Soft/Med Clay: gamma * H * (1 - 4*cu/(gamma*H))
  // Stiff Clay: 0.2 to 0.4 * gamma * H
  let peckIntensity = 0.65 * avgGamma * Math.max(2, excavationDepth) * Ka;
  if (avgPhi < 15 && avgC > 0) {
    // Clay type
    const stabilityNumber = (avgGamma * excavationDepth) / Math.max(1, avgC);
    if (stabilityNumber > 4) {
      peckIntensity = Math.max(10, avgGamma * excavationDepth * (1 - (4 * avgC) / (avgGamma * excavationDepth + 0.01)));
    } else {
      peckIntensity = 0.3 * avgGamma * excavationDepth;
    }
  }

  // Calculate pressures along depth
  let cumulativeOverburden = q;

  for (let i = 0; i < numPoints; i++) {
    const depth = i * dz;
    const soil = getSoilAtDepth(layers, depth);
    const gamma = depth < gwt ? soil.unitWeight : soil.satUnitWeight;

    if (depth > 0) {
      cumulativeOverburden += gamma * dz;
    }

    const effectivePhiRad = (soil.frictionAngle * Math.PI) / 180;
    const localKa = Math.tan(Math.PI / 4 - effectivePhiRad / 2) ** 2;
    const localKp = Math.tan(Math.PI / 4 + effectivePhiRad / 2) ** 2;

    // Surcharge pressure
    const surchargePressure = q * localKa;

    // Water pressure
    let waterPressure = 0;
    if (depth > gwt) {
      // In excavation zone, water table is often pumped down near excavation bottom
      const waterHead = depth < excavationDepth ? (depth - gwt) * 0.4 : (depth - Math.max(gwt, excavationDepth - 1.0));
      waterPressure = Math.max(0, waterHead * 9.81);
    }

    // Active earth pressure
    let activeEarthPressure = 0;
    if (settings.earthPressureTheory === 'PECK' && excavationDepth > 2) {
      if (depth <= 0.25 * excavationDepth) {
        // Trapezoid ramp-up
        activeEarthPressure = (peckIntensity * (depth / (0.25 * excavationDepth))) + surchargePressure;
      } else if (depth <= 0.75 * excavationDepth) {
        // Uniform maximum
        activeEarthPressure = peckIntensity + surchargePressure;
      } else if (depth <= excavationDepth) {
        // Ramp down towards bottom
        const ratio = 1 - (depth - 0.75 * excavationDepth) / (0.25 * excavationDepth);
        activeEarthPressure = Math.max(peckIntensity * 0.6, peckIntensity * ratio) + surchargePressure;
      } else {
        // Below excavation base (Rankine active with reduction)
        const subDepth = depth - excavationDepth;
        activeEarthPressure = Math.max(0, (cumulativeOverburden - waterPressure) * localKa - 2 * soil.cohesion * Math.sqrt(localKa));
      }
    } else {
      // Rankine
      const effectiveStress = Math.max(0, cumulativeOverburden - waterPressure);
      activeEarthPressure = Math.max(0, effectiveStress * localKa - 2 * soil.cohesion * Math.sqrt(localKa));
    }

    const totalLateralPressure = activeEarthPressure + waterPressure;

    // Passive resistance below excavation depth
    let passiveResistance = 0;
    if (depth > excavationDepth) {
      const embedBelowBase = depth - excavationDepth;
      const effectiveEmbedStress = embedBelowBase * (soil.satUnitWeight - 9.81);
      passiveResistance = effectiveEmbedStress * localKp + 2 * soil.cohesion * Math.sqrt(localKp);
    }

    points.push({
      depth,
      soilName: soil.name,
      soilType: soil.type,
      activeEarthPressure: Math.round(activeEarthPressure * 10) / 10,
      waterPressure: Math.round(waterPressure * 10) / 10,
      surchargePressure: Math.round(surchargePressure * 10) / 10,
      totalLateralPressure: Math.round(totalLateralPressure * 10) / 10,
      passiveResistance: Math.round(passiveResistance * 10) / 10,
      bendingMoment: 0,
      shearForce: 0,
      displacement: 0,
    });
  }

  // --- Structural Analysis: Reactions, Bending Moments, Shear Forces & Wall Deflection ---
  // Continuous beam model with supports at active strut locations and virtual fixed support in embedment depth
  const supportDepths = activeStrutList.map((s) => s.depth);
  // Add equivalent virtual fixed support depth in embedment rock/dense soil (typically 1.5m to 2.5m below excavation base)
  const virtualSupportDepth = Math.min(totalWallLength - 0.5, excavationDepth + 2.0);
  const allSupports = [...supportDepths, virtualSupportDepth].sort((a, b) => a - b);

  // Compute tributary load and reactions on each support
  const reactions: { depth: number; reactionPerMeter: number }[] = allSupports.map((sd) => ({
    depth: sd,
    reactionPerMeter: 0,
  }));

  // Simple and robust tributary load distribution between support midspans
  for (let sIdx = 0; sIdx < allSupports.length; sIdx++) {
    const sup = allSupports[sIdx];
    const topBound = sIdx === 0 ? 0 : (allSupports[sIdx - 1] + sup) / 2;
    const botBound = sIdx === allSupports.length - 1 ? Math.min(totalWallLength, excavationDepth + 3) : (sup + allSupports[sIdx + 1]) / 2;

    let tribForce = 0;
    for (const pt of points) {
      if (pt.depth >= topBound && pt.depth <= botBound) {
        tribForce += pt.totalLateralPressure * dz;
      }
    }
    reactions[sIdx].reactionPerMeter = Math.max(10, tribForce);
  }

  // Map strut reaction back into depth analysis points
  activeStrutList.forEach((st) => {
    const match = reactions.find((r) => Math.abs(r.depth - st.depth) < 0.3);
    const pt = points.find((p) => Math.abs(p.depth - st.depth) < dz / 2);
    if (pt && match) {
      pt.strutReaction = Math.round(match.reactionPerMeter * 10) / 10;
    }
  });

  // Calculate Shear Force V(z) and Bending Moment M(z) along depth
  let currentShear = 0;
  let currentMoment = 0;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const netLoad = pt.depth <= excavationDepth + 1.0 
      ? pt.totalLateralPressure 
      : Math.max(0, pt.totalLateralPressure - pt.passiveResistance * 0.3);

    // Add support reaction point load
    const isSupport = reactions.find((r) => Math.abs(r.depth - pt.depth) < dz / 2);
    if (isSupport) {
      currentShear -= isSupport.reactionPerMeter;
    }

    currentShear += netLoad * dz;
    currentMoment += currentShear * dz;

    // Apply damping/boundary zeroing near tip of pile
    if (pt.depth > excavationDepth + 4) {
      const decay = Math.max(0, 1 - (pt.depth - (excavationDepth + 4)) / 4);
      currentMoment *= decay;
      currentShear *= decay;
    }

    pt.shearForce = Math.round(currentShear * 10) / 10;
    pt.bendingMoment = Math.round(Math.abs(currentMoment) * 10) / 10;
  }

  // Compute Wall Deflection (mm) via elastic beam integration
  // Maximum deflection typically occurs at unsupported cantilever top or midspan between struts
  const maxSpan = supportDepths.length > 0 
    ? Math.max(supportDepths[0], ...supportDepths.map((d, idx) => idx > 0 ? d - supportDepths[idx - 1] : d), excavationDepth - (supportDepths[supportDepths.length - 1] || 0))
    : excavationDepth;

  // Max empirical/theoretical deflection based on excavation depth and strut stiffness
  const theoreticalMaxDelta = (0.0018 * excavationDepth * 1000) * (maxSpan / 4.0); // mm

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    let deflection = 0;

    if (pt.depth <= excavationDepth) {
      // Bulging curve between surface and base
      const zRatio = pt.depth / Math.max(1, excavationDepth);
      if (supportDepths.length === 0) {
        // Cantilever stage
        deflection = theoreticalMaxDelta * (1 - Math.pow(1 - zRatio, 2));
      } else {
        // Deep excavation with struts: belly shape maximum around 0.5 ~ 0.7 H
        const belly = Math.sin(zRatio * Math.PI);
        const topDispl = 0.3 * theoreticalMaxDelta;
        deflection = topDispl * (1 - zRatio) + theoreticalMaxDelta * Math.pow(belly, 1.2);

        // Check if close to an active strut (restrained displacement)
        for (const supD of supportDepths) {
          const distToStrut = Math.abs(pt.depth - supD);
          if (distToStrut < 1.5) {
            const restraint = (1.5 - distToStrut) / 1.5;
            deflection = deflection * (1 - restraint * 0.65);
          }
        }
      }
    } else {
      // Below excavation base: decays to zero at embedment fixity
      const embedRatio = Math.min(1, (pt.depth - excavationDepth) / (totalWallLength - excavationDepth));
      const baseDisplacement = theoreticalMaxDelta * 0.35;
      deflection = Math.max(0, baseDisplacement * Math.pow(1 - embedRatio, 2));
    }

    pt.displacement = Math.round(Math.max(0.2, deflection) * 10) / 10;
  }

  // --- Strut & Wale Capacity Check ---
  const strutResults: StrutResult[] = activeStrutList.map((st) => {
    const matchReact = reactions.find((r) => Math.abs(r.depth - st.depth) < 0.3);
    const reactionPerMeter = matchReact ? matchReact.reactionPerMeter : 60;
    
    // Total Axial Force = Reaction/m * Horizontal Spacing + Preload Residual
    const spacing = st.horizontalSpacing;
    const totalAxialForce = reactionPerMeter * spacing + st.preloadTon * 9.81 * 0.7; // kN

    // Effective buckling length
    const effectiveLength = st.hasCenterPost ? st.excavationWidth / 2 : st.excavationWidth;
    
    // Radius of gyration r = sqrt(I / A)
    const r_cm = Math.sqrt(st.momentOfInertiaI / st.crossSectionAreaA);
    const slendernessRatio = (effectiveLength * 100) / (r_cm || 10);

    // Allowable compressive stress calculation (Korean Steel Specification)
    // For SS275/SM355 structural steel with AISC curve approximation
    const Fy = 275; // MPa
    let allowableStress = 140; // MPa default
    if (slendernessRatio < 30) {
      allowableStress = 160;
    } else if (slendernessRatio < 100) {
      allowableStress = 160 - 0.7 * (slendernessRatio - 30);
    } else {
      allowableStress = Math.max(40, (12000000) / (slendernessRatio * slendernessRatio));
    }

    // Actual stress = P / A
    const actualStress = (totalAxialForce * 10) / st.crossSectionAreaA; // MPa (kN/cm² * 10 = MPa)
    const allowableForce = (allowableStress * st.crossSectionAreaA) / 10; // kN
    const utilizationRatio = Math.round((actualStress / allowableStress) * 1000) / 10;
    const isSafe = utilizationRatio <= 100;

    // Wale bending check: M = w * L² / 10
    const w = reactionPerMeter; // kN/m on wale
    const waleSpan = st.horizontalSpacing;
    const waleMoment = (w * waleSpan * waleSpan) / 10; // kN·m
    // Wale stress = M / Z
    const waleBendingStress = (waleMoment * 1000) / (st.waleZ || 1500); // MPa
    const waleUtilization = Math.round((waleBendingStress / (st.waleAllowableBending || 210)) * 1000) / 10;
    const isWaleSafe = waleUtilization <= 100;

    return {
      tier: st.tier,
      depth: st.depth,
      specName: st.specName,
      spacing: st.horizontalSpacing,
      reactionPerMeter: Math.round(reactionPerMeter * 10) / 10,
      totalAxialForce: Math.round(totalAxialForce * 10) / 10,
      allowableForce: Math.round(allowableForce * 10) / 10,
      effectiveLength: Math.round(effectiveLength * 10) / 10,
      slendernessRatio: Math.round(slendernessRatio * 10) / 10,
      actualStress: Math.round(actualStress * 10) / 10,
      allowableStress: Math.round(allowableStress * 10) / 10,
      utilizationRatio,
      isSafe,
      waleMoment: Math.round(waleMoment * 10) / 10,
      waleBendingStress: Math.round(waleBendingStress * 10) / 10,
      waleUtilizationRatio: waleUtilization,
      isWaleSafe,
    };
  });

  // --- Geotechnical Safety Checks (Heaving, Boiling, Piping, Embedment) ---

  // 1. Heaving check (Terzaghi / Peck)
  // Evaluated at excavation base (GL - excavationDepth)
  const bottomSoil = getSoilAtDepth(layers, excavationDepth + 1.0);
  let heavingFs = 99.9;
  const heavingRequiredFs = 1.2;
  if (bottomSoil.type === 'clay' || bottomSoil.cohesion > 15) {
    const cu = Math.max(15, bottomSoil.cohesion);
    const Nc = 5.7;
    const overburdenAtBase = avgGamma * excavationDepth + q;
    // Fs = (Nc * cu) / (gamma * H + q)
    heavingFs = (Nc * cu) / Math.max(1, overburdenAtBase);
  } else {
    // Sand/rock ground is virtually free from plastic heaving
    heavingFs = 3.5;
  }
  heavingFs = Math.round(heavingFs * 100) / 100;
  const heavingSafe = heavingFs >= heavingRequiredFs;

  // 2. Boiling check (Terzaghi hydraulic gradient)
  // Water head difference between outside and inside excavation
  const outsideWaterHead = Math.max(0, excavationDepth - gwt);
  const embedmentDepth = totalWallLength - excavationDepth;
  const boilingRequiredFs = 1.5;
  let boilingFs = 99.9;
  let icr = 1.0;
  let iexit = 0.1;

  if (outsideWaterHead > 0.5 && (bottomSoil.type === 'sand' || bottomSoil.type === 'alluvium' || bottomSoil.type === 'fill')) {
    const satGamma = bottomSoil.satUnitWeight;
    const gammaW = 9.81;
    icr = (satGamma - gammaW) / gammaW;
    // Seepage flow exit gradient approximation i = delta_h / (2 * D_embed)
    iexit = outsideWaterHead / Math.max(1, 2 * embedmentDepth);
    boilingFs = icr / Math.max(0.01, iexit);
  } else {
    boilingFs = 4.2;
  }
  boilingFs = Math.round(boilingFs * 100) / 100;
  const boilingSafe = boilingFs >= boilingRequiredFs;

  // 3. Piping check (Lane / Bligh Creep ratio)
  const totalSeepageLength = 2 * embedmentDepth + settings.stationWidth;
  const pipingCreepRatio = Math.round((totalSeepageLength / Math.max(0.5, outsideWaterHead)) * 10) / 10;
  const pipingRequiredRatio = 5.0; // For fine sand / silt
  const pipingSafe = outsideWaterHead <= 0.5 || pipingCreepRatio >= pipingRequiredRatio;

  // 4. Embedment passive resistance safety factor
  // Sum of passive moment vs active overturning moment about virtual hinge
  let totalActiveMoment = 0;
  let totalPassiveMoment = 0;
  for (const pt of points) {
    if (pt.depth <= excavationDepth) {
      totalActiveMoment += pt.totalLateralPressure * dz * (excavationDepth + embedmentDepth - pt.depth);
    } else {
      totalPassiveMoment += pt.passiveResistance * dz * (totalWallLength - pt.depth);
    }
  }
  const embedmentFs = Math.round((Math.max(1, totalPassiveMoment) / Math.max(1, totalActiveMoment * 0.45)) * 100) / 100;
  const embedmentRequiredFs = 1.2;
  const embedmentSafe = embedmentFs >= embedmentRequiredFs;

  // 5. Wall stress and displacement safety
  const maxBendingMoment = Math.max(...points.map((p) => p.bendingMoment));
  // Per pile or per meter wall section modulus:
  // If H-Pile spacing is e.g. 1.5m, moment per pile = M_per_meter * spacing
  const momentPerPile = maxBendingMoment * wall.pileSpacing; // kN·m
  const maxBendingStress = Math.round(((momentPerPile * 1000) / wall.sectionModulusZ) * 10) / 10; // MPa
  const allowableBendingStress = wall.allowableBendingStress;
  const wallStressUtilization = Math.round((maxBendingStress / allowableBendingStress) * 1000) / 10;
  const isWallStressSafe = wallStressUtilization <= 100;

  const maxDisplacement = Math.max(...points.map((p) => p.displacement));
  // KDS allowable wall displacement is typically 0.2% to 0.35% of excavation depth
  const allowableDisplacement = Math.round(Math.max(15, excavationDepth * 3.0) * 10) / 10; // mm
  const isDisplacementSafe = maxDisplacement <= allowableDisplacement;

  // 6. Ground settlement profile behind wall
  const maxSettlement = Math.round((maxDisplacement * 0.75) * 10) / 10; // mm
  const settlementProfile: SettlementPoint[] = [];
  const maxInfluenceDist = Math.round(excavationDepth * 2.5);
  for (let x = 0; x <= maxInfluenceDist; x += 2) {
    // Clough & O'Rourke settlement profile curve
    const xRatio = x / Math.max(1, excavationDepth);
    let s = 0;
    if (xRatio <= 0.5) {
      s = maxSettlement * (0.6 + 0.8 * xRatio);
    } else if (xRatio <= 2.0) {
      s = maxSettlement * Math.exp(-Math.pow(xRatio - 0.5, 1.8));
    } else {
      s = maxSettlement * 0.1 * (1 - (xRatio - 2.0) / 1.0);
    }
    settlementProfile.push({
      distance: x,
      settlement: Math.round(Math.max(0, s) * 10) / 10,
    });
  }

  // 7. 중간말뚝 (Center King Post) 연직 하중 및 지지력·좌굴 안정성 계산
  const cpConfig = settings.centerPost || {
    enabled: true,
    count: 1,
    specName: 'H-300×300×10×15 (SM355)',
    spacing: 4.0,
    totalLength: totalWallLength + 4.0,
    embedmentDepth: 8.0,
    crossSectionAreaA: 119.8,
    momentOfInertiaI: 6750,
    elasticModulusE: 205000,
    allowableAxialStress: 160,
    allowableBearingCapacity: 1850,
    deckGirderSpec: 'H-400×400×13×21 (SM355)',
    trafficLoadType: 'DB-24',
    deckSelfWeight: 3.5,
    trafficWheelLoad: 96.0,
    impactFactor: 0.30,
  };

  const tribWidth = settings.stationWidth / (cpConfig.count + 1);
  const cpSpacing = cpConfig.spacing;
  const tribArea = tribWidth * cpSpacing;

  // Decking self-weight + Main girder dead load
  const deckDeadLoad = Math.round(cpConfig.deckSelfWeight * tribArea + (cpConfig.totalLength * 0.12 * 9.81));

  // Traffic live load (DB-24 standard vehicle live load + impact factor i)
  const trafficLiveLoad = Math.round(cpConfig.trafficWheelLoad * 2 * (1 + cpConfig.impactFactor));

  // Strut vertical dead load & incidental loading
  const strutIncidentalLoad = Math.round(activeStrutList.length * 28.0);

  // Total vertical working load on King Post:
  const totalVerticalLoad = deckDeadLoad + trafficLiveLoad + strutIncidentalLoad;

  // Allowable bearing capacity Qa (from rock socket embedment)
  const allowableBearingCapacity = cpConfig.allowableBearingCapacity;
  const bearingSafetyFactor = Math.round((allowableBearingCapacity / Math.max(1, totalVerticalLoad)) * 100) / 100;
  const isBearingSafe = bearingSafetyFactor >= 2.0;

  // Buckling check of King Post
  let maxUnbracedSpan = 4.5;
  if (activeStrutList.length > 0) {
    const depths = [0, ...activeStrutList.map((s) => s.depth), excavationDepth];
    depths.sort((a, b) => a - b);
    for (let k = 0; k < depths.length - 1; k++) {
      maxUnbracedSpan = Math.max(maxUnbracedSpan, depths[k + 1] - depths[k]);
    }
  }
  const ry = Math.sqrt(cpConfig.momentOfInertiaI / cpConfig.crossSectionAreaA);
  const slendernessRatio = Math.round(((maxUnbracedSpan * 100) / Math.max(1, ry)) * 10) / 10;

  let allowableBucklingStress = cpConfig.allowableAxialStress;
  if (slendernessRatio > 30) {
    allowableBucklingStress = Math.round(cpConfig.allowableAxialStress * (1 - 0.35 * Math.min(1, (slendernessRatio / 150) ** 2)));
  }
  const actualAxialStress = Math.round(((totalVerticalLoad * 10) / cpConfig.crossSectionAreaA) * 10) / 10;
  const stressUtilizationRatio = Math.round((actualAxialStress / Math.max(1, allowableBucklingStress)) * 1000) / 10;
  const isStressSafe = stressUtilizationRatio <= 100;

  const centerPostResult = {
    enabled: cpConfig.enabled,
    totalVerticalLoad,
    deckDeadLoad,
    trafficLiveLoad,
    strutIncidentalLoad,
    allowableBearingCapacity,
    bearingSafetyFactor,
    isBearingSafe,
    unsupportedLength: Math.round(maxUnbracedSpan * 10) / 10,
    slendernessRatio,
    actualAxialStress,
    allowableBucklingStress,
    stressUtilizationRatio,
    isStressSafe,
    strutBucklingReductionEffect: `좌굴 유효지간 ${(settings.stationWidth).toFixed(1)}m → ${(settings.stationWidth / 2).toFixed(1)}m (50% 감소)`,
  };

  // Summary status
  const allGeotechSafe = heavingSafe && boilingSafe && pipingSafe && embedmentSafe;
  const allStructuralSafe = isWallStressSafe && isDisplacementSafe && strutResults.every((s) => s.isSafe && s.isWaleSafe) && isBearingSafe && isStressSafe;

  let summaryStatus: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
  if (!allGeotechSafe || !allStructuralSafe) {
    const isExtreme = (!heavingSafe && heavingFs < 1.0) || (!boilingSafe && boilingFs < 1.1) || wallStressUtilization > 120 || !isBearingSafe;
    summaryStatus = isExtreme ? 'DANGER' : 'WARNING';
  }

  return {
    step: currentStage.step,
    currentExcavationDepth: excavationDepth,
    points,
    strutResults,
    safety: {
      heavingFs,
      heavingRequiredFs,
      heavingSafe,
      heavingCriticalDepth: excavationDepth,
      boilingFs,
      boilingRequiredFs,
      boilingSafe,
      criticalHydraulicGradient: Math.round(icr * 100) / 100,
      actualHydraulicGradient: Math.round(iexit * 100) / 100,
      pipingCreepRatio,
      pipingRequiredRatio,
      pipingSafe,
      embedmentFs,
      embedmentRequiredFs,
      embedmentSafe,
      maxBendingMoment: Math.round(maxBendingMoment * 10) / 10,
      maxBendingStress,
      allowableBendingStress,
      wallStressUtilization,
      isWallStressSafe,
      maxDisplacement,
      allowableDisplacement,
      isDisplacementSafe,
      maxSettlement,
      settlementProfile,
      centerPost: centerPostResult,
    },
    summaryStatus,
  };
}
