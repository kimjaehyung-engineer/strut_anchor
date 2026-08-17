import React from 'react';
import {
  CalculationResult,
  ExcavationStage,
  ProjectSettings,
  SoilLayer,
  StrutTier,
  WallSection,
} from '../types';
import { X, Printer, Download, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CalculationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProjectSettings;
  layers: SoilLayer[];
  wall: WallSection;
  struts: StrutTier[];
  currentStage: ExcavationStage;
  calcResult: CalculationResult;
}

export const CalculationReportModal: React.FC<CalculationReportModalProps> = ({
  isOpen,
  onClose,
  settings,
  layers,
  wall,
  struts,
  currentStage,
  calcResult,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded w-full max-w-4xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-100 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                개착 가시설 구조안정성 검토 계산서 (Structural Calculation Sheet)
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                KDS 21 30 00 (가시설물 설계기준) 및 KDS 11 00 00 (지반설계기준) 준용
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄 / PDF 저장</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs font-sans bg-white print:p-4">
          {/* Report Cover / Header Box */}
          <div className="border border-slate-300 bg-slate-50 p-4 rounded text-center space-y-1">
            <div className="text-base font-bold text-slate-900 tracking-wide">
              지하정거장 개착공사 가시설 구조안정성 검토서
            </div>
            <div className="text-xs text-slate-600 font-medium">
              공사명: {settings.projectName} ({settings.stationName})
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              검토단계: {currentStage.name} (현재 굴착심도 GL -{calcResult.currentExcavationDepth}m)
            </div>
          </div>

          {/* Section 1: Design Conditions */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
              1. 기본 설계 조건 및 지반 정수
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200 text-[11px]">
              <div>정거장 제원: <span className="font-mono font-bold text-slate-900">B={settings.stationWidth}m × L={settings.stationLength || 100}m</span></div>
              <div>최종 굴착심도: <span className="font-mono font-bold text-slate-900">{settings.finalExcavationDepth} m</span></div>
              <div>지하수위(GWT): <span className="font-mono font-bold text-slate-900">GL -{settings.groundWaterTable} m</span></div>
              <div>상재하중(q): <span className="font-mono font-bold text-slate-900">{settings.surchargeLoad} kN/m²</span></div>
              <div>벽체 형식: <span className="font-bold text-slate-900">{wall.name}</span></div>
              <div>말뚝 길이 / 피치: <span className="font-mono font-semibold text-slate-900">{wall.totalLength}m / @{wall.pileSpacing}m</span></div>
              <div>벽체 허용휨응력: <span className="font-mono font-semibold text-slate-900">{wall.allowableBendingStress} MPa</span></div>
              <div>토압 이론: <span className="font-bold text-slate-900">{settings.earthPressureTheory}</span></div>
            </div>

            {/* Soil Layers Table */}
            <table className="w-full text-left border-collapse border border-slate-200 mt-2 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold">
                  <th className="p-2 border border-slate-200">지층명</th>
                  <th className="p-2 border border-slate-200">심도 (m)</th>
                  <th className="p-2 border border-slate-200">단위중량 γ (kN/m³)</th>
                  <th className="p-2 border border-slate-200">점착력 c (kPa)</th>
                  <th className="p-2 border border-slate-200">마찰각 φ (°)</th>
                  <th className="p-2 border border-slate-200">N치</th>
                </tr>
              </thead>
              <tbody>
                {layers.map((l) => (
                  <tr key={l.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 font-medium text-slate-900">{l.name}</td>
                    <td className="p-2 font-mono text-slate-700">GL -{l.depthTop} ~ -{l.depthBottom}</td>
                    <td className="p-2 font-mono text-slate-700">{l.unitWeight} / {l.satUnitWeight}</td>
                    <td className="p-2 font-mono text-slate-700">{l.cohesion}</td>
                    <td className="p-2 font-mono text-slate-700">{l.frictionAngle}°</td>
                    <td className="p-2 font-mono font-bold text-slate-900">{l.nValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Safety Check Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
              2. KDS 기준 종합 안정성 평가 요약
            </h3>
            <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold">
                  <th className="p-2 border border-slate-200">검토 항목</th>
                  <th className="p-2 border border-slate-200">계산치 / 발생치</th>
                  <th className="p-2 border border-slate-200">허용치 / 기준치</th>
                  <th className="p-2 border border-slate-200 text-center">안전율 / 응력비</th>
                  <th className="p-2 border border-slate-200 text-center">판정</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-medium border border-slate-200 text-slate-900">1. 히빙 (Heaving)</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">Fs = {calcResult.safety.heavingFs}</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">Fs ≥ {calcResult.safety.heavingRequiredFs}</td>
                  <td className="p-2 text-center font-mono font-bold border border-slate-200 text-slate-900">{calcResult.safety.heavingFs}</td>
                  <td className="p-2 text-center border border-slate-200">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${calcResult.safety.heavingSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {calcResult.safety.heavingSafe ? 'OK' : 'NG'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-medium border border-slate-200 text-slate-900">2. 보일링 (Boiling)</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">Fs = {calcResult.safety.boilingFs}</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">Fs ≥ {calcResult.safety.boilingRequiredFs}</td>
                  <td className="p-2 text-center font-mono font-bold border border-slate-200 text-slate-900">{calcResult.safety.boilingFs}</td>
                  <td className="p-2 text-center border border-slate-200">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${calcResult.safety.boilingSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {calcResult.safety.boilingSafe ? 'OK' : 'NG'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-medium border border-slate-200 text-slate-900">3. 파이핑 (Piping)</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">C = {calcResult.safety.pipingCreepRatio}</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">C ≥ {calcResult.safety.pipingRequiredRatio}</td>
                  <td className="p-2 text-center font-mono font-bold border border-slate-200 text-slate-900">{calcResult.safety.pipingCreepRatio}</td>
                  <td className="p-2 text-center border border-slate-200">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${calcResult.safety.pipingSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {calcResult.safety.pipingSafe ? 'OK' : 'NG'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-medium border border-slate-200 text-slate-900">4. 벽체 근입깊이 저항</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">Fs = {calcResult.safety.embedmentFs}</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">Fs ≥ {calcResult.safety.embedmentRequiredFs}</td>
                  <td className="p-2 text-center font-mono font-bold border border-slate-200 text-slate-900">{calcResult.safety.embedmentFs}</td>
                  <td className="p-2 text-center border border-slate-200">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${calcResult.safety.embedmentSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {calcResult.safety.embedmentSafe ? 'OK' : 'NG'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-medium border border-slate-200 text-slate-900">5. 벽체 최대 휨응력</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">{calcResult.safety.maxBendingStress} MPa</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">{calcResult.safety.allowableBendingStress} MPa</td>
                  <td className="p-2 text-center font-mono font-bold border border-slate-200 text-slate-900">{calcResult.safety.wallStressUtilization}%</td>
                  <td className="p-2 text-center border border-slate-200">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${calcResult.safety.isWallStressSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {calcResult.safety.isWallStressSafe ? 'OK' : 'NG'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-medium border border-slate-200 text-slate-900">6. 벽체 수평변위</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">{calcResult.safety.maxDisplacement} mm</td>
                  <td className="p-2 font-mono border border-slate-200 text-slate-700">{calcResult.safety.allowableDisplacement} mm</td>
                  <td className="p-2 text-center font-mono font-bold border border-slate-200 text-slate-900">
                    {Math.round((calcResult.safety.maxDisplacement / calcResult.safety.allowableDisplacement) * 100)}%
                  </td>
                  <td className="p-2 text-center border border-slate-200">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${calcResult.safety.isDisplacementSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {calcResult.safety.isDisplacementSafe ? 'OK' : 'NG'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Strut Axial Force Matrix */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
              3. 지보공 (버팀보 및 띠장) 단별 구조검토
            </h3>
            {calcResult.strutResults.length > 0 ? (
              <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold">
                    <th className="p-2 border border-slate-200">단수</th>
                    <th className="p-2 border border-slate-200">심도</th>
                    <th className="p-2 border border-slate-200">규격</th>
                    <th className="p-2 border border-slate-200">설계축력 P</th>
                    <th className="p-2 border border-slate-200">허용내력 Pa</th>
                    <th className="p-2 border border-slate-200 text-center">축응력비</th>
                    <th className="p-2 border border-slate-200 text-center">띠장응력비</th>
                    <th className="p-2 border border-slate-200 text-center">판정</th>
                  </tr>
                </thead>
                <tbody>
                  {calcResult.strutResults.map((s) => (
                    <tr key={s.tier} className="hover:bg-slate-50">
                      <td className="p-2 font-bold border border-slate-200 text-slate-900">{s.tier}단</td>
                      <td className="p-2 font-mono border border-slate-200 text-slate-700">GL -{s.depth}m</td>
                      <td className="p-2 font-mono border border-slate-200 text-slate-700">{s.specName}</td>
                      <td className="p-2 font-mono border border-slate-200 text-slate-700">{s.totalAxialForce} kN</td>
                      <td className="p-2 font-mono border border-slate-200 text-slate-700">{s.allowableForce} kN</td>
                      <td className="p-2 text-center font-mono font-bold border border-slate-200 text-slate-900">{s.utilizationRatio}%</td>
                      <td className="p-2 text-center font-mono font-bold border border-slate-200 text-slate-900">{s.waleUtilizationRatio}%</td>
                      <td className="p-2 text-center border border-slate-200">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.isSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {s.isSafe ? 'OK' : 'NG'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-slate-500 italic p-2 bg-slate-50 rounded border border-slate-200">
                현재 단계는 버팀보 미설치 캔틸레버 굴착 상태입니다.
              </div>
            )}
          </div>

          {/* Section 4: Applied Material Specifications Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
              4. 도면 및 공사비 내역서 적용 가시설 자재 규격 상세
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="font-bold text-blue-900">• 엄지말뚝 (H-Pile): {wall.name}</div>
                <div className="text-slate-600">단면적 A={wall.crossSectionAreaA}cm², 단면계수 Z={wall.sectionModulusZ}cm³, 허용휨응력 fa={wall.allowableBendingStress}MPa, 천공경 D500mm</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="font-bold text-blue-900">• 띠장 (Wale): {struts[0]?.waleSpecName || '2H-300×305×15×15'}</div>
                <div className="text-slate-600">단면계수 Z={struts[0]?.waleZ || 2940}cm³, 연결재(C-1 TYPE), 우각부(D-1 TYPE), 보걸이(O-1/O-2)</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="font-bold text-blue-900">• 버팀보 (Strut): {struts[0]?.specName || 'H-300×305×15×15'}</div>
                <div className="text-slate-600">스크류잭 1,000kN(100tonf), 화타쐐기 K-1/K-2 TYPE, 연결부 S-2 TYPE, 보강재 B-4/B-5/B-6</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div className="font-bold text-blue-900">• 보강재 / 토류판 / 복공</div>
                <div className="text-slate-600">ㄷ-380×100(F-1), L-90×90(G-2 브레이싱), 목재토류판 T=6cm / 강재 T=1.2mm, 복공판 H형 2000×1000×200</div>
              </div>
            </div>
          </div>

          {/* Section 5: Engineering Conclusion */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 text-xs">5. 종합 검토 의견 및 시공 관리사항</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              본 지하정거장 개착가시설은 {currentStage.name} 단계에서 흙막이 벽체 휨응력(최대 {calcResult.safety.maxBendingStress} MPa) 및 변위량({calcResult.safety.maxDisplacement} mm)이 허용 기준치 이내로 안전하며, 지반의 히빙(Fs={calcResult.safety.heavingFs}), 보일링(Fs={calcResult.safety.boilingFs}) 및 수동토압 안전율(Fs={calcResult.safety.embedmentFs}) 모두 KDS 기준을 만족합니다. 도로 복공판 상부 차량 통행에 따른 진동 및 지하수위 변동에 대비하여 계측관리(경사계, 수위계, 스트럿 하중계)를 철저히 이행하시기 바랍니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-slate-500 text-[11px] font-medium">
            * 본 계산서는 설계 보조용 지반·가시설 구조 해석 소프트웨어로 자동 산정되었습니다.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded shadow-xs transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
