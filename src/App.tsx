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
import { StageController } from './components/StageController';
import { SafetyCheckMatrix } from './components/SafetyCheckMatrix';
import { InputPanel } from './components/InputPanel';
import { PlanningGuideModal } from './components/PlanningGuideModal';
import { CalculationReportModal } from './components/CalculationReportModal';
import { AiEngineeringAdvisor } from './components/AiEngineeringAdvisor';
import { ReinforcementModal } from './components/ReinforcementModal';
import { AnchorComparisonModal } from './components/AnchorComparisonModal';
import {
  Compass,
  FileText,
  Layers,
  Shield,
  Activity,
  Sliders,
  Bot,
  HelpCircle,
  FolderOpen,
  ChevronRight,
  TrendingDown,
  Building2,
  Sparkles,
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

  const [settings, setSettings] = useState<ProjectSettings>(currentPreset.settings);
  const [layers, setLayers] = useState<SoilLayer[]>(currentPreset.layers);
  const [wall, setWall] = useState<WallSection>(currentPreset.wall);
  const [struts, setStruts] = useState<StrutTier[]>(currentPreset.struts);
  const [stages, setStages] = useState<ExcavationStage[]>(currentPreset.stages);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Active Right-Side Panel Tab
  const [rightTab, setRightTab] = useState<'SAFETY' | 'INPUTS' | 'AI_ADVISOR'>('SAFETY');

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isReinforcementOpen, setIsReinforcementOpen] = useState<boolean>(false);
  const [isAnchorModalOpen, setIsAnchorModalOpen] = useState<boolean>(false);
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
      <header className="min-h-14 py-2 sm:py-0 bg-slate-900 text-white flex flex-wrap items-center justify-between px-3 sm:px-4 lg:px-6 shrink-0 border-b border-slate-700 sticky top-0 z-40 shadow-md gap-2">
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
              {settings.projectName} — {settings.stationName} (개착가시설 안정성 해석)
            </p>
          </div>
        </div>

        {/* Center/Right: Status & Controls Toolbar */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 lg:gap-2.5 text-xs font-medium shrink-0">
          {/* Engine Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-800/90 rounded border border-slate-700 text-slate-300 text-[11px] whitespace-nowrap shrink-0">
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine: Ready
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono">GL -{calcResult.currentExcavationDepth}m</span>
          </div>

          {/* Presets Selector Dropdown */}
          <div className="relative flex items-center bg-slate-800 rounded border border-slate-700 px-2 py-1.5 text-xs text-slate-200 hover:border-slate-600 transition shrink-0 max-w-[190px] sm:max-w-[240px] md:max-w-[280px]">
            <FolderOpen className="w-3.5 h-3.5 text-blue-400 mr-1.5 shrink-0" />
            <select
              value={selectedPresetId}
              onChange={(e) => {
                const p = PRESET_PROJECTS.find((item) => item.id === e.target.value);
                if (p) handleSelectPreset(p);
              }}
              aria-label="대표 표준단면 프리셋 선택"
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs truncate w-full"
            >
              {PRESET_PROJECTS.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block mx-0.5" />

          {/* Quick Auto-Reinforce Button */}
          <button
            onClick={handleTriggerReinforcement}
            className={`px-2.5 sm:px-3 py-1.5 text-white text-xs font-bold rounded flex items-center gap-1.5 transition shadow-sm cursor-pointer whitespace-nowrap shrink-0 ${
              calcResult.summaryStatus === 'SAFE'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 animate-pulse'
            }`}
            title="NG 항목 해소 및 지반보강/단면 상향 최적화"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span>제원상향(보강)</span>
          </button>

          {/* Ground Anchor Comparison Button */}
          <button
            onClick={() => setIsAnchorModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-bold rounded border border-sky-400/30 flex items-center gap-1.5 transition shadow-sm cursor-pointer whitespace-nowrap shrink-0"
            title="스트럿 대신 동일 안전율을 갖는 그라운드 앵커 수량 및 단면 비교해석"
          >
            <Anchor className="w-3.5 h-3.5 text-sky-200 shrink-0" />
            <span>앵커 긴장 비교</span>
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
            className="px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            title="구조계산서 출력 및 검토"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>구조계산서</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 lg:p-5 space-y-4">
        {/* Stage Timeline Controller */}
        <StageController
          stages={stages}
          currentStepIndex={currentStepIndex}
          onSelectStep={(idx) => setCurrentStepIndex(idx)}
        />

        {/* 2-Column Grid Layout: Canvas & Multi-view (Left) / Inspector & Matrix (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column (Canvas Visualizer + Summary Metrics) - 7 Columns */}
          <div className="lg:col-span-7 space-y-3">
            <ExcavationCanvas
              settings={settings}
              layers={layers}
              wall={wall}
              struts={struts}
              currentStage={currentStage}
              calcResult={calcResult}
            />

            {/* Quick Metrics Bar Under Canvas - Professional Polish Grid */}
            <div className="bg-white border border-slate-200 rounded shadow-sm grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-3">
              <div className="px-3 py-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  최대 휨모멘트 (M_max)
                </span>
                <div className="font-mono font-bold text-slate-800 text-sm flex items-baseline gap-1">
                  <span>{calcResult.safety.maxBendingMoment}</span>
                  <span className="text-[10px] font-normal text-slate-500">kN·m/m</span>
                </div>
              </div>

              <div className="px-3 py-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  벽체 최대변위 (δ_max)
                </span>
                <div className="font-mono font-bold text-slate-800 text-sm flex items-baseline gap-1">
                  <span className={calcResult.safety.isDisplacementSafe ? 'text-slate-800' : 'text-rose-600'}>
                    {calcResult.safety.maxDisplacement}
                  </span>
                  <span className="text-[10px] font-normal text-slate-500">/ {calcResult.safety.allowableDisplacement} mm</span>
                </div>
              </div>

              <div className="px-3 py-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  히빙 안전율 (Fs)
                </span>
                <div className="font-mono font-bold text-emerald-600 text-sm flex items-baseline gap-1">
                  <span>Fs = {calcResult.safety.heavingFs > 50 ? '99.0+' : calcResult.safety.heavingFs.toFixed(2)}</span>
                  <span className="text-[10px] font-normal text-slate-500">≥ {calcResult.safety.heavingRequiredFs}</span>
                </div>
              </div>

              <div className="px-3 py-1 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  보일링 안전율 (Fs)
                </span>
                <div className="font-mono font-bold text-emerald-600 text-sm flex items-baseline gap-1">
                  <span>Fs = {calcResult.safety.boilingFs > 50 ? '99.0+' : calcResult.safety.boilingFs.toFixed(2)}</span>
                  <span className="text-[10px] font-normal text-slate-500">≥ {calcResult.safety.boilingRequiredFs}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Tabbed Inspector: Safety Matrix / Inputs / AI Advisor) - 5 Columns */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Panel Tabs Switcher */}
            <div className="bg-slate-200/80 p-1 rounded border border-slate-300 flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setRightTab('SAFETY')}
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 transition ${
                  rightTab === 'SAFETY'
                    ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>KDS 안전성 검토</span>
              </button>
              <button
                onClick={() => setRightTab('INPUTS')}
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 transition ${
                  rightTab === 'INPUTS'
                    ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>설계 변수 편집</span>
              </button>
              <button
                onClick={() => setRightTab('AI_ADVISOR')}
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 transition ${
                  rightTab === 'AI_ADVISOR'
                    ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span>AI 기술자문</span>
              </button>
            </div>

            {/* Tab 1: Safety Matrix */}
            {rightTab === 'SAFETY' && (
              <SafetyCheckMatrix
                calcResult={calcResult}
                wall={wall}
                struts={struts}
                onUpdateStruts={setStruts}
                onOpenReinforcement={handleTriggerReinforcement}
                onOpenAnchorComparison={() => setIsAnchorModalOpen(true)}
              />
            )}

            {/* Tab 2: Inputs Panel */}
            {rightTab === 'INPUTS' && (
              <InputPanel
                settings={settings}
                onUpdateSettings={setSettings}
                layers={layers}
                onUpdateLayers={setLayers}
                wall={wall}
                onUpdateWall={setWall}
                struts={struts}
                onUpdateStruts={setStruts}
              />
            )}

            {/* Tab 3: AI Advisor */}
            {rightTab === 'AI_ADVISOR' && (
              <AiEngineeringAdvisor
                settings={settings}
                layers={layers}
                wall={wall}
                struts={struts}
                currentStage={currentStage}
                calcResult={calcResult}
              />
            )}
          </div>
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
        calcResult={calcResult}
      />
    </div>
  );
}
