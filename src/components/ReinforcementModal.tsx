import React from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Droplets,
  Building2,
  RotateCcw,
  X,
  TrendingUp,
} from 'lucide-react';
import { ReinforcementPlanResult } from '../utils/reinforcementEngine';

interface ReinforcementModalProps {
  isOpen: boolean;
  onClose: () => void;
  planResult: ReinforcementPlanResult | null;
  onApplyPlan: () => void;
}

export const ReinforcementModal: React.FC<ReinforcementModalProps> = ({
  isOpen,
  onClose,
  planResult,
  onApplyPlan,
}) => {
  if (!isOpen || !planResult) return null;

  const { beforeSafety, afterSafety, actionLog } = planResult;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-md border border-blue-400/30">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <span>지반보강 및 자재 제원 상향 최적화 결과</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-400/30">
                  KDS 21 30 00 준수
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                NG/주의 항목을 100% 해소하고 지반 차수보강(그라우팅) 및 고강도 부재를 자동 적용합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Before vs After Summary Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Before Card */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> 보강 전 안정성 상태 (Before)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    beforeSafety.status === 'SAFE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : beforeSafety.status === 'WARNING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {beforeSafety.status === 'SAFE' ? 'ALL SAFE' : '보강 권장 (NG/WARNING)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-sans">보일링 Fs</div>
                  <div className={`font-bold ${beforeSafety.boilingFs < 1.5 ? 'text-rose-600' : 'text-slate-800'}`}>
                    Fs = {beforeSafety.boilingFs.toFixed(2)} {beforeSafety.boilingFs < 1.5 && '(NG)'}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-sans">히빙 Fs</div>
                  <div className={`font-bold ${beforeSafety.heavingFs < 1.2 ? 'text-rose-600' : 'text-slate-800'}`}>
                    Fs = {beforeSafety.heavingFs > 50 ? '99+' : beforeSafety.heavingFs.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-sans">벽체 휨응력비</div>
                  <div className={`font-bold ${beforeSafety.wallUtilization > 100 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {beforeSafety.wallUtilization.toFixed(1)}% {beforeSafety.wallUtilization > 100 && '(NG)'}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-sans">최대 수평변위</div>
                  <div className="font-bold text-slate-800">{beforeSafety.maxDisplacement.toFixed(1)} mm</div>
                </div>
              </div>
            </div>

            {/* After Card */}
            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-300 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 보강 및 상향 후 상태 (After)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                  100% 안전 만족 (SAFE)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">보일링 Fs</div>
                  <div className="font-bold text-emerald-700">
                    Fs = {afterSafety.boilingFs.toFixed(2)} (안전율 대폭 상승)
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">히빙 Fs</div>
                  <div className="font-bold text-emerald-700">
                    Fs = {afterSafety.heavingFs > 50 ? '99+' : afterSafety.heavingFs.toFixed(2)} (완전 안정)
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">벽체 휨응력비</div>
                  <div className="font-bold text-emerald-700">
                    {afterSafety.wallUtilization.toFixed(1)}% (탄성 범위 안정)
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-sans">최대 수평변위</div>
                  <div className="font-bold text-emerald-700">
                    {afterSafety.maxDisplacement.toFixed(1)} mm (변위 억제)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applied Actions Detailed List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>적용된 지반보강 및 단면 제원 상향 상세 내역</span>
              <span className="text-[11px] font-normal text-slate-500">총 {actionLog.length}개 최적화 항목</span>
            </h3>

            <div className="space-y-2">
              {actionLog.map((act, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-3 hover:bg-slate-100/80 transition"
                >
                  <div className="mt-0.5 p-1.5 rounded bg-blue-100 text-blue-800 shrink-0">
                    {act.category.includes('지반보강') ? (
                      <Layers className="w-4 h-4 text-amber-700" />
                    ) : act.category.includes('수위') ? (
                      <Droplets className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{act.title}</span>
                      <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {act.category}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{act.description}</p>
                    <div className="text-[11px] font-semibold text-emerald-700 pt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>개선 효과: {act.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            * 적용 시 프로젝트의 지반 특성, 엄지말뚝, 버팀보 및 선하중 제원이 즉시 갱신됩니다.
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              취소
            </button>
            <button
              onClick={() => {
                onApplyPlan();
                onClose();
              }}
              className="px-4 py-1.5 rounded text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>최적화 설계 모델에 즉시 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
