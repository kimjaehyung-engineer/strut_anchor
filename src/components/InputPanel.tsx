import React, { useState } from 'react';
import {
  ProjectSettings,
  SoilLayer,
  SoilType,
  StrutTier,
  StrutType,
  WallSection,
  WallStructureType,
} from '../types';
import {
  Settings2,
  Layers,
  Shield,
  GitBranch,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  ChevronDown,
  FileSpreadsheet,
  PackageCheck,
  Sparkles,
  Info,
  Search,
} from 'lucide-react';
import {
  H_PILE_SPECS,
  WALE_SPECS,
  STRUT_SPECS,
  CENTER_POST_SPECS,
  DECK_GIRDER_SPECS,
  REINFORCEMENT_SPECS,
  ATTACHED_BOQ_DATA,
  HPileSpec,
  WaleSpec,
  StrutSpec,
} from '../utils/materialSpecs';

interface InputPanelProps {
  settings: ProjectSettings;
  onUpdateSettings: (settings: ProjectSettings) => void;
  layers: SoilLayer[];
  onUpdateLayers: (layers: SoilLayer[]) => void;
  wall: WallSection;
  onUpdateWall: (wall: WallSection) => void;
  struts: StrutTier[];
  onUpdateStruts: (struts: StrutTier[]) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  settings,
  onUpdateSettings,
  layers,
  onUpdateLayers,
  wall,
  onUpdateWall,
  struts,
  onUpdateStruts,
}) => {
  const [activeTab, setActiveTab] = useState<'PROJECT' | 'SOIL' | 'WALL' | 'STRUTS' | 'BOQ'>('PROJECT');
  const [boqSearch, setBoqSearch] = useState('');
  const [selectedBoqCategory, setSelectedBoqCategory] = useState<string>('ALL');

  // Soil Layer Helpers
  const handleSoilChange = (index: number, field: keyof SoilLayer, value: any) => {
    const updated = [...layers];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateLayers(updated);
  };

  const handleAddSoil = () => {
    const lastLayer = layers[layers.length - 1];
    const top = lastLayer ? lastLayer.depthBottom : 0;
    const newLayer: SoilLayer = {
      id: `soil-${Date.now()}`,
      name: '신규 지층',
      type: 'sand',
      depthTop: top,
      depthBottom: top + 5.0,
      unitWeight: 19.0,
      satUnitWeight: 20.0,
      cohesion: 0,
      frictionAngle: 32,
      subgradeReactionKh: 25000,
      permeabilityK: 1e-3,
      color: '#FFE082',
      nValue: 20,
    };
    onUpdateLayers([...layers, newLayer]);
  };

  const handleDeleteSoil = (index: number) => {
    if (layers.length <= 1) return;
    const updated = layers.filter((_, i) => i !== index);
    onUpdateLayers(updated);
  };

  // Wall Spec Quick Select Handler
  const handleSelectHPileSpec = (specId: string) => {
    const spec = H_PILE_SPECS.find((s) => s.id === specId);
    if (!spec) return;
    onUpdateWall({
      ...wall,
      type: 'H_PILE_TIMBER',
      name: spec.name,
      sectionModulusZ: spec.sectionModulusZx,
      momentOfInertiaI: spec.momentOfInertiaIx,
      crossSectionAreaA: spec.areaA,
      allowableBendingStress: spec.allowableBendingStress,
      description: `도면 자재 규격: ${spec.size} (${spec.steelGrade}), 단위중량 ${spec.unitWeight}kg/m - ${spec.notes}`,
    });
  };

  // Strut Spec Quick Select Handler
  const handleSelectStrutSpec = (index: number, strutSpecId: string) => {
    const spec = STRUT_SPECS.find((s) => s.id === strutSpecId);
    if (!spec) return;

    const updated = [...struts];
    const target = updated[index];

    let strutType: StrutType = 'PIPE_STRUT';
    if (spec.category === 'H_BEAM') strutType = 'H_BEAM';
    else if (spec.category === 'ANCHOR') strutType = 'GROUND_ANCHOR';

    updated[index] = {
      ...target,
      type: strutType,
      specName: spec.name,
      crossSectionAreaA: spec.areaA,
      momentOfInertiaI: spec.momentOfInertiaI,
      allowableAxialStress: spec.allowableAxialStress,
    };
    onUpdateStruts(updated);
  };

  // Wale Spec Quick Select Handler
  const handleSelectWaleSpec = (index: number, waleSpecId: string) => {
    const spec = WALE_SPECS.find((s) => s.id === waleSpecId);
    if (!spec) return;

    const updated = [...struts];
    const target = updated[index];

    updated[index] = {
      ...target,
      waleSpecName: spec.name,
      waleZ: spec.sectionModulusZ,
      waleAllowableBending: spec.allowableBendingStress,
    };
    onUpdateStruts(updated);
  };

  // Strut Helpers
  const handleStrutChange = (index: number, field: keyof StrutTier, value: any) => {
    const updated = [...struts];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateStruts(updated);
  };

  const handleAddStrut = () => {
    const lastStrut = struts[struts.length - 1];
    const newTier = struts.length + 1;
    const newDepth = lastStrut ? lastStrut.depth + 4.5 : 2.5;
    const defaultSpec = STRUT_SPECS[0]; // H-300×305
    const defaultWale = WALE_SPECS[0]; // 2H-300×305
    const newStrut: StrutTier = {
      id: `strut-${Date.now()}`,
      tier: newTier,
      depth: newDepth,
      type: 'H_BEAM',
      specName: defaultSpec.name,
      horizontalSpacing: 4.0,
      excavationWidth: settings.stationWidth,
      hasCenterPost: true,
      preloadTon: 30.0,
      crossSectionAreaA: defaultSpec.areaA,
      momentOfInertiaI: defaultSpec.momentOfInertiaI,
      elasticModulusE: 205000,
      allowableAxialStress: defaultSpec.allowableAxialStress,
      waleSpecName: defaultWale.name,
      waleZ: defaultWale.sectionModulusZ,
      waleAllowableBending: defaultWale.allowableBendingStress,
      installedAtStep: newTier * 2,
    };
    onUpdateStruts([...struts, newStrut]);
  };

  const handleDeleteStrut = (index: number) => {
    if (struts.length <= 1) return;
    const updated = struts.filter((_, i) => i !== index).map((s, idx) => ({ ...s, tier: idx + 1 }));
    onUpdateStruts(updated);
  };

  // Apply Full Attached Specs to Current Model
  const handleApplyFullAttachedSpecs = () => {
    // 1. Set Wall to H-300×305 (SM355)
    const h300Spec = H_PILE_SPECS[0];
    onUpdateWall({
      ...wall,
      type: 'H_PILE_TIMBER',
      name: h300Spec.name,
      sectionModulusZ: h300Spec.sectionModulusZx,
      momentOfInertiaI: h300Spec.momentOfInertiaIx,
      crossSectionAreaA: h300Spec.areaA,
      allowableBendingStress: h300Spec.allowableBendingStress,
      description: '첨부 내역서 표준 자재: H-300×305×15×15 (SM355) 엄지말뚝 + 2H-300 띠장 + 스크류잭 1000kN',
    });

    // 2. Set all struts to H-300×305 (한면제작, SM355) and 2H-300×305 띠장
    const strutSpec = STRUT_SPECS[0];
    const waleSpec = WALE_SPECS[0];
    const updatedStruts = struts.map((s) => ({
      ...s,
      type: 'H_BEAM' as StrutType,
      specName: strutSpec.name,
      crossSectionAreaA: strutSpec.areaA,
      momentOfInertiaI: strutSpec.momentOfInertiaI,
      allowableAxialStress: strutSpec.allowableAxialStress,
      waleSpecName: waleSpec.name,
      waleZ: waleSpec.sectionModulusZ,
      waleAllowableBending: waleSpec.allowableBendingStress,
      preloadTon: 30.0,
    }));
    onUpdateStruts(updatedStruts);
  };

  // Filtered BOQ items
  const filteredBoq = ATTACHED_BOQ_DATA.filter((item) => {
    const matchesCategory = selectedBoqCategory === 'ALL' || item.category === selectedBoqCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(boqSearch.toLowerCase()) ||
      item.spec.toLowerCase().includes(boqSearch.toLowerCase()) ||
      item.code.toLowerCase().includes(boqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const boqCategories = ['ALL', ...Array.from(new Set(ATTACHED_BOQ_DATA.map((i) => i.category)))];

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center space-x-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PROJECT')}
          className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
            activeTab === 'PROJECT'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5 text-blue-600" />
          <span>1. 정거장 제원·하중</span>
        </button>
        <button
          onClick={() => setActiveTab('SOIL')}
          className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
            activeTab === 'SOIL'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>2. 지층 및 토질 ({layers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('WALL')}
          className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
            activeTab === 'WALL'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>3. 흙막이 벽체 (H-Pile)</span>
        </button>
        <button
          onClick={() => setActiveTab('STRUTS')}
          className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
            activeTab === 'STRUTS'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-blue-600" />
          <span>4. 버팀보·띠장 ({struts.length}단)</span>
        </button>
        <button
          onClick={() => setActiveTab('BOQ')}
          className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
            activeTab === 'BOQ'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-current" />
          <span>5. 도면 자재 규격 & 물량표 (BOQ)</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 overflow-y-auto max-h-[480px] text-xs text-slate-700">
        {/* Tab 1: Project Settings */}
        {activeTab === 'PROJECT' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">프로젝트명</label>
                <input
                  type="text"
                  value={settings.projectName}
                  onChange={(e) => onUpdateSettings({ ...settings, projectName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">정거장 역사명</label>
                <input
                  type="text"
                  value={settings.stationName}
                  onChange={(e) => onUpdateSettings({ ...settings, stationName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-slate-500 font-medium mb-1">굴착폭 B (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.stationWidth}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, stationWidth: parseFloat(e.target.value) || 20 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">최종심도 H (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.finalExcavationDepth}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      finalExcavationDepth: parseFloat(e.target.value) || 24,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">지하수위 GWT (-m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.groundWaterTable}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      groundWaterTable: parseFloat(e.target.value) || 5,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">상재하중 q (kN/m²)</label>
                <input
                  type="number"
                  step="1"
                  value={settings.surchargeLoad}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      surchargeLoad: parseFloat(e.target.value) || 12,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-slate-500 font-medium mb-1">토압 산정 모델 (Earth Pressure)</label>
                <select
                  value={settings.earthPressureTheory}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      earthPressureTheory: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="PECK">Peck 경험적 겉보기 토압 (버팀보 가시설 표준)</option>
                  <option value="RANKINE">Rankine 극한 수평토압</option>
                  <option value="TSCHEBOTARIOFF">Tschebotarioff 사다리꼴 토압</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">도로 복공판 폭 (m)</label>
                <input
                  type="number"
                  step="1"
                  value={settings.roadWidth}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, roadWidth: parseFloat(e.target.value) || 30 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Center King Post & Traffic Load Parameters */}
            <div className="pt-3 border-t border-slate-200 space-y-2.5 bg-amber-50/40 p-3 rounded border border-amber-200/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>교통하중 지지용 중간말뚝 (Center King Post) 설정</span>
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded">
                  도로 복공구간 필수
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-500 text-[11px] font-medium mb-1">중간말뚝 H형강 규격</label>
                  <select
                    value={settings.centerPost?.specName || CENTER_POST_SPECS[0].name}
                    onChange={(e) => {
                      const sel = CENTER_POST_SPECS.find((s) => s.name === e.target.value) || CENTER_POST_SPECS[0];
                      onUpdateSettings({
                        ...settings,
                        centerPost: {
                          ...(settings.centerPost || {
                            spacing: 4.0,
                            deckGirderSpec: DECK_GIRDER_SPECS[0].name,
                            trafficLoadModel: 'DB-24',
                            rockSocketDepth: 3.0,
                            allowableBearingCapacity: 1850,
                          }),
                          specName: sel.name,
                          crossSectionAreaA: sel.areaA,
                          momentOfInertiaI: sel.momentOfInertiaIy,
                          allowableAxialStress: sel.allowableAxialStress,
                        },
                      });
                    }}
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {CENTER_POST_SPECS.map((spec) => (
                      <option key={spec.id} value={spec.name}>
                        {spec.name} (A={spec.areaA}cm², SM355)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] font-medium mb-1">말뚝 종방향 설치간격 (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.centerPost?.spacing ?? 4.0}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        centerPost: {
                          ...(settings.centerPost || {
                            specName: CENTER_POST_SPECS[0].name,
                            crossSectionAreaA: CENTER_POST_SPECS[0].areaA,
                            momentOfInertiaI: CENTER_POST_SPECS[0].momentOfInertiaIy,
                            allowableAxialStress: CENTER_POST_SPECS[0].allowableAxialStress,
                            deckGirderSpec: DECK_GIRDER_SPECS[0].name,
                            trafficLoadModel: 'DB-24',
                            rockSocketDepth: 3.0,
                            allowableBearingCapacity: 1850,
                          }),
                          spacing: parseFloat(e.target.value) || 4.0,
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-800 font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] font-medium mb-1">복공 주형보(Girder) 규격</label>
                  <select
                    value={settings.centerPost?.deckGirderSpec || DECK_GIRDER_SPECS[0].name}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        centerPost: {
                          ...(settings.centerPost || {
                            specName: CENTER_POST_SPECS[0].name,
                            crossSectionAreaA: CENTER_POST_SPECS[0].areaA,
                            momentOfInertiaI: CENTER_POST_SPECS[0].momentOfInertiaIy,
                            allowableAxialStress: CENTER_POST_SPECS[0].allowableAxialStress,
                            spacing: 4.0,
                            trafficLoadModel: 'DB-24',
                            rockSocketDepth: 3.0,
                            allowableBearingCapacity: 1850,
                          }),
                          deckGirderSpec: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {DECK_GIRDER_SPECS.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} (Z={g.sectionModulusZ}cm³)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Soil Layers */}
        {activeTab === 'SOIL' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">지층별 심도 및 토질정수 매개변수 설정</span>
              <button
                onClick={handleAddSoil}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>지층 추가</span>
              </button>
            </div>

            <div className="space-y-2">
              {layers.map((l, idx) => (
                <div key={l.id} className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="w-3 h-3 rounded-full shrink-0 border border-slate-300" style={{ backgroundColor: l.color }} />
                      <input
                        type="text"
                        value={l.name}
                        onChange={(e) => handleSoilChange(idx, 'name', e.target.value)}
                        className="bg-transparent font-bold text-slate-900 focus:outline-none border-b border-transparent focus:border-blue-500 text-xs flex-1"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteSoil(idx)}
                      disabled={layers.length <= 1}
                      className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">상단 (m)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={l.depthTop}
                        onChange={(e) => handleSoilChange(idx, 'depthTop', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">하단 (m)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={l.depthBottom}
                        onChange={(e) => handleSoilChange(idx, 'depthBottom', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">γ (kN/m³)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={l.unitWeight}
                        onChange={(e) => handleSoilChange(idx, 'unitWeight', parseFloat(e.target.value) || 18)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">점착력 c (kPa)</span>
                      <input
                        type="number"
                        step="1"
                        value={l.cohesion}
                        onChange={(e) => handleSoilChange(idx, 'cohesion', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">마찰각 φ (°)</span>
                      <input
                        type="number"
                        step="1"
                        value={l.frictionAngle}
                        onChange={(e) => handleSoilChange(idx, 'frictionAngle', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SPT N치</span>
                      <input
                        type="number"
                        step="1"
                        value={l.nValue}
                        onChange={(e) => handleSoilChange(idx, 'nValue', parseInt(e.target.value) || 10)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Wall Properties with Attached Material Spec Selector */}
        {activeTab === 'WALL' && (
          <div className="space-y-3.5">
            {/* Quick Spec Presets from Attached BOQ */}
            <div className="bg-blue-50/70 border border-blue-200 rounded p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                  <PackageCheck className="w-4 h-4 text-blue-600" />
                  <span>첨부 내역서 H-Pile 규격 빠른 선택 (Material Spec Presets)</span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                  천공경 D500mm 기준
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {H_PILE_SPECS.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => handleSelectHPileSpec(spec.id)}
                    className="text-left bg-white hover:bg-blue-100/50 p-2 rounded border border-blue-200/80 transition flex flex-col justify-between shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] group-hover:text-blue-700">
                        {spec.size} ({spec.steelGrade})
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{spec.unitWeight} kg/m</span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                      <span>Zx={spec.sectionModulusZx} cm³</span>
                      <span>Ix={spec.momentOfInertiaIx.toLocaleString()} cm4</span>
                      <span className="font-semibold text-blue-600">fa={spec.allowableBendingStress}MPa</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">벽체 구조 형식</label>
                <select
                  value={wall.type}
                  onChange={(e) => onUpdateWall({ ...wall, type: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="H_PILE_TIMBER">H-Pile + 목재/강재토류판 (내역서 표준)</option>
                  <option value="CIP">CIP 현장타설 주열벽 (Cast-In-Place Pile)</option>
                  <option value="DIAPHRAGM_WALL">지하연속벽 (Slurry Wall)</option>
                  <option value="SHEET_PILE">강널말뚝 (Sheet Pile)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">부재 규격 명칭</label>
                <input
                  type="text"
                  value={wall.name}
                  onChange={(e) => onUpdateWall({ ...wall, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-slate-500 font-medium mb-1">말뚝 총길이 L (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={wall.totalLength}
                  onChange={(e) => onUpdateWall({ ...wall, totalLength: parseFloat(e.target.value) || 30 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">말뚝 설치간격 (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={wall.pileSpacing}
                  onChange={(e) => onUpdateWall({ ...wall, pileSpacing: parseFloat(e.target.value) || 1.5 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">단면계수 Z (cm³)</label>
                <input
                  type="number"
                  step="10"
                  value={wall.sectionModulusZ}
                  onChange={(e) => onUpdateWall({ ...wall, sectionModulusZ: parseFloat(e.target.value) || 1470 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono font-bold text-blue-700"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">허용휨응력 fa (MPa)</label>
                <input
                  type="number"
                  step="5"
                  value={wall.allowableBendingStress}
                  onChange={(e) =>
                    onUpdateWall({ ...wall, allowableBendingStress: parseFloat(e.target.value) || 210 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono font-bold text-blue-700"
                />
              </div>
            </div>

            {/* Lagging and Casing Info from Attached Images */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] space-y-1">
              <div className="font-bold text-slate-800 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>내역서 연계 토류판 및 시공 보조 사양</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                <div>• 목재토류판: <span className="font-semibold text-slate-800">T=6cm (60mm)</span></div>
                <div>• 강재토류판: <span className="font-semibold text-slate-800">T=1.2mm (경량강재)</span></div>
                <div>• 천공케이싱: <span className="font-semibold text-slate-800">D500mm / 되메우기</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Struts & Wales with Attached Material Spec Selector */}
        {activeTab === 'STRUTS' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-700 font-bold text-xs">단별 버팀보(Strut) 규격 및 수평간격·매개변수 설정</span>
              <button
                onClick={handleAddStrut}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>지보단 추가</span>
              </button>
            </div>

            {/* Quick Batch Spacing Toolbar */}
            <div className="bg-slate-50 border border-blue-200/80 rounded-lg p-2.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  전체 지보단 수평설치간격 (Sh) 일괄 빠른 변경
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  현재 평균: {(struts.reduce((acc, s) => acc + s.horizontalSpacing, 0) / Math.max(1, struts.length)).toFixed(1)}m
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[2.0, 2.5, 3.0, 3.5, 4.0, 5.0].map((spacingVal) => (
                  <button
                    key={`batch-spacing-${spacingVal}`}
                    onClick={() => {
                      const updated = struts.map((st) => ({
                        ...st,
                        horizontalSpacing: spacingVal,
                      }));
                      onUpdateStruts(updated);
                    }}
                    className={`px-2 py-1 rounded text-xs font-mono font-semibold transition border ${
                      struts.every((s) => s.horizontalSpacing === spacingVal)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                    }`}
                    title={`모든 지보단 버팀보 수평간격을 ${spacingVal}m로 일괄 설정`}
                  >
                    @{spacingVal.toFixed(1)}m
                  </button>
                ))}
                <span className="text-[10px] text-slate-500 ml-auto hidden sm:inline">
                  * 간격을 줄이면(e.g. 4m→3m) 버팀보 축력 및 응력비가 25% 감소하여 OK 개선
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {struts.map((s, idx) => (
                <div key={s.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-700">{s.tier}단 지보공</span>
                      <span className="text-[11px] text-slate-500 font-mono">(GL -{s.depth}m)</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono font-bold">
                        Sh = {s.horizontalSpacing}m
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteStrut(idx)}
                      disabled={struts.length <= 1}
                      className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Spec Selectors for this Strut Tier */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                        버팀보 자재 규격 선택 (Strut Spec)
                      </label>
                      <select
                        value={STRUT_SPECS.find((spec) => spec.name === s.specName)?.id || 'strut-h-300-305'}
                        onChange={(e) => handleSelectStrutSpec(idx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-[11px] font-semibold"
                      >
                        {STRUT_SPECS.map((sp) => (
                          <option key={sp.id} value={sp.id}>
                            {sp.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                        띠장 자재 규격 선택 (Wale Spec)
                      </label>
                      <select
                        value={WALE_SPECS.find((w) => w.name === s.waleSpecName)?.id || 'wale-2h-300-305'}
                        onChange={(e) => handleSelectWaleSpec(idx, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-[11px] font-semibold"
                      >
                        {WALE_SPECS.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 items-end">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">설치심도 GL - (m)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={s.depth}
                        onChange={(e) => handleStrutChange(idx, 'depth', parseFloat(e.target.value) || 2)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                        <span className="font-bold text-blue-900">수평간격 Sh (m)</span>
                        <div className="flex items-center gap-0.5 font-mono">
                          <button
                            type="button"
                            onClick={() => handleStrutChange(idx, 'horizontalSpacing', Math.max(1.0, Math.round((s.horizontalSpacing - 0.5) * 10) / 10))}
                            className="px-1 py-0.2 bg-slate-200 hover:bg-slate-300 rounded text-[9px] font-bold"
                            title="0.5m 감소"
                          >
                            -0.5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStrutChange(idx, 'horizontalSpacing', Math.round((s.horizontalSpacing + 0.5) * 10) / 10)}
                            className="px-1 py-0.2 bg-slate-200 hover:bg-slate-300 rounded text-[9px] font-bold"
                            title="0.5m 증가"
                          >
                            +0.5
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="10.0"
                          value={s.horizontalSpacing}
                          onChange={(e) =>
                            handleStrutChange(idx, 'horizontalSpacing', parseFloat(e.target.value) || 3.0)
                          }
                          className="w-full bg-white border border-blue-300 rounded px-1.5 py-1 text-blue-900 font-mono font-bold text-[11px] focus:ring-1 focus:ring-blue-500"
                        />
                        <select
                          value={[2.0, 2.5, 3.0, 3.5, 4.0, 5.0].includes(s.horizontalSpacing) ? s.horizontalSpacing : 'CUSTOM'}
                          onChange={(e) => {
                            if (e.target.value !== 'CUSTOM') {
                              handleStrutChange(idx, 'horizontalSpacing', parseFloat(e.target.value));
                            }
                          }}
                          className="bg-white border border-slate-200 rounded py-1 px-0.5 text-[10px] text-slate-600 font-mono"
                          title="자주 쓰이는 표준 설치간격 프리셋"
                        >
                          <option value="CUSTOM">선택</option>
                          <option value={2.0}>@2.0m</option>
                          <option value={2.5}>@2.5m</option>
                          <option value={3.0}>@3.0m</option>
                          <option value={3.5}>@3.5m</option>
                          <option value={4.0}>@4.0m</option>
                          <option value={5.0}>@5.0m</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">초기 Preload (tonf)</span>
                      <input
                        type="number"
                        step="5"
                        value={s.preloadTon}
                        onChange={(e) => handleStrutChange(idx, 'preloadTon', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-medium">중간말뚝 유무</span>
                      <select
                        value={s.hasCenterPost ? 'true' : 'false'}
                        onChange={(e) => handleStrutChange(idx, 'hasCenterPost', e.target.value === 'true')}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 text-[11px]"
                      >
                        <option value="true">설치 (좌굴장 1/2)</option>
                        <option value="false">미설치 (전폭 지간)</option>
                      </select>
                    </div>
                  </div>

                  {/* Jack & Bracing Details for this tier */}
                  <div className="bg-white p-2 rounded border border-slate-200 text-[10px] text-slate-600 flex flex-wrap items-center justify-between gap-1">
                    <div>
                      <span className="font-semibold text-slate-800">유압잭/쐐기: </span>
                      <span>스크류잭 1,000kN (100tonf) / 화타쐐기 K-1</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">보강/가새: </span>
                      <span>L-90×90×10 / ㄷ-380×100 연결</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: BOQ and Full Material Specifications Matrix */}
        {activeTab === 'BOQ' && (
          <div className="space-y-4">
            {/* Header Action Banner */}
            <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-slate-50 p-3.5 rounded border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <PackageCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-xs">
                    첨부 내역서(총계약 내역) 자재 규격 일괄 적용
                  </span>
                  <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    KDS 연동
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  엄지말뚝 <span className="font-bold text-blue-800">H-300×305×15×15 (SM355)</span>, 띠장 <span className="font-bold text-blue-800">2H-300×305</span>, 버팀보 <span className="font-bold text-blue-800">H-300×305</span>, <span className="font-bold text-blue-800">스크류잭 1,000kN</span>, <span className="font-bold text-blue-800">토류판 T=6cm / T=1.2mm</span> 및 <span className="font-bold text-blue-800">보강재 L-90/ㄷ-380</span>를 모델링에 즉시 반영합니다.
                </p>
              </div>
              <button
                onClick={handleApplyFullAttachedSpecs}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>내역서 규격 모델링에 전체 적용</span>
              </button>
            </div>

            {/* Structural Material Spec Summary Cards */}
            <div className="space-y-1.5">
              <div className="font-bold text-slate-800 text-xs">■ 주요 가시설 자재 규격 상세 (도면 및 내역서)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Card 1: H-Pile */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5">
                  <div className="font-bold text-blue-900 text-[11px] flex items-center justify-between">
                    <span>1. 흙막이 엄지말뚝 (H-Pile)</span>
                    <span className="text-[10px] text-blue-600 font-mono">D500mm 천공</span>
                  </div>
                  <ul className="text-[11px] text-slate-700 space-y-1">
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-300×305×15×15 (SM355):</span>
                      <span className="font-mono">Zx=1,470cm³, 106.0kg/m</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-440×300×11×18 (SM355):</span>
                      <span className="font-mono">Zx=2,550cm³, 124.0kg/m</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-700×300×13×24 (SM355):</span>
                      <span className="font-mono">Zx=5,760cm³, 185.0kg/m</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-250×250×9×14 (SS275):</span>
                      <span className="font-mono">Zx=864cm³, 72.4kg/m</span>
                    </li>
                  </ul>
                </div>

                {/* Card 2: Wale & Strut */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5">
                  <div className="font-bold text-blue-900 text-[11px] flex items-center justify-between">
                    <span>2. 띠장(Wale) & 버팀보(Strut)</span>
                    <span className="text-[10px] text-blue-600 font-mono">잭 1000kN</span>
                  </div>
                  <ul className="text-[11px] text-slate-700 space-y-1">
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 2H-300×305 2련 띠장:</span>
                      <span className="font-mono">Z=2,940cm³, C-1 / D-1</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-300×305 버팀보:</span>
                      <span className="font-mono">한면제작, S-2 연결</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 스크류잭 / 화타쐐기:</span>
                      <span className="font-mono">스크류잭 1000kN, K-1/K-2</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 띠장 보걸이 브라켓:</span>
                      <span className="font-mono">O-1/O-2 (H300), O-5/O-6 (H250)</span>
                    </li>
                  </ul>
                </div>

                {/* Card 3: Reinforcement & Bracing */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5">
                  <div className="font-bold text-blue-900 text-[11px] flex items-center justify-between">
                    <span>3. 보강재 & 브레이싱 (Bracing)</span>
                    <span className="text-[10px] text-blue-600 font-mono">형강류</span>
                  </div>
                  <ul className="text-[11px] text-slate-700 space-y-1">
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• ㄷ-형강 (F-1 TYPE):</span>
                      <span className="font-mono">ㄷ-380×100×10.5×16mm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• L-형강 (G-2 TYPE):</span>
                      <span className="font-mono">L-90×90×10mm (수평/사재 가새)</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 버팀보 보강재 (B TYPE):</span>
                      <span className="font-mono">B-4, B-5, B-6 TYPE</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• U볼트 / 스티프너:</span>
                      <span className="font-mono">U-1(H+ㄷ), U-6(ㄷ+ㄷ), I-1</span>
                    </li>
                  </ul>
                </div>

                {/* Card 4: Deck, Lagging & Grouting */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5">
                  <div className="font-bold text-blue-900 text-[11px] flex items-center justify-between">
                    <span>4. 복공·주형보 / 토류판 / 차수</span>
                    <span className="text-[10px] text-blue-600 font-mono">시공재</span>
                  </div>
                  <ul className="text-[11px] text-slate-700 space-y-1">
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 도로 복공판:</span>
                      <span className="font-mono">H형 2000×1000×200mm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 주형보 침보:</span>
                      <span className="font-mono">외측(A-1 H300), 중앙(B-1 H440)</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 토류판 (Lagging):</span>
                      <span className="font-mono">목재 T=6cm / 강재 T=1.2mm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 차수 그라우팅:</span>
                      <span className="font-mono">D1,000 × C.T.C 800mm (1:15)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Full Attached BOQ Table with Search & Category Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-slate-800 text-xs">
                  ■ 첨부 공사비 내역서 항목별 규격 및 단가표 ({filteredBoq.length}건)
                </div>
                <div className="flex items-center space-x-2">
                  {/* Category Filter */}
                  <select
                    value={selectedBoqCategory}
                    onChange={(e) => setSelectedBoqCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-medium"
                  >
                    {boqCategories.map((c) => (
                      <option key={c} value={c}>
                        {c === 'ALL' ? '전체 공종' : c}
                      </option>
                    ))}
                  </select>
                  {/* Search Box */}
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      placeholder="규격/공종 검색..."
                      value={boqSearch}
                      onChange={(e) => setBoqSearch(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded pl-6 pr-2 py-1 text-[11px] w-36 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="overflow-x-auto max-h-[220px]">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-1.5 pl-2.5">공종 코드</th>
                        <th className="p-1.5">공종명</th>
                        <th className="p-1.5">상세 규격</th>
                        <th className="p-1.5 text-center">단위</th>
                        <th className="p-1.5 text-right">수량</th>
                        <th className="p-1.5 text-right">단가(원)</th>
                        <th className="p-1.5 text-right pr-2.5">금액(원)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBoq.map((b) => (
                        <tr key={b.code} className="hover:bg-slate-50">
                          <td className="p-1.5 pl-2.5 font-mono text-slate-500 text-[10px]">{b.code}</td>
                          <td className="p-1.5 font-medium text-slate-900">{b.name}</td>
                          <td className="p-1.5 font-mono text-slate-700">{b.spec}</td>
                          <td className="p-1.5 text-center font-mono text-slate-500">{b.unit}</td>
                          <td className="p-1.5 text-right font-mono text-slate-800">
                            {b.quantity.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                          </td>
                          <td className="p-1.5 text-right font-mono text-slate-600">
                            {b.unitPrice > 0 ? b.unitPrice.toLocaleString() : '-'}
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold text-slate-900 pr-2.5">
                            {b.totalPrice > 0 ? b.totalPrice.toLocaleString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

