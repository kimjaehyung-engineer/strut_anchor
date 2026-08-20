import React, { useState, useEffect } from 'react';
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
  Building2,
  BookOpen,
  Eye,
  Anchor,
  Layers3,
  SlidersHorizontal,
  ArrowRight,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { MaterialVisualGuideModal } from './MaterialVisualGuideModal';
import { StationLayoutViewer } from './StationLayoutViewer';
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
  onOpenAnchorComparison?: () => void;
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
  onOpenAnchorComparison,
}) => {
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVED'>('IDLE');
  const [soilSaveStatus, setSoilSaveStatus] = useState<'IDLE' | 'SAVED'>('IDLE');

  const handleSaveSoilData = () => {
    try {
      onUpdateLayers([...layers]);
      localStorage.setItem(
        'STRUT_ANCHOR_SOIL_LAYERS',
        JSON.stringify({
          layers,
          savedAt: new Date().toISOString(),
        })
      );
      setSoilSaveStatus('SAVED');
      setTimeout(() => {
        setSoilSaveStatus('IDLE');
      }, 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAllSettings = () => {
    try {
      const syncedSettings: ProjectSettings = {
        ...settings,
        stationLength: settings.stationLength || 100,
        stationWidth: settings.stationWidth || 20,
        finalExcavationDepth: settings.finalExcavationDepth || 35.5,
        storyCount: settings.storyCount || 4,
        deckWidth: (settings.stationWidth || 20) + 2.0,
        excavationWidth: (settings.stationWidth || 20) + 1.5,
      };

      const syncedWall: WallSection = {
        ...wall,
        totalLength: (syncedSettings.finalExcavationDepth || 22) + 6.0,
      };

      onUpdateSettings(syncedSettings);
      onUpdateWall(syncedWall);

      localStorage.setItem(
        'STRUT_ANCHOR_ENGINEERING_DATA',
        JSON.stringify({
          settings: syncedSettings,
          layers,
          wall: syncedWall,
          struts,
          savedAt: new Date().toISOString(),
        })
      );

      setSaveStatus('SAVED');
      setTimeout(() => {
        setSaveStatus('IDLE');
      }, 5000);
    } catch (e) {
      console.error(e);
    }
  };
  const [activeTab, setActiveTab] = useState<'PROJECT' | 'UTILITIES' | 'SOIL' | 'SPECS'>('PROJECT');
  const [isVisualGuideOpen, setIsVisualGuideOpen] = useState<boolean>(false);
  const [selectedGuideMember, setSelectedGuideMember] = useState<string>('OVERVIEW');

  // Strut Tier Helpers
  const handleUpdateStrut = (index: number, field: keyof StrutTier, value: any) => {
    const updated = [...struts];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateStruts(updated);
  };

  const handleUpdateStrutAnchorConfig = (index: number, field: keyof NonNullable<StrutTier['anchorConfig']>, value: any) => {
    const updated = [...struts];
    const currentConfig = updated[index].anchorConfig || {
      anchorsBetweenStruts: 3,
      strandCount: 4,
      anchorAngle: 20,
      anchorLoadRatio: 0.65,
      anchorPreloadTon: 35,
      strutSpacing: 10.0,
    };
    updated[index] = {
      ...updated[index],
      anchorConfig: {
        ...currentConfig,
        [field]: value,
      },
    };
    onUpdateStruts(updated);
  };

  const handleAddStrut = () => {
    const lastStrut = struts[struts.length - 1];
    const nextDepth = lastStrut ? lastStrut.depth + 2.5 : 2.0;
    const nextTierNum = struts.length + 1;
    const newStrut: StrutTier = {
      id: `strut-tier-${nextTierNum}-${Date.now()}`,
      tier: nextTierNum,
      depth: nextDepth,
      type: 'HYBRID',
      specName: 'H-300×300×10×15 (SM355)',
      horizontalSpacing: 10.0,
      excavationWidth: settings.stationWidth || 20.0,
      hasCenterPost: true,
      preloadTon: 30.0,
      crossSectionAreaA: 118.4,
      momentOfInertiaI: 20400,
      elasticModulusE: 200000,
      allowableAxialStress: 140.0,
      waleSpecName: '2H-300×300×10×15',
      waleZ: 2720,
      waleAllowableBending: 140.0,
      installedAtStep: nextTierNum + 1,
      anchorConfig: {
        anchorsBetweenStruts: 3,
        strandCount: 4,
        anchorAngle: 20,
        anchorLoadRatio: 0.65,
        anchorPreloadTon: 35.0,
        strutSpacing: 10.0,
      },
    };
    onUpdateStruts([...struts, newStrut]);
  };

  const handleDeleteStrut = (index: number) => {
    if (struts.length <= 1) return;
    const updated = struts.filter((_, i) => i !== index).map((s, i) => ({ ...s, tier: i + 1 }));
    onUpdateStruts(updated);
  };

  // Soil Layer Helpers (하단 심도 변경 시 다음 층 상단 심도 자동 동기화)
  const handleSoilChange = (index: number, field: keyof SoilLayer, value: any) => {
    const updated = [...layers];
    updated[index] = { ...updated[index], [field]: value };
    // 하단 심도 변경 → 다음 층 상단 심도 자동 일치
    if (field === 'depthBottom' && index < updated.length - 1) {
      updated[index + 1] = { ...updated[index + 1], depthTop: value as number };
    }
    // 상단 심도 변경 → 이전 층 하단 심도 자동 일치
    if (field === 'depthTop' && index > 0) {
      updated[index - 1] = { ...updated[index - 1], depthBottom: value as number };
    }
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

  // Utilities Helpers
  const utilities = settings.utilities || [
    { id: 'util-gas', name: '도시가스관 (D300)', type: 'GAS', depth: 3.2, offsetFromWall: 2.5, diameterMm: 300, color: '#eab308' },
    { id: 'util-water', name: '상수도 본관 (D500)', type: 'WATER', depth: 3.8, offsetFromWall: 6.5, diameterMm: 500, color: '#0284c7' },
    { id: 'util-telecom', name: '통신 광케이블 (D150)', type: 'TELECOM', depth: 3.0, offsetFromWall: 13.5, diameterMm: 150, color: '#10b981' },
    { id: 'util-power', name: '한전 지중전력구 (D250)', type: 'POWER', depth: 4.5, offsetFromWall: 17.0, diameterMm: 250, color: '#ef4444' },
  ];

  const handleUpdateUtility = (index: number, field: string, value: any) => {
    const updated = [...utilities];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateSettings({ ...settings, utilities: updated });
  };

  const handleAddUtility = () => {
    const newUtil = {
      id: `util-${Date.now()}`,
      name: '신규 지장물 (D200)',
      type: 'SEWER' as const,
      depth: 3.5,
      offsetFromWall: 10.0,
      diameterMm: 200,
      color: '#8b5cf6',
    };
    onUpdateSettings({ ...settings, utilities: [...utilities, newUtil] });
  };

  const handleDeleteUtility = (index: number) => {
    const updated = utilities.filter((_, i) => i !== index);
    onUpdateSettings({ ...settings, utilities: updated });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col flex-1">
      {/* Tab Navigation */}
      <div className="bg-slate-100/90 px-3 py-2 border-b border-slate-200 flex items-center space-x-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PROJECT')}
          className={`px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
            activeTab === 'PROJECT'
              ? 'bg-blue-600 text-white shadow-sm font-bold ring-2 ring-blue-400/40 opacity-100'
              : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80 font-medium opacity-65 hover:opacity-90'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>1. 정거장 제원·하중</span>
        </button>
        <button
          onClick={() => setActiveTab('UTILITIES')}
          className={`px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
            activeTab === 'UTILITIES'
              ? 'bg-amber-600 text-white shadow-sm font-bold ring-2 ring-amber-400/40 opacity-100'
              : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80 font-medium opacity-65 hover:opacity-90'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>2. 지하 지장물 매설 ({utilities.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('SOIL')}
          className={`px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
            activeTab === 'SOIL'
              ? 'bg-emerald-600 text-white shadow-sm font-bold ring-2 ring-emerald-400/40 opacity-100'
              : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80 font-medium opacity-65 hover:opacity-90'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. 지층 및 토질 ({layers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('SPECS')}
          className={`px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0 ${
            activeTab === 'SPECS'
              ? 'bg-indigo-600 text-white shadow-sm font-bold ring-2 ring-indigo-400/40 opacity-100'
              : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80 font-medium opacity-65 hover:opacity-90'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>4. 가시설 자재 도감</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5 text-xs text-slate-700 flex-1">
        {/* Tab 1: Project Settings */}
        {activeTab === 'PROJECT' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left Column: Station CAD Layout Diagram (그림은 왼쪽) */}
            <div className="lg:col-span-6 space-y-3">
              <StationLayoutViewer
                settings={settings}
                layers={layers}
              />
            </div>

            {/* Right Column: All Input Parameter Controls (나머지는 오른쪽) */}
            <div className="lg:col-span-6 space-y-3.5">
              {/* 💾 [상단] 제원 설정 저장 및 1·2·3안 정거장 정보 일괄 적용 버튼 */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-3 sm:p-3.5 rounded-xl text-white shadow-md flex flex-wrap items-center justify-between gap-2.5 border border-blue-400/40">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-xs">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm leading-tight text-white flex items-center gap-1.5">
                      <span>정거장 제원 설정 저장 & 1·2·3안 자동 연동</span>
                      <span className="px-1.5 py-0.2 bg-yellow-400 text-slate-950 font-black text-[10px] rounded">저장 필수</span>
                    </h4>
                    <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                      폭 B={settings.stationWidth}m, 연장 L={settings.stationLength ?? 100}m, 심도 H={settings.finalExcavationDepth}m가 1·2·3안에 즉시 입력됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleSaveAllSettings}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 rounded-lg font-black text-xs sm:text-sm flex items-center space-x-1.5 shadow-md transition cursor-pointer border border-yellow-200"
                  >
                    <span>💾 제원 저장 (1·2·3안 일괄 적용)</span>
                  </button>
                  {onOpenAnchorComparison && (
                    <button
                      type="button"
                      onClick={onOpenAnchorComparison}
                      className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-xs flex items-center space-x-1 border border-white/30 transition cursor-pointer"
                    >
                      <Anchor className="w-3.5 h-3.5 text-sky-300" />
                      <span>1·2·3안 공법비교</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {saveStatus === 'SAVED' && (
                <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-xs">✓</div>
                    <div>
                      <strong>제원 저장 완료!</strong> 정거장 폭 <strong>B={settings.stationWidth}m</strong>, 연장 <strong>L={settings.stationLength ?? 100}m</strong>, 굴착심도 <strong>H={settings.finalExcavationDepth}m</strong> (지하 {settings.storyCount ?? 2}층) 정보가 <strong>1안(버팀보) · 2안(어스앵커) · 3안(복합공법)</strong>에 실시간 입력치로 일괄 반영되었습니다.
                    </div>
                  </div>
                  {onOpenAnchorComparison && (
                    <button
                      type="button"
                      onClick={onOpenAnchorComparison}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-black text-xs cursor-pointer shadow-2xs"
                    >
                      👉 1·2·3안 공법비교 바로보기
                    </button>
                  )}
                </div>
              )}

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

            {/* Station Excavation & Structure Dimensions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-blue-50/40 p-3 rounded-lg border border-blue-200/60">
              <div>
                <label className="block text-slate-600 font-bold mb-1">정거장 구조물 폭 B (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.stationWidth}
                  onChange={(e) => {
                    const newWidth = parseFloat(e.target.value) || 20;
                    onUpdateSettings({
                      ...settings,
                      stationWidth: newWidth,
                      deckWidth: newWidth + 2.0,
                      excavationWidth: newWidth + 1.5,
                    });
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">정거장 연장 L (m)</label>
                <input
                  type="number"
                  step="5"
                  value={settings.stationLength ?? 100}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      stationLength: parseFloat(e.target.value) || 100,
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">최종 굴착심도 H (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.finalExcavationDepth}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      finalExcavationDepth: parseFloat(e.target.value) || 22,
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">지하수위 GWT (-m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.groundWaterTable}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      groundWaterTable: parseFloat(e.target.value) || 4.5,
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sky-700 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Station Story Count (층수) Quick Selector */}
            <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>지하정거장 구조물 층수(Story) 선정</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  현재: 지하 {settings.storyCount ?? 2}층 구조
                </span>
              </div>

              {/* 6 Story Preset Buttons (1F to 6F) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  {
                    stories: 1,
                    label: '지하 1층형',
                    sub: '단층 통합',
                    desc: '대합실+승강장',
                    height: 8.0,
                    depth: (settings.topCoverDepth ?? 7.5) + 8.0,
                  },
                  {
                    stories: 2,
                    label: '지하 2층형',
                    sub: '표준 정거장★',
                    desc: 'B1 대합실 / B2 승강장',
                    height: 14.5,
                    depth: (settings.topCoverDepth ?? 7.5) + 14.5,
                  },
                  {
                    stories: 3,
                    label: '지하 3층형',
                    sub: '환승·심도',
                    desc: '대합실/환승/승강장',
                    height: 21.0,
                    depth: (settings.topCoverDepth ?? 7.5) + 21.0,
                  },
                  {
                    stories: 4,
                    label: '지하 4층형',
                    sub: '복합 환승역',
                    desc: '상가/1호선/환승/2호선',
                    height: 28.0,
                    depth: (settings.topCoverDepth ?? 7.5) + 28.0,
                  },
                  {
                    stories: 5,
                    label: '지하 5층형',
                    sub: '대심도 급행',
                    desc: '대합실/도시철도/급행',
                    height: 35.0,
                    depth: (settings.topCoverDepth ?? 7.5) + 35.0,
                  },
                  {
                    stories: 6,
                    label: '지하 6층형',
                    sub: '초대심도 GTX',
                    desc: '상가/지하철/환승/GTX',
                    height: 42.0,
                    depth: (settings.topCoverDepth ?? 7.5) + 42.0,
                  },
                ].map((item) => (
                  <button
                    key={`story-btn-${item.stories}`}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({
                        ...settings,
                        storyCount: item.stories,
                        structureHeight: item.height,
                        finalExcavationDepth: item.depth,
                      });
                    }}
                    className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                      (settings.storyCount ?? 2) === item.stories
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{item.label}</span>
                        <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                          (settings.storyCount ?? 2) === item.stories ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 font-semibold'
                        }`}>
                          {item.height}m
                        </span>
                      </div>
                      <span className={`text-[10px] font-medium block ${
                        (settings.storyCount ?? 2) === item.stories ? 'text-indigo-200' : 'text-indigo-600'
                      }`}>
                        {item.sub}
                      </span>
                    </div>
                    <span className={`text-[9.5px] mt-1 block truncate ${
                      (settings.storyCount ?? 2) === item.stories ? 'text-indigo-100' : 'text-slate-500'
                    }`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Underground Station Structure Box Height & Top Cover (Overburden) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-indigo-50/50 p-3 rounded-lg border border-indigo-200/70">
              <div>
                <label className="block text-indigo-950 font-bold mb-1">
                  지하정거장 본체 구조물 높이 (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.structureHeight ?? 14.5}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      structureHeight: parseFloat(e.target.value) || 14.5,
                    })
                  }
                  className="w-full bg-white border border-indigo-300 rounded px-2.5 py-1.5 text-indigo-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  지하 {settings.storyCount ?? 2}층 구조물 본체 높이
                </span>
              </div>
              <div>
                <label className="block text-indigo-950 font-bold mb-1">
                  지반~구조물 상단 높이 / 토피고 (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.topCoverDepth ?? 7.5}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      topCoverDepth: parseFloat(e.target.value) || 7.5,
                    })
                  }
                  className="w-full bg-white border border-indigo-300 rounded px-2.5 py-1.5 text-indigo-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">GL -7.5m에 상단 슬래브 위치</span>
              </div>
              <div>
                <label className="block text-indigo-950 font-bold mb-1">
                  상재하중 q (kN/m²)
                </label>
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
                  className="w-full bg-white border border-indigo-300 rounded px-2.5 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">도로교통 DB-24 하중</span>
              </div>
            </div>

            {/* Earth Pressure Theory & Road & Decking Width */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
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
                <label className="block text-slate-500 font-medium mb-1">상부 원도로 폭 (m)</label>
                <input
                  type="number"
                  step="1"
                  value={settings.roadWidth}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, roadWidth: parseFloat(e.target.value) || 32 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">도로 전체 폭 (예: 8차로 32m)</span>
              </div>

              <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200/80">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-amber-950 font-bold text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>도로 복공판 설치폭 (m)</span>
                  </label>
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-mono">
                    자동산정
                  </span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  value={settings.deckWidth ?? (settings.stationWidth + 2.0)}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, deckWidth: parseFloat(e.target.value) || (settings.stationWidth + 2.0) })
                  }
                  className="w-full bg-white border border-amber-300 rounded px-2.5 py-1 text-amber-950 font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                />
                <span className="text-[9.5px] text-amber-800 mt-0.5 block font-medium">
                  구조물({settings.stationWidth}m) + 여유(2.0m) = {(settings.deckWidth ?? (settings.stationWidth + 2.0)).toFixed(1)}m
                </span>
              </div>
            </div>

            {/* Center King Post & Road Deck Girder Parameters with Structural Calculation */}
            {(() => {
              const spacing = settings.centerPost?.spacing || 4.0;
              const girderSpecName = settings.centerPost?.deckGirderSpec || 'H-400×400×13×21 (SM355)';
              const postSpecName = settings.centerPost?.specName || 'H-300×300×10×15 (SM355)';
              const bStruct = settings.stationWidth || 20.0;
              const qTraffic = settings.surchargeLoad || 12.0;

              // 1. Deck Girder Structural Analysis (DB-24 Load on Girder Span)
              const girder = DECK_GIRDER_SPECS.find((g) => g.name === girderSpecName) || DECK_GIRDER_SPECS[0];
              const spanM = spacing; // Girder longitudinal span
              // DB-24 Wheel Load P = 96 kN (Rear wheel), Dead Load w = 15 kN/m
              const mDead = (15.0 * spanM * spanM) / 8.0;
              const mLive = (96.0 * spanM) / 4.0 * 1.3; // with impact
              const mTotal = mDead + mLive; // kN*m
              const sigmaGirder = (mTotal * 1e6) / (girder.sectionModulusZ * 1e3); // MPa
              const fbaGirder = 140.0; // MPa allowable bending stress
              const urGirder = sigmaGirder / fbaGirder;

              // 2. Center Post Axial Bearing Load Analysis (Tributary Area)
              const tribArea = spacing * (bStruct / 2.0); // m²
              const pAxial = tribArea * (qTraffic + 18.0); // kN (Total Vertical Load)
              const qaPost = 1850.0; // kN (Allowable Rock Socket Bearing Capacity)
              const urPost = pAxial / qaPost;

              // 3. Recommended Optimal Spacing Calculation
              const calcOptimalSpacing = () => {
                // Find maximum spacing where urGirder <= 0.85 and urPost <= 0.85
                for (let s = 4.5; s >= 2.0; s -= 0.5) {
                  const sDead = (15.0 * s * s) / 8.0;
                  const sLive = (96.0 * s) / 4.0 * 1.3;
                  const sSigma = ((sDead + sLive) * 1e6) / (girder.sectionModulusZ * 1e3);
                  const sAxial = s * (bStruct / 2.0) * (qTraffic + 18.0);
                  if (sSigma / fbaGirder <= 0.88 && sAxial / qaPost <= 0.88) {
                    return s;
                  }
                }
                return 2.5;
              };

              const optimalSpacing = calcOptimalSpacing();

              return (
                <div className="pt-3 border-t border-slate-200 space-y-2.5 bg-amber-50/50 p-3 rounded-lg border border-amber-200/70">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      <span>복공 주형보(Girder) 및 중간말뚝 (Center King Post) 구조설계</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSettings({
                          ...settings,
                          centerPost: {
                            ...(settings.centerPost || ({} as any)),
                            spacing: optimalSpacing,
                          },
                        });
                      }}
                      className="text-[10px] font-bold text-amber-800 bg-amber-200/80 hover:bg-amber-300 px-2 py-0.5 rounded cursor-pointer transition flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>구조계산 최적간격 적용 ({optimalSpacing.toFixed(1)}m)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-slate-500 text-[11px] font-medium mb-1">복공 주형보(Girder) 규격</label>
                      <select
                        value={girderSpecName}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            centerPost: {
                              ...(settings.centerPost || ({} as any)),
                              deckGirderSpec: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono text-[11px]"
                      >
                        {DECK_GIRDER_SPECS.map((g) => (
                          <option key={g.id} value={g.name}>
                            {g.name} (Zx={g.sectionModulusZ}cm³)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 text-[11px] font-medium mb-1">중간말뚝 H형강 규격</label>
                      <select
                        value={postSpecName}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            centerPost: {
                              ...(settings.centerPost || ({} as any)),
                              specName: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono text-[11px]"
                      >
                        {CENTER_POST_SPECS.map((cp) => (
                          <option key={cp.id} value={cp.name}>
                            {cp.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 text-[11px] font-medium mb-1">말뚝 종방향 설치간격 (m)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={spacing}
                        onChange={(e) =>
                          onUpdateSettings({
                            ...settings,
                            centerPost: {
                              ...(settings.centerPost || ({} as any)),
                              spacing: parseFloat(e.target.value) || 4.0,
                            },
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono text-[11px] font-bold"
                      />
                    </div>
                  </div>

                  {/* Structural Safety Matrix Verification Bar */}
                  <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10.5px]">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 block font-medium">주형보 휨응력 (DB-24 하중)</span>
                      <div className="font-mono font-bold flex items-center gap-1.5">
                        <span className={urGirder <= 1.0 ? 'text-emerald-700' : 'text-rose-600'}>
                          σb = {sigmaGirder.toFixed(1)} MPa ({Math.round(urGirder * 100)}%)
                        </span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          urGirder <= 1.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {urGirder <= 1.0 ? 'OK' : 'NG (응력초과)'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-400 block font-medium">중간말뚝 연직 축하중 (Qa=1850kN)</span>
                  <div className="font-mono font-bold flex items-center gap-1.5">
                        <span className={urPost <= 1.0 ? 'text-emerald-700' : 'text-rose-600'}>
                          Pv = {pAxial.toFixed(0)} kN ({Math.round(urPost * 100)}%)
                        </span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          urPost <= 1.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {urPost <= 1.0 ? 'OK' : 'NG (지지력부족)'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-1 sm:pt-0">
                      <span className="text-slate-400 block font-medium">지간당 분담 복공면적</span>
                      <div className="font-mono font-bold text-slate-800">
                        {tribArea.toFixed(1)} m² <span className="text-[10px] text-slate-400 font-normal">({(bStruct / 2).toFixed(1)}m × {spacing}m)</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Guide Note for Alternative Support Comparison */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  1안(전구간 버팀보), 2안(어스앵커), 3안(광간격 복합공법)의 단별 지보공 설계는 <strong>[🎯 1·2·3안 공법비교]</strong>에서 독립적으로 최적화됩니다.
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

        {/* Tab: Supports Management (단별 개별 지지 방식 지정: 스트럿 / 앵커 / 3안 복합공법) */}
        {activeTab === 'SUPPORTS' && (
          <div className="space-y-4">
            {/* Header & Quick Multi-tier Preset Buttons */}
            <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 p-3.5 rounded-lg border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    단수별(Tier-by-Tier) 지지 방식 및 세부 제원 독립 설정
                  </span>
                  <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    실시간 역학 연동
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  설계자가 직접 각 단마다 <strong className="text-blue-700">스트럿 전용(1안)</strong>, <strong className="text-amber-700">앵커 전용(2안)</strong>, <strong className="text-purple-700">광간격 복합(3안)</strong>을 선택하고 간격과 제원을 튜닝합니다.
                </p>
              </div>

              {/* Quick Template Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    // 3안 복합공법 표준 템플릿 일괄 적용 (1단: 스트럿 10m, 2~N단: 3안 복합 10m+3공)
                    const updated = struts.map((s, idx) => {
                      if (idx === 0) {
                        return {
                          ...s,
                          type: 'H_BEAM' as StrutType,
                          specName: 'H-300×300×10×15 (SM355)',
                          horizontalSpacing: 10.0,
                          preloadTon: 30.0,
                          hasCenterPost: true,
                          waleSpecName: '2H-300×300×10×15',
                          waleZ: 2720,
                        };
                      }
                      return {
                        ...s,
                        type: 'HYBRID' as StrutType,
                        specName: 'H-300×300×10×15 (SM355)',
                        horizontalSpacing: 10.0,
                        preloadTon: 30.0,
                        hasCenterPost: true,
                        waleSpecName: '2H-350×350×12×19',
                        waleZ: 4080,
                        anchorConfig: {
                          anchorsBetweenStruts: 3,
                          strandCount: 4,
                          anchorAngle: 20,
                          anchorLoadRatio: 0.65,
                          anchorPreloadTon: 35.0,
                          strutSpacing: 10.0,
                        },
                      };
                    });
                    onUpdateStruts(updated);
                  }}
                  className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                  title="1단 스트럿 + 2~4단 3안 복합공법 일괄 적용"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  <span>★ 3안 복합 표준조합 일괄적용</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // 1안 전구간 스트럿 일괄 적용 (4.0m 일반간격)
                    const updated = struts.map((s) => ({
                      ...s,
                      type: 'H_BEAM' as StrutType,
                      specName: 'H-300×300×10×15 (SM355)',
                      horizontalSpacing: 4.0,
                      preloadTon: 30.0,
                      hasCenterPost: true,
                      waleSpecName: '2H-300×300×10×15',
                      waleZ: 2720,
                    }));
                    onUpdateStruts(updated);
                  }}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <span>1안 스트럿(4m)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // 2안 전구간 앵커 일괄 적용 (2.0m 간격)
                    const updated = struts.map((s) => ({
                      ...s,
                      type: 'GROUND_ANCHOR' as StrutType,
                      horizontalSpacing: 2.0,
                      preloadTon: 35.0,
                      waleSpecName: '2H-300×300×10×15',
                      waleZ: 2720,
                      anchorConfig: {
                        strandCount: 4,
                        anchorAngle: 20,
                        anchorPreloadTon: 35.0,
                      },
                    }));
                    onUpdateStruts(updated);
                  }}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <span>2안 앵커(2m)</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddStrut}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>단 추가</span>
                </button>
              </div>
            </div>

            {/* List of Tiers */}
            <div className="space-y-3">
              {struts.map((strut, idx) => {
                const isHybrid = strut.type === 'HYBRID';
                const isAnchor = strut.type === 'GROUND_ANCHOR';
                const isStrutOnly = strut.type === 'H_BEAM' || strut.type === 'PIPE_STRUT';
                const config = strut.anchorConfig || {
                  anchorsBetweenStruts: 3,
                  strandCount: 4,
                  anchorAngle: 20,
                  anchorLoadRatio: 0.65,
                  anchorPreloadTon: 35.0,
                  strutSpacing: strut.horizontalSpacing || 10.0,
                };
                const calcAnchorSpacing = isHybrid
                  ? Math.round((strut.horizontalSpacing / ((config.anchorsBetweenStruts || 3) + 1)) * 100) / 100
                  : strut.horizontalSpacing;

                return (
                  <div
                    key={strut.id || idx}
                    className={`p-3.5 rounded-lg border transition space-y-3 ${
                      isHybrid
                        ? 'bg-purple-50/40 border-purple-200 shadow-2xs'
                        : isAnchor
                        ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                        : 'bg-blue-50/30 border-blue-200 shadow-2xs'
                    }`}
                  >
                    {/* Tier Top Header & Method Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                          isHybrid ? 'bg-purple-600' : isAnchor ? 'bg-amber-600' : 'bg-blue-600'
                        }`}>
                          {strut.tier}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>제{strut.tier}단 지보공</span>
                            <span className="text-[10px] text-slate-500 font-mono font-normal">
                              (설치심도: GL -{strut.depth.toFixed(1)}m / Step {strut.installedAtStep || strut.tier + 1})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Method Selector Segmented Buttons */}
                      <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateStrut(idx, 'type', 'H_BEAM');
                            if (strut.horizontalSpacing > 6) {
                              handleUpdateStrut(idx, 'horizontalSpacing', 4.0);
                            }
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                            isStrutOnly
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-blue-600'
                          }`}
                        >
                          <span>🟦 1안 버팀보</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateStrut(idx, 'type', 'GROUND_ANCHOR');
                            handleUpdateStrut(idx, 'horizontalSpacing', 2.0);
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                            isAnchor
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-600'
                          }`}
                        >
                          <span>🟧 2안 앵커</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateStrut(idx, 'type', 'HYBRID');
                            handleUpdateStrut(idx, 'horizontalSpacing', 10.0);
                            handleUpdateStrut(idx, 'waleSpecName', '2H-350×350×12×19');
                          }}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                            isHybrid
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-purple-600'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-purple-200" />
                          <span>🟪 ★ 3안 복합(광간격+앵커)</span>
                        </button>
                      </div>

                      {/* Delete button */}
                      {struts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteStrut(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition ml-auto sm:ml-0"
                          title="이 단 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      {/* Depth Setting */}
                      <div>
                        <label className="block text-slate-500 font-medium text-[11px] mb-1">설치 깊이 (GL -m)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={strut.depth}
                          onChange={(e) => handleUpdateStrut(idx, 'depth', parseFloat(e.target.value) || 1.5)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono font-bold"
                        />
                      </div>

                      {/* Case 1: STRUT ONLY */}
                      {isStrutOnly && (
                        <>
                          <div>
                            <label className="block text-slate-500 font-medium text-[11px] mb-1">버팀보 간격 (m)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={strut.horizontalSpacing}
                              onChange={(e) => handleUpdateStrut(idx, 'horizontalSpacing', parseFloat(e.target.value) || 4.0)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-500 font-medium text-[11px] mb-1">버팀보 규격</label>
                            <select
                              value={strut.specName}
                              onChange={(e) => {
                                const selected = STRUT_SPECS.find((s) => s.name === e.target.value) || STRUT_SPECS[0];
                                handleUpdateStrut(idx, 'specName', selected.name);
                                handleUpdateStrut(idx, 'crossSectionAreaA', selected.areaA);
                                handleUpdateStrut(idx, 'momentOfInertiaI', selected.momentOfInertiaI);
                              }}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono text-[11px]"
                            >
                              {STRUT_SPECS.map((s) => (
                                <option key={s.id} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-500 font-medium text-[11px] mb-1">선행하중 (Preload, tonf)</label>
                            <input
                              type="number"
                              step="5"
                              value={strut.preloadTon || 30.0}
                              onChange={(e) => handleUpdateStrut(idx, 'preloadTon', parseFloat(e.target.value) || 30.0)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono font-bold"
                            />
                          </div>
                        </>
                      )}

                      {/* Case 2: ANCHOR ONLY */}
                      {isAnchor && (
                        <>
                          <div>
                            <label className="block text-slate-500 font-medium text-[11px] mb-1">앵커 수평간격 (m)</label>
                            <input
                              type="number"
                              step="0.5"
                              value={strut.horizontalSpacing}
                              onChange={(e) => handleUpdateStrut(idx, 'horizontalSpacing', parseFloat(e.target.value) || 2.0)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono font-bold text-amber-900"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-500 font-medium text-[11px] mb-1">강선 가닥수 (SWPC 7B)</label>
                            <select
                              value={config.strandCount || 4}
                              onChange={(e) => handleUpdateStrutAnchorConfig(idx, 'strandCount', parseInt(e.target.value) || 4)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono text-[11px]"
                            >
                              <option value={3}>3가닥 (12.7mm, 허용 330kN)</option>
                              <option value={4}>4가닥 (12.7mm, 허용 440kN)</option>
                              <option value={5}>5가닥 (12.7mm, 허용 550kN)</option>
                              <option value={6}>6가닥 (12.7mm, 허용 660kN)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-500 font-medium text-[11px] mb-1">앵커 경사각 (θ, deg)</label>
                            <input
                              type="number"
                              step="5"
                              value={config.anchorAngle || 20}
                              onChange={(e) => handleUpdateStrutAnchorConfig(idx, 'anchorAngle', parseFloat(e.target.value) || 20)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 font-mono font-bold"
                            />
                          </div>
                        </>
                      )}

                      {/* Case 3: 3안 HYBRID (광간격 버팀보 + 사이 앵커) */}
                      {isHybrid && (
                        <>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-purple-900 font-bold text-[11px]">버팀보 광간격 (m)</label>
                              <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1 rounded">작업구</span>
                            </div>
                            <select
                              value={strut.horizontalSpacing}
                              onChange={(e) => handleUpdateStrut(idx, 'horizontalSpacing', parseFloat(e.target.value) || 10.0)}
                              className="w-full bg-white border border-purple-300 rounded px-2 py-1 text-purple-950 font-mono font-bold text-[11px]"
                            >
                              <option value={8.0}>8.0m (중간 장비구)</option>
                              <option value={10.0}>10.0m (★ 표준 대형 작업구)</option>
                              <option value={12.0}>12.0m (대형 광폭 지간)</option>
                              <option value={15.0}>15.0m (특수 장경간)</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-purple-900 font-bold text-[11px]">사이 앵커 수량</label>
                              <span className="text-[9px] font-mono text-purple-700 font-bold">
                                @{calcAnchorSpacing}m 간격
                              </span>
                            </div>
                            <select
                              value={config.anchorsBetweenStruts || 3}
                              onChange={(e) => handleUpdateStrutAnchorConfig(idx, 'anchorsBetweenStruts', parseInt(e.target.value) || 3)}
                              className="w-full bg-white border border-purple-300 rounded px-2 py-1 text-purple-950 font-mono font-bold text-[11px]"
                            >
                              <option value={2}>2공 (@{(strut.horizontalSpacing / 3).toFixed(2)}m 간격)</option>
                              <option value={3}>★ 3공 (@{(strut.horizontalSpacing / 4).toFixed(2)}m 간격)</option>
                              <option value={4}>4공 (@{(strut.horizontalSpacing / 5).toFixed(2)}m 간격)</option>
                              <option value={5}>5공 (@{(strut.horizontalSpacing / 6).toFixed(2)}m 간격)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-purple-900 font-medium text-[11px] mb-1">앵커 하중분담율</label>
                            <select
                              value={Math.round((config.anchorLoadRatio || 0.65) * 100)}
                              onChange={(e) => handleUpdateStrutAnchorConfig(idx, 'anchorLoadRatio', (parseFloat(e.target.value) || 65) / 100)}
                              className="w-full bg-white border border-purple-300 rounded px-2 py-1 text-purple-950 font-mono text-[11px]"
                            >
                              <option value={50}>50% (버팀보 50%)</option>
                              <option value={60}>60% (버팀보 40%)</option>
                              <option value={65}>★ 65% (버팀보 35% 최적)</option>
                              <option value={70}>70% (버팀보 30%)</option>
                              <option value={75}>75% (버팀보 25%)</option>
                            </select>
                          </div>
                        </>
                      )}

                      {/* Wale Specification (Common) */}
                      <div>
                        <label className="block text-slate-500 font-medium text-[11px] mb-1">띠장(Wale) 규격</label>
                        <select
                          value={strut.waleSpecName || (isHybrid ? '2H-350×350×12×19' : '2H-300×300×10×15')}
                          onChange={(e) => {
                            const selected = WALE_SPECS.find((w) => w.name === e.target.value) || WALE_SPECS[0];
                            handleUpdateStrut(idx, 'waleSpecName', selected.name);
                            handleUpdateStrut(idx, 'waleZ', selected.sectionModulusZ);
                            handleUpdateStrut(idx, 'waleAllowableBending', selected.allowableBendingStress);
                          }}
                          className={`w-full bg-white border rounded px-2 py-1 text-slate-800 font-mono text-[11px] ${
                            isHybrid ? 'border-purple-300 font-bold' : 'border-slate-200'
                          }`}
                        >
                          {WALE_SPECS.map((w) => (
                            <option key={w.id} value={w.name}>
                              {w.name} (Z={w.sectionModulusZ}cm³)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Live Summary Footer for this Tier */}
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">📌 단별 설계 요약:</span>
                        {isHybrid && (
                          <span className="text-purple-800 font-mono bg-purple-100 px-2 py-0.5 rounded font-bold">
                            10m 광간격 버팀보({Math.round((1 - (config.anchorLoadRatio || 0.65)) * 100)}%) + {config.anchorsBetweenStruts || 3}공 앵커({Math.round((config.anchorLoadRatio || 0.65) * 100)}%, @{calcAnchorSpacing}m) + {strut.waleSpecName} 띠장
                          </span>
                        )}
                        {isAnchor && (
                          <span className="text-amber-800 font-mono bg-amber-100 px-2 py-0.5 rounded font-bold">
                            전구간 앵커 @{strut.horizontalSpacing}m 간격 ({config.strandCount || 4}가닥, {config.anchorAngle || 20}°) + {strut.waleSpecName}
                          </span>
                        )}
                        {isStrutOnly && (
                          <span className="text-blue-800 font-mono bg-blue-100 px-2 py-0.5 rounded font-bold">
                            전구간 버팀보 @{strut.horizontalSpacing}m 간격 ({strut.specName}) + 선행하중 {strut.preloadTon}t
                          </span>
                        )}
                      </div>

                      <span className="text-slate-400 text-[10px]">
                        {isHybrid ? '✨ 띠장 휨모멘트 65% 상쇄 SAFE' : isAnchor ? '내부 완전개방' : '표준 지지'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Underground Utilities Management (GL -3~5m) */}
        {activeTab === 'UTILITIES' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  지하 매설 지장물 관리 (심도 GL -3.0m ~ -5.0m 구간)
                </h4>
                <p className="text-[11px] text-slate-500">
                  도심지 굴착 시 상하수도·가스·통신·전력 관로의 위치 및 천공/버팀보 간섭 여부를 관리합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddUtility}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>지장물 추가</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="py-2 px-2">관종 구분</th>
                    <th className="py-2 px-2">지장물 명칭</th>
                    <th className="py-2 px-2">매설 심도 (GL -m)</th>
                    <th className="py-2 px-2">벽체 이격거리 (m)</th>
                    <th className="py-2 px-2">관경 (mm)</th>
                    <th className="py-2 px-2">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {utilities.map((util, idx) => (
                    <tr key={util.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: util.color }}
                        >
                          {util.type}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={util.name}
                          onChange={(e) => handleUpdateUtility(idx, 'name', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium text-xs text-center"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="0.1"
                          value={util.depth}
                          onChange={(e) => handleUpdateUtility(idx, 'depth', parseFloat(e.target.value) || 3.0)}
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-center font-bold text-blue-700 text-xs"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="0.5"
                          value={util.offsetFromWall}
                          onChange={(e) => handleUpdateUtility(idx, 'offsetFromWall', parseFloat(e.target.value) || 2.0)}
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-center text-xs"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="50"
                          value={util.diameterMm}
                          onChange={(e) => handleUpdateUtility(idx, 'diameterMm', parseInt(e.target.value) || 200)}
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-center text-xs"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteUtility(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Soil Layers with Stratigraphy Diagram & Property Graphs */}
        {activeTab === 'SOIL' && (() => {
          const maxDepth = Math.max(...layers.map(l => l.depthBottom), 10);
          const maxC = Math.max(...layers.map(l => l.cohesion || 0), 10);
          const maxPhi = Math.max(...layers.map(l => l.frictionAngle || 0), 10);
          const maxN = Math.max(...layers.map(l => l.nValue || 0), 10);
          const graphH = 280;
          const graphW = 90;
          const depthToY = (d: number) => (d / maxDepth) * (graphH - 10) + 5;
          // Build data points for line graphs
          const cPoints = layers.map(l => ({ depth: (l.depthTop + l.depthBottom) / 2, val: l.cohesion || 0 }));
          const phiPoints = layers.map(l => ({ depth: (l.depthTop + l.depthBottom) / 2, val: l.frictionAngle || 0 }));
          const nPoints = layers.map(l => ({ depth: (l.depthTop + l.depthBottom) / 2, val: l.nValue || 0 }));
          const makePath = (pts: {depth:number;val:number}[], maxVal: number) => {
            if (pts.length === 0) return '';
            return pts.map((p, i) => {
              const x = 5 + (p.val / maxVal) * (graphW - 15);
              const y = depthToY(p.depth);
              return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');
          };
          const makeDots = (pts: {depth:number;val:number}[], maxVal: number, color: string) => {
            return pts.map((p, i) => {
              const x = 5 + (p.val / maxVal) * (graphW - 15);
              const y = depthToY(p.depth);
              return <circle key={i} cx={x} cy={y} r={2.5} fill={color} stroke="white" strokeWidth={1} />;
            });
          };
          return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium text-xs sm:text-sm">지층별 심도 및 토질정수 매개변수 설정</span>
              <button
                onClick={handleAddSoil}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>지층 추가</span>
              </button>
            </div>

            {/* 2-Column Layout: 50% : 50% Half-and-Half split (same height) */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch">
              {/* Left Column (50%): Soil Layer Input Cards */}
              <div className="w-full lg:w-1/2 space-y-2 min-w-0 flex flex-col justify-between">
                <div className="space-y-2">
                {layers.map((l, idx) => (
                  <div key={l.id} className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1.5 hover:border-blue-300 transition">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="w-3 h-3 rounded-full shrink-0 border border-slate-300" style={{ backgroundColor: l.color }} />
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/80 px-1 py-0.5 rounded shrink-0">#{idx + 1}층</span>
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
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">상단 (m)</span>
                        <input type="number" step="0.5" value={l.depthTop}
                          onChange={(e) => handleSoilChange(idx, 'depthTop', parseFloat(e.target.value) || 0)}
                          className={`w-full border rounded px-1.5 py-1 text-slate-800 font-mono text-[11px] ${idx > 0 ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-white border-slate-200'}`}
                          readOnly={idx > 0}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">하단 (m)</span>
                        <input type="number" step="0.5" value={l.depthBottom}
                          onChange={(e) => handleSoilChange(idx, 'depthBottom', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">γ (kN/m³)</span>
                        <input type="number" step="0.5" value={l.unitWeight}
                          onChange={(e) => handleSoilChange(idx, 'unitWeight', parseFloat(e.target.value) || 18)}
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">점착력 c (kPa)</span>
                        <input type="number" step="1" value={l.cohesion}
                          onChange={(e) => handleSoilChange(idx, 'cohesion', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">마찰각 φ (°)</span>
                        <input type="number" step="1" value={l.frictionAngle}
                          onChange={(e) => handleSoilChange(idx, 'frictionAngle', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-semibold">SPT N치</span>
                        <input type="number" step="1" value={l.nValue}
                          onChange={(e) => handleSoilChange(idx, 'nValue', parseInt(e.target.value) || 10)}
                          className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-slate-800 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>

              {/* Right Column (50%): Stratigraphy Diagram (40%) + Graphs (60%) */}
              <div className="w-full lg:w-1/2 flex gap-2 items-stretch min-w-0">
                {/* Stratigraphy Schematic (40% of right column) */}
                <div className="w-5/12 bg-white border border-slate-200 rounded-xl p-2 shadow-2xs flex flex-col">
                  <div className="text-[11px] font-bold text-slate-800 mb-1 text-center shrink-0 flex items-center justify-center gap-1">
                    <span>🏔️</span>
                    <span>지층 구분 모식도</span>
                  </div>
                  <div className="relative border border-slate-300 rounded-lg overflow-hidden flex-1 bg-slate-50/50" style={{ minHeight: '180px' }}>
                    {/* GL ±0.0 marker */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-900 z-10" />
                    <div className="absolute top-0.5 left-1 text-[8px] font-mono font-black text-slate-900 z-10 bg-white/80 px-1 rounded shadow-2xs">GL ±0.0m</div>
                    {layers.map((l) => {
                      const topPct = (l.depthTop / maxDepth) * 100;
                      const botPct = (l.depthBottom / maxDepth) * 100;
                      const hPct = botPct - topPct;
                      if (hPct <= 0) return null;
                      return (
                        <div key={l.id} className="absolute left-0 right-0 flex items-center border-b border-slate-400/40 transition-all hover:brightness-95" style={{ top: `${topPct}%`, height: `${hPct}%` }}>
                          <div className="absolute inset-0" style={{ backgroundColor: l.color, opacity: 0.4 }} />
                          <div className="relative z-10 flex items-center justify-between w-full px-2">
                            <div className="flex items-center space-x-1 truncate max-w-[65%]">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                              <span className="text-[10px] font-black text-slate-900 truncate">{l.name.replace(/\(.*\)/, '').trim()}</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-700 bg-white/70 px-1 py-0.5 rounded shrink-0">
                              GL -{l.depthTop}~-{l.depthBottom}m
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {[0, 10, 20, 30, 40, 50].filter(d => d <= maxDepth + 5).map(d => (
                      <div key={d} className="absolute right-1 text-[7px] font-mono font-bold text-slate-500 bg-white/70 px-0.5 rounded" style={{ top: `${(d / maxDepth) * 100}%`, transform: 'translateY(-50%)' }}>
                        -{d}m
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Graphs: c, φ, N (60% of right column) */}
                <div className="w-7/12 flex gap-1.5 items-stretch min-w-0">
                  {/* Cohesion c Graph */}
                  <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                    <div className="text-[10px] font-black text-rose-700 mb-1 text-center shrink-0 bg-rose-50 py-0.5 rounded border border-rose-200">
                      c (kPa)
                    </div>
                    <svg className="flex-1 border border-slate-100 rounded-lg bg-slate-50/60" viewBox={`0 0 ${graphW} ${graphH}`} preserveAspectRatio="none">
                      {[0, 10, 20, 30, 40].filter(d => d <= maxDepth).map(d => (
                        <line key={d} x1={0} y1={depthToY(d)} x2={graphW} y2={depthToY(d)} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="2,2" />
                      ))}
                      <path d={makePath(cPoints, maxC)} fill="none" stroke="#e11d48" strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                      {makeDots(cPoints, maxC, '#e11d48')}
                      {cPoints.map((p, i) => (
                        <text key={i} x={Math.min(graphW - 18, 5 + (p.val / maxC) * (graphW - 15) + 3)} y={depthToY(p.depth) + 3} fontSize={8} fill="#be123c" fontWeight="bold">{p.val}</text>
                      ))}
                    </svg>
                  </div>

                  {/* Friction Angle φ Graph */}
                  <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                    <div className="text-[10px] font-black text-blue-700 mb-1 text-center shrink-0 bg-blue-50 py-0.5 rounded border border-blue-200">
                      φ (°)
                    </div>
                    <svg className="flex-1 border border-slate-100 rounded-lg bg-slate-50/60" viewBox={`0 0 ${graphW} ${graphH}`} preserveAspectRatio="none">
                      {[0, 10, 20, 30, 40].filter(d => d <= maxDepth).map(d => (
                        <line key={d} x1={0} y1={depthToY(d)} x2={graphW} y2={depthToY(d)} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="2,2" />
                      ))}
                      <path d={makePath(phiPoints, maxPhi)} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                      {makeDots(phiPoints, maxPhi, '#2563eb')}
                      {phiPoints.map((p, i) => (
                        <text key={i} x={Math.min(graphW - 18, 5 + (p.val / maxPhi) * (graphW - 15) + 3)} y={depthToY(p.depth) + 3} fontSize={8} fill="#1d4ed8" fontWeight="bold">{p.val}</text>
                      ))}
                    </svg>
                  </div>

                  {/* SPT N Graph */}
                  <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs">
                    <div className="text-[10px] font-black text-emerald-700 mb-1 text-center shrink-0 bg-emerald-50 py-0.5 rounded border border-emerald-200">
                      SPT N
                    </div>
                    <svg className="flex-1 border border-slate-100 rounded-lg bg-slate-50/60" viewBox={`0 0 ${graphW} ${graphH}`} preserveAspectRatio="none">
                      {[0, 10, 20, 30, 40].filter(d => d <= maxDepth).map(d => (
                        <line key={d} x1={0} y1={depthToY(d)} x2={graphW} y2={depthToY(d)} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="2,2" />
                      ))}
                      <path d={makePath(nPoints, maxN)} fill="none" stroke="#059669" strokeWidth={2.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                      {makeDots(nPoints, maxN, '#059669')}
                      {nPoints.map((p, i) => (
                        <text key={i} x={Math.min(graphW - 18, 5 + (p.val / maxN) * (graphW - 15) + 3)} y={depthToY(p.depth) + 3} fontSize={8} fill="#047857" fontWeight="bold">{p.val}</text>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Success Toast Banner */}
            {soilSaveStatus === 'SAVED' && (
              <div className="bg-emerald-50 border-2 border-emerald-500 p-3 rounded-lg flex items-center justify-between gap-2 text-xs text-emerald-950 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-black text-sm">✓</div>
                  <div>
                    <strong>지반데이터 저장 완료!</strong> {layers.length}개 지층의 토질정수(γ, c, φ, N치)가 1안(버팀보) · 2안(어스앵커) · 3안(복합공법) 해석에 즉시 반영되었습니다.
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Action Bar */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-3.5 rounded-xl text-white shadow-md flex flex-wrap items-center justify-between gap-3 border border-blue-700">
              <div className="space-y-0.5">
                <div className="font-bold text-sm flex items-center gap-2 text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>지반데이터 확정 및 구조해석 연동</span>
                </div>
                <p className="text-[11px] text-blue-200">
                  위에서 입력·수정한 지반 정수를 저장하면 1안(버팀보), 2안(앵커), 3안(복합)의 16단계 수치해석에 일괄 반영됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveSoilData}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 rounded-lg font-black text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition cursor-pointer active:scale-95 border border-amber-300"
              >
                <Save className="w-4 h-4" />
                <span>💾 지반데이터 저장 및 1·2·3안 구조해석 즉시 반영하기</span>
              </button>
            </div>
          </div>
          );
        })()}

        {/* Tab 4: Comprehensive Structural Material Specifications (가시설 자재 규격 상세) */}
        {activeTab === 'SPECS' && (
          <div className="space-y-4">
            {/* Header Action Banner with Beginner Visual Guide Button */}
            <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-slate-50 p-3.5 rounded-lg border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    도면 및 내역서 표준 가시설 자재 규격 상세 일람
                  </span>
                  <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    KDS 21 30 00 / SM355 연동
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  엄지말뚝 <span className="font-bold text-blue-800">H-300×305 (SM355)</span>, 띠장 <span className="font-bold text-blue-800">2H-300</span>, 버팀보 <span className="font-bold text-blue-800">H-300</span>, <span className="font-bold text-blue-800">스크류잭 1,000kN</span>, <span className="font-bold text-blue-800">화타쐐기</span>, <span className="font-bold text-blue-800">토류판 T=6cm</span> 및 <span className="font-bold text-blue-800">보강재 L-90/ㄷ-380</span> 규격과 3D 도해를 확인합니다.
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGuideMember('OVERVIEW');
                    setIsVisualGuideOpen(true);
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition whitespace-nowrap cursor-pointer"
                  title="초심자를 위한 가시설 부재 그림/도해 시공도감 창 열기"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>🖼️ 초심자용 부재 그림/도감 열기</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
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
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>내역서 규격 일괄 적용</span>
                </button>
              </div>
            </div>

            {/* 1. Structural Material Spec Summary Cards (4 Key Categories) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
                  <span>■ 주요 가시설 자재 규격 상세 (도면 및 내역서)</span>
                </div>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200">
                  각 카드 클릭 시 3D 상세 도해 팝업
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {/* Card 1: H-Pile */}
                <div
                  onClick={() => {
                    setSelectedGuideMember('H_PILE');
                    setIsVisualGuideOpen(true);
                  }}
                  className="bg-slate-50 hover:bg-blue-50/60 p-3 rounded-lg border border-slate-200 hover:border-blue-300 space-y-1.5 shadow-2xs transition cursor-pointer group"
                >
                  <div className="font-bold text-blue-900 text-xs flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="group-hover:text-blue-700 flex items-center gap-1">
                      <span>1. 흙막이 엄지말뚝 (H-Pile)</span>
                      <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
                    </span>
                    <span className="text-[10px] text-blue-600 font-mono">D500mm 천공 (도해보기 ➔)</span>
                  </div>
                  <ul className="text-[11px] text-slate-700 space-y-1.5 pt-0.5">
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-300×305×15×15 (SM355):</span>
                      <span className="font-mono text-slate-700">Zx=1,470cm³, 106.0kg/m</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-440×300×11×18 (SM355):</span>
                      <span className="font-mono text-slate-700">Zx=2,550cm³, 124.0kg/m</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-700×300×13×24 (SM355):</span>
                      <span className="font-mono text-slate-700">Zx=5,760cm³, 185.0kg/m</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-250×250×9×14 (SS275):</span>
                      <span className="font-mono text-slate-700">Zx=864cm³, 72.4kg/m</span>
                    </li>
                  </ul>
                </div>

                {/* Card 2: Wale & Strut */}
                <div
                  onClick={() => {
                    setSelectedGuideMember('WALE');
                    setIsVisualGuideOpen(true);
                  }}
                  className="bg-slate-50 hover:bg-blue-50/60 p-3 rounded-lg border border-slate-200 hover:border-blue-300 space-y-1.5 shadow-2xs transition cursor-pointer group"
                >
                  <div className="font-bold text-blue-900 text-xs flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="group-hover:text-blue-700 flex items-center gap-1">
                      <span>2. 띠장(Wale) & 버팀보(Strut)</span>
                      <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
                    </span>
                    <span className="text-[10px] text-blue-600 font-mono">잭 1000kN (도해보기 ➔)</span>
                  </div>
                  <ul className="text-[11px] text-slate-700 space-y-1.5 pt-0.5">
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 2H-300×305 2련 띠장:</span>
                      <span className="font-mono text-slate-700">Z=2,940cm³, C-1 / D-1</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• H-300×305 버팀보:</span>
                      <span className="font-mono text-slate-700">한면제작, S-2 연결</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 스크류잭 / 화타쐐기:</span>
                      <span className="font-mono text-slate-700">스크류잭 1000kN, K-1/K-2</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 띠장 보걸이 브라켓:</span>
                      <span className="font-mono text-slate-700">O-1/O-2 (H300), O-5/O-6 (H250)</span>
                    </li>
                  </ul>
                </div>

                {/* Card 3: Reinforcement & Bracing */}
                <div
                  onClick={() => {
                    setSelectedGuideMember('BRACING');
                    setIsVisualGuideOpen(true);
                  }}
                  className="bg-slate-50 hover:bg-blue-50/60 p-3 rounded-lg border border-slate-200 hover:border-blue-300 space-y-1.5 shadow-2xs transition cursor-pointer group"
                >
                  <div className="font-bold text-blue-900 text-xs flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="group-hover:text-blue-700 flex items-center gap-1">
                      <span>3. 보강재 & 브레이싱 (Bracing)</span>
                      <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
                    </span>
                    <span className="text-[10px] text-blue-600 font-mono">형강류 (도해보기 ➔)</span>
                  </div>
                  <ul className="text-[11px] text-slate-700 space-y-1.5 pt-0.5">
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• ㄷ-형강 (F-1 TYPE):</span>
                      <span className="font-mono text-slate-700">ㄷ-380×100×10.5×16mm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• L-형강 (G-2 TYPE):</span>
                      <span className="font-mono text-slate-700">L-90×90×10mm (수평/사재 가새)</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 버팀보 보강재 (B TYPE):</span>
                      <span className="font-mono text-slate-700">B-4, B-5, B-6 TYPE</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• U볼트 / 스티프너:</span>
                      <span className="font-mono text-slate-700">U-1(H+ㄷ), U-6(ㄷ+ㄷ), I-1</span>
                    </li>
                  </ul>
                </div>

                {/* Card 4: Deck, Lagging & Grouting */}
                <div
                  onClick={() => {
                    setSelectedGuideMember('DECK');
                    setIsVisualGuideOpen(true);
                  }}
                  className="bg-slate-50 hover:bg-blue-50/60 p-3 rounded-lg border border-slate-200 hover:border-blue-300 space-y-1.5 shadow-2xs transition cursor-pointer group"
                >
                  <div className="font-bold text-blue-900 text-xs flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="group-hover:text-blue-700 flex items-center gap-1">
                      <span>4. 복공·주형보 / 토류판 / 차수</span>
                      <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-600 transition" />
                    </span>
                    <span className="text-[10px] text-blue-600 font-mono">시공재 (도해보기 ➔)</span>
                  </div>
                  <ul className="text-[11px] text-slate-700 space-y-1.5 pt-0.5">
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 도로 복공판:</span>
                      <span className="font-mono text-slate-700">H형 2000×1000×200mm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 주형보 침보:</span>
                      <span className="font-mono text-slate-700">외측(A-1 H300), 중앙(B-1 H440)</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 토류판 (Lagging):</span>
                      <span className="font-mono text-slate-700">목재 T=6cm / 강재 T=1.2mm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold text-slate-900">• 차수 그라우팅:</span>
                      <span className="font-mono text-slate-700">D1,000 × C.T.C 800mm (1:15)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Detailed Material Properties & Section Modulus Matrix (단면성능 및 제원표) */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-indigo-600 rounded-xs" />
                <span>■ 흙막이 엄지말뚝(H-Pile) 및 지보공 부재 상세 단면성능표</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-center border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                      <th className="py-2 px-2 text-left">부재 구분</th>
                      <th className="py-2 px-1">규격 (H×B×t1×t2)</th>
                      <th className="py-2 px-1">강종</th>
                      <th className="py-2 px-1">단면계수 Zx (cm³)</th>
                      <th className="py-2 px-1">단면2차모멘트 Ix (cm⁴)</th>
                      <th className="py-2 px-1">단면적 A (cm²)</th>
                      <th className="py-2 px-1">단위중량 (kg/m)</th>
                      <th className="py-2 px-1">허용휨응력 (MPa)</th>
                      <th className="py-2 px-2 text-left">도면 표준 적용 용도</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {H_PILE_SPECS.map((hp) => (
                      <tr key={hp.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2 text-left font-bold text-slate-900">{hp.name}</td>
                        <td className="py-2 px-1 font-mono text-slate-600">{hp.size}</td>
                        <td className="py-2 px-1 font-bold text-blue-700">{hp.steelGrade}</td>
                        <td className="py-2 px-1 font-mono font-bold text-indigo-700">{hp.sectionModulusZx.toLocaleString()}</td>
                        <td className="py-2 px-1 font-mono text-slate-600">{hp.momentOfInertiaIx.toLocaleString()}</td>
                        <td className="py-2 px-1 font-mono text-slate-600">{hp.areaA}</td>
                        <td className="py-2 px-1 font-mono text-slate-600">{hp.unitWeight}</td>
                        <td className="py-2 px-1 font-mono font-semibold text-emerald-700">{hp.allowableBendingStress}</td>
                        <td className="py-2 px-2 text-left text-slate-500">{hp.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Wale & Strut Specs Table */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-amber-600 rounded-xs" />
                <span>■ 띠장(Wale) & 버팀보(Strut) 규격 및 허용내력 일람</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Wale Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 p-2 font-bold text-slate-800 text-xs border-b border-slate-200">
                    띠장 (Wale) 규격 상세
                  </div>
                  <table className="w-full text-center border-collapse text-[11px]">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
                      <tr>
                        <th className="py-1.5 px-2 text-left">명칭</th>
                        <th className="py-1.5 px-1">단면계수 Z(cm³)</th>
                        <th className="py-1.5 px-1">허용응력(MPa)</th>
                        <th className="py-1.5 px-2 text-left">연결 조인트</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {WALE_SPECS.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2 text-left font-semibold text-slate-900">{w.name}</td>
                          <td className="py-1.5 px-1 font-mono font-bold text-blue-700">{w.sectionModulusZ.toLocaleString()}</td>
                          <td className="py-1.5 px-1 font-mono text-emerald-700">{w.allowableBendingStress}</td>
                          <td className="py-1.5 px-2 text-left text-slate-500">{w.connectionType} / {w.bracketType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Strut Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 p-2 font-bold text-slate-800 text-xs border-b border-slate-200">
                    버팀보 (Strut) 및 잭 상세
                  </div>
                  <table className="w-full text-center border-collapse text-[11px]">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
                      <tr>
                        <th className="py-1.5 px-2 text-left">명칭</th>
                        <th className="py-1.5 px-1">단면적 A(cm²)</th>
                        <th className="py-1.5 px-1">허용축응력(MPa)</th>
                        <th className="py-1.5 px-2 text-left">특징 및 적용</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {STRUT_SPECS.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-1.5 px-2 text-left font-semibold text-slate-900">{s.name}</td>
                          <td className="py-1.5 px-1 font-mono font-bold text-blue-700">{s.areaA}</td>
                          <td className="py-1.5 px-1 font-mono text-emerald-700">{s.allowableAxialStress}</td>
                          <td className="py-1.5 px-2 text-left text-slate-500">{s.jackSpec} ({s.connectionSpec})</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 4. Bracing & Connecting Details */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-emerald-600 rounded-xs" />
                <span>■ 브레이싱 형강류 & 연결 부재 상세 (도면 상세도 부호 일람)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">ㄷ-형강 (F-1 TYPE)</div>
                  <div className="font-mono text-slate-700">ㄷ-380×100×10.5×16</div>
                  <div className="text-[10.5px] text-slate-500">버팀보 상하 수평보강재</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">L-형강 (G-2 TYPE)</div>
                  <div className="font-mono text-slate-700">L-90×90×10mm</div>
                  <div className="text-[10.5px] text-slate-500">수평 및 사재 가새 브레이싱</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">화타쐐기 (K-1, K-2)</div>
                  <div className="font-mono text-slate-700">K-1(H300), K-2(H440)</div>
                  <div className="text-[10.5px] text-slate-500">말뚝-띠장 밀착 쐐기</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">보걸이 브라켓 (O TYPE)</div>
                  <div className="font-mono text-slate-700">O-1~O-6 TYPE</div>
                  <div className="text-[10.5px] text-slate-500">철근/앵글 띠장 지지 브라켓</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Beginner Visual Guide Modal */}
      <MaterialVisualGuideModal
        isOpen={isVisualGuideOpen}
        onClose={() => setIsVisualGuideOpen(false)}
        initialMember={selectedGuideMember}
      />
    </div>
  );
};

