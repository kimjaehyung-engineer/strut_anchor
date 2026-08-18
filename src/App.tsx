import React, { useState, useMemo } from 'react';
import {
  CalculationResult,
  ExcavationStage,
  ProjectSettings,
  SoilLayer,
  StrutTier,
  WallSection,
} from './types';
import { PRESET_PROJECTS, ProjectPreset } from './utils/presets';
import { calculateExcavationAnalysis } from './utils/geotechnicalEngine';
import {
  optimizeProjectForSafety,
  ReinforcementPlanResult,
} from './utils/reinforcementEngine';
import { ExcavationCanvas } from './components/ExcavationCanvas';
import { StationLayoutViewer } from './components/StationLayoutViewer';
import { StageController } from './components/StageController';
import { SafetyCheckMatrix } from './components/SafetyCheckMatrix';
import { InputPanel } from './components/InputPanel';
import { PlanningGuideModal } from './components/PlanningGuideModal';
import { CalculationReportModal } from './components/CalculationReportModal';
import { ReinforcementModal } from './components/ReinforcementModal';
import { AnchorComparisonModal } from './components/AnchorComparisonModal';
import { FinalAnalysisPptModal } from './components/FinalAnalysisPptModal';
import { StructureConstructionImpactModal } from './components/StructureConstructionImpactModal';
import {
  Compass,
  FileText,
  Layers,
  Shield,
  Activity,
  Sliders,
  HelpCircle,
  FolderOpen,
  ChevronRight,
  TrendingDown,
  Building2,
  Sparkles,
  Award,
  CheckCircle2,
  Cpu,
  Zap,
  Anchor,
} from 'lucide-react';

export default function App() {
  // Preset selector
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_PROJECTS[0].id);

  // Active project state
  const currentPreset = useMemo(
    () => PRESET_PROJECTS.find((p) => p.id === selectedPresetId) || PRESET_PROJECTS[0],
    [selectedPresetId]
  );

  // Load persisted engineering data from localStorage on initial boot / refresh
  const savedInitialData = useMemo(() => {
    try {
      const raw = localStorage.getItem('STRUT_ANCHOR_ENGINEERING_DATA');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse STRUT_ANCHOR_ENGINEERING_DATA from localStorage', e);
    }
    return null;
  }, []);

  const [settings, setSettings] = useState<ProjectSettings>(() => {
    if (savedInitialData?.settings) {
      return { ...currentPreset.settings, ...savedInitialData.settings };
    }
    return currentPreset.settings;
  });

  const [layers, setLayers] = useState<SoilLayer[]>(() => {
    if (savedInitialData?.layers && Array.isArray(savedInitialData.layers)) {
      return savedInitialData.layers;
    }
    return currentPreset.layers;
  });

  const [wall, setWall] = useState<WallSection>(() => {
    if (savedInitialData?.wall) {
      return { ...currentPreset.wall, ...savedInitialData.wall };
    }
    return currentPreset.wall;
  });

  const [struts, setStruts] = useState<StrutTier[]>(() => {
    if (savedInitialData?.struts && Array.isArray(savedInitialData.struts)) {
      return savedInitialData.struts;
    }
    return currentPreset.struts;
  });

  const [stages, setStages] = useState<ExcavationStage[]>(() => {
    if (savedInitialData?.stages && Array.isArray(savedInitialData.stages)) {
      return savedInitialData.stages;
    }
    return currentPreset.stages;
  });

  // Automatically sync to localStorage whenever state changes
  React.useEffect(() => {
    try {
      localStorage.setItem(
        'STRUT_ANCHOR_ENGINEERING_DATA',
        JSON.stringify({
          settings,
          layers,
          wall,
          struts,
          stages,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Failed to auto-sync to localStorage', e);
    }
  }, [settings, layers, wall, struts, stages]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Active Right-Side Panel Tab (Default to INPUTS as requested)
  const [rightTab, setRightTab] = useState<'INPUTS' | 'COMPARISON' | 'SAFETY'>('INPUTS');

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isReinforcementOpen, setIsReinforcementOpen] = useState<boolean>(false);
  const [isAnchorModalOpen, setIsAnchorModalOpen] = useState<boolean>(false);
  const [isFinalAnalysisOpen, setIsFinalAnalysisOpen] = useState<boolean>(false);
  const [isStructureImpactOpen, setIsStructureImpactOpen] = useState<boolean>(false);
  const [anchorModalTab, setAnchorModalTab] = useState<string>('1_STRUT');
  const [comparisonKey, setComparisonKey] = useState<number>(0);
  const [reinforcementPlan, setReinforcementPlan] = useState<ReinforcementPlanResult | null>(null);

  // Switch preset handler
  const handleSelectPreset = (preset: ProjectPreset) => {
    setSelectedPresetId(preset.id);
    setSettings(preset.settings);
    setLayers(preset.layers);
    setWall(preset.wall);
    setStruts(preset.struts);
    setStages(preset.stages);
    setCurrentStepIndex(0);
  };

  // Perform geotechnical calculation for current stage
  const currentStage = stages[currentStepIndex] || stages[0];
  const calcResult: CalculationResult = useMemo(() => {
    return calculateExcavationAnalysis(settings, layers, wall, struts, currentStage);
  }, [settings, layers, wall, struts, currentStage]);

  // Open Auto-Optimization Reinforcement Modal
  const handleTriggerReinforcement = () => {
    const plan = optimizeProjectForSafety(settings, layers, wall, struts, stages);
    setReinforcementPlan(plan);
    setIsReinforcementOpen(true);
  };

  // Apply Reinforcement Plan
  const handleApplyReinforcementPlan = () => {
    if (!reinforcementPlan) return;
    setSettings(reinforcementPlan.settings);
    setLayers(reinforcementPlan.layers);
    setWall(reinforcementPlan.wall);
    setStruts(reinforcementPlan.struts);
    setStages(reinforcementPlan.stages);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white antialiased">
      {/* High-Contrast Professional Polish Header */}
      <header className="no-print print:hidden min-h-14 py-2 sm:py-0 bg-slate-900 text-white flex flex-wrap items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0 border-b border-slate-700 sticky top-0 z-40 shadow-md gap-2">
        {/* Left: DX Badge & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-sm tracking-wider text-white shadow-sm shrink-0">
            DX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm lg:text-base font-semibold tracking-tight text-white whitespace-nowrap">
                Deep Excavation Stability Analyzer
              </h1>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 hidden md:inline-block whitespace-nowrap">
                v1.0.4 KDS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xl:block truncate max-w-md">
              {settings.projectName} — {settings.stationName} (개착가시설 지반·구조 통합설계)
            </p>
          </div>
        </div>

        {/* Center/Right: Status & Controls Toolbar */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 lg:gap-2.5 text-xs font-medium shrink-0">
          {/* Final 3-Alternative Analysis (1-Page PPT Presentation) Button */}
          <button
            onClick={() => setIsFinalAnalysisOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded border border-purple-400/40 flex items-center gap-1.5 transition shadow-md cursor-pointer whitespace-nowrap shrink-0"
            title="3개안을 비교하는 1장 슬라이드 PPT 최종 종합분석 보고서"
          >
            <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>최종 분석</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-200" />
          </button>

          {/* Permanent Structure Impact Analysis Button */}
          <button
            onClick={() => setIsStructureImpactOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded border border-emerald-400/40 flex items-center gap-1.5 transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            title="본체 구조물 축조 시 가시설 간섭(벽체 2단타설·중간말뚝 절단·슬래브 재지보) 공기/비용 정밀 분석"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
            <span>구조물 축조 영향</span>
          </button>

          {/* Planning Guide Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-2 sm:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 flex items-center gap-1.5 transition shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            title="개착공사 가시설 설계 가이드"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">설계가이드</span>
            <span className="sm:hidden">가이드</span>
          </button>

          {/* Calculation Report Button */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 flex items-center gap-1.5 transition shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            title="구조계산서 출력 및 검토"
          >
            <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span>구조계산서</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Full Width 100% & Full Height) */}
      <main className="no-print print:hidden flex-1 w-full px-3 sm:px-4 lg:px-6 py-3.5 flex flex-col space-y-3.5">
        {/* 5-Stage Engineering Pipeline Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg font-bold text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>설계 프로세스:</span>
            </span>
            <div className="hidden md:flex items-center space-x-1 text-xs">
              <span className="px-2.5 py-1 bg-blue-600 text-white rounded-md font-bold shadow-2xs">
                1단계: 지반·정거장 정보입력 (현재)
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  setAnchorModalTab('STRUT_ONLY');
                  setIsAnchorModalOpen(true);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-md font-medium transition cursor-pointer border border-transparent hover:border-amber-300"
                title="1안 버팀보(Strut) 설계 및 간섭 한계점 검토"
              >
                2단계: 1안 버팀보 설계
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  setAnchorModalTab('DESIGN');
                  setIsAnchorModalOpen(true);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-900 rounded-md font-medium transition cursor-pointer border border-transparent hover:border-indigo-300"
                title="2안 앵커 및 지장물 회피 고각앵커(45°~70°) 구조설계"
              >
                3단계: 2안 앵커/고각
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  setAnchorModalTab('HYBRID');
                  setIsAnchorModalOpen(true);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 rounded-md font-medium transition cursor-pointer border border-transparent hover:border-blue-300"
                title="3안 광간격 버팀보(10m)+앵커 복합공법 설계"
              >
                4단계: 3안 광간격 복합
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => {
                  setAnchorModalTab('REPORT');
                  setIsAnchorModalOpen(true);
                }}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-bold border border-indigo-200 transition cursor-pointer"
                title="3개 대안 종합 기술검토 및 공법비교 보고서"
              >
                5단계: 종합 공법비교
              </button>
            </div>
          </div>
        </div>

        {/* Main Full-Width Inputs & Configuration Layout */}
        <div className="w-full space-y-3.5">
          {/* Panel Tabs Switcher */}
          <div className="bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 text-xs font-semibold shadow-xs">
            <button
              onClick={() => setRightTab('INPUTS')}
              className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                rightTab === 'INPUTS'
                  ? 'bg-blue-600 text-white shadow-sm font-bold ring-2 ring-blue-400/40 opacity-100'
                  : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80 font-medium opacity-65 hover:opacity-90'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>1. 정거장·지층·인접지장물 제원 입력 (기본)</span>
            </button>
            <button
              onClick={() => {
                setAnchorModalTab('1_STRUT');
                setComparisonKey((k) => k + 1);
                setRightTab('COMPARISON');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                rightTab === 'COMPARISON'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-sm ring-2 ring-purple-400/50 opacity-100'
                  : 'bg-white text-purple-700/80 hover:text-purple-900 hover:bg-purple-50/50 border border-purple-200/70 font-medium opacity-65 hover:opacity-90'
              }`}
              title="1안(버팀보) vs 2안(앵커) vs 3안(복합공법) 3대 대안 공법비교 및 종합 리포트 지금 창에서 바로 보기"
            >
              <Anchor className="w-4 h-4" />
              <span>🎯 2. 가시설 1·2·3안 공법비교</span>
            </button>
            <button
              onClick={() => setRightTab('SAFETY')}
              className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                rightTab === 'SAFETY'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold ring-2 ring-emerald-400/40 opacity-100'
                  : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80 font-medium opacity-65 hover:opacity-90'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>3. KDS 안정성 검토</span>
            </button>
          </div>

          {/* Tab 1: Full-Width Inputs Hub (Default) */}
          {rightTab === 'INPUTS' && (
            <div className="w-full flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs p-1">
              <InputPanel
                settings={settings}
                onUpdateSettings={setSettings}
                layers={layers}
                onUpdateLayers={setLayers}
                wall={wall}
                onUpdateWall={setWall}
                struts={struts}
                onUpdateStruts={setStruts}
                onOpenAnchorComparison={() => {
                  setAnchorModalTab('1_STRUT');
                  setComparisonKey((k) => k + 1);
                  setRightTab('COMPARISON');
                }}
              />
            </div>
          )}

          {/* Tab 2: Full-Width Comparison Report Inline View (Current Window) */}
          {rightTab === 'COMPARISON' && (
            <div className="w-full flex-1 flex flex-col min-h-[85vh]">
              <AnchorComparisonModal
                key={comparisonKey}
                isOpen={true}
                isInline={true}
                onClose={() => setRightTab('INPUTS')}
                settings={settings}
                layers={layers}
                wall={wall}
                struts={struts}
                stages={stages}
                currentStepIndex={currentStepIndex}
                onSelectStep={(idx) => setCurrentStepIndex(idx)}
                onUpdateWall={setWall}
                onUpdateStruts={setStruts}
                calcResult={calcResult}
                initialTab="1_STRUT"
              />
            </div>
          )}

          {/* Tab 3: Safety Matrix */}
          {rightTab === 'SAFETY' && (
            <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs p-4">
              <SafetyCheckMatrix
                calcResult={calcResult}
                wall={wall}
                struts={struts}
                onUpdateStruts={setStruts}
                onOpenReinforcement={handleTriggerReinforcement}
                onOpenAnchorComparison={() => {
                  setAnchorModalTab('1_STRUT');
                  setRightTab('COMPARISON');
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Engineering Footer Status Bar */}
      <footer className="h-8 bg-slate-200 border-t border-slate-300 flex items-center px-4 justify-between text-[11px] text-slate-600 font-mono shrink-0 mt-auto">
        <div className="truncate">
          <span className="font-semibold text-slate-700">Project:</span> {settings.projectName} / {settings.stationName}
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>KDS 21 30 00 / KDS 11 00 00 Compliant</span>
          <span>•</span>
          <span>Status: Normal Simulation</span>
        </div>
      </footer>

      {/* Planning Roadmap & Software Engineering Guide Modal */}
      <PlanningGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Structural Calculation Report Modal */}
      <CalculationReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        settings={settings}
        layers={layers}
        wall={wall}
        struts={struts}
        stages={stages}
        currentStage={currentStage}
        calcResult={calcResult}
      />

      {/* Reinforcement & Safety Optimization Modal */}
      <ReinforcementModal
        isOpen={isReinforcementOpen}
        onClose={() => setIsReinforcementOpen(false)}
        planResult={reinforcementPlan}
        onApplyPlan={handleApplyReinforcementPlan}
      />

      {/* 1-Page PPT Final Analysis Presentation Modal */}
      <FinalAnalysisPptModal
        isOpen={isFinalAnalysisOpen}
        onClose={() => setIsFinalAnalysisOpen(false)}
        settings={settings}
        layers={layers}
        wall={wall}
        struts={struts}
        stages={stages}
        calcResult={calcResult}
        onOpenDetailedReport={() => {
          setIsFinalAnalysisOpen(false);
          setRightTab('COMPARISON');
        }}
      />

      {/* Ground Anchor Comparison & Quantity Take-off Modal */}
      <AnchorComparisonModal
        isOpen={isAnchorModalOpen}
        onClose={() => setIsAnchorModalOpen(false)}
        settings={settings}
        layers={layers}
        wall={wall}
        struts={struts}
        stages={stages}
        currentStepIndex={currentStepIndex}
        onSelectStep={(idx) => setCurrentStepIndex(idx)}
        onUpdateWall={setWall}
        onUpdateStruts={setStruts}
        calcResult={calcResult}
        initialTab={anchorModalTab}
      />

      {/* Permanent Structure Construction Interference Impact Modal */}
      <StructureConstructionImpactModal
        isOpen={isStructureImpactOpen}
        onClose={() => setIsStructureImpactOpen(false)}
        settings={settings}
      />
    </div>
  );
}
