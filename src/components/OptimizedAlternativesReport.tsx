import React, { useMemo } from 'react';
import { CalculationResult, ExcavationStage, ProjectSettings, SoilLayer, StrutTier, WallSection } from '../types';
import { calculateExcavationAnalysis } from '../utils/geotechnicalEngine';
import {
  optimizeAllAlternatives,
  OptimizedAlternativeDesign,
  OptimizedAlternativeKey,
} from '../utils/alternativeOptimizationEngine';

interface Props {
  settings: ProjectSettings;
  layers: SoilLayer[];
  wall: WallSection;
  struts: StrutTier[];
  stages: ExcavationStage[];
  calcResult: CalculationResult;
}

const won = (value: number) => `${Math.round(value / 10000).toLocaleString()}만원`;
const eok = (value: number) => `${(value / 100000000).toFixed(2)}억원`;

const keyStyle: Record<OptimizedAlternativeKey, string> = {
  STRUT: 'border-amber-300 bg-amber-50',
  STANDARD_ANCHOR: 'border-sky-300 bg-sky-50',
  HIGH_ANGLE_ANCHOR: 'border-indigo-300 bg-indigo-50',
  HYBRID: 'border-purple-400 bg-purple-50',
};

function AlternativeCard({ design, recommended }: { design: OptimizedAlternativeDesign; recommended: boolean }) {
  const q = design.quantities;
  const s = design.safety;
  return (
    <div className={`rounded-xl border-2 p-3.5 space-y-3 ${keyStyle[design.key]} ${recommended ? 'ring-2 ring-emerald-400' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-black text-slate-950 text-sm">{design.name} {recommended && '★ 조건부 우선안'}</div>
          <div className="text-[11px] text-slate-600 mt-0.5">{design.description}</div>
        </div>
        <span className={`px-2 py-1 rounded border text-[11px] font-black ${s.allChecksSafe ? 'bg-emerald-100 border-emerald-400 text-emerald-900' : 'bg-rose-100 border-rose-400 text-rose-900'}`}>
          {s.allChecksSafe ? '구조안전 제약 통과' : '재설계 필요'}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
        <div className="bg-white/90 border border-slate-200 rounded p-2"><div className="text-slate-500">직접공사비</div><div className="font-black text-slate-900">{eok(design.costs.directCost)}</div></div>
        <div className="bg-white/90 border border-slate-200 rounded p-2"><div className="text-slate-500">토지비 제외 LCC</div><div className="font-black text-blue-900">{eok(design.costs.lccWithoutLand)}</div></div>
        <div className="bg-white/90 border border-slate-200 rounded p-2"><div className="text-slate-500">위험조정 LCC</div><div className="font-black text-purple-900">{eok(design.costs.riskAdjustedLcc)}</div></div>
        <div className="bg-white/90 border border-slate-200 rounded p-2"><div className="text-slate-500">예상 공기</div><div className="font-black text-slate-900">{design.costs.durationDays}일</div></div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
        <table className="w-full text-[10.5px] text-center border-collapse">
          <thead className="bg-slate-100 text-slate-700"><tr><th className="p-1.5">단</th><th className="p-1.5">GL-m</th><th className="p-1.5">지보형식</th><th className="p-1.5">간격/각도</th><th className="p-1.5">확정 규격</th><th className="p-1.5">설계력</th><th className="p-1.5">사용률</th><th className="p-1.5">인발 Fs</th><th className="p-1.5">수량</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {design.tiers.map((tier) => (
              <tr key={`${design.key}-${tier.tier}`}>
                <td className="p-1.5 font-bold">{tier.tier}</td><td className="p-1.5 font-mono">{tier.depth.toFixed(1)}</td>
                <td className="p-1.5 font-semibold">{tier.kind === 'STRUT' ? '버팀보' : tier.kind === 'HIGH_ANGLE_ANCHOR' ? '고각앵커' : '표준앵커'}</td>
                <td className="p-1.5 font-mono">@{tier.spacing}m{tier.angleDeg ? ` / ${tier.angleDeg}°` : ''}</td>
                <td className="p-1.5 text-left min-w-44">{tier.spec}{tier.bondLength ? ` / Lf ${tier.freeLength}m + Le ${tier.bondLength}m` : ''}</td>
                <td className="p-1.5 font-mono">{tier.designForce.toLocaleString()}kN</td><td className="p-1.5 font-mono">{tier.utilizationPct.toFixed(1)}%</td>
                <td className="p-1.5 font-mono">{tier.pulloutFs?.toFixed(2) || '-'}</td><td className="p-1.5 font-mono">{tier.count}{tier.kind === 'STRUT' ? '본' : '공'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
        <div className="bg-white/90 rounded border border-slate-200 p-2 leading-relaxed">
          <div className="font-black text-slate-800 mb-1">확정 수량</div>
          <div>엄지말뚝: {q.soldierPileSpec}, @{q.soldierPilePitch}m, {q.soldierPileCount}본 / {q.soldierPileLength.toLocaleString()}m</div>
          <div>띠장 강재: {q.waleSteelTon.toLocaleString()}ton / 중간말뚝: {q.centerPostCount}본 / 복공: {q.deckArea.toLocaleString()}m²</div>
          <div>버팀보: {q.strutCount}본, {q.strutSteelTon}ton / 앵커: {q.anchorCount}공</div>
          <div>앵커 천공: {q.drillingLength.toLocaleString()}m / 강선: {q.strandWeightTon}ton / 그라우트: {q.groutVolume}m³</div>
        </div>
        <div className="bg-white/90 rounded border border-slate-200 p-2 leading-relaxed">
          <div className="font-black text-slate-800 mb-1">구조안전 지배값</div>
          <div>벽체 {s.wallUtilizationPct}% / 지보재 {s.maxSupportUtilizationPct}% / 띠장 {s.maxWaleUtilizationPct}%</div>
          <div>최소 인발 Fs: {s.minPulloutFs?.toFixed(2) || '-'} / 말뚝 연직 Fs: {s.pileVerticalFs.toFixed(2)}</div>
          <div>최대 앵커 수평투영: {design.maxHorizontalProjection}m / 지장물 교차 후보: {design.utilityConflictCount}건</div>
          <div className="mt-1 font-semibold text-rose-700">조건: {design.feasibleCondition}</div>
        </div>
      </div>
      <div className="bg-white/90 rounded border border-slate-200 p-2 text-[10.5px] text-slate-600">
        비용구성: 공통 지반보강 {won(design.costs.groundTreatment)} + 벽체·말뚝 {won(design.costs.wallAndPile)} + 복공·중간말뚝 {won(design.costs.deckAndCenterPost)} + 지보·띠장 {won(design.costs.supportAndWale)} + 간접·간섭비 {won(design.costs.indirectCost + design.costs.interferenceCost)}
      </div>
    </div>
  );
}

export const OptimizedAlternativesReport: React.FC<Props> = ({ settings, layers, wall, struts, stages, calcResult }) => {
  const finalCalcResult = useMemo(() => {
    const finalStage = stages[stages.length - 1] || {
      step: 999,
      name: '최종 굴착단계',
      excavationDepth: settings.finalExcavationDepth,
      activeStrutIds: struts.map((strut) => strut.id),
      description: '최적화 최종단계',
      isCompleted: false,
    };
    return calculateExcavationAnalysis(settings, layers, wall, struts, finalStage);
  }, [settings, layers, wall, struts, stages, calcResult]);
  const optimization = useMemo(() => {
    try {
      return { report: optimizeAllAlternatives(settings, layers, wall, struts, finalCalcResult), error: '' };
    } catch (error) {
      return {
        report: null,
        error: error instanceof Error ? error.message : '최적화 계산 중 알 수 없는 오류가 발생했습니다.',
      };
    }
  },
    [settings, layers, wall, struts, finalCalcResult],
  );
  if (!optimization.report) {
    return (
      <div className="rounded-xl border-2 border-rose-400 bg-rose-50 p-5 text-rose-950">
        <div className="text-base font-black">공법비교 계산을 완료하지 못했습니다.</div>
        <div className="mt-2 text-xs leading-relaxed">{optimization.error}</div>
        <div className="mt-2 text-[11px] text-rose-800">입력 제원의 굴착심도·지층·벽체·지보재 값을 확인한 뒤 다시 선택해 주세요.</div>
      </div>
    );
  }
  const report = optimization.report;
  const baseWinner = report.alternatives.find((item) => item.key === report.lowestBaseLccKey)!;
  const riskWinner = report.alternatives.find((item) => item.key === report.lowestRiskAdjustedLccKey)!;
  const recommended = report.alternatives.find((item) => item.key === report.recommendedKey)!;

  return (
    <div className="space-y-5 pb-8 text-slate-800">
      <div className="rounded-xl bg-slate-950 text-white p-5 border border-slate-700 space-y-3">
        <div className="flex flex-wrap justify-between gap-2">
          <div><div className="text-lg font-black">4대 가시설 지보공법 구조안전 제약 경제성 최적화 최종보고서</div><div className="text-xs text-slate-300 mt-1">재검토 작업본 · 기준일 {report.basis.designDate} · 수량 및 비용 동시 확정</div></div>
          <div className="text-right text-xs font-mono text-slate-200">H={report.basis.excavationDepth}m · L={report.basis.stationLength}m · B={report.basis.stationWidth}m<br/>지보심도 {report.basis.supportDepths.join(' / ')}m</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="rounded bg-slate-900 border border-slate-700 p-3"><div className="text-slate-400">토지비 제외 최저 LCC</div><div className="font-black text-sky-300 mt-1">{baseWinner.name} · {eok(baseWinner.costs.lccWithoutLand)}</div></div>
          <div className="rounded bg-slate-900 border border-slate-700 p-3"><div className="text-slate-400">잠정 위험조정 최저</div><div className="font-black text-purple-300 mt-1">{riskWinner.name} · {eok(riskWinner.costs.riskAdjustedLcc)}</div></div>
          <div className="rounded bg-emerald-950 border border-emerald-600 p-3"><div className="text-emerald-200">지장물 후보까지 반영한 조건부 우선안</div><div className="font-black text-emerald-300 mt-1">{recommended.name}</div></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="font-black text-slate-900">1. 공통 최적화 기준</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-[11px]">
          <div className="bg-slate-50 rounded border border-slate-200 p-3"><div className="font-bold mb-1">구조안전 제약</div>{report.basis.criteria.map((item) => <div key={item}>• {item}</div>)}</div>
          <div className="bg-slate-50 rounded border border-slate-200 p-3"><div className="font-bold mb-1">통일 단가 기준</div>{report.basis.unitRates.map((item) => <div key={item}>• {item}</div>)}</div>
        </div>
        <div className="bg-emerald-50 rounded border border-emerald-300 p-3 text-[11px]">
          <div className="font-black text-emerald-950 mb-1">모든 대안에 선반영한 공통 지반안정 설계</div>
          {report.basis.groundActions.map((item) => <div key={item}>• {item}</div>)}
          <div className="font-bold mt-1">공통 보강비: {won(report.basis.commonGroundTreatmentCost)}</div>
        </div>
        <div className="p-3 rounded border border-amber-300 bg-amber-50 text-[11px] leading-relaxed text-amber-950">
          토지사용 위험충당금은 비교를 위한 잠정값입니다. 실제 LCC 확정 시 감정평가·사용기간·소유자 동의조건으로 교체해야 하며, 지장물 교차 후보가 1건 이상인 앵커안은 이설 또는 앵커 궤적 변경 전까지 시공 확정안이 아닙니다.
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="font-black text-slate-900">2. 최적 조합 종합 비교</div>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-[11px] text-center border-collapse">
            <thead className="bg-slate-100"><tr><th className="p-2 text-left">대안</th><th className="p-2">구조판정</th><th className="p-2">직접비</th><th className="p-2">공기</th><th className="p-2">토지비 제외 LCC</th><th className="p-2">위험조정 LCC</th><th className="p-2">앵커 투영</th><th className="p-2">지장물 후보</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {report.alternatives.map((item) => (
                <tr key={item.key} className={item.key === report.recommendedKey ? 'bg-emerald-50 font-bold' : ''}>
                  <td className="p-2 text-left font-bold">{item.name}{item.key === report.recommendedKey ? ' ★' : ''}</td>
                  <td className="p-2 text-emerald-700">{item.safety.allChecksSafe ? 'SAFE' : 'NG'}</td><td className="p-2 font-mono">{won(item.costs.directCost)}</td>
                  <td className="p-2 font-mono">{item.costs.durationDays}일</td><td className="p-2 font-mono">{won(item.costs.lccWithoutLand)}</td><td className="p-2 font-mono font-bold">{won(item.costs.riskAdjustedLcc)}</td>
                  <td className="p-2 font-mono">{item.maxHorizontalProjection}m</td><td className={`p-2 font-mono ${item.utilityConflictCount ? 'text-rose-700' : 'text-emerald-700'}`}>{item.utilityConflictCount}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <div className="font-black text-slate-900 px-1">3. 대안별 확정 입력치·수량·안전율·비용</div>
        {report.alternatives.map((design) => <div key={design.key}><AlternativeCard design={design} recommended={design.key === report.recommendedKey} /></div>)}
      </div>

      <div className="rounded-xl border-2 border-slate-800 bg-white p-5 space-y-2">
        <div className="font-black text-slate-950">4. 최종 검토의견</div>
        <p className="text-sm leading-relaxed">{report.conclusion}</p>
        <p className="text-xs leading-relaxed text-slate-600">본 결과는 기존 단계별 해석에서 산정된 단위폭 수평반력을 동일하게 유지하는 설계 최적화 결과입니다. 최종 시공 확정 전 현장 인발시험, 배면 토지경계·지장물 측량, 연결부 상세, 시공단계별 2차원 또는 3차원 해석 및 관계전문가 확인이 필요합니다.</p>
      </div>
    </div>
  );
};
