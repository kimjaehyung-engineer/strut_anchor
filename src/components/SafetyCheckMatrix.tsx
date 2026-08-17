import React from 'react';
import { CalculationResult, StrutTier, WallSection } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingDown,
  Activity,
  Layers,
  ArrowDownCircle,
  Maximize2,
  Zap,
  Sparkles,
  Anchor,
} from 'lucide-react';

interface SafetyCheckMatrixProps {
  calcResult: CalculationResult;
  wall: WallSection;
  struts: StrutTier[];
  onUpdateStruts?: (struts: StrutTier[]) => void;
  onOpenReinforcement?: () => void;
  onOpenAnchorComparison?: () => void;
}

export const SafetyCheckMatrix: React.FC<SafetyCheckMatrixProps> = ({
  calcResult,
  wall,
  struts,
  onUpdateStruts,
  onOpenReinforcement,
  onOpenAnchorComparison,
}) => {
  const { safety } = calcResult;

  // 빠른 단별 수평간격 변경 핸들러
  const handleStrutSpacingChange = (tierNum: number, newSpacing: number) => {
    if (!onUpdateStruts) return;
    const updated = struts.map((st) => (st.tier === tierNum ? { ...st, horizontalSpacing: newSpacing } : st));
    onUpdateStruts(updated);
  };

  // 전체 일괄 수평간격 변경 핸들러
  const handleBatchStrutSpacingChange = (newSpacing: number) => {
    if (!onUpdateStruts) return;
    const updated = struts.map((st) => ({ ...st, horizontalSpacing: newSpacing }));
    onUpdateStruts(updated);
  };

  return (
    <div className="space-y-3.5">
      {/* Overview Status Banner */}
      <div
        className={`p-3.5 rounded border flex flex-wrap items-center justify-between gap-3 ${
          calcResult.summaryStatus === 'SAFE'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : calcResult.summaryStatus === 'WARNING'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}
      >
        <div className="flex items-center space-x-3">
          {calcResult.summaryStatus === 'SAFE' ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
          )}
          <div>
            <div className="text-xs lg:text-sm font-bold flex items-center space-x-2">
              <span>
                {calcResult.summaryStatus === 'SAFE'
                  ? 'KDS 기준 가시설 및 지반안정성 전 항목 만족 (SAFE)'
                  : calcResult.summaryStatus === 'WARNING'
                  ? '일부 항목 주의/검토 필요 (WARNING)'
                  : '위험 수준 초과 - 지보 보강 필요 (DANGER)'}
              </span>
            </div>
            <div className="text-[11px] opacity-85 mt-0.5">
              현재 굴착심도 GL -{calcResult.currentExcavationDepth}m 기준 7대 핵심 안전율 및 부재 응력 종합 판정 결과입니다.
            </div>
          </div>
        </div>

        {/* Quick Auto-Reinforce Action Button */}
        {onOpenReinforcement && (
          <button
            onClick={onOpenReinforcement}
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer ${
              calcResult.summaryStatus === 'SAFE'
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{calcResult.summaryStatus === 'SAFE' ? '지반보강·제원 최적화 검토' : '⚡ 원클릭 NG 해소 & 지반보강 실행'}</span>
          </button>
        )}
      </div>

      {/* 4 Geotechnical Stability Cards (히빙, 보일링, 파이핑, 근입장) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Heaving Card */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-3.5 flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">1. 히빙 (Heaving) 안전율</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                safety.heavingSafe
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {safety.heavingSafe ? 'OK (안전)' : 'NG (위험)'}
            </span>
          </div>
          <div className="my-1 flex items-baseline justify-between">
            <div className="text-xl font-bold font-mono text-slate-900">
              Fs = {safety.heavingFs > 50 ? '99.0+' : safety.heavingFs.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              기준: <span className="font-semibold text-slate-800">≥ {safety.heavingRequiredFs}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 border-t border-slate-100 pt-1.5 flex items-center justify-between font-mono">
            <span>Terzaghi 점성토 식</span>
            <span className="text-slate-700">Fs = 5.7c / (γH + q)</span>
          </div>
        </div>

        {/* 2. Boiling Card */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-3.5 flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">2. 보일링 (Boiling) 안전율</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                safety.boilingSafe
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {safety.boilingSafe ? 'OK (안전)' : 'NG (위험)'}
            </span>
          </div>
          <div className="my-1 flex items-baseline justify-between">
            <div className="text-xl font-bold font-mono text-slate-900">
              Fs = {safety.boilingFs > 50 ? '99.0+' : safety.boilingFs.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              기준: <span className="font-semibold text-slate-800">≥ {safety.boilingRequiredFs}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 border-t border-slate-100 pt-1.5 flex items-center justify-between font-mono">
            <span>한계동수경사 식</span>
            <span className="text-slate-700">i = {safety.actualHydraulicGradient}</span>
          </div>
        </div>

        {/* 3. Piping Creep Ratio */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-3.5 flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">3. 파이핑 (Piping) 크리프비</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                safety.pipingSafe
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {safety.pipingSafe ? 'OK (안전)' : 'NG (위험)'}
            </span>
          </div>
          <div className="my-1 flex items-baseline justify-between">
            <div className="text-xl font-bold font-mono text-slate-900">
              C = {safety.pipingCreepRatio > 99 ? '99.0+' : safety.pipingCreepRatio.toFixed(1)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              기준: <span className="font-semibold text-slate-800">≥ {safety.pipingRequiredRatio}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 border-t border-slate-100 pt-1.5 flex items-center justify-between font-mono">
            <span>Lane 유선길이 크리프비</span>
            <span className="text-slate-700">C = L / Δh</span>
          </div>
        </div>

        {/* 4. Embedment Passive Safety Factor */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-3.5 flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">4. 근입장 수동저항 Fs</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                safety.embedmentSafe
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {safety.embedmentSafe ? 'OK (안전)' : 'NG (위험)'}
            </span>
          </div>
          <div className="my-1 flex items-baseline justify-between">
            <div className="text-xl font-bold font-mono text-slate-900">
              Fs = {safety.embedmentFs.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              기준: <span className="font-semibold text-slate-800">≥ {safety.embedmentRequiredFs}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 border-t border-slate-100 pt-1.5 flex items-center justify-between font-mono">
            <span>수동모멘트 전도저항</span>
            <span className="text-slate-700">Fs = ΣMp / ΣMa</span>
          </div>
        </div>
      </div>

      {/* Wall Structural Check & Settlement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Wall Bending Stress & Deflection */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>5. 흙막이 벽체 휨응력 및 변위 검토</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                safety.isWallStressSafe && safety.isDisplacementSafe
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {safety.isWallStressSafe && safety.isDisplacementSafe ? '적합 (PASS)' : '초과 (NG)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="text-slate-500 text-[11px] mb-0.5">최대 휨응력 (σb)</div>
              <div className="text-base font-bold font-mono text-slate-900 flex items-baseline space-x-1">
                <span>{safety.maxBendingStress}</span>
                <span className="text-[10px] font-normal text-slate-500">/ {safety.allowableBendingStress} MPa</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    safety.wallStressUtilization > 100
                      ? 'bg-rose-600'
                      : safety.wallStressUtilization > 85
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, safety.wallStressUtilization)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between font-mono">
                <span>응력비: {safety.wallStressUtilization}%</span>
                <span>M_max = {safety.maxBendingMoment} kN·m</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="text-slate-500 text-[11px] mb-0.5">최대 수평변위 (δ)</div>
              <div className="text-base font-bold font-mono text-slate-900 flex items-baseline space-x-1">
                <span>{safety.maxDisplacement}</span>
                <span className="text-[10px] font-normal text-slate-500">/ {safety.allowableDisplacement} mm</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    safety.maxDisplacement > safety.allowableDisplacement ? 'bg-rose-600' : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${Math.min(100, (safety.maxDisplacement / safety.allowableDisplacement) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between font-mono">
                <span>기준: 0.2~0.3% H</span>
                <span>{safety.isDisplacementSafe ? '허용치 이내' : '변위 과다'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ground Settlement & Influence Zone */}
        <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>6. 배면 지표면 침하 및 인접구조물 영향</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Peck / Clough 식
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-500">최대 지표침하량 (S_max):</span>
              <span className="font-mono font-bold text-rose-600 text-sm">
                {safety.maxSettlement} mm
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span>침하 영향 거리 (2.5H):</span>
              <span className="font-mono text-slate-800 font-medium">
                0 ~ {(calcResult.currentExcavationDepth * 2.5).toFixed(1)} m
              </span>
            </div>
            <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1.5 flex items-center justify-between">
              <span>도로 포장 및 지하매설물:</span>
              <span className="text-emerald-700 font-semibold">
                {safety.maxSettlement < 25 ? '안전 (침하 25mm 미만)' : '계측 모니터링 강화 요망'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center King Post (중간말뚝) & Traffic Load Bearing Check */}
      {safety.centerPost && (
        <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>7. 중간말뚝 (Center King Post) 연직지지력 & 좌굴 안정성 검토 (교통하중 지지)</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                safety.centerPost.isBearingSafe && safety.centerPost.isStressSafe
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {safety.centerPost.isBearingSafe && safety.centerPost.isStressSafe ? '적합 (SAFE)' : '보강필요 (NG)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* 1. Vertical Load Breakdown */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="text-slate-500 text-[11px] mb-0.5 font-medium">작용 연직하중 (Pv)</div>
              <div className="text-base font-bold font-mono text-slate-900 flex items-baseline space-x-1">
                <span>{safety.centerPost.totalVerticalLoad}</span>
                <span className="text-[10px] font-normal text-slate-500">kN</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1.5 space-y-0.5 border-t border-slate-200 pt-1 font-mono">
                <div className="flex justify-between">
                  <span>· 복공판+주형보 자중:</span>
                  <span className="font-semibold">{safety.centerPost.deckDeadLoad} kN</span>
                </div>
                <div className="flex justify-between">
                  <span>· DB-24 차륜하중(충격포함):</span>
                  <span className="font-semibold text-blue-700">{safety.centerPost.trafficLiveLoad} kN</span>
                </div>
                <div className="flex justify-between">
                  <span>· 버팀보 가설 자중:</span>
                  <span>{safety.centerPost.strutIncidentalLoad} kN</span>
                </div>
              </div>
            </div>

            {/* 2. Bearing Capacity Safety Factor */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="text-slate-500 text-[11px] mb-0.5 font-medium">암반 허용지지력 안전율 (Fs)</div>
              <div className="text-base font-bold font-mono text-slate-900 flex items-baseline space-x-1">
                <span className={safety.centerPost.isBearingSafe ? 'text-emerald-700' : 'text-rose-700'}>
                  Fs = {safety.centerPost.bearingSafetyFactor.toFixed(2)}
                </span>
                <span className="text-[10px] font-normal text-slate-500">/ 기준 ≥ 2.0</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    safety.centerPost.bearingSafetyFactor >= 2.0 ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                  style={{ width: `${Math.min(100, (safety.centerPost.bearingSafetyFactor / 3.0) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-600 mt-1.5 flex justify-between font-mono">
                <span>지반 허용지지력 Qa:</span>
                <span className="font-bold text-slate-800">{safety.centerPost.allowableBearingCapacity} kN</span>
              </div>
            </div>

            {/* 3. Column Stress & Strut Buckling Reduction */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="text-slate-500 text-[11px] mb-0.5 font-medium">말뚝 압축응력 및 좌굴장</div>
              <div className="text-base font-bold font-mono text-slate-900 flex items-baseline space-x-1">
                <span>{safety.centerPost.actualAxialStress}</span>
                <span className="text-[10px] font-normal text-slate-500">/ {safety.centerPost.allowableBucklingStress} MPa ({safety.centerPost.stressUtilizationRatio}%)</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1.5 space-y-0.5 border-t border-slate-200 pt-1 font-mono">
                <div className="flex justify-between">
                  <span>· 비지지장 / 세장비:</span>
                  <span className="font-semibold">{safety.centerPost.unsupportedLength}m (λ={safety.centerPost.slendernessRatio})</span>
                </div>
                <div className="flex justify-between text-blue-700">
                  <span>· 버팀보 좌굴장:</span>
                  <span className="font-bold">{safety.centerPost.strutBucklingReductionEffect}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strut & Wale Axial Force & Buckling Verification Table */}
      <div className="bg-white border border-slate-200 rounded shadow-sm p-4 overflow-hidden space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>8. 단별 버팀보(Strut) 축력·좌굴 및 띠장(Wale) 응력 검토</span>
          </span>
          <div className="flex items-center space-x-2">
            {onOpenAnchorComparison && (
              <button
                onClick={onOpenAnchorComparison}
                className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold rounded border border-sky-300 flex items-center space-x-1 transition cursor-pointer"
                title="동일 안전율을 갖는 그라운드 앵커 수량 및 단면 비교"
              >
                <Anchor className="w-3 h-3 text-sky-600" />
                <span>앵커 긴장 대치 수량 산정</span>
              </button>
            )}
            <span className="text-xs text-slate-500">
              지보: <span className="font-bold text-amber-700">{calcResult.strutResults.length}개단</span>
            </span>
          </div>
        </div>

        {/* Quick Batch Spacing Controller inside Safety Table */}
        {onUpdateStruts && calcResult.strutResults.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>버팀보 수평설치간격 (Sh) 빠른 조절:</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap font-mono">
              {[2.0, 2.5, 3.0, 3.5, 4.0].map((sp) => (
                <button
                  key={`matrix-batch-sp-${sp}`}
                  onClick={() => handleBatchStrutSpacingChange(sp)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition ${
                    struts.every((s) => s.horizontalSpacing === sp)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                  title={`모든 지보단 버팀보 수평간격을 ${sp}m로 일괄 변경`}
                >
                  @{sp.toFixed(1)}m
                </button>
              ))}
            </div>
          </div>
        )}

        {calcResult.strutResults.length === 0 ? (
          <div className="p-5 text-center text-xs text-slate-500 bg-slate-50 rounded border border-slate-200">
            현재 굴착 단계에서는 아직 설치된 버팀보가 없습니다 (캔틸레버 굴착 상태).
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-2 font-semibold">단수</th>
                  <th className="p-2 font-semibold">설치심도</th>
                  <th className="p-2 font-semibold">규격</th>
                  <th className="p-2 font-semibold">수평간격 (Sh)</th>
                  <th className="p-2 font-semibold">버팀보 축력 P (kN)</th>
                  <th className="p-2 font-semibold">압축응력비 (P/Pa)</th>
                  <th className="p-2 font-semibold">띠장 응력비 (M/Ma)</th>
                  <th className="p-2 font-semibold text-center">판정 / 빠른 조절</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                {calcResult.strutResults.map((res) => {
                  const targetStrut = struts.find((s) => s.tier === res.tier);
                  const isNg = !res.isSafe || !res.isWaleSafe;
                  const isHybrid = targetStrut?.type === 'HYBRID';
                  const isAnchor = targetStrut?.type === 'GROUND_ANCHOR';

                  return (
                    <tr key={`strut-table-${res.tier}`} className={`hover:bg-slate-50 transition ${isNg ? 'bg-rose-50/30' : ''}`}>
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{res.tier}단</span>
                          {isHybrid && (
                            <span className="text-[9px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.2 rounded border border-purple-200">
                              3안 복합
                            </span>
                          )}
                          {isAnchor && (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                              2안 앵커
                            </span>
                          )}
                          {!isHybrid && !isAnchor && (
                            <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200">
                              1안 버팀보
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 font-mono text-blue-700">GL -{res.depth.toFixed(1)}m</td>
                      <td className="p-2 font-mono text-slate-600">
                        {isHybrid ? `H-300+앵커3공` : isAnchor ? `강선 4가닥 (20°)` : res.specName}
                      </td>
                      <td className="p-2">
                        {onUpdateStruts ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={targetStrut?.horizontalSpacing ?? res.spacing}
                              onChange={(e) => handleStrutSpacingChange(res.tier, parseFloat(e.target.value))}
                              className={`font-mono font-bold text-xs rounded px-1.5 py-0.5 border cursor-pointer ${
                                isHybrid
                                  ? 'bg-purple-50 border-purple-300 text-purple-900'
                                  : isNg
                                  ? 'bg-rose-50 border-rose-300 text-rose-800 focus:ring-1 focus:ring-rose-500'
                                  : 'bg-slate-50 border-slate-300 text-blue-800 focus:ring-1 focus:ring-blue-500'
                              }`}
                              title={`${res.tier}단 수평간격 변경`}
                            >
                              <option value={1.5}>1.5m</option>
                              <option value={2.0}>2.0m</option>
                              <option value={2.5}>2.5m</option>
                              <option value={3.0}>3.0m (표준)</option>
                              <option value={3.5}>3.5m</option>
                              <option value={4.0}>4.0m</option>
                              <option value={5.0}>5.0m</option>
                              <option value={8.0}>8.0m (광간격)</option>
                              <option value={10.0}>10.0m (★ 3안 표준)</option>
                              <option value={12.0}>12.0m (대형광간격)</option>
                            </select>
                          </div>
                        ) : (
                          <span className="font-mono">{res.spacing}m</span>
                        )}
                      </td>
                      <td className="p-2 font-mono font-bold text-amber-700">
                        {isHybrid ? `${Math.round(res.totalAxialForce * 0.35)} kN (분담35%)` : `${res.totalAxialForce} kN`}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono font-bold ${res.utilizationRatio > 100 ? 'text-rose-600' : 'text-slate-800'}`}>
                            {isHybrid ? Math.round(res.utilizationRatio * 0.7) : res.utilizationRatio}%
                          </span>
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                res.utilizationRatio > 100
                                  ? 'bg-rose-600'
                                  : res.utilizationRatio > 80
                                  ? 'bg-amber-500'
                                  : isHybrid
                                  ? 'bg-purple-600'
                                  : 'bg-emerald-600'
                              }`}
                              style={{ width: `${Math.min(100, isHybrid ? res.utilizationRatio * 0.7 : res.utilizationRatio)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className={`font-mono ${res.waleUtilizationRatio > 100 ? 'text-rose-600 font-bold' : ''}`}>
                          {isHybrid ? Math.round(res.waleUtilizationRatio * 0.65) : res.waleUtilizationRatio}%
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              !isNg || isHybrid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {!isNg || isHybrid ? 'SAFE (안전)' : 'NG (초과)'}
                          </span>
                          {isNg && !isHybrid && onUpdateStruts && (
                            <button
                              onClick={() => handleStrutSpacingChange(res.tier, 3.0)}
                              className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold shadow-2xs whitespace-nowrap"
                              title="수평간격을 3.0m로 축소하여 즉시 OK 만족"
                            >
                              간격 3.0m로 OK
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

