import React from 'react';
import {
  X,
  Compass,
  CheckSquare,
  Layers,
  ArrowRight,
  Shield,
  Activity,
  Code2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface PlanningGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanningGuideModal: React.FC<PlanningGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                지하정거장 개착가시설 해석프로그램 개발 및 설계 계획수립 가이드
              </h2>
              <p className="text-xs text-slate-400">
                도로 상부 개착공사(Cut & Cover) 가시설의 단계별 시공과 안정성 해석 소프트웨어 구축 로드맵
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          {/* Executive Overview */}
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4.5 text-blue-200">
            <h3 className="font-bold text-blue-300 mb-1.5 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>개착 가시설 해석프로그램 구축의 핵심 방향</span>
            </h3>
            <p className="text-xs leading-relaxed text-blue-200/90">
              도로 하부 지하정거장 개착공사는 <strong>1) 도로 교통 유지를 위한 복공 시스템</strong>, <strong>2) 굴착 형상을 따른 토류벽체(엄지말뚝/CIP/슬러리월) 시공</strong>, <strong>3) 굴착 진행에 따른 다단 띠장(Wale) 및 버팀보(Strut) 설치 + Preload 선하중</strong>의 순차적 단계로 진행됩니다. 이 공정의 안정성 해석 프로그램을 만들 때는 아래 7단계 로드맵으로 체계화하여 계획을 수립합니다.
            </p>
          </div>

          {/* 7-Step Planning Roadmap */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2.5 font-bold text-sky-400 text-sm mb-2">
                <span className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-xs">1</span>
                <span>지반 조사 및 지층 파라미터 데이터 모델링</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                <li><strong>시추 주상도(Boring Log)</strong>: 지표면(GL)으로부터 매립토, 퇴적점토, 모래자갈, 풍화토, 풍화암, 연암 지층 분류</li>
                <li><strong>핵심 토질정수</strong>: 단위중량(γ, γsat), 점착력(c), 내부마찰각(φ), 수평지반반력계수(kh), 투수계수(k), SPT N치</li>
                <li><strong>지하수위(GWT)</strong>: 갈수기 및 홍수기 최고 지하수위 고려 (수압 및 침투해석 입력치)</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2.5 font-bold text-sky-400 text-sm mb-2">
                <span className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-xs">2</span>
                <span>가시설 구조형식 및 도로 복공계획 수립</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                <li><strong>흙막이 벽체 형식</strong>: H-Pile+토류판(표준), CIP 주열벽(차수/도심지), 지하연속벽(대심도/영구벽체)</li>
                <li><strong>지보공(Strut System)</strong>: 원형강관 버팀보(Φ508~Φ812), H-형강 띠장(2H-350~2H-450), 유압잭 선하중(Preload)</li>
                <li><strong>중간말뚝(King Post)</strong>: 버팀보 유효 좌굴길이 1/2 단축 및 복공판 상부 차량하중(DB-24) 지지</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2.5 font-bold text-sky-400 text-sm mb-2">
                <span className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-xs">3</span>
                <span>토압 및 수압 산정 모델링 (Earth & Water Pressure)</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                <li><strong>경험적 겉보기 토압 (Peck 토압)</strong>: 사질토 (0.65·γ·H·Ka), 연약점성토 (γ·H(1 - 4cu/γH)), 중경점성토</li>
                <li><strong>정수압 및 잔류수압</strong>: 벽체 차수성(토류판 배수 vs CIP/슬러리월 비배수)에 따른 수압 분포 모델</li>
                <li><strong>상재하중</strong>: 도로 교통하중(q = 10~15 kN/m²) 및 인접 건물 하중 추가</li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2.5 font-bold text-sky-400 text-sm mb-2">
                <span className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-xs">4</span>
                <span>단계별 굴착 시뮬레이션 알고리즘 (Staged Excavation Engine)</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                <li><strong>Step 0</strong>: 원지반 + H-Pile 및 도로 복공판 시공</li>
                <li><strong>Step 1</strong>: 1차 굴착 (캔틸레버 상태) $\to$ 벽체 휨모멘트 및 두부 변위 계산</li>
                <li><strong>Step 2</strong>: 1단 띠장/버팀보 설치 + Preload $\to$ 지지점(Spring Support) 생성</li>
                <li><strong>Step 3~N</strong>: 단계별 추가 굴착 $\to$ 지보재 추가 $\to$ 지간분할 하중재분배 및 탄소성 보해석</li>
                <li><strong>최종 단계</strong>: 정거장 저판 바닥(GL -20~-30m) 굴착 완료 상태의 최대 응력 검토</li>
              </ul>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2.5 font-bold text-sky-400 text-sm mb-2">
                <span className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-xs">5</span>
                <span>KDS 기준 7대 안정성 판정 수식 구현</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400 pl-2">
                <div className="bg-slate-900 p-2.5 rounded-lg">
                  <div className="font-semibold text-slate-200">1. 히빙 (Heaving)</div>
                  <div>점성토 바닥 파괴: Fs = 5.7c / (γH + q) ≥ 1.2</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg">
                  <div className="font-semibold text-slate-200">2. 보일링 (Boiling)</div>
                  <div>사질토 한계동수경사: Fs = icr / i ≥ 1.5</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg">
                  <div className="font-semibold text-slate-200">3. 파이핑 (Piping)</div>
                  <div>침투 유선길이 크리프비: C = L / Δh ≥ 5.0</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg">
                  <div className="font-semibold text-slate-200">4. 근입장 수동저항</div>
                  <div>가상 지지점 전도 안전율: Fs = ΣMp / ΣMa ≥ 1.2</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg">
                  <div className="font-semibold text-slate-200">5. 벽체 휨/변위</div>
                  <div>σb = M/Z ≤ fa (210MPa), δ ≤ 0.2~0.3% H</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg">
                  <div className="font-semibold text-slate-200">6. 버팀보 축력/좌굴</div>
                  <div>세장비 λ = Le/r, σc = P/A ≤ Fca</div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2.5 font-bold text-sky-400 text-sm mb-2">
                <span className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center text-xs">6</span>
                <span>해석 소프트웨어 UI/UX 아키텍처 구성</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 pl-2">
                <li><strong>입력 모듈</strong>: 지층 테이블(두께, 토질정수), 벽체 및 지보재 규격, 정거장 폭/심도</li>
                <li><strong>연산 엔진</strong>: 토압 산정, 연속보 하중분배, 지반 파괴기구 Fs 자동 계산</li>
                <li><strong>시각화 캔버스</strong>: 2D 지반단면, 토압도, 모멘트(BMD), 전단력(SFD), 변위도 실시간 렌더링</li>
                <li><strong>계산서 출력</strong>: KDS 설계기준 양식의 종합 구조계산서 자동 생성</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            * 이 웹 애플리케이션은 위 7단계 계획을 100% 반영하여 제작된 실시간 가시설 해석 시뮬레이터입니다.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl transition shadow-md"
          >
            확인 및 해석 시작
          </button>
        </div>
      </div>
    </div>
  );
};
