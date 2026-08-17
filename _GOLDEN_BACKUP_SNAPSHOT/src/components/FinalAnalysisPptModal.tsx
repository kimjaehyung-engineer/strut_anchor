import React from 'react';
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
} from 'lucide-react';
import { ProjectSettings } from '../types';

interface FinalAnalysisPptModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProjectSettings;
  onOpenDetailedReport?: () => void;
}

export const FinalAnalysisPptModal: React.FC<FinalAnalysisPptModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOpenDetailedReport,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      {/* 16:9 Presentation Slide Container */}
      <div className="bg-white w-full max-w-[1420px] rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Top Control Bar (Non-Printable Toolbar) */}
        <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-purple-600 text-white text-[11px] font-black rounded tracking-wider uppercase">
              EXECUTIVE PPT REPORT (최종 분석)
            </span>
            <span className="font-bold text-sm text-slate-200">
              대심도 가시설 지보공법 3대 대안 최종 종합분석 보고서
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenDetailedReport && (
              <button
                type="button"
                onClick={onOpenDetailedReport}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                title="상세 설계 및 단계별 해석 모달 열기"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>상세 공법설계 리포트</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              title="1장 PPT 슬라이드 인쇄 및 PDF 저장"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>슬라이드 인쇄 / PDF</span>
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
            [1-PAGE PRESENTATION SLIDE BODY]
           ═══════════════════════════════════════════════════════════════════════ */}
        <div className="p-5 sm:p-7 space-y-4 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/80">
          
          {/* Slide Header: Title & Project Metadata */}
          <div className="flex flex-wrap items-start justify-between gap-3 pb-2.5 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-purple-900 text-white text-xs font-extrabold rounded">
                  최종 심의의결 보고서 (Executive Summary)
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  DOC NO: AGY-GEO-2026-FINAL-01
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-950 mt-1 tracking-tight">
                철도정거장 대심도(H=22~42m) 가시설 흙막이 지보공법 3대 대안 최종 비교분석 및 최적안(제3안) 선정
              </h1>
            </div>

            <div className="flex flex-col items-end text-xs text-slate-600 font-medium space-y-0.5">
              <div>· 프로젝트: <strong className="text-slate-900">{settings.projectName || '도심지 철도정거장 건설공사'}</strong></div>
              <div>· 굴착 제원: <strong className="text-slate-900">연장 L=90m × 폭 B={settings.stationWidth}m × 심도 H={settings.finalExcavationDepth}m</strong></div>
            </div>
          </div>

          {/* Executive Summary Hero Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-3.5 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3 border border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-400 text-purple-950 rounded-lg shadow-sm shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-amber-300 font-black text-xs tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>최종 위원회 심의 결론 : 제3안 (광간격 복합 지보공법) 최우수 선정</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-100 mt-0.5">
                  상부 1·2단 고각앵커 45°(무지주 개방) + 중부 암반앵커 + 하부 5단 광간격(@10m) 버팀보 최적 결합
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 text-center shrink-0">
              <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                <div className="text-[9px] text-purple-200 font-medium">LCC 총생애주기비용 절감</div>
                <div className="text-base font-black text-amber-300 font-mono">2.45 억원 (23%↓)</div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                <div className="text-[9px] text-purple-200 font-medium">가시설 총공기 최속 단축</div>
                <div className="text-base font-black text-emerald-300 font-mono">59 일 (2개월↓)</div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                <div className="text-[9px] text-purple-200 font-medium">사유지 침범 민원 리스크</div>
                <div className="text-base font-black text-sky-300">0 m (완전 회피)</div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              [포함된 핵심 1] 정량적 공기(Schedule) & 토공 사이클타임 3개 공법 비교 분석
             ═══════════════════════════════════════════════════════════════════════ */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>1. 정량적 공기(Schedule) & 토공 사이클타임(Cycle-time) 3개 공법 비교 분석</span>
              </span>
              <span className="text-[11px] font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded font-bold border border-purple-200">
                3안 채택 시 약 2개월(59일) 공기단축 확정
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[10px]">
                    <th className="py-2 px-2 text-left">공정 및 공학 비교 항목</th>
                    <th className="py-2 px-2 text-amber-800 font-bold bg-amber-50/50">1안. 전구간 버팀보(Strut)</th>
                    <th className="py-2 px-2 text-sky-800 font-bold bg-sky-50/50">2안. 전구간 앵커(Anchor)</th>
                    <th className="py-2 px-2 text-purple-900 font-extrabold bg-purple-100/70">3안. 복합공법(Hybrid) [제3안★]</th>
                    <th className="py-2 px-2 text-slate-600">공학적 분석 및 효과</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-1.5 px-2 text-left font-semibold text-slate-800">투입 굴착 장비 규격</td>
                    <td className="py-1.5 px-2 font-mono">0.4m³ 소형 백호 (간섭)</td>
                    <td className="py-1.5 px-2 font-mono text-sky-700 font-bold">1.0m³ 대형 백호</td>
                    <td className="py-1.5 px-2 font-mono text-purple-900 font-bold bg-purple-50/30">1.0m³ 대형 백호 (10m 개구)</td>
                    <td className="py-1.5 px-2 text-left text-[10px] text-slate-500">버킷 용량 2.5배 증대</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-left font-semibold text-slate-800">1회 굴착·선회 사이클타임</td>
                    <td className="py-1.5 px-2 font-mono text-rose-700">42 초 (장애물 회피)</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-700 font-bold">26 초</td>
                    <td className="py-1.5 px-2 font-mono text-purple-900 font-bold bg-purple-50/30">29 초</td>
                    <td className="py-1.5 px-2 text-left text-[10px] text-slate-500">선회 방해요소 80% 제거</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-left font-semibold text-slate-800">일일 토공 반출량</td>
                    <td className="py-1.5 px-2 font-mono">320 m³/일</td>
                    <td className="py-1.5 px-2 font-mono text-sky-700 font-bold">580 m³/일 (+81%)</td>
                    <td className="py-1.5 px-2 font-mono text-purple-900 font-bold bg-purple-50/30">520 m³/일 (+62.5%)</td>
                    <td className="py-1.5 px-2 text-left text-[10px] text-slate-500">덤프트럭 직접 상차 가능</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-left font-semibold text-slate-800">순수 토공 소요일수</td>
                    <td className="py-1.5 px-2 font-mono text-rose-700">125 일</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-700 font-bold">69 일 (-56일)</td>
                    <td className="py-1.5 px-2 font-mono text-purple-900 font-bold bg-purple-50/30">76 일 (-49일 단축)</td>
                    <td className="py-1.5 px-2 text-left text-[10px] text-slate-500">토공사 공기 40% 단축</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-left font-semibold text-slate-800">가시설 해체 및 골조 간섭 지연</td>
                    <td className="py-1.5 px-2 font-mono text-rose-700">55 일 (단계별 해체·재버팀)</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-700 font-bold">51 일 (무간섭 골조)</td>
                    <td className="py-1.5 px-2 font-mono text-purple-900 font-bold bg-purple-50/30">45 일</td>
                    <td className="py-1.5 px-2 text-left text-[10px] text-slate-500">버팀보 해체 수량 65% 감소</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2 px-2 text-left text-slate-900">총 가시설 공기 (Total Duration)</td>
                    <td className="py-2 px-2 font-mono text-rose-800">180 일 (기준)</td>
                    <td className="py-2 px-2 font-mono text-emerald-700">120 일 (-60일 단축)</td>
                    <td className="py-2 px-2 font-mono text-purple-900 text-xs bg-purple-100/60 font-black">
                      121 일 (-59일 단축)
                    </td>
                    <td className="py-2 px-2 text-left text-purple-900 font-extrabold">
                      ★ 약 2개월 공기 단축 확정
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              [포함된 핵심 2] LCC 생애주기 총공사비 및 경제성 비교 분석
             ═══════════════════════════════════════════════════════════════════════ */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>2. LCC 생애주기 총공사비 및 경제성 비교 분석 (단위: 만원)</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                ★ 2억 4,500만원 순절감 달성
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[10px]">
                    <th className="py-2 px-2 text-left">공종 세부 비용 항목</th>
                    <th className="py-2 px-2 text-amber-800 font-bold">1안. 버팀보(Strut)</th>
                    <th className="py-2 px-2 text-sky-800 font-bold">2안. 앵커(Anchor)</th>
                    <th className="py-2 px-2 text-purple-900 font-extrabold bg-purple-50">3안. 복합(Hybrid) [제3안★]</th>
                    <th className="py-2 px-2 text-slate-600">산출 근거 및 비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-1.5 px-2 text-left font-semibold text-slate-800">1. 가시설 직접 시공비</td>
                    <td className="py-1.5 px-2 font-mono">72,000 만원</td>
                    <td className="py-1.5 px-2 font-mono">79,500 만원</td>
                    <td className="py-1.5 px-2 font-mono font-bold text-purple-900 bg-purple-50/30">75,500 만원</td>
                    <td className="py-1.5 px-2 text-left text-[10px] text-slate-500">버팀보 감축(-65%) + 앵커 감축(-40%)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-left font-semibold text-slate-800">2. 토공 능률향상 절감액</td>
                    <td className="py-1.5 px-2 font-mono text-slate-400">0 만원</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-700">-7,500 만원</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-700 font-bold bg-purple-50/30">-6,400 만원</td>
                    <td className="py-1.5 px-2 text-left text-[10px] text-slate-500">대형 장비 투입 및 토사 반출 능률 향상</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-left font-semibold text-slate-800">3. 가시설 해체·골조 간섭 절감</td>
                    <td className="py-1.5 px-2 font-mono text-slate-400">0 만원</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-700">-6,800 만원</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-700 font-bold bg-purple-50/30">-4,500 만원</td>
                    <td className="py-1.5 px-2 text-left text-[10px] text-slate-500">철근/폼 조립 간섭 배제</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 text-left font-semibold text-slate-800">4. 공기단축(59일) 현장간접비 절감</td>
                    <td className="py-1.5 px-2 font-mono text-slate-400">0 만원</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-700">-15,000 만원</td>
                    <td className="py-1.5 px-2 font-mono text-emerald-700 font-bold bg-purple-50/30">-14,750 만원</td>
                    <td className="py-1.5 px-2 text-left text-[10px] text-slate-500">현장관리비(250만원/일) 59일 절감</td>
                  </tr>
                  <tr className="bg-purple-50/80 font-bold">
                    <td className="py-2 px-2 text-left text-purple-950 font-extrabold">
                      5. LCC 순 총공사비 (Net Total)
                    </td>
                    <td className="py-2 px-2 font-mono text-rose-800">106,300 만원</td>
                    <td className="py-2 px-2 font-mono text-sky-800">79,800 만원</td>
                    <td className="py-2 px-2 font-mono text-purple-950 text-xs font-black">
                      81,800 만원
                    </td>
                    <td className="py-2 px-2 text-left text-purple-950 font-extrabold">
                      ★ 2억 4,500만원 순절감 달성
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              [포함된 핵심 3] 엔지니어링 종합 채택 권고사항 (3대 Case 분석)
             ═══════════════════════════════════════════════════════════════════════ */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>3. 엔지니어링 종합 채택 권고사항</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 leading-relaxed">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-sky-900 block">Case 1. 부지 경계 여건이 양호한 경우</span>
                <p className="text-slate-600">
                  사유지 침범 협의가 가능하거나 도로부지인 구간은 <strong>2안(전구간 앵커 20°)</strong>을 적용하여 100% 무지주 개방 및 최대 공기단축(60일)을 달성하는 것이 가장 유리합니다.
                </p>
              </div>
              <div className="p-2.5 bg-purple-100/80 rounded-lg border border-purple-300 space-y-1">
                <span className="font-bold text-purple-950 block">Case 2. 인접 구조물 근접 및 경계 민원 우려 시 (추천★)</span>
                <p className="text-purple-900 font-medium">
                  지하매설물이 밀집되거나 부지경계 제약이 있는 구간은 <strong>3안(제3안 복합공법)</strong>을 채택하여 10m 광간격 개구부로 <strong>토공 공기단축(59일)과 2.45억 절감효과를 98% 확보</strong>하면서 민원 리스크를 원천 차단하십시오.
                </p>
              </div>
              <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-200 space-y-1">
                <span className="font-bold text-indigo-950 block">Case 3. 상부 사유지/지장물 간섭 시 (고각앵커)</span>
                <p className="text-indigo-900">
                  상부 1~2단에 <strong>고각앵커(45°~60° 전용 천공장비)</strong>를 도입하면 배면 침범거리가 최대 58% 단축되어 지장물/사유지 침범을 완벽히 우회·회피하면서 인발 Fs≥2.0을 100% 만족할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Final Resolution Footer */}
          <div className="bg-slate-900 text-slate-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black rounded text-[10px]">
                심의의결 주문
              </span>
              <span className="font-bold text-slate-100">
                본 심의위원회는 공기단축(59일), LCC 원가절감(2.45억원), 민원 및 안전 리스크가 완벽히 해소된 <strong className="text-amber-300">「제3안 광간격 복합 지보공법」</strong>을 최종 시공 공법으로 채택함.
              </span>
            </div>
            <div className="font-mono text-slate-400 text-[11px]">
              기술심의평가위원회 위원 일동 ㊞
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
