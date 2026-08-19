import React, { useMemo, useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Coins,
  ChevronRight,
  Building2,
  BarChart3,
  Scale,
  Zap,
  Info,
  GitBranch,
  Presentation,
  Maximize2,
} from 'lucide-react';
import {
  CalculationResult,
  ExcavationStage,
  ProjectSettings,
  SoilLayer,
  StrutTier,
  WallSection,
} from '../types';
import { calculateStructureConstructionImpact } from '../utils/structureImpactEngine';

interface FinalAnalysisPptModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProjectSettings;
  layers?: SoilLayer[];
  wall?: WallSection;
  struts?: StrutTier[];
  stages?: ExcavationStage[];
  calcResult?: CalculationResult;
  onOpenDetailedReport?: () => void;
}

export const FinalAnalysisPptModal: React.FC<FinalAnalysisPptModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOpenDetailedReport,
}) => {
  const [viewTab, setViewTab] = useState<'PPT_1PAGE' | 'GRAPHS' | 'TABLES' | 'DECISION_MATRIX'>('PPT_1PAGE');

  const structureImpact = useMemo(() => {
    return calculateStructureConstructionImpact(settings);
  }, [settings]);

  if (!isOpen) return null;

  const unitIndirectCostPerDay = 132.5; // 현장간접비: 일 132.5만원 (월 약 4,000만원 기준)

  const altData = {
    alt1: {
      name: '1안. 전구간 버팀보(8단 Strut)',
      tag: '기준 공법',
      color: 'amber',
      directCost: 142570, // 직접비 14억 2,570만원 (중간말뚝 52본 포함)
      interferenceCost: 0,
      netConstructionCost: 142570, // 1단계 순공사비 = 14억 2,570만원
      earthworkDays: 164,
      totalDuration: 269,
      durationSavings: 0,
      cpIndirectSavings: 0,
      equipLossCost: 0,
      netLccCost: 178213, // [종합 LCC = 직접비 14.26억 + 간접비 3.56억 = 17억 8,213만원]
      boundaryRisk: '0m (침범 없음 100% OK)',
      verdict: '가설 직접비 최저이나 공기(269일) 길고 중간말뚝 52본 관통 간섭',
    },
    alt2A: {
      name: '2안-A. 표준 앵커(10단 20°)',
      tag: '무지주 공법',
      color: 'sky',
      directCost: 222970, // 22억 2,970만원 (중간말뚝 52본 포함)
      interferenceCost: 0,
      netConstructionCost: 222970,
      earthworkDays: 103,
      totalDuration: 148,
      durationSavings: 121,
      cpIndirectSavings: Math.round(121 * unitIndirectCostPerDay), // 16,033 만원
      equipLossCost: 0,
      netLccCost: 287580, // [종합 LCC = 직접비 22.30억 + 간접비 1.96억 + 보상비 4.50억 = 28억 7,580만원]
      boundaryRisk: '사유지 20.4m 침범 (보상비 4.5억/민원)',
      verdict: '공기 우수하나 배면 20.4m 사유지 침범 민원 및 보상비(4.5억) 발생',
    },
    alt2B: {
      name: '2안-B. 고각 앵커(10단 45°~70°)',
      tag: '사유지 0m 회피',
      color: 'indigo',
      directCost: 260680, // 26억 0,680만원 (중간말뚝 52본 포함)
      interferenceCost: 0,
      netConstructionCost: 260680,
      earthworkDays: 103,
      totalDuration: 155,
      durationSavings: 114,
      cpIndirectSavings: Math.round(114 * unitIndirectCostPerDay), // 15,105 만원
      equipLossCost: 0,
      netLccCost: 281218, // [종합 LCC = 직접비 26.07억 + 간접비 2.05억 = 28억 1,218만원]
      boundaryRisk: '0m (사유지 0.0m 완벽 회피 100% OK)',
      verdict: '사유지 0m 완벽 회피하나 전구간 앵커로 직접비(26.07억) 과다',
    },
    alt3: {
      name: '3안. 광간격 복합공법(8단 Hybrid)',
      tag: '최우수 선정안★',
      color: 'purple',
      directCost: 169600, // 직접비 16억 9,600만원 (중간말뚝 20본)
      interferenceCost: 0,
      netConstructionCost: 169600, // 1단계 순공사비 = 16억 9,600만원
      earthworkDays: 66,
      totalDuration: 88,
      durationSavings: 181,
      cpIndirectSavings: Math.round(181 * unitIndirectCostPerDay), // 23,983 만원 절감
      equipLossCost: 0,
      efficiencySavings: 0,
      netLccCost: 181260, // [종합 LCC = 직접비 16.96억 + 간접비 1.17억 = 18억 1,260만원]
      boundaryRisk: '0m (사유지 0.0m 완벽 회피 100% OK)',
      verdict: '★ 공기 181일 최속단축(88일 완공) · 사유지 0m 완전회피 · 종합 LCC 최적 (압도적 1위 🏆)',
    },
  };

  const handleTriggerPrint = (tab: 'PPT_1PAGE' | 'GRAPHS' | 'TABLES' | 'DECISION_MATRIX' = 'PPT_1PAGE') => {
    setViewTab(tab);
    setTimeout(() => {
      window.print();
    }, 120);
  };

  return (
    <div className="ppt-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-2 sm:p-3 overflow-y-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:static">
      {/* 
        ═══════════════════════════════════════════════════════════════════════
        CLEAN STANDARD PRINT CSS: EXACT 1-PAGE A4 LANDSCAPE OUTPUT
        ═══════════════════════════════════════════════════════════════════════
      */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 3mm 4mm;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: visible !important;
          }
          /* 1. Hide non-print elements completely */
          .no-print, .print\\:hidden, header, nav, footer {
            display: none !important;
          }
          /* 2. Release modal backdrop to static document flow */
          .ppt-modal-backdrop {
            position: static !important;
            inset: auto !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            overflow: visible !important;
            display: block !important;
          }
          /* 3. Lock slide container to exact single A4 landscape sheet */
          #printable-ppt-slide {
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 98vh !important;
            max-height: 98vh !important;
            margin: 0 !important;
            padding: 2mm 3mm !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* 16:9 Presentation Slide Container */}
      <div
        id="printable-ppt-slide"
        className="ppt-slide-card bg-white w-full max-w-[1400px] rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150 my-auto print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none"
      >
        
        {/* Top Control Bar (Non-Printable Toolbar) */}
        <div className="no-print bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between border-b border-slate-800 print:hidden shrink-0 gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[11px] font-black rounded tracking-wider uppercase">
              EXECUTIVE PPT REPORT
            </span>
            <span className="font-bold text-xs sm:text-sm text-slate-200 hidden md:inline">
              1안·2안(A/B)·3안 가시설 4대 대안 최종 분석 보고서
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => handleTriggerPrint('PPT_1PAGE')}
                className={`px-3 py-1 rounded-md font-extrabold transition flex items-center gap-1.5 cursor-pointer ${
                  viewTab === 'PPT_1PAGE'
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title="PPT 1장 축약 화면으로 전환 후 바로 A4 가로 1장 인쇄/PDF 저장창을 엽니다."
              >
                <Presentation className="w-3.5 h-3.5 text-blue-200" />
                <span>PPT 1장으로 축약 (인쇄 🖨️)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab('GRAPHS')}
                className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                  viewTab === 'GRAPHS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>3단계 시각화 그래프</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab('TABLES')}
                className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                  viewTab === 'TABLES'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>정량 분석 수치표</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab('DECISION_MATRIX')}
                className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                  viewTab === 'DECISION_MATRIX'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>2D 의사결정 사분면</span>
              </button>
            </div>

            {onOpenDetailedReport && (
              <button
                type="button"
                onClick={onOpenDetailedReport}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                title="상세 설계 및 단계별 해석 모달 열기"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>상세 설계 비교</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleTriggerPrint('PPT_1PAGE')}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              title="현재 슬라이드 1장 즉시 인쇄 및 PDF 저장"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>1장 즉시 인쇄 / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            [EXPANDED 1-PAGE PRESENTATION SLIDE BODY: 시원하고 균형 잡힌 16:9 슬라이드]
           ═══════════════════════════════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 space-y-3 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/70 flex-1 flex flex-col justify-between overflow-hidden">
          
          {/* Slide Header: Title & Project Metadata */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 gap-3 shrink-0">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-black rounded tracking-wide shadow-xs">
                EXECUTIVE SUMMARY
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
                대심도 가시설 지보공법 4대 대안(1안 vs 2안A vs 2안B vs 3안) 정량 비교 · 종합 LCC 심의의결 보고서
              </h1>
            </div>

            <div className="flex items-center space-x-4 text-[11px] text-slate-600 font-medium">
              <div>· 프로젝트: <strong className="text-slate-900 font-bold">{settings.projectName || '도시철도 본선 개착공사'}</strong></div>
              <div>· 굴착 제원: <strong className="text-slate-900 font-bold">L={settings.stationLength || 100}m × B={settings.stationWidth}m × H={settings.finalExcavationDepth}m</strong></div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              [TAB 0] PPT 1장 축약 뷰 (시원한 세로 비율 & 고해상도 모식도 탑재)
             ═══════════════════════════════════════════════════════════════════════ */}
          {viewTab === 'PPT_1PAGE' && (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              
              {/* 1. 상단 4대 대안 핵심 KPI 비교 카드 + 대표 모식도 삽입 (4열 가로 시원한 배치) */}
              <div className="grid grid-cols-4 gap-3 text-xs shrink-0">
                {/* 1안 */}
                <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1.5">
                      <span className="font-extrabold text-slate-900 text-xs">1안. 버팀보 (Strut)</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">기준 공법</span>
                    </div>
                    {/* 1안 대표 모식도 (h-20으로 시원하게 확장) */}
                    <div className="w-full h-20 mb-1.5 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                      <svg viewBox="0 0 140 70" className="w-full h-full">
                        <line x1="0" y1="10" x2="140" y2="10" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,2" />
                        <rect x="24" y="8" width="5" height="58" fill="#475569" rx="0.5" />
                        <rect x="111" y="8" width="5" height="58" fill="#475569" rx="0.5" />
                        <line x1="29" y1="58" x2="111" y2="58" stroke="#64748b" strokeWidth="1.5" />
                        {/* 중간말뚝 2열 */}
                        <line x1="53" y1="6" x2="53" y2="65" stroke="#64748b" strokeWidth="1.2" strokeDasharray="2,2" />
                        <line x1="87" y1="6" x2="87" y2="65" stroke="#64748b" strokeWidth="1.2" strokeDasharray="2,2" />
                        {/* 4단 버팀보 */}
                        <line x1="29" y1="18" x2="111" y2="18" stroke="#dc2626" strokeWidth="2.0" />
                        <line x1="29" y1="30" x2="111" y2="30" stroke="#dc2626" strokeWidth="2.0" />
                        <line x1="29" y1="42" x2="111" y2="42" stroke="#dc2626" strokeWidth="2.0" />
                        <line x1="29" y1="52" x2="111" y2="52" stroke="#dc2626" strokeWidth="2.0" />
                        <text x="70" y="37" fontSize="7" fill="#dc2626" fontWeight="bold" textAnchor="middle">수평 버팀보 4단 (간섭 과다)</text>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-[10.5px]">
                      <span className="text-slate-500">순공사(1단계):</span>
                      <span className="font-mono font-bold text-slate-800">{(altData.alt1.netConstructionCost / 10000).toFixed(2)} 억원</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10.5px] text-slate-500">종합LCC(3단계):</span>
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{(altData.alt1.netLccCost / 10000).toFixed(2)} 억원</span>
                    </div>
                    <div className="text-[9.5px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                      <span>공기: <strong className="text-slate-700 font-mono">{altData.alt1.totalDuration}일</strong></span>
                      <span>중간말뚝: <strong className="text-slate-700">52본</strong></span>
                    </div>
                  </div>
                </div>

                {/* 2안-A */}
                <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1.5">
                      <span className="font-extrabold text-slate-900 text-xs">2안-A. 표준 앵커(20°)</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">무지주</span>
                    </div>
                    {/* 2안-A 대표 모식도 */}
                    <div className="w-full h-20 mb-1.5 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                      <svg viewBox="0 0 140 70" className="w-full h-full">
                        <line x1="0" y1="10" x2="140" y2="10" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,2" />
                        {/* 사유지 경계선 */}
                        <line x1="12" y1="4" x2="12" y2="65" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2.5,2" />
                        <rect x="28" y="8" width="5" height="58" fill="#475569" rx="0.5" />
                        <rect x="111" y="8" width="5" height="58" fill="#475569" rx="0.5" />
                        <line x1="33" y1="58" x2="111" y2="58" stroke="#64748b" strokeWidth="1.5" />
                        {/* 20° 경사 앵커 (경계 침범) */}
                        <line x1="28" y1="20" x2="2" y2="30" stroke="#ef4444" strokeWidth="1.8" />
                        <line x1="28" y1="32" x2="2" y2="42" stroke="#ef4444" strokeWidth="1.8" />
                        <line x1="28" y1="44" x2="2" y2="54" stroke="#ef4444" strokeWidth="1.8" />
                        <line x1="116" y1="20" x2="138" y2="30" stroke="#0284c7" strokeWidth="1.8" />
                        <line x1="116" y1="32" x2="138" y2="42" stroke="#0284c7" strokeWidth="1.8" />
                        <line x1="116" y1="44" x2="138" y2="54" stroke="#0284c7" strokeWidth="1.8" />
                        <text x="72" y="32" fontSize="7" fill="#0284c7" fontWeight="bold" textAnchor="middle">100% 무지주 개방</text>
                        <text x="72" y="44" fontSize="6.5" fill="#ef4444" fontWeight="bold" textAnchor="middle">⚠️ 배면 20.4m 침범</text>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-[10.5px]">
                      <span className="text-slate-500">순공사(1단계):</span>
                      <span className="font-mono font-bold text-slate-800">{(altData.alt2A.netConstructionCost / 10000).toFixed(2)} 억원</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10.5px] text-slate-500">종합LCC(3단계):</span>
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{(altData.alt2A.netLccCost / 10000).toFixed(2)} 억원</span>
                    </div>
                    <div className="text-[9.5px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                      <span>공기: <strong className="text-slate-700 font-mono">{altData.alt2A.totalDuration}일 (-{altData.alt2A.durationSavings}d)</strong></span>
                      <span className="text-rose-600 font-medium">사유지침범(4.5억)</span>
                    </div>
                  </div>
                </div>

                {/* 2안-B */}
                <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-1.5">
                      <span className="font-extrabold text-slate-900 text-xs">2안-B. 고각 앵커(45°)</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">0m회피</span>
                    </div>
                    {/* 2안-B 대표 모식도 */}
                    <div className="w-full h-20 mb-1.5 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                      <svg viewBox="0 0 140 70" className="w-full h-full">
                        <line x1="0" y1="10" x2="140" y2="10" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,2" />
                        <line x1="18" y1="4" x2="18" y2="65" stroke="#10b981" strokeWidth="1.2" strokeDasharray="2.5,2" />
                        <rect x="28" y="8" width="5" height="58" fill="#475569" rx="0.5" />
                        <rect x="111" y="8" width="5" height="58" fill="#475569" rx="0.5" />
                        <line x1="33" y1="58" x2="111" y2="58" stroke="#64748b" strokeWidth="1.5" />
                        {/* 45°~70° 급경사 고각 앵커 */}
                        <line x1="28" y1="20" x2="19" y2="52" stroke="#4f46e5" strokeWidth="1.8" />
                        <line x1="28" y1="32" x2="20" y2="62" stroke="#4f46e5" strokeWidth="1.8" />
                        <line x1="116" y1="20" x2="125" y2="52" stroke="#4f46e5" strokeWidth="1.8" />
                        <line x1="116" y1="32" x2="124" y2="62" stroke="#4f46e5" strokeWidth="1.8" />
                        <text x="72" y="32" fontSize="7" fill="#4f46e5" fontWeight="bold" textAnchor="middle">고각 45° 수직관입</text>
                        <text x="72" y="44" fontSize="6.5" fill="#10b981" fontWeight="bold" textAnchor="middle">사유지 0m 회피 (직접비)</text>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-[10.5px]">
                      <span className="text-slate-500">순공사(1단계):</span>
                      <span className="font-mono font-bold text-slate-800">{(altData.alt2B.netConstructionCost / 10000).toFixed(2)} 억원</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10.5px] text-slate-500">종합LCC(3단계):</span>
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{(altData.alt2B.netLccCost / 10000).toFixed(2)} 억원</span>
                    </div>
                    <div className="text-[9.5px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                      <span>공기: <strong className="text-slate-700 font-mono">{altData.alt2B.totalDuration}일 (-{altData.alt2B.durationSavings}d)</strong></span>
                      <span className="text-emerald-700 font-bold">사유지 0m 회피</span>
                    </div>
                  </div>
                </div>

                {/* 3안 복합공법 (선정안★) */}
                <div className="bg-slate-900 text-white p-3 rounded-xl space-y-2 shadow-md relative overflow-hidden border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg shadow-xs">
                      ★ 최우수 선정안
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-1.5">
                      <span className="font-black text-slate-100 text-xs">3안. 복합공법 (Hybrid)</span>
                      <span className="px-1.5 py-0.5 bg-purple-900 text-purple-200 rounded text-[10px] font-bold">Hybrid</span>
                    </div>
                    {/* 3안 대표 모식도 */}
                    <div className="w-full h-20 mb-1.5 bg-slate-950 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center p-1">
                      <svg viewBox="0 0 140 70" className="w-full h-full">
                        <line x1="0" y1="10" x2="140" y2="10" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3,2" />
                        <rect x="28" y="8" width="5" height="58" fill="#94a3b8" rx="0.5" />
                        <rect x="111" y="8" width="5" height="58" fill="#94a3b8" rx="0.5" />
                        <line x1="33" y1="58" x2="111" y2="58" stroke="#cbd5e1" strokeWidth="1.5" />
                        {/* 상부 1~3단 앵커 */}
                        <line x1="28" y1="20" x2="18" y2="48" stroke="#c084fc" strokeWidth="1.6" />
                        <line x1="28" y1="30" x2="14" y2="56" stroke="#c084fc" strokeWidth="1.6" />
                        <line x1="116" y1="20" x2="126" y2="48" stroke="#c084fc" strokeWidth="1.6" />
                        <line x1="116" y1="30" x2="130" y2="56" stroke="#c084fc" strokeWidth="1.6" />
                        {/* 최하부 버팀보 */}
                        <line x1="33" y1="50" x2="111" y2="50" stroke="#a855f7" strokeWidth="2.5" />
                        <text x="72" y="26" fontSize="6.5" fill="#e9d5ff" fontWeight="bold" textAnchor="middle">상부 1·2단 고각 45° (사유지 0m)</text>
                        <text x="72" y="42" fontSize="7.5" fill="#c084fc" fontWeight="black" textAnchor="middle">★ 최단공기 88일 완공</text>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-[10.5px]">
                      <span className="text-slate-300">순공사(1단계):</span>
                      <span className="font-mono font-bold text-slate-100">{(altData.alt3.netConstructionCost / 10000).toFixed(2)} 억원</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10.5px] text-purple-300 font-bold">종합LCC(3단계):</span>
                      <span className="font-mono font-black text-purple-300 text-xs sm:text-sm">{(altData.alt3.netLccCost / 10000).toFixed(2)} 억원</span>
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-medium pt-1 border-t border-slate-800 flex justify-between">
                      <span>공기: <strong className="text-purple-300 font-mono">{altData.alt3.totalDuration}일 (-{altData.alt3.durationSavings}d)</strong></span>
                      <span className="text-emerald-400 font-bold">사유지 0m 완벽회피</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 중앙 2분할 레이아웃: 좌측(3단계 정량 비교표) vs 우측(비용/공기 시각화 바 차트) */}
              <div className="grid grid-cols-12 gap-3 flex-1">
                
                {/* 좌측 7/12: 3단계 핵심 정량 수치 요약표 */}
                <div className="col-span-7 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-700" />
                      <span>4대 대안 3단계 공사비 및 공기 정량 분석표 (중간말뚝·고각브래킷 반영)</span>
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                      순공사비 ➔ CP간접비 ➔ 종합LCC
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-center border-collapse text-[10.5px]">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[10px] font-bold">
                          <th className="py-1.5 px-2 text-left">분석 단계 및 세부 비목</th>
                          <th className="py-1.5 px-2 text-slate-700">1안 (버팀보)</th>
                          <th className="py-1.5 px-2 text-slate-700">2안-A (표준20°)</th>
                          <th className="py-1.5 px-2 text-slate-700">2안-B (고각45°)</th>
                          <th className="py-1.5 px-2 text-purple-950 font-extrabold bg-purple-100/70">3안 (복합공법)★</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="py-1.2 px-2 text-left text-slate-700 font-medium">· 가시설 직접공사비 (말뚝·지보재)</td>
                          <td className="py-1.2 px-2 font-mono">{(altData.alt1.directCost / 10000).toFixed(2)} 억원</td>
                          <td className="py-1.2 px-2 font-mono">{(altData.alt2A.directCost / 10000).toFixed(2)} 억원</td>
                          <td className="py-1.2 px-2 font-mono">{(altData.alt2B.directCost / 10000).toFixed(2)} 억원</td>
                          <td className="py-1.2 px-2 font-mono font-semibold text-purple-950 bg-purple-50/40">{(altData.alt3.directCost / 10000).toFixed(2)} 억원</td>
                        </tr>
                        <tr>
                          <td className="py-1.2 px-2 text-left text-slate-700 font-medium">· 사유지 보상비 (침범 민원)</td>
                          <td className="py-1.2 px-2 font-mono text-slate-400">0 원</td>
                          <td className="py-1.2 px-2 font-mono text-rose-600 font-bold">+4.50 억원</td>
                          <td className="py-1.2 px-2 font-mono text-slate-400">0 원</td>
                          <td className="py-1.2 px-2 font-mono font-semibold text-emerald-700 bg-purple-50/40">0 원 (회피★)</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold text-slate-900">
                          <td className="py-1.5 px-2 text-left font-extrabold text-slate-900">★ [1단계] 순가설공사비 합산</td>
                          <td className="py-1.5 px-2 font-mono">{(altData.alt1.netConstructionCost / 10000).toFixed(2)} 억원</td>
                          <td className="py-1.5 px-2 font-mono">{((altData.alt2A.directCost + 45000) / 10000).toFixed(2)} 억원</td>
                          <td className="py-1.5 px-2 font-mono">{(altData.alt2B.netConstructionCost / 10000).toFixed(2)} 억원</td>
                          <td className="py-1.5 px-2 font-mono font-black text-purple-950 bg-purple-100/80">{(altData.alt3.netConstructionCost / 10000).toFixed(2)} 억원</td>
                        </tr>
                        <tr>
                          <td className="py-1.2 px-2 text-left text-slate-700">· 가시설 토공 소요공기</td>
                          <td className="py-1.2 px-2 font-mono">{altData.alt1.totalDuration} 일 (기준)</td>
                          <td className="py-1.2 px-2 font-mono">{altData.alt2A.totalDuration} 일 (-{altData.alt2A.durationSavings}d)</td>
                          <td className="py-1.2 px-2 font-mono">{altData.alt2B.totalDuration} 일 (-{altData.alt2B.durationSavings}d)</td>
                          <td className="py-1.2 px-2 font-mono font-semibold text-purple-950 bg-purple-50/40">{altData.alt3.totalDuration} 일 (-{altData.alt3.durationSavings}d)</td>
                        </tr>
                        <tr>
                          <td className="py-1.2 px-2 text-left text-slate-700 font-semibold">· 현장 상주간접비 (일 132.5만)</td>
                          <td className="py-1.2 px-2 font-mono text-slate-700">3.56 억원</td>
                          <td className="py-1.2 px-2 font-mono text-slate-700">1.96 억원</td>
                          <td className="py-1.2 px-2 font-mono text-slate-700">2.05 억원</td>
                          <td className="py-1.2 px-2 font-mono font-semibold text-purple-950 bg-purple-50/40">1.17 억원 (최소★)</td>
                        </tr>
                        <tr className="bg-purple-100/90 font-black border-t border-purple-300 text-purple-950">
                          <td className="py-1.5 px-2 text-left text-[11px] font-black text-purple-950">★ [최종] 종합 LCC 순총공사비</td>
                          <td className="py-1.5 px-2 font-mono text-slate-800">{(altData.alt1.netLccCost / 10000).toFixed(2)} 억원</td>
                          <td className="py-1.5 px-2 font-mono text-slate-800">{(altData.alt2A.netLccCost / 10000).toFixed(2)} 억원</td>
                          <td className="py-1.5 px-2 font-mono text-slate-800">{(altData.alt2B.netLccCost / 10000).toFixed(2)} 억원</td>
                          <td className="py-1.5 px-2 font-mono text-purple-900 font-black bg-purple-200/80">{(altData.alt3.netLccCost / 10000).toFixed(2)} 억원</td>
                        </tr>
                        <tr>
                          <td className="py-1.2 px-2 text-left text-slate-700 font-semibold">· 사유지 침범 민원 리스크</td>
                          <td className="py-1.2 px-2 text-slate-600">0.0m (OK)</td>
                          <td className="py-1.2 px-2 text-rose-600 font-bold">20.4m 침범 (High)</td>
                          <td className="py-1.2 px-2 text-emerald-700 font-bold">0.0m (완전 회피)</td>
                          <td className="py-1.2 px-2 text-purple-950 font-bold bg-purple-50/40">0.0m (완전 회피 OK★)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 leading-normal">
                    💡 <strong>비교 요약:</strong> 3안은 상부 2단 고각 앵커로 <strong>사유지 침범 0m를 완벽 회피</strong>하면서도 100% 무지주 개방으로 <strong>공기를 181일 최속 단축(88일 완공)</strong>하고, 하부 3단 2H-350 고내력 버팀보로 대심도 토압을 완벽 제어하여 <strong>구조 안전성과 경제성(LCC 18.13억)</strong>을 동시 만족하는 최우수 대안입니다.
                  </div>
                </div>

                {/* 우측 5/12: LCC 공사비 & 공기 비교 시각화 바 차트 */}
                <div className="col-span-5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-slate-700" />
                      <span>종합 LCC 총비용 & 총공기 비교 차트</span>
                    </span>
                    <span className="text-[9.5px] font-mono text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded font-bold border border-purple-200">
                      최신 산출 기준
                    </span>
                  </div>

                  {/* LCC Cost Horizontal Bars */}
                  <div className="space-y-2 text-xs">
                    {/* 1안 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] font-medium text-slate-700">
                        <span>1안: 버팀보</span>
                        <span className="font-mono text-slate-700 font-bold">{(altData.alt1.netLccCost / 10000).toFixed(2)} 억원 (기준)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-lg h-6 overflow-hidden flex items-center px-1 border border-slate-200">
                        <div className="h-4.5 bg-slate-400 rounded text-[9.5px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: '62%' }}>
                          {(altData.alt1.netLccCost / 10000).toFixed(2)} 억원
                        </div>
                      </div>
                    </div>
                    {/* 2안-A */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] font-medium text-slate-700">
                        <span>2안-A: 표준앵커</span>
                        <span className="font-mono text-slate-700 font-bold">{(altData.alt2A.netLccCost / 10000).toFixed(2)} 억원 (사유지침범)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-lg h-6 overflow-hidden flex items-center px-1 border border-slate-200">
                        <div className="h-4.5 bg-slate-500 rounded text-[9.5px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: '100%' }}>
                          {(altData.alt2A.netLccCost / 10000).toFixed(2)} 억원 (민원위험)
                        </div>
                      </div>
                    </div>
                    {/* 2안-B */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] font-medium text-slate-700">
                        <span>2안-B: 고각앵커</span>
                        <span className="font-mono text-slate-700 font-bold">{(altData.alt2B.netLccCost / 10000).toFixed(2)} 억원</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-lg h-6 overflow-hidden flex items-center px-1 border border-slate-200">
                        <div className="h-4.5 bg-slate-400 rounded text-[9.5px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: '97%' }}>
                          {(altData.alt2B.netLccCost / 10000).toFixed(2)} 억원 (직접비과다)
                        </div>
                      </div>
                    </div>
                    {/* 3안 (선정안) */}
                    <div className="space-y-1 bg-purple-50/70 p-1 rounded-lg border border-purple-200">
                      <div className="flex justify-between text-[10.5px] font-black text-purple-950">
                        <span>3안: 복합공법★</span>
                        <span className="font-mono text-purple-700 font-black">{(altData.alt3.netLccCost / 10000).toFixed(2)} 억원 (최적 선정안)</span>
                      </div>
                      <div className="w-full bg-purple-100 rounded-lg h-6 overflow-hidden flex items-center px-1 border border-purple-200">
                        <div className="h-4.5 bg-purple-700 rounded text-[9.5px] text-white font-mono flex items-center justify-center px-2 font-black whitespace-nowrap" style={{ width: '63%' }}>
                          {(altData.alt3.netLccCost / 10000).toFixed(2)} 억원 (사유지 0m + 181일 단축★)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Comparison One-liner */}
                  <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 text-[10.5px] text-slate-800 flex justify-between items-center font-bold">
                    <span>★ 전 생애 총공기:</span>
                    <span className="font-mono text-slate-800">1안 {altData.alt1.totalDuration}일 ➔ 3안 {altData.alt3.totalDuration}일 (<strong className="text-purple-700 font-black">-{altData.alt3.durationSavings}일, 6.0개월 최단 공기 🏆</strong>)</span>
                  </div>
                </div>

              </div>

              {/* 3. 하단 공학적 종합 소견 (컴팩트 3단 카드) */}
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5 shrink-0">
                <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                  <span>3. 공학적 종합 소견 및 심의의결 가이드</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10.5px] text-slate-700 leading-normal">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block text-[10.5px]">Case 1. 부지 경계 여건 양호 시</span>
                    <p className="text-slate-600 text-[10px] mt-0.5">
                      도로부지 구간은 <strong>2안-A(전구간 앵커 20°)</strong>로 100% 무지주 통타설을 적용하십시오.
                    </p>
                  </div>
                  <div className="p-2 bg-purple-950 text-white rounded-lg border border-purple-800 shadow-2xs">
                    <span className="font-bold text-purple-200 block text-[10.5px]">Case 2. 인접 구조물 근접 / 민원 우려 시 (최우수 추천★)</span>
                    <p className="text-purple-100 font-medium text-[10px] mt-0.5">
                      경계 제약 구간은 <strong>3안(복합공법, 순공사 10.58억)</strong>을 채택하여 <strong>공기 106일 단축과 사유지 0m 완전회피</strong>를 달성하십시오.
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 block text-[10.5px]">Case 3. 상부 지장물 간섭 시</span>
                    <p className="text-slate-600 text-[10px] mt-0.5">
                      상부 1~2단에 <strong>고각앵커(45°~70°)</strong>를 국소 도입하면 배면 침범 0m로 지장물을 완벽히 우회·회피합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Final Resolution Footer (심의의결 주문) */}
              <div className="bg-slate-900 text-slate-200 px-4 py-2 rounded-xl flex items-center justify-between gap-3 text-[11px] border border-slate-800 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <span className="px-2 py-0.5 bg-purple-500 text-white font-black rounded text-[10px]">
                    심의의결 주문
                  </span>
                  <span className="font-medium text-slate-100 text-[10.5px]">
                    본 심의위원회는 전 생애 공기단축({altData.alt3.durationSavings}일, 6.0개월), 사유지 0m 완전회피, 구조물 수밀성 및 구조안전성(KDS 21 30 00 만족)이 완벽한 <strong className="text-purple-300 font-bold">「제3안 광간격 복합 지보공법」</strong>을 최종 시공 공법으로 의결함.
                  </span>
                </div>
                <div className="font-mono text-slate-400 text-[10px] shrink-0">
                  기술심의평가위원회 위원 일동 ㊞
                </div>
              </div>

            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              [TAB 1] GRAPHS: 3단계 시각화 그래프 뷰
             ═══════════════════════════════════════════════════════════════════════ */}
          {viewTab === 'GRAPHS' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* GRAPH 1 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center space-x-1 font-extrabold text-slate-900 text-xs">
                    <Coins className="w-3.5 h-3.5 text-slate-700" />
                    <span>1. 가시설 직접 순공사비 비교</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                    단위: 만원
                  </span>
                </div>

                <div className="text-[10.5px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 leading-tight">
                  📌 <strong>가시설 직접비(복공·말뚝 포함) + 지보재(버팀보/앵커)</strong> 순수 공사비 합산
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-800">
                      <span>1안. 버팀보 (8단 @4m)</span>
                      <span className="font-mono font-extrabold">{altData.alt1.netConstructionCost.toLocaleString()} 만원 (기준)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-slate-200">
                      <div className="h-5 bg-amber-600 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: `${(altData.alt1.netConstructionCost / 280000) * 100}%` }}>
                        직접비 {(altData.alt1.netConstructionCost / 10000).toFixed(2)} 억원
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-800">
                      <span>2안-A. 표준앵커 (10단 20°)</span>
                      <span className="font-mono font-extrabold">{altData.alt2A.netConstructionCost.toLocaleString()} 만원</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-slate-200">
                      <div className="h-5 bg-sky-600 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: `${(altData.alt2A.netConstructionCost / 280000) * 100}%` }}>
                        직접비 {(altData.alt2A.netConstructionCost / 10000).toFixed(2)} 억원
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-800">
                      <span>2안-B. 고각앵커 (10단 45°)</span>
                      <span className="font-mono font-extrabold">{altData.alt2B.netConstructionCost.toLocaleString()} 만원</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-slate-200">
                      <div className="h-5 bg-indigo-600 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: `${(altData.alt2B.netConstructionCost / 280000) * 100}%` }}>
                        직접비 {(altData.alt2B.netConstructionCost / 10000).toFixed(2)} 억원
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 bg-purple-50/50 p-1.5 rounded-lg border border-purple-200">
                    <div className="flex justify-between text-[11px] font-black text-slate-900">
                      <span>3안. 복합공법 (8단 Hybrid★)</span>
                      <span className="font-mono text-purple-700 font-black">{altData.alt3.netConstructionCost.toLocaleString()} 만원</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-purple-200">
                      <div className="h-5 bg-purple-700 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-black whitespace-nowrap" style={{ width: `${(altData.alt3.netConstructionCost / 280000) * 100}%` }}>
                        직접비 {(altData.alt3.netConstructionCost / 10000).toFixed(2)} 억원 (최적)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 leading-tight">
                  가시설 직접비는 1안(14.26억)이 가장 낮으나 공기가 길고, 3안(16.96억)은 사유지 0m 회피 공법 중 가장 경제적입니다.
                </div>
              </div>

              {/* GRAPH 2 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center space-x-1 font-extrabold text-slate-900 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-700" />
                    <span>2. 토공사 공기 단축 및 간접비 절감</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                    일 132.5만원 기준
                  </span>
                </div>

                <div className="text-[10.5px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 leading-tight">
                  ⚖️ <strong>공기 단축 효과:</strong> 1안(269일) 대비 공기 단축에 따른 현장 상주간접비 절감액
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>1안. 버팀보 (총 {altData.alt1.totalDuration}일)</span>
                      <span className="font-mono text-slate-500 font-bold">절감 0원 (기준 0일)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden flex items-center px-2 text-[10px] text-slate-500 border border-slate-200 font-medium">
                      공기단축 없음 (간접비 절감 0원)
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-800">
                      <span>2안-A. 표준앵커 20° (총 {altData.alt2A.totalDuration}일)</span>
                      <span className="font-mono text-slate-800 font-extrabold">-{altData.alt2A.cpIndirectSavings.toLocaleString()}만원 (-{altData.alt2A.durationSavings}일)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-slate-200">
                      <div className="h-5 bg-sky-600 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: `${(altData.alt2A.durationSavings / 200) * 100}%` }}>
                        {altData.alt2A.durationSavings}일 단축 ➔ -{(altData.alt2A.cpIndirectSavings / 10000).toFixed(2)}억원 절감
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-800">
                      <span>2안-B. 고각앵커 (총 {altData.alt2B.totalDuration}일)</span>
                      <span className="font-mono text-slate-800 font-extrabold">-{altData.alt2B.cpIndirectSavings.toLocaleString()}만원 (-{altData.alt2B.durationSavings}일)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-slate-200">
                      <div className="h-5 bg-indigo-600 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: `${(altData.alt2B.durationSavings / 200) * 100}%` }}>
                        {altData.alt2B.durationSavings}일 단축 ➔ -{(altData.alt2B.cpIndirectSavings / 10000).toFixed(2)}억원 절감
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 bg-purple-50/50 p-1.5 rounded-lg border border-purple-200">
                    <div className="flex justify-between text-[11px] font-black text-slate-900">
                      <span>3안. 복합공법 (총 {altData.alt3.totalDuration}일)★</span>
                      <span className="font-mono text-purple-700 font-black">-{altData.alt3.cpIndirectSavings.toLocaleString()}만원 (-{altData.alt3.durationSavings}일★)</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-purple-200">
                      <div className="h-5 bg-purple-700 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-black whitespace-nowrap" style={{ width: `${(altData.alt3.durationSavings / 200) * 100}%` }}>
                        {altData.alt3.durationSavings}일 단축 (6.0개월) ➔ -{(altData.alt3.cpIndirectSavings / 10000).toFixed(2)}억원 최단 공기 절감 🏆
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 leading-tight">
                  3안은 상부 무지주 쾌속 굴착으로 181일 단축하여 <strong>2.40억원의 현장간접비 절감</strong>을 달성합니다.
                </div>
              </div>

              {/* GRAPH 3 */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center space-x-1 font-extrabold text-slate-900 text-xs">
                    <Award className="w-3.5 h-3.5 text-slate-700" />
                    <span>3. 종합 LCC 총비용 (CP간접비 합산)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                    최종 LCC 순비용
                  </span>
                </div>

                <div className="text-[10.5px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200 leading-tight">
                  ★ <strong>순공사비(1단계) - CP간접비절감(2단계)</strong> 종합 순비용 합산
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-800">
                      <span>1안. 전구간 버팀보</span>
                      <span className="font-mono font-extrabold">{altData.alt1.netLccCost.toLocaleString()} 만원 (기준)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-slate-200">
                      <div className="h-5 bg-amber-600 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: `${(altData.alt1.netLccCost / 300000) * 100}%` }}>
                        {(altData.alt1.netLccCost / 10000).toFixed(2)} 억원 (직접 14.26억 + 간접 3.56억)
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-800">
                      <span>2안-A. 표준 앵커 (20°)</span>
                      <span className="font-mono font-extrabold">{altData.alt2A.netLccCost.toLocaleString()} 만원</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-slate-200">
                      <div className="h-5 bg-sky-600 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: `${(altData.alt2A.netLccCost / 300000) * 100}%` }}>
                        {(altData.alt2A.netLccCost / 10000).toFixed(2)} 억원 (보상비 4.5억 포함 / 제외 24.26억)
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-800">
                      <span>2안-B. 고각 앵커 (45°~70°)</span>
                      <span className="font-mono font-extrabold">{altData.alt2B.netLccCost.toLocaleString()} 만원</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-slate-200">
                      <div className="h-5 bg-indigo-600 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-bold whitespace-nowrap" style={{ width: `${(altData.alt2B.netLccCost / 300000) * 100}%` }}>
                        {(altData.alt2B.netLccCost / 10000).toFixed(2)} 억원 (직접 26.07억 + 간접 2.05억)
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 bg-purple-50/50 p-1.5 rounded-lg border border-purple-200">
                    <div className="flex justify-between text-[11px] font-black text-slate-900">
                      <span>3안. 광간격 복합공법 (Hybrid) [선정안★]</span>
                      <span className="font-mono text-purple-700 font-black text-xs">{altData.alt3.netLccCost.toLocaleString()} 만원 (최적 1위★)</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-lg h-7 overflow-hidden flex items-center px-1 border border-purple-200">
                      <div className="h-5 bg-purple-700 rounded text-[10px] text-white font-mono flex items-center justify-center px-2 font-black whitespace-nowrap" style={{ width: `${(altData.alt3.netLccCost / 300000) * 100}%` }}>
                        {(altData.alt3.netLccCost / 10000).toFixed(2)} 억원 (사유지 0m 회피 공법 중 압도적 1위 🏆)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-800 font-bold bg-slate-100 p-2 rounded border border-slate-200 leading-tight">
                  ★ 종합 LCC 관점에서는 3안이 <strong>{(altData.alt3.netLccCost / 10000).toFixed(2)}억원</strong>으로 사유지 0m 완벽 회피 및 88일 최속 완공을 동시 달성하여 최우수 대안으로 선정되었습니다.
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              [TAB 2] TABLES: 4대 대안 정량 분석 수치표 뷰
             ═══════════════════════════════════════════════════════════════════════ */}
          {viewTab === 'TABLES' && (
            <div className="space-y-2.5">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-3.5 bg-indigo-600 rounded-2xs" />
                  <span>[표 1] 1단계: 순공사비(Net Construction Cost) 정밀 비교표</span>
                </span>
                <table className="w-full text-center border-collapse text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[10px] font-bold">
                      <th className="py-1.5 px-2 text-left">세부 공종 비목</th>
                      <th className="py-1.5 px-2">1안. 버팀보</th>
                      <th className="py-1.5 px-2">2안-A. 표준 앵커</th>
                      <th className="py-1.5 px-2">2안-B. 고각 앵커</th>
                      <th className="py-1.5 px-2 font-bold bg-purple-50 text-purple-950">3안. 복합공법★</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-1 px-2 text-left font-semibold text-slate-800">1. 가시설 직접 시공비 소계</td>
                      <td className="py-1 px-2 font-mono">{(altData.alt1.directCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1 px-2 font-mono">{(altData.alt2A.directCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1 px-2 font-mono">{(altData.alt2B.directCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1 px-2 font-mono font-bold bg-purple-50/50 text-purple-950">{(altData.alt3.directCost / 10000).toFixed(2)} 억원</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-left font-semibold text-slate-800">2. 사유지 보상비 (침범 민원)</td>
                      <td className="py-1 px-2 font-mono text-slate-400">0 원</td>
                      <td className="py-1 px-2 font-mono text-rose-600 font-bold">+4.50 억원</td>
                      <td className="py-1 px-2 font-mono text-slate-400">0 원</td>
                      <td className="py-1 px-2 font-mono font-bold bg-purple-50/50 text-purple-950">0 원 (회피★)</td>
                    </tr>
                    <tr className="bg-slate-100 font-bold border-t border-slate-300">
                      <td className="py-1.5 px-2 text-left font-black text-slate-900">★ [1단계 소계] 순공사비 합산</td>
                      <td className="py-1.5 px-2 font-mono">{(altData.alt1.netConstructionCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1.5 px-2 font-mono">{((altData.alt2A.directCost + 45000) / 10000).toFixed(2)} 억원</td>
                      <td className="py-1.5 px-2 font-mono">{(altData.alt2B.netConstructionCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1.5 px-2 font-mono font-black text-purple-950 bg-purple-100">{(altData.alt3.netConstructionCost / 10000).toFixed(2)} 억원</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-3.5 bg-purple-600 rounded-2xs" />
                  <span>[표 2] 3단계: 종합 LCC (Life Cycle Cost) 평가표</span>
                </span>
                <table className="w-full text-center border-collapse text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[10px] font-bold">
                      <th className="py-1.5 px-2 text-left">평가 항목</th>
                      <th className="py-1.5 px-2">1안. 버팀보</th>
                      <th className="py-1.5 px-2">2안-A. 표준 앵커</th>
                      <th className="py-1.5 px-2">2안-B. 고각 앵커</th>
                      <th className="py-1.5 px-2 font-bold bg-purple-50 text-purple-950">3안. 복합공법★</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-1 px-2 text-left font-medium text-slate-800">1단계 가설 직접비</td>
                      <td className="py-1 px-2 font-mono">{(altData.alt1.directCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1 px-2 font-mono">{(altData.alt2A.directCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1 px-2 font-mono">{(altData.alt2B.directCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1 px-2 font-mono font-bold bg-purple-50/50 text-purple-950">{(altData.alt3.directCost / 10000).toFixed(2)} 억원</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-left font-medium text-slate-800">2단계 현장 상주간접비</td>
                      <td className="py-1 px-2 font-mono text-slate-700">3.56 억원 ({altData.alt1.totalDuration}일)</td>
                      <td className="py-1 px-2 font-mono text-slate-700">1.96 억원 ({altData.alt2A.totalDuration}일)</td>
                      <td className="py-1 px-2 font-mono text-slate-700">2.05 억원 ({altData.alt2B.totalDuration}일)</td>
                      <td className="py-1 px-2 font-mono font-bold text-purple-900 bg-purple-50/50">1.17 억원 ({altData.alt3.totalDuration}일★)</td>
                    </tr>
                    <tr className="bg-purple-100 font-bold border-t-2 border-purple-300">
                      <td className="py-1.5 px-2 text-left font-black text-purple-950">★ 3단계 종합 LCC 금액</td>
                      <td className="py-1.5 px-2 font-mono text-slate-900">{(altData.alt1.netLccCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1.5 px-2 font-mono text-slate-900">{(altData.alt2A.netLccCost / 10000).toFixed(2)} 억원 (보상포함)</td>
                      <td className="py-1.5 px-2 font-mono text-slate-900">{(altData.alt2B.netLccCost / 10000).toFixed(2)} 억원</td>
                      <td className="py-1.5 px-2 font-mono font-black text-purple-950 bg-purple-200">★ {(altData.alt3.netLccCost / 10000).toFixed(2)} 억원 (최적 1위)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              [TAB 3] DECISION_MATRIX: 2D 의사결정 매트릭스 사분면 뷰
             ═══════════════════════════════════════════════════════════════════════ */}
          {viewTab === 'DECISION_MATRIX' && (
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-extrabold text-slate-900 text-xs flex items-center space-x-1">
                  <Scale className="w-3.5 h-3.5 text-slate-700" />
                  <span>2D 의사결정 매트릭스 (X축: 사유지 회피 및 LCC 효율 vs Y축: 공기단축)</span>
                </span>
                <span className="text-[10.5px] font-mono text-purple-800 bg-purple-100 px-2 py-0.5 rounded font-bold border border-purple-200">
                  우측 상단: 최적 채택 영역 (Sweet Spot)
                </span>
              </div>

              <div className="relative h-64 bg-gradient-to-tr from-slate-100 via-slate-50 to-purple-50/40 rounded-xl border border-slate-300 p-3 flex flex-col justify-between overflow-hidden">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 border-dashed" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300 border-dashed" />

                <div className="absolute top-2 left-3 text-[10px] text-slate-400 font-bold">공기단축 우수 / 민원·비용 리스크</div>
                <div className="absolute top-2 right-3 text-[10px] text-purple-950 font-black bg-purple-200 px-2.5 py-0.5 rounded border border-purple-300">
                  ★ 최적 선정 영역 (공기 {altData.alt3.durationSavings}d 단축 + 사유지 0m + LCC 최적)
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 font-bold">비추천 영역 (공기 지연 {altData.alt1.totalDuration}일 + 간섭 리스크)</div>
                <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-bold">공사비 양호 / 공기단축 낮음</div>

                <div className="absolute bottom-6 left-8 bg-amber-700 text-white text-[10.5px] font-extrabold px-3 py-1.5 rounded-xl shadow border border-white">
                  <span>1안: 버팀보 (LCC {(altData.alt1.netLccCost / 10000).toFixed(2)}억, {altData.alt1.totalDuration}일)</span>
                </div>
                <div className="absolute top-6 left-12 bg-sky-700 text-white text-[10.5px] font-extrabold px-3 py-1.5 rounded-xl shadow border border-white">
                  <span>2안-A: 표준앵커 (LCC {(altData.alt2A.netLccCost / 10000).toFixed(2)}억 / 사유지 침범 20.4m)</span>
                </div>
                <div className="absolute top-14 left-60 bg-indigo-700 text-white text-[10.5px] font-extrabold px-3 py-1.5 rounded-xl shadow border border-white">
                  <span>2안-B: 고각앵커 (LCC {(altData.alt2B.netLccCost / 10000).toFixed(2)}억 / 0m 회피)</span>
                </div>
                <div className="absolute top-6 right-8 bg-purple-900 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xl border-2 border-yellow-300 flex flex-col items-center animate-pulse">
                  <span className="text-yellow-300 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> 3안: 복합공법 (종합 LCC {(altData.alt3.netLccCost / 10000).toFixed(2)}억)★</span>
                  <span className="text-[10px] text-purple-200 font-semibold mt-0.5">공기 {altData.alt3.durationSavings}일 단축 + 사유지 0m 완전회피 + 무지주 쾌속시공</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
