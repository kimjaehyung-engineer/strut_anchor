import React, { useState, useMemo } from 'react';
import {
  X,
  Building2,
  Clock,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Download,
  Copy,
  Printer,
  Sparkles,
  Shield,
  FileSpreadsheet,
  Info,
  ChevronRight,
  SplitSquareVertical,
  Check,
  Zap,
} from 'lucide-react';
import { ProjectSettings } from '../types';
import {
  calculateStructureConstructionImpact,
  StructureImpactResult,
} from '../utils/structureImpactEngine';

interface StructureConstructionImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProjectSettings;
}

export const StructureConstructionImpactModal: React.FC<StructureConstructionImpactModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'SIMULATION' | 'COST_SCHEDULE' | 'BREAKDOWN' | 'REPORT'>('SIMULATION');
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const impactData: StructureImpactResult = useMemo(() => {
    return calculateStructureConstructionImpact(settings);
  }, [settings]);

  if (!isOpen) return null;

  const { costSummary, kingPostAnalysis, wallPouringAnalysis, slabRestrutAnalysis, items, stageSimulations } = impactData;
  const currSim = stageSimulations[selectedStageIndex] || stageSimulations[0];

  const handleCopyReport = () => {
    const txt = `[본체 구조물 축조 시 가시설 간섭 영향(공기·비용) 3대 대안 종합 분석 기술검토서]
■ 프로젝트: ${settings.projectName || '지하정거장 건설공사'}
■ 제원: 정거장 연장 ${impactData.stationLength}m × 폭 ${impactData.stationWidth}m × 심도 ${impactData.excavationDepth}m (${impactData.storyCount}개 층)

============================================================
1. 핵심 결론 요약 (Executive Summary)
============================================================
· 제1안 (전구간 버팀보): 중간말뚝(${kingPostAnalysis.strutPostCount}본) 슬래브 관통 및 사후 산소절단, 벽체 2단 분할타설(콜드조인트), 슬래브 재지보 간섭 발생
  ➔ 본체 구조물 공기 +${costSummary.strutStructureDurationDays - costSummary.anchorStructureDurationDays}일 지연 | 추가 간섭비용 +${Math.round(costSummary.strutStructureExtraCost / 10000).toLocaleString()}만원
· 제2안 (전구간 어스앵커): 내부 중간말뚝 0본(무지주), 벽체 전고(Full-Height) 1단 일체 통타설, 슬래브 간섭 제로
  ➔ 본체 구조물 공기 0일 (1안 대비 -${costSummary.durationSavingsAnchorVsStrut}일 쾌속 단축) | 추가 간섭비용 0원 (${Math.round(costSummary.costSavingsAnchorVsStrut / 10000).toLocaleString()}만원 절감)
· 제3안 (광간격 복합공법 @10m): 상부 앵커로 무지주 일체타설 + 하부 10m 광폭 작업구로 말뚝 65% 감소
  ➔ 본체 구조물 공기 1안 대비 -${costSummary.durationSavingsHybridVsStrut}일 단축 | 추가비용 +${Math.round(costSummary.hybridStructureExtraCost / 10000).toLocaleString()}만원 (${Math.round(costSummary.costSavingsHybridVsStrut / 10000).toLocaleString()}만원 절감)

============================================================
2. 항목별 세부 간섭비용 및 공기 비교
============================================================
1) 중간말뚝 슬래브 관통부 지수판 방수 & 사후 가스절단:
   - 1안: ${kingPostAnalysis.strutPenetrationPoints}개소 (${Math.round((kingPostAnalysis.strutCutCost + kingPostAnalysis.strutWaterproofingCost) / 10000).toLocaleString()}만원, ${kingPostAnalysis.strutDays}일)
   - 2안: 0개소 (0원, 0일)
   - 3안: ${kingPostAnalysis.hybridPenetrationPoints}개소 (${Math.round((kingPostAnalysis.hybridCutCost + kingPostAnalysis.hybridWaterproofingCost) / 10000).toLocaleString()}만원, ${kingPostAnalysis.hybridDays}일)

2) 외벽체 타설 (2단 분할 vs 1단 전고 일체):
   - 1안: 2단 분할 타설 불가피 (${Math.round((wallPouringAnalysis.strutFormworkExtraCost + wallPouringAnalysis.strutWaterstopCost) / 10000).toLocaleString()}만원, ${wallPouringAnalysis.strutDays}일, 수평 콜드조인트 누수 리스크 High)
   - 2안: 시스템 갱폼 1단 일체 통타설 (0원, 0일, 콜드조인트 없음)
   - 3안: 상부 일체 + 하부 부분분할 (${Math.round((wallPouringAnalysis.hybridFormworkExtraCost + wallPouringAnalysis.hybridWaterstopCost) / 10000).toLocaleString()}만원, ${wallPouringAnalysis.hybridDays}일)

3) 슬래브 타설 시 버팀보 간섭 및 재지보(Re-strutting):
   - 1안: 재지보 빔 ${slabRestrutAnalysis.strutRestrutBeamCount}개소 (${Math.round(slabRestrutAnalysis.strutRestrutCost / 10000).toLocaleString()}만원, ${slabRestrutAnalysis.strutTotalDays}일)
   - 2안: 재지보 0개소 (0원, 0일)
   - 3안: 재지보 ${slabRestrutAnalysis.hybridRestrutBeamCount}개소 (${Math.round(slabRestrutAnalysis.hybridRestrutCost / 10000).toLocaleString()}만원, ${slabRestrutAnalysis.hybridTotalDays}일)`;

    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportCSV = () => {
    const rows: string[][] = [];
    rows.push(['본체 구조물 축조 시 가시설 간섭 영향(공기·비용) 3대 대안 분석 보고서']);
    rows.push(['프로젝트명', settings.projectName || '']);
    rows.push(['연장(m)', impactData.stationLength.toString(), '폭(m)', impactData.stationWidth.toString(), '굴착심도(m)', impactData.excavationDepth.toString(), '층수', impactData.storyCount.toString()]);
    rows.push([]);
    rows.push(['[1. 3대 대안별 본체 구조물 축조 종합 요약]']);
    rows.push(['구분', '제1안 (전구간 버팀보)', '제2안 (전구간 어스앵커)', '제3안 (광간격 복합공법)', '1안 대비 2안 절감/단축', '1안 대비 3안 절감/단축']);
    rows.push(['구조물 추가 간섭비용(원)', costSummary.strutStructureExtraCost.toString(), '0', costSummary.hybridStructureExtraCost.toString(), costSummary.costSavingsAnchorVsStrut.toString(), costSummary.costSavingsHybridVsStrut.toString()]);
    rows.push(['구조물 축조 총소요공기(일)', costSummary.strutStructureDurationDays.toString(), costSummary.anchorStructureDurationDays.toString(), costSummary.hybridStructureDurationDays.toString(), `-${costSummary.durationSavingsAnchorVsStrut}일`, `-${costSummary.durationSavingsHybridVsStrut}일`]);
    rows.push(['외벽체 타설 방식', '2단 분할 타설 (콜드조인트 有)', '전고 1단 일체 타설 (조인트 無)', '상부 1단 + 하부 국부타설', '품질 극대화', '품질 우수']);
    rows.push(['중간말뚝 슬래브 관통수', `${kingPostAnalysis.strutPenetrationPoints}개소`, '0개소 (무지주)', `${kingPostAnalysis.hybridPenetrationPoints}개소`, `${kingPostAnalysis.strutPenetrationPoints}개소 제거`, `${kingPostAnalysis.strutPenetrationPoints - kingPostAnalysis.hybridPenetrationPoints}개소 감소`]);
    rows.push([]);
    rows.push(['[2. 세부 공종별 추가비용 및 공기 내역]']);
    rows.push(['공종 대분류', '세부 항목명', '단위', '1안 수량', '1안 금액(원)', '1안 일수', '2안 수량', '2안 금액(원)', '2안 일수', '3안 수량', '3안 금액(원)', '3안 일수', '구조/방수 리스크']);
    items.forEach((it) => {
      rows.push([
        it.category,
        it.subItem,
        it.unit,
        it.strutQty.toString(),
        it.strutAmount.toString(),
        it.strutDays.toString(),
        it.anchorQty.toString(),
        it.anchorAmount.toString(),
        it.anchorDays.toString(),
        it.hybridQty.toString(),
        it.hybridAmount.toString(),
        it.hybridDays.toString(),
        it.riskNote,
      ]);
    });

    const csvContent = '\uFEFF' + rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `본체구조물_축조_가시설간섭영향분석_${settings.projectName || 'Report'}.csv`;
    document.body.appendChild(a);
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-1 sm:p-3 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[96vh] flex flex-col text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="h-14 px-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  본체 구조물 축조 시 가시설 간섭 영향 분석 (벽체 2단타설·중간말뚝 절단·슬래브 재지보)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                  LCC 구조물 공기·비용 연동
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                가시설 완료 후 상향식(Bottom-Up) 구조물 축조 시 3대 대안별 중간말뚝 관통/절단, 벽체 2단 타설, 재지보 공기 및 비용 정밀 산정
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyReport}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
              title="분석 보고서 텍스트 복사"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사완료' : '텍스트복사'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
              title="CSV 수량 및 공사비 엑셀 내보내기"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>CSV 내보내기</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('SIMULATION')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'SIMULATION'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. 층별 상향식 축조 시뮬레이션 (3D 도해)</span>
          </button>
          <button
            onClick={() => setActiveTab('COST_SCHEDULE')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'COST_SCHEDULE'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>2. 3대 대안 공사비 & 공기 종합 비교</span>
          </button>
          <button
            onClick={() => setActiveTab('BREAKDOWN')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'BREAKDOWN'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>3. 세부 산출 내역서 (관통·절단·재지보)</span>
          </button>
          <button
            onClick={() => setActiveTab('REPORT')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'REPORT'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>4. 구조물 시공성·방수품질 리스크 평가</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Top 3 KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1안 Strut Card */}
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-extrabold text-amber-950 border-b border-amber-200 pb-1.5">
                <span>1안. 전구간 버팀보 (스트럿)</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-bold">
                  간섭 최대
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-600 text-xs">구조물 추가 간섭비:</span>
                  <span className="text-base font-black text-amber-900 font-mono">
                    +{Math.round(costSummary.strutStructureExtraCost / 10000).toLocaleString()}만원
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-600 text-xs">구조물 공기 지연:</span>
                  <span className="text-sm font-bold text-amber-900 font-mono">
                    +{costSummary.strutStructureDurationDays - costSummary.anchorStructureDurationDays}일 지연
                  </span>
                </div>
              </div>
              <p className="text-[10.5px] text-amber-900 leading-snug bg-white/70 p-2 rounded border border-amber-200">
                ⚠️ 중간말뚝 {kingPostAnalysis.strutPostCount}본 슬래브 관통/절단 + 벽체 2단 분할타설(콜드조인트) + 슬래브 재지보 발생
              </p>
            </div>

            {/* 2안 Anchor Card */}
            <div className="bg-blue-50/80 border border-blue-300 rounded-xl p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-extrabold text-blue-950 border-b border-blue-200 pb-1.5">
                <span>2안. 전구간 어스앵커 (무지주)</span>
                <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded text-[10px] font-bold">
                  간섭 제로★
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-600 text-xs">구조물 추가 간섭비:</span>
                  <span className="text-base font-black text-blue-900 font-mono">
                    0원 (완전 절감)
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-600 text-xs">구조물 공기 단축:</span>
                  <span className="text-sm font-bold text-blue-900 font-mono">
                    -{costSummary.durationSavingsAnchorVsStrut}일 단축
                  </span>
                </div>
              </div>
              <p className="text-[10.5px] text-blue-950 leading-snug bg-white/70 p-2 rounded border border-blue-200">
                ✨ 무지주 공간으로 벽체 1단 전고(Full-Height) 통타설 + 중간말뚝 절단 0건 + 펌프카 쾌속 타설
              </p>
            </div>

            {/* 3안 Hybrid Card */}
            <div className="bg-purple-50/80 border border-purple-300 rounded-xl p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-extrabold text-purple-950 border-b border-purple-200 pb-1.5">
                <span>3안. 광간격 복합공법 (@10m)</span>
                <span className="px-2 py-0.5 bg-purple-200 text-purple-900 rounded text-[10px] font-bold">
                  간섭 최소화★
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-600 text-xs">구조물 추가 간섭비:</span>
                  <span className="text-base font-black text-purple-900 font-mono">
                    +{Math.round(costSummary.hybridStructureExtraCost / 10000).toLocaleString()}만원 ({Math.round(costSummary.costSavingsHybridVsStrut / 10000).toLocaleString()}만 절감)
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-600 text-xs">구조물 공기 단축:</span>
                  <span className="text-sm font-bold text-purple-900 font-mono">
                    -{costSummary.durationSavingsHybridVsStrut}일 단축
                  </span>
                </div>
              </div>
              <p className="text-[10.5px] text-purple-950 leading-snug bg-white/70 p-2 rounded border border-purple-200">
                🎯 상부 앵커로 지붕/상부벽체 무지주 통타설 + 하부 10m 광폭 작업구로 말뚝 65% 감소
              </p>
            </div>
          </div>

          {/* TAB 1: Stage-by-Stage Construction Simulator */}
          {activeTab === 'SIMULATION' && (
            <div className="space-y-4">
              {/* Stage Step Selector Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {stageSimulations.map((st, idx) => (
                  <button
                    key={st.stageNumber}
                    onClick={() => setSelectedStageIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedStageIndex === idx
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-[11px] opacity-80 block mb-1">
                      {st.stageName.split(':')[0]}
                    </span>
                    <span className="text-xs font-bold line-clamp-1">
                      {st.stageName.split(':')[1] || st.stageName}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Stage Simulation Visual & Detailed Comparison Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-sky-300">
                      {currSim.stageName}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {currSim.stageSubtitle}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600/30 border border-blue-400/40 text-blue-200 rounded-full text-xs font-bold">
                    상향식(Bottom-Up) 공정
                  </span>
                </div>

                {/* 3-Column Visual Comparison Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* 1안 카드 */}
                  <div className="bg-slate-800/90 rounded-xl p-3.5 border border-amber-500/40 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 text-xs">
                      <span className="font-extrabold text-amber-300">1안: 전구간 버팀보</span>
                      <span className="font-mono text-amber-200 text-[11px]">소요: {currSim.strutDays}일</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] text-slate-400 block font-semibold">가시설 상태:</span>
                      <p className="text-slate-200 text-[11.5px] leading-relaxed">{currSim.strutStatus}</p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] text-slate-400 block font-semibold">구조물 타설 작업:</span>
                      <p className="text-slate-200 text-[11.5px] leading-relaxed">{currSim.strutWork}</p>
                    </div>
                    <div className="bg-amber-950/40 border border-amber-600/30 p-2 rounded text-[11px] text-amber-200 space-y-1">
                      <span className="font-bold block">⚠️ 주요 간섭 및 문제점:</span>
                      <p className="leading-snug">{currSim.strutInterference}</p>
                    </div>
                  </div>

                  {/* 2안 카드 */}
                  <div className="bg-slate-800/90 rounded-xl p-3.5 border border-blue-500/40 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 text-xs">
                      <span className="font-extrabold text-sky-300">2안: 전구간 어스앵커</span>
                      <span className="font-mono text-sky-200 text-[11px]">소요: {currSim.anchorDays}일 (-{currSim.strutDays - currSim.anchorDays}일)</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] text-slate-400 block font-semibold">가시설 상태:</span>
                      <p className="text-slate-200 text-[11.5px] leading-relaxed">{currSim.anchorStatus}</p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] text-slate-400 block font-semibold">구조물 타설 작업:</span>
                      <p className="text-slate-200 text-[11.5px] leading-relaxed">{currSim.anchorWork}</p>
                    </div>
                    <div className="bg-blue-950/40 border border-blue-500/30 p-2 rounded text-[11px] text-sky-200 space-y-1">
                      <span className="font-bold block">✨ 시공성 및 품질 이점:</span>
                      <p className="leading-snug">간섭 제로, 시스템 거푸집 1단 통타설로 방수/품질 완벽</p>
                    </div>
                  </div>

                  {/* 3안 카드 */}
                  <div className="bg-slate-800/90 rounded-xl p-3.5 border border-purple-500/40 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 text-xs">
                      <span className="font-extrabold text-purple-300">3안: 광간격 복합공법</span>
                      <span className="font-mono text-purple-200 text-[11px]">소요: {currSim.hybridDays}일 (-{currSim.strutDays - currSim.hybridDays}일)</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] text-slate-400 block font-semibold">가시설 상태:</span>
                      <p className="text-slate-200 text-[11.5px] leading-relaxed">{currSim.hybridStatus}</p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] text-slate-400 block font-semibold">구조물 타설 작업:</span>
                      <p className="text-slate-200 text-[11.5px] leading-relaxed">{currSim.hybridWork}</p>
                    </div>
                    <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded text-[11px] text-purple-200 space-y-1">
                      <span className="font-bold block">🎯 복합 공법 장점:</span>
                      <p className="leading-snug">상부 완전 개방 + 하부 10m 광폭 작업구로 공기단축과 민원회피 동시 만족</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Cost & Schedule Comprehensive Analysis */}
          {activeTab === 'COST_SCHEDULE' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-blue-600" />
                  <span>3대 대안 본체 구조물 축조 공기 & 비용 정밀 산정 총괄표</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  가시설 내부 장애물(버팀보, 중간말뚝) 유무에 따라 발생하는 <strong>중간말뚝 관통부 방수처리비용, 사후 가스절단비용, 외벽체 2단 분할타설 거푸집 노무비, 슬래브 재지보(Re-strut) 빔 공사비</strong>를 종합 집계하였습니다.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 border-r border-slate-200">구분</th>
                        <th className="p-2.5 border-r border-slate-200 bg-amber-50/60 text-amber-950">1안: 전구간 버팀보</th>
                        <th className="p-2.5 border-r border-slate-200 bg-blue-50/60 text-blue-950">2안: 전구간 어스앵커</th>
                        <th className="p-2.5 border-r border-slate-200 bg-purple-50/60 text-purple-950">3안: 광간격 복합공법</th>
                        <th className="p-2.5 bg-emerald-50/60 text-emerald-950">2안 vs 1안 절감/단축</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-bold bg-slate-50">중간말뚝(King Post) 관통수</td>
                        <td className="p-2.5 font-mono text-amber-900 font-bold">{kingPostAnalysis.strutPenetrationPoints}개소 ({kingPostAnalysis.strutPostCount}본)</td>
                        <td className="p-2.5 font-mono text-blue-900 font-bold">0개소 (무지주)</td>
                        <td className="p-2.5 font-mono text-purple-900 font-bold">{kingPostAnalysis.hybridPenetrationPoints}개소 ({kingPostAnalysis.hybridPostCount}본)</td>
                        <td className="p-2.5 font-mono text-emerald-700 font-bold">-{kingPostAnalysis.strutPenetrationPoints}개소 (100% 제거)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold bg-slate-50">말뚝 관통부 방수 & 사후절단비</td>
                        <td className="p-2.5 font-mono text-amber-900">{Math.round((kingPostAnalysis.strutCutCost + kingPostAnalysis.strutWaterproofingCost) / 10000).toLocaleString()} 만원</td>
                        <td className="p-2.5 font-mono text-blue-900">0 원</td>
                        <td className="p-2.5 font-mono text-purple-900">{Math.round((kingPostAnalysis.hybridCutCost + kingPostAnalysis.hybridWaterproofingCost) / 10000).toLocaleString()} 만원</td>
                        <td className="p-2.5 font-mono text-emerald-700 font-bold">-{Math.round((kingPostAnalysis.strutCutCost + kingPostAnalysis.strutWaterproofingCost) / 10000).toLocaleString()} 만원</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold bg-slate-50">외벽체(Side Wall) 타설 방식</td>
                        <td className="p-2.5 text-amber-900 font-bold">2단 분할 타설 (콜드조인트 有)</td>
                        <td className="p-2.5 text-blue-900 font-bold">전고 1단 일체 타설 (조인트 無)</td>
                        <td className="p-2.5 text-purple-900 font-bold">상부 1단 + 하부 부분분할</td>
                        <td className="p-2.5 text-emerald-700 font-bold">수밀성 극대화 (누수위험 0)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold bg-slate-50">벽체 분할타설 & 지수판 추가비</td>
                        <td className="p-2.5 font-mono text-amber-900">{Math.round((wallPouringAnalysis.strutFormworkExtraCost + wallPouringAnalysis.strutWaterstopCost) / 10000).toLocaleString()} 만원</td>
                        <td className="p-2.5 font-mono text-blue-900">0 원</td>
                        <td className="p-2.5 font-mono text-purple-900">{Math.round((wallPouringAnalysis.hybridFormworkExtraCost + wallPouringAnalysis.hybridWaterstopCost) / 10000).toLocaleString()} 만원</td>
                        <td className="p-2.5 font-mono text-emerald-700 font-bold">-{Math.round((wallPouringAnalysis.strutFormworkExtraCost + wallPouringAnalysis.strutWaterstopCost) / 10000).toLocaleString()} 만원</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold bg-slate-50">슬래브 재지보(Re-strut) 공사비</td>
                        <td className="p-2.5 font-mono text-amber-900">{Math.round(slabRestrutAnalysis.strutRestrutCost / 10000).toLocaleString()} 만원 ({slabRestrutAnalysis.strutRestrutBeamCount}개소)</td>
                        <td className="p-2.5 font-mono text-blue-900">0 원 (0개소)</td>
                        <td className="p-2.5 font-mono text-purple-900">{Math.round(slabRestrutAnalysis.hybridRestrutCost / 10000).toLocaleString()} 만원 ({slabRestrutAnalysis.hybridRestrutBeamCount}개소)</td>
                        <td className="p-2.5 font-mono text-emerald-700 font-bold">-{Math.round(slabRestrutAnalysis.strutRestrutCost / 10000).toLocaleString()} 만원</td>
                      </tr>
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="p-2.5">본체 구조물 추가 간섭비 합계</td>
                        <td className="p-2.5 font-mono text-amber-900 text-sm">+{Math.round(costSummary.strutStructureExtraCost / 10000).toLocaleString()} 만원</td>
                        <td className="p-2.5 font-mono text-blue-900 text-sm">0 원</td>
                        <td className="p-2.5 font-mono text-purple-900 text-sm">+{Math.round(costSummary.hybridStructureExtraCost / 10000).toLocaleString()} 만원</td>
                        <td className="p-2.5 font-mono text-emerald-700 text-sm">-{Math.round(costSummary.costSavingsAnchorVsStrut / 10000).toLocaleString()} 만원 절감</td>
                      </tr>
                      <tr className="bg-blue-50 font-bold text-slate-900">
                        <td className="p-2.5">본체 구조물 축조 소요공기</td>
                        <td className="p-2.5 font-mono text-amber-900 text-sm">{costSummary.strutStructureDurationDays} 일 (기준)</td>
                        <td className="p-2.5 font-mono text-blue-900 text-sm">{costSummary.anchorStructureDurationDays} 일 (-{costSummary.durationSavingsAnchorVsStrut}일)</td>
                        <td className="p-2.5 font-mono text-purple-900 text-sm">{costSummary.hybridStructureDurationDays} 일 (-{costSummary.durationSavingsHybridVsStrut}일)</td>
                        <td className="p-2.5 font-mono text-emerald-700 text-sm">-{costSummary.durationSavingsAnchorVsStrut} 일 쾌속 단축</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Detailed BOQ Breakdown */}
          {activeTab === 'BREAKDOWN' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    ■ 공종별 세부 수량 및 비용 산출 명세 (내역서 기준)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    단가 기준: KDS 및 건설표준품셈 적용
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-r border-slate-200">공종 분류</th>
                        <th className="p-2 border-r border-slate-200">세부 산출 항목</th>
                        <th className="p-2 border-r border-slate-200">단위</th>
                        <th className="p-2 border-r border-slate-200 text-right bg-amber-50/50">1안 수량</th>
                        <th className="p-2 border-r border-slate-200 text-right bg-amber-50/50">1안 금액(원)</th>
                        <th className="p-2 border-r border-slate-200 text-right bg-blue-50/50">2안 수량</th>
                        <th className="p-2 border-r border-slate-200 text-right bg-blue-50/50">2안 금액(원)</th>
                        <th className="p-2 border-r border-slate-200 text-right bg-purple-50/50">3안 수량</th>
                        <th className="p-2 border-r border-slate-200 text-right bg-purple-50/50">3안 금액(원)</th>
                        <th className="p-2">구조/방수 리스크 요인</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-800 border-r border-slate-200">{it.category}</td>
                          <td className="p-2 text-slate-700 border-r border-slate-200">{it.subItem}</td>
                          <td className="p-2 font-mono text-center border-r border-slate-200">{it.unit}</td>
                          <td className="p-2 font-mono text-right border-r border-slate-200 bg-amber-50/30">{it.strutQty.toLocaleString()}</td>
                          <td className="p-2 font-mono text-right font-bold text-amber-900 border-r border-slate-200 bg-amber-50/30">{it.strutAmount.toLocaleString()}</td>
                          <td className="p-2 font-mono text-right border-r border-slate-200 bg-blue-50/30">{it.anchorQty.toLocaleString()}</td>
                          <td className="p-2 font-mono text-right font-bold text-blue-900 border-r border-slate-200 bg-blue-50/30">{it.anchorAmount.toLocaleString()}</td>
                          <td className="p-2 font-mono text-right border-r border-slate-200 bg-purple-50/30">{it.hybridQty.toLocaleString()}</td>
                          <td className="p-2 font-mono text-right font-bold text-purple-900 border-r border-slate-200 bg-purple-50/30">{it.hybridAmount.toLocaleString()}</td>
                          <td className="p-2 text-[11px] text-rose-700 font-medium">{it.riskNote}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={3} className="p-2.5 text-center">합계 (본체 구조물 축조 추가 간섭비)</td>
                        <td className="p-2.5 font-mono text-right bg-amber-100/60">-</td>
                        <td className="p-2.5 font-mono text-right font-black text-amber-900 bg-amber-100/60 text-sm">
                          {costSummary.strutStructureExtraCost.toLocaleString()} 원
                        </td>
                        <td className="p-2.5 font-mono text-right bg-blue-100/60">-</td>
                        <td className="p-2.5 font-mono text-right font-black text-blue-900 bg-blue-100/60 text-sm">
                          0 원
                        </td>
                        <td className="p-2.5 font-mono text-right bg-purple-100/60">-</td>
                        <td className="p-2.5 font-mono text-right font-black text-purple-900 bg-purple-100/60 text-sm">
                          {costSummary.hybridStructureExtraCost.toLocaleString()} 원
                        </td>
                        <td className="p-2.5 text-emerald-700 font-bold">2안 100% 절감 (1.15억원 이득)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Risk & Quality Report */}
          {activeTab === 'REPORT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Quality Risks */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-extrabold text-rose-950 text-xs sm:text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>제1안 (버팀보) 적용 시 구조물 품질 및 하자 리스크</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-rose-900 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-700">1.</span>
                      <span><strong>벽체 수평 콜드조인트 누수:</strong> 버팀보 간섭으로 인한 2단 분할 타설 시 시공이음 부위로 지하수 침투 및 방수막 파손 위험 상존</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-700">2.</span>
                      <span><strong>중간말뚝 관통부 장기 하자:</strong> 각 층 슬래브를 관통하는 말뚝 주변 콘크리트 수축 균열 및 사후 가스절단/몰탈 충진 부위 누수 1순위</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-700">3.</span>
                      <span><strong>철근 배근 피복두께 부족:</strong> 촘촘한 버팀보 및 브라켓 주변 철근 가공조립 난항으로 설계 피복두께 미달 및 콘크리트 곰보 발생</span>
                    </li>
                  </ul>
                </div>

                {/* Right: Anchor / Hybrid Advantages */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-extrabold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>제2안(앵커) 및 제3안(복합공법) 채택 시 품질 혁신 효과</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-emerald-900 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-700">1.</span>
                      <span><strong>전고 1단 일체 타설:</strong> 갱폼 시스템 적용으로 수평 시공이음 없이 바닥부터 슬래브까지 일체 타설하여 완벽한 수밀성 확보</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-700">2.</span>
                      <span><strong>무지주 슬래브 철근 연속 배근:</strong> 중간말뚝 관통부가 없어 철근 절단/보강 없이 구조도면 원설계 그대로 일체 배근</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-700">3.</span>
                      <span><strong>펌프카 및 대형 폼워크 쾌속 시공:</strong> 붐대 선회 간섭이 없어 레미콘 콜드조인트 방지 및 공기 단축 극대화</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-3 px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            * KDS 21 30 00 가설흙막이설계기준 및 구조물 시공 실무 데이터 기반
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
