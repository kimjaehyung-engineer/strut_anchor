import React, { useState } from 'react';
import {
  CalculationResult,
  ExcavationStage,
  ProjectSettings,
  SoilLayer,
  StrutTier,
  WallSection,
} from '../types';
import {
  Eye,
  Layers,
  Activity,
  ArrowDown,
  Droplet,
  Info,
  Maximize2,
  TrendingDown,
  GitCommit,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface ExcavationCanvasProps {
  settings: ProjectSettings;
  layers: SoilLayer[];
  wall: WallSection;
  struts: StrutTier[];
  currentStage: ExcavationStage;
  calcResult: CalculationResult;
}

export type ViewMode =
  | 'CROSS_SECTION'
  | 'EARTH_PRESSURE'
  | 'MOMENT_BMD'
  | 'SHEAR_SFD'
  | 'DISPLACEMENT'
  | 'SETTLEMENT'
  | 'MULTI_VIEW';

export const ExcavationCanvas: React.FC<ExcavationCanvasProps> = ({
  settings,
  layers,
  wall,
  struts,
  currentStage,
  calcResult,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('CROSS_SECTION');
  const [hoverDepth, setHoverDepth] = useState<number | null>(null);

  const excavationDepth = currentStage.excavationDepth;
  const totalLength = wall.totalLength;
  const gwt = settings.groundWaterTable;
  const stationWidth = settings.stationWidth;
  const stationLength = settings.stationLength || 100;

  // Active struts for current stage
  const activeStruts = struts.filter(
    (s) => currentStage.activeStrutIds.includes(s.id) && s.depth <= excavationDepth + 0.1
  );

  // SVG coordinate transformation
  const width = 880;
  const height = 650;
  const marginTop = 85; // Increased top margin to provide ample room for front-view vehicles & annotations
  const marginBottom = 35;
  const marginLeft = 65;
  const marginRight = 45;

  const viewHeight = height - marginTop - marginBottom;
  const maxDepthView = Math.max(totalLength + 2, 32);
  const scaleY = viewHeight / maxDepthView; // pixels per meter depth

  // Center coordinate for the excavation pit
  const centerX = width / 2;
  const scaleX = 14; // pixels per meter horizontal
  const pitHalfWidthPx = (stationWidth / 2) * scaleX;
  const leftWallX = centerX - pitHalfWidthPx;
  const rightWallX = centerX + pitHalfWidthPx;

  const getY = (depth: number) => marginTop + depth * scaleY;

  // Lane center X coordinates for dual-way traffic
  const lane1CenterX = leftWallX + (centerX - leftWallX) * 0.48; // Left lane (상행선)
  const lane2CenterX = centerX + (rightWallX - centerX) * 0.52; // Right lane (하행선)

  // Max values for diagram scaling
  const maxPressure = Math.max(1, ...calcResult.points.map((p) => p.totalLateralPressure));
  const maxMoment = Math.max(1, ...calcResult.points.map((p) => p.bendingMoment));
  const maxShear = Math.max(1, ...calcResult.points.map((p) => Math.abs(p.shearForce)));
  const maxDisp = Math.max(1, ...calcResult.points.map((p) => p.displacement));

  // Hover data point
  const hoverPoint =
    hoverDepth !== null
      ? calcResult.points.find((p) => Math.abs(p.depth - hoverDepth) < 0.3)
      : null;

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col">
      {/* Header View Switcher */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">
            실시간 지반·구조 연동 횡단면도
          </span>
          <span className="text-[11px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-mono font-medium">
            현재 굴착심도: GL -{excavationDepth.toFixed(1)}m
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-200/70 p-1 rounded border border-slate-300/60">
          <button
            onClick={() => setViewMode('CROSS_SECTION')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center space-x-1.5 ${
              viewMode === 'CROSS_SECTION'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>2D 지반단면</span>
          </button>
          <button
            onClick={() => setViewMode('EARTH_PRESSURE')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center space-x-1.5 ${
              viewMode === 'EARTH_PRESSURE'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>토압·수압도</span>
          </button>
          <button
            onClick={() => setViewMode('MOMENT_BMD')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center space-x-1.5 ${
              viewMode === 'MOMENT_BMD'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-blue-600" />
            <span>휨모멘트 (BMD)</span>
          </button>
          <button
            onClick={() => setViewMode('SHEAR_SFD')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center space-x-1.5 ${
              viewMode === 'SHEAR_SFD'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>전단력 (SFD)</span>
          </button>
          <button
            onClick={() => setViewMode('DISPLACEMENT')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center space-x-1.5 ${
              viewMode === 'DISPLACEMENT'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-blue-600" />
            <span>벽체변위 (δ)</span>
          </button>
          <button
            onClick={() => setViewMode('SETTLEMENT')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center space-x-1.5 ${
              viewMode === 'SETTLEMENT'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
            <span>지표침하곡선</span>
          </button>
          <button
            onClick={() => setViewMode('MULTI_VIEW')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all flex items-center space-x-1.5 ${
              viewMode === 'MULTI_VIEW'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>종합 4분할뷰</span>
          </button>
        </div>
      </div>

      {/* Main SVG Visualization (Bright Clean Engineering Theme) */}
      <div className="relative flex-1 bg-slate-50 flex items-center justify-center p-3 overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[960px] h-auto font-sans bg-white rounded border border-slate-200/90 shadow-inner"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const svgY = ((e.clientY - rect.top) / rect.height) * height;
            if (svgY >= marginTop && svgY <= marginTop + totalLength * scaleY) {
              const d = Math.round(((svgY - marginTop) / scaleY) * 2) / 2;
              setHoverDepth(d);
            } else {
              setHoverDepth(null);
            }
          }}
          onMouseLeave={() => setHoverDepth(null)}
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="lightGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            </pattern>

            {/* Soil Gradients */}
            <linearGradient id="groundWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.45" />
            </linearGradient>

            <pattern id="soilFillPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.9" fill="#94a3b8" opacity="0.35" />
              <circle cx="7" cy="7" r="1.2" fill="#64748b" opacity="0.35" />
            </pattern>
            <pattern id="sandPattern" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="0.8" fill="#d97706" opacity="0.35" />
            </pattern>
            <pattern id="rockPattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M0 16 L16 0 M8 16 L16 8 M0 8 L8 0" stroke="#64748b" strokeWidth="0.8" opacity="0.3" />
            </pattern>
            <pattern id="deckHatch" width="6" height="6" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="6" y2="6" stroke="#94a3b8" strokeWidth="0.9" />
            </pattern>

            {/* Markers */}
            <marker id="dimArrowStart" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto">
              <polygon points="6,0 0,3 6,6" fill="#3b82f6" />
            </marker>
            <marker id="dimArrowEnd" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
              <polygon points="0,0 6,3 0,6" fill="#3b82f6" />
            </marker>
            <marker id="loadArrowRed" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
              <polygon points="0,0 6,0 3,6" fill="#ef4444" />
            </marker>
            <marker id="loadArrowOrange" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
              <polygon points="0,0 6,0 3,6" fill="#f59e0b" />
            </marker>
          </defs>

          {/* SVG Canvas Base Background */}
          <rect width={width} height={height} fill="#ffffff" />
          <rect width={width} height={height} fill="url(#lightGrid)" />

          {/* Standard Single or Multi Views */}
          {viewMode === 'CROSS_SECTION' && (
            <g id="crossSectionGroup">
              {/* Left Ground Layers */}
              {layers.map((layer) => {
                const yTop = getY(layer.depthTop);
                const yBottom = getY(Math.min(layer.depthBottom, maxDepthView));
                const layerHeight = Math.max(0, yBottom - yTop);
                return (
                  <g key={`left-${layer.id}`}>
                    <rect
                      x={marginLeft}
                      y={yTop}
                      width={leftWallX - marginLeft}
                      height={layerHeight}
                      fill={layer.color}
                      opacity={0.3}
                    />
                    {/* Pattern Overlay */}
                    <rect
                      x={marginLeft}
                      y={yTop}
                      width={leftWallX - marginLeft}
                      height={layerHeight}
                      fill={
                        layer.type === 'sand'
                          ? 'url(#sandPattern)'
                          : layer.type === 'hard_rock' || layer.type === 'weathered_rock'
                          ? 'url(#rockPattern)'
                          : 'url(#soilFillPattern)'
                      }
                    />
                    {/* Layer Boundary Line */}
                    <line
                      x1={marginLeft}
                      y1={yBottom}
                      x2={leftWallX}
                      y2={yBottom}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                    {/* Layer Name Annotation Badge */}
                    <g transform={`translate(${marginLeft + 6}, ${yTop + 4})`}>
                      <rect
                        x="0"
                        y="0"
                        width="186"
                        height="15"
                        rx="3"
                        fill="#ffffff"
                        fillOpacity="0.88"
                        stroke="#cbd5e1"
                        strokeWidth="0.8"
                      />
                      <text
                        x="5"
                        y="11"
                        fill="#1e293b"
                        fontSize="9"
                        fontWeight="600"
                      >
                        {layer.name} (N={layer.nValue}, c={layer.cohesion}, φ={layer.frictionAngle}°)
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Right Ground Layers */}
              {layers.map((layer) => {
                const yTop = getY(layer.depthTop);
                const yBottom = getY(Math.min(layer.depthBottom, maxDepthView));
                const layerHeight = Math.max(0, yBottom - yTop);
                return (
                  <g key={`right-${layer.id}`}>
                    <rect
                      x={rightWallX}
                      y={yTop}
                      width={width - marginRight - rightWallX}
                      height={layerHeight}
                      fill={layer.color}
                      opacity={0.3}
                    />
                    <rect
                      x={rightWallX}
                      y={yTop}
                      width={width - marginRight - rightWallX}
                      height={layerHeight}
                      fill={
                        layer.type === 'sand'
                          ? 'url(#sandPattern)'
                          : layer.type === 'hard_rock' || layer.type === 'weathered_rock'
                          ? 'url(#rockPattern)'
                          : 'url(#soilFillPattern)'
                      }
                    />
                    <line
                      x1={rightWallX}
                      y1={yBottom}
                      x2={width - marginRight}
                      y2={yBottom}
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  </g>
                );
              })}

              {/* Underground Water Table (GWT) */}
              <g id="gwtGroup">
                {/* Left GWT Line */}
                <line
                  x1={marginLeft}
                  y1={getY(gwt)}
                  x2={leftWallX}
                  y2={getY(gwt)}
                  stroke="#0284c7"
                  strokeWidth="2.2"
                  strokeDasharray="6 3"
                />
                {/* Right GWT Line */}
                <line
                  x1={rightWallX}
                  y1={getY(gwt)}
                  x2={width - marginRight}
                  y2={getY(gwt)}
                  stroke="#0284c7"
                  strokeWidth="2.2"
                  strokeDasharray="6 3"
                />
                {/* GWT Label Badge */}
                <g transform={`translate(${marginLeft + 4}, ${getY(gwt) - 18})`}>
                  <rect
                    x="0"
                    y="0"
                    width="114"
                    height="16"
                    rx="3"
                    fill="#0284c7"
                    stroke="#0369a1"
                    strokeWidth="1"
                  />
                  <text
                    x="57"
                    y="11.5"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ▼ 지하수위 GL -{gwt.toFixed(1)}m
                  </text>
                </g>
              </g>

              {/* Excavation Pit Zone */}
              {/* Unexcavated Soil Below Current Excavation Floor */}
              {layers.map((layer) => {
                const yTop = Math.max(getY(excavationDepth), getY(layer.depthTop));
                const yBottom = getY(Math.min(layer.depthBottom, maxDepthView));
                if (yBottom <= yTop) return null;
                return (
                  <rect
                    key={`pit-${layer.id}`}
                    x={leftWallX}
                    y={yTop}
                    width={rightWallX - leftWallX}
                    height={yBottom - yTop}
                    fill={layer.color}
                    opacity={0.45}
                  />
                );
              })}

              {/* Excavated Air Space (Bright White Background) */}
              <rect
                x={leftWallX}
                y={marginTop}
                width={rightWallX - leftWallX}
                height={getY(excavationDepth) - marginTop}
                fill="#f8fafc"
                opacity="0.8"
              />

              {/* Excavation Base Floor Line */}
              <line
                x1={leftWallX}
                y1={getY(excavationDepth)}
                x2={rightWallX}
                y2={getY(excavationDepth)}
                stroke="#d97706"
                strokeWidth="3"
              />
              {/* Excavation Depth Floor Badge */}
              <g transform={`translate(${centerX - 80}, ${getY(excavationDepth) - 18})`}>
                <rect
                  x="0"
                  y="0"
                  width="160"
                  height="16"
                  rx="3"
                  fill="#b45309"
                  stroke="#78350f"
                  strokeWidth="1"
                />
                <text
                  x="80"
                  y="11.5"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  ▼ 현재 굴착면 GL -{excavationDepth.toFixed(1)}m
                </text>
              </g>

              {/* ========================================================================= */}
              {/* ROAD DECKING & DUAL-WAY TRAFFIC VEHICLES (FRONT-VIEW 정면 모습) */}
              {/* ========================================================================= */}
              <g id="roadDeckingAndTraffic">
                {/* 1. Surface Asphalt Ground Line (GL ±0.0m) */}
                <rect
                  x={marginLeft}
                  y={marginTop - 16}
                  width={width - marginLeft - marginRight}
                  height="16"
                  fill="#334155"
                />
                {/* Road Lane Markings Outside Pit */}
                <line
                  x1={marginLeft}
                  y1={marginTop - 8}
                  x2={leftWallX}
                  y2={marginTop - 8}
                  stroke="#f8fafc"
                  strokeWidth="1.5"
                  strokeDasharray="8 6"
                />
                <line
                  x1={rightWallX}
                  y1={marginTop - 8}
                  x2={width - marginRight}
                  y2={marginTop - 8}
                  stroke="#f8fafc"
                  strokeWidth="1.5"
                  strokeDasharray="8 6"
                />

                {/* 2. Steel Decking Plates (복공판 강재 200mm) */}
                <rect
                  x={leftWallX}
                  y={marginTop - 18}
                  width={rightWallX - leftWallX}
                  height="18"
                  fill="#1e293b"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  rx="1"
                />
                <rect
                  x={leftWallX}
                  y={marginTop - 18}
                  width={rightWallX - leftWallX}
                  height="18"
                  fill="url(#deckHatch)"
                  opacity="0.6"
                />

                {/* Dual-Way Centerline on Decking (상하행 중앙선 노란색 복선) */}
                <line
                  x1={centerX - 1.5}
                  y1={marginTop - 18}
                  x2={centerX - 1.5}
                  y2={marginTop}
                  stroke="#eab308"
                  strokeWidth="1.5"
                />
                <line
                  x1={centerX + 1.5}
                  y1={marginTop - 18}
                  x2={centerX + 1.5}
                  y2={marginTop}
                  stroke="#eab308"
                  strokeWidth="1.5"
                />

                {/* 3. Decking Main Girders (복공 주형보 H-400×400) */}
                {/* Left Wall Support Girder */}
                <g id="leftGirder">
                  <rect x={leftWallX - 4} y={marginTop} width="22" height="14" fill="#475569" stroke="#334155" strokeWidth="1" rx="1" />
                  <line x1={leftWallX - 4} y1={marginTop + 2} x2={leftWallX + 18} y2={marginTop + 2} stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1={leftWallX - 4} y1={marginTop + 12} x2={leftWallX + 18} y2={marginTop + 12} stroke="#94a3b8" strokeWidth="1.5" />
                </g>
                {/* Right Wall Support Girder */}
                <g id="rightGirder">
                  <rect x={rightWallX - 18} y={marginTop} width="22" height="14" fill="#475569" stroke="#334155" strokeWidth="1" rx="1" />
                  <line x1={rightWallX - 18} y1={marginTop + 2} x2={rightWallX + 4} y2={marginTop + 2} stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1={rightWallX - 18} y1={marginTop + 12} x2={rightWallX + 4} y2={marginTop + 12} stroke="#94a3b8" strokeWidth="1.5" />
                </g>
                {/* Center King Post Top Girder & Cap Plate (중간말뚝 두부 주형보) */}
                <g id="centerGirder">
                  <rect x={centerX - 22} y={marginTop} width="44" height="15" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" rx="1" />
                  <line x1={centerX - 22} y1={marginTop + 2} x2={centerX + 22} y2={marginTop + 2} stroke="#fcd34d" strokeWidth="1.5" />
                  <line x1={centerX - 22} y1={marginTop + 13} x2={centerX + 22} y2={marginTop + 13} stroke="#fcd34d" strokeWidth="1.5" />
                </g>

                {/* ===================================================================== */}
                {/* [상행선 좌측 차로] FRONT-VIEW CAR / SUV (승용차 정면 앞모습) */}
                {/* ===================================================================== */}
                <g id="lane1CarFront" transform={`translate(${lane1CenterX - 22}, ${marginTop - 54})`}>
                  {/* Lane Badge */}
                  <rect x="0" y="-12" width="44" height="11" rx="2" fill="#0284c7" />
                  <text x="22" y="-3.5" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                    상행선
                  </text>

                  {/* Left & Right Tires (정면 전륜 타이어) */}
                  <rect x="1" y="22" width="7" height="14" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
                  <rect x="36" y="22" width="7" height="14" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />

                  {/* Lower Chassis / Underbody */}
                  <rect x="6" y="26" width="32" height="6" fill="#1e293b" />

                  {/* Main Car Body (차체 하단 및 범퍼) */}
                  <rect x="3" y="16" width="38" height="14" rx="3" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />

                  {/* Cabin / Roof (상단 캐빈 및 루프) */}
                  <path
                    d="M 8 16 L 11 4 L 33 4 L 36 16 Z"
                    fill="#3b82f6"
                    stroke="#1d4ed8"
                    strokeWidth="1"
                  />

                  {/* Front Windshield Glass (전면 윈드실드 유리) */}
                  <path
                    d="M 10 15 L 12.5 5.5 L 31.5 5.5 L 34 15 Z"
                    fill="#e0f2fe"
                    stroke="#60a5fa"
                    strokeWidth="0.8"
                  />
                  {/* Rearview Mirror Inside (룸미러) */}
                  <rect x="20.5" y="6" width="3" height="2" fill="#475569" rx="0.5" />

                  {/* Side Mirrors (좌우 사이드미러) */}
                  <rect x="-1" y="12" width="4" height="3" rx="1" fill="#1d4ed8" />
                  <rect x="41" y="12" width="4" height="3" rx="1" fill="#1d4ed8" />

                  {/* Radiator Grille (전면 라디에이터 그릴) */}
                  <rect x="13" y="19" width="18" height="6" rx="1.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
                  <line x1="14" y1="22" x2="30" y2="22" stroke="#64748b" strokeWidth="0.8" />

                  {/* Left & Right Headlights (LED 헤드라이트) */}
                  <polygon points="5,18 11,18 10,22 5,22" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />
                  <polygon points="33,18 39,18 39,22 34,22" fill="#fef08a" stroke="#eab308" strokeWidth="0.8" />

                  {/* License Plate (번호판) */}
                  <rect x="17" y="25" width="10" height="4" rx="0.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.6" />
                  <text x="22" y="28.2" fill="#0f172a" fontSize="3.5" fontWeight="bold" textAnchor="middle">
                    SEOUL
                  </text>
                </g>

                {/* ===================================================================== */}
                {/* [하행선 우측 차로] FRONT-VIEW HEAVY TRUCK / DB-24 (대형 덤프트럭 정면 앞모습) */}
                {/* ===================================================================== */}
                <g id="lane2TruckFront" transform={`translate(${lane2CenterX - 28}, ${marginTop - 62})`}>
                  {/* Lane Badge */}
                  <rect x="0" y="-12" width="56" height="11" rx="2" fill="#b45309" />
                  <text x="28" y="-3.5" fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                    하행선 (DB-24)
                  </text>

                  {/* Left & Right Heavy Tires (대형 전륜 복륜 타이어) */}
                  <rect x="1" y="28" width="9" height="16" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
                  <rect x="46" y="28" width="9" height="16" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />

                  {/* Heavy Chassis Axle */}
                  <rect x="8" y="34" width="40" height="7" fill="#1e293b" />

                  {/* Main Truck Cabin Box (높은 대형 트럭 캐빈) */}
                  <rect x="4" y="2" width="48" height="36" rx="3" fill="#ea580c" stroke="#c2410c" strokeWidth="1.2" />

                  {/* Sunvisor (상부 썬바이저) */}
                  <rect x="3" y="1" width="50" height="4" rx="1" fill="#7c2d12" />
                  {/* Roof Marker Lights (상단 차폭등) */}
                  <circle cx="12" cy="3" r="1" fill="#fef08a" />
                  <circle cx="28" cy="3" r="1" fill="#fef08a" />
                  <circle cx="44" cy="3" r="1" fill="#fef08a" />

                  {/* Large Truck Windshield (대형 전면 윈드실드) */}
                  <rect x="7" y="6" width="42" height="15" rx="1.5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="0.8" />
                  {/* Windshield Wipers */}
                  <line x1="16" y1="19" x2="22" y2="10" stroke="#0f172a" strokeWidth="1" />
                  <line x1="32" y1="19" x2="38" y2="10" stroke="#0f172a" strokeWidth="1" />

                  {/* Large Side Mirrors (와이드 사이드미러) */}
                  <rect x="-1" y="6" width="4" height="11" rx="1" fill="#1e293b" stroke="#78716c" strokeWidth="0.8" />
                  <line x1="3" y1="8" x2="4" y2="8" stroke="#1e293b" strokeWidth="1" />
                  <line x1="3" y1="15" x2="4" y2="15" stroke="#1e293b" strokeWidth="1" />

                  <rect x="53" y="6" width="4" height="11" rx="1" fill="#1e293b" stroke="#78716c" strokeWidth="0.8" />
                  <line x1="52" y1="8" x2="53" y2="8" stroke="#1e293b" strokeWidth="1" />
                  <line x1="52" y1="15" x2="53" y2="15" stroke="#1e293b" strokeWidth="1" />

                  {/* Massive Chrome Radiator Grille (대형 크롬 그릴) */}
                  <rect x="12" y="23" width="32" height="11" rx="1.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="14" y1="26" x2="42" y2="26" stroke="#94a3b8" strokeWidth="0.8" />
                  <line x1="14" y1="29" x2="42" y2="29" stroke="#94a3b8" strokeWidth="0.8" />
                  <line x1="14" y1="32" x2="42" y2="32" stroke="#94a3b8" strokeWidth="0.8" />

                  {/* Grille Emblem Badge */}
                  <rect x="23" y="24" width="10" height="4" rx="0.5" fill="#b91c1c" />
                  <text x="28" y="27" fill="#ffffff" fontSize="3" fontWeight="bold" textAnchor="middle">
                    DB-24
                  </text>

                  {/* Heavy Dual Headlights (좌우 복합 헤드라이트) */}
                  <rect x="5" y="25" width="6" height="7" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
                  <rect x="45" y="25" width="6" height="7" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />

                  {/* Heavy Steel Bumper & License Plate */}
                  <rect x="3" y="34" width="50" height="4" rx="1" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
                  <rect x="22" y="34.5" width="12" height="3" rx="0.5" fill="#ffffff" />
                  <text x="28" y="36.8" fill="#0f172a" fontSize="3" fontWeight="bold" textAnchor="middle">
                    24-TON
                  </text>
                </g>

                {/* 4. Traffic Wheel Load Downward Vectors (차륜 하중 작용 화살표) */}
                <g id="wheelLoadVectors">
                  {/* Lane 1 Car Wheel Loads */}
                  <line x1={lane1CenterX - 18} y1={marginTop - 18} x2={lane1CenterX - 18} y2={marginTop - 4} stroke="#0284c7" strokeWidth="1.8" />
                  <polygon points={`${lane1CenterX - 20.5},${marginTop - 8} ${lane1CenterX - 18},${marginTop - 2} ${lane1CenterX - 15.5},${marginTop - 8}`} fill="#0284c7" />

                  <line x1={lane1CenterX + 18} y1={marginTop - 18} x2={lane1CenterX + 18} y2={marginTop - 4} stroke="#0284c7" strokeWidth="1.8" />
                  <polygon points={`${lane1CenterX + 15.5},${marginTop - 8} ${lane1CenterX + 18},${marginTop - 2} ${lane1CenterX + 20.5},${marginTop - 8}`} fill="#0284c7" />

                  {/* Lane 2 Truck Wheel Loads (DB-24 집중하중 P=96kN) */}
                  <line x1={lane2CenterX - 23} y1={marginTop - 18} x2={lane2CenterX - 23} y2={marginTop - 3} stroke="#ef4444" strokeWidth="2.2" />
                  <polygon points={`${lane2CenterX - 26},${marginTop - 8} ${lane2CenterX - 23},${marginTop - 1} ${lane2CenterX - 20},${marginTop - 8}`} fill="#ef4444" />

                  <line x1={lane2CenterX + 23} y1={marginTop - 18} x2={lane2CenterX + 23} y2={marginTop - 3} stroke="#ef4444" strokeWidth="2.2" />
                  <polygon points={`${lane2CenterX + 20},${marginTop - 8} ${lane2CenterX + 23},${marginTop - 1} ${lane2CenterX + 26},${marginTop - 8}`} fill="#ef4444" />

                  {/* Central King Post Transfer Vector */}
                  <line x1={centerX} y1={marginTop - 18} x2={centerX} y2={marginTop + 6} stroke="#f59e0b" strokeWidth="2.5" />
                  <polygon points={`${centerX - 4},${marginTop + 1} ${centerX},${marginTop + 9} ${centerX + 4},${marginTop + 1}`} fill="#f59e0b" />
                </g>

                {/* 5. Station Top Dimension Bar & Info Badges (간섭 없는 깔끔한 최상단 배치) */}
                <g id="topDimensionBar">
                  {/* Station Width Dimension Line (B = ...m) */}
                  <line
                    x1={leftWallX}
                    y1={16}
                    x2={rightWallX}
                    y2={16}
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    markerStart="url(#dimArrowStart)"
                    markerEnd="url(#dimArrowEnd)"
                  />
                  {/* Extension lines from walls to dimension line */}
                  <line x1={leftWallX} y1={10} x2={leftWallX} y2={marginTop} stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 2" />
                  <line x1={rightWallX} y1={10} x2={rightWallX} y2={marginTop} stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 2" />

                  {/* Station Dimension Badge */}
                  <rect
                    x={centerX - 125}
                    y={6}
                    width="250"
                    height="20"
                    rx="4"
                    fill="#1e40af"
                    stroke="#3b82f6"
                    strokeWidth="1"
                  />
                  <text
                    x={centerX}
                    y={20}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    정거장 굴착폭 B = {stationWidth.toFixed(1)}m | 연장 L = {stationLength}m
                  </text>
                </g>
              </g>

              {/* ========================================================================= */}
              {/* UNDERGROUND STATION BOX STRUCTURE (지하정거장 본체 구조물 높이 & 토피고) */}
              {/* ========================================================================= */}
              {(() => {
                const structHeight = settings.structureHeight ?? 14.5;
                const topCover = settings.topCoverDepth ?? 7.5;
                const yTop = getY(topCover);
                const yBot = getY(topCover + structHeight);
                const boxHeight = yBot - yTop;
                const boxLeft = leftWallX + 8;
                const boxRight = rightWallX - 8;
                const boxWidth = boxRight - boxLeft;

                return (
                  <g id="stationBoxStructure">
                    {/* Semi-transparent Station Concrete Outline */}
                    <rect
                      x={boxLeft}
                      y={yTop}
                      width={boxWidth}
                      height={boxHeight}
                      fill="#e0e7ff"
                      fillOpacity="0.22"
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeDasharray="6 3"
                      rx="3"
                    />

                    {/* Top Roof Slab (상부 지붕 슬래브 T=1.2m) */}
                    <rect
                      x={boxLeft}
                      y={yTop}
                      width={boxWidth}
                      height="12"
                      fill="#818cf8"
                      fillOpacity="0.35"
                      stroke="#4f46e5"
                      strokeWidth="1.2"
                    />
                    {/* Intermediate Concourse Slab (중간 중2층/대합실 슬래브) */}
                    <line
                      x1={boxLeft}
                      y1={yTop + boxHeight * 0.48}
                      x2={boxRight}
                      y2={yTop + boxHeight * 0.48}
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                    {/* Bottom Base Mat Slab (하부 바닥 기초 슬래브 T=1.5m) */}
                    <rect
                      x={boxLeft}
                      y={yBot - 14}
                      width={boxWidth}
                      height="14"
                      fill="#818cf8"
                      fillOpacity="0.35"
                      stroke="#4f46e5"
                      strokeWidth="1.2"
                    />

                    {/* Station Structure Dimension Badge */}
                    <g transform={`translate(${boxRight - 175}, ${yTop + 18})`}>
                      <rect
                        x="0"
                        y="0"
                        width="170"
                        height="26"
                        rx="4"
                        fill="#312e81"
                        fillOpacity="0.9"
                        stroke="#a5b4fc"
                        strokeWidth="1"
                      />
                      <text x="8" y="11" fill="#c7d2fe" fontSize="8.5" fontWeight="bold">
                        지하정거장 본체 구조물 (2층 Box)
                      </text>
                      <text x="8" y="21" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                        H={structHeight}m (상단 토피고 GL -{topCover}m)
                      </text>
                    </g>
                  </g>
                );
              })()}

              {/* ========================================================================= */}
              {/* UNDERGROUND UTILITIES (지하 매설 지장물 GL -3~5m 가스/상수/통신/전력) */}
              {/* ========================================================================= */}
              <g id="undergroundUtilities">
                {(
                  settings.utilities || [
                    { id: 'util-gas', name: '도시가스관 (D300)', type: 'GAS', depth: 3.2, offsetFromWall: 2.5, diameterMm: 300, color: '#eab308' },
                    { id: 'util-water', name: '상수도 본관 (D500)', type: 'WATER', depth: 3.8, offsetFromWall: 6.5, diameterMm: 500, color: '#0284c7' },
                    { id: 'util-telecom', name: '통신 광케이블 (D150)', type: 'TELECOM', depth: 3.0, offsetFromWall: 13.5, diameterMm: 150, color: '#10b981' },
                    { id: 'util-power', name: '한전 지중전력구 (D250)', type: 'POWER', depth: 4.5, offsetFromWall: 17.0, diameterMm: 250, color: '#ef4444' },
                  ]
                ).map((util) => {
                  const yUtil = getY(util.depth);
                  const xUtil = leftWallX + (util.offsetFromWall / stationWidth) * (rightWallX - leftWallX);
                  const pipeRadius = Math.max(5, (util.diameterMm / 1000) * 12);

                  return (
                    <g key={util.id} id={util.id}>
                      {/* Pipe Cross-section Outer Ring */}
                      <circle
                        cx={xUtil}
                        cy={yUtil}
                        r={pipeRadius}
                        fill={util.color}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        fillOpacity="0.9"
                      />
                      {/* Pipe Inner Hole */}
                      <circle
                        cx={xUtil}
                        cy={yUtil}
                        r={Math.max(2, pipeRadius - 2.5)}
                        fill="#ffffff"
                        fillOpacity="0.85"
                        stroke={util.color}
                        strokeWidth="1"
                      />

                      {/* Leader Line & Label Tag */}
                      <line
                        x1={xUtil}
                        y1={yUtil - pipeRadius}
                        x2={xUtil}
                        y2={yUtil - pipeRadius - 10}
                        stroke={util.color}
                        strokeWidth="1.2"
                      />
                      <g transform={`translate(${xUtil - 38}, ${yUtil - pipeRadius - 22})`}>
                        <rect
                          x="0"
                          y="0"
                          width="76"
                          height="12"
                          rx="2"
                          fill="#0f172a"
                          fillOpacity="0.88"
                          stroke={util.color}
                          strokeWidth="1"
                        />
                        <text
                          x="38"
                          y="8.5"
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {util.name.split(' ')[0]} GL -{util.depth}m
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>

              {/* ========================================================================= */}
              {/* RETAINING WALLS (엄지말뚝 / 흙막이벽체 좌우 2열) */}
              {/* ========================================================================= */}
              {/* Left Wall */}
              <g id="leftWall">
                <rect
                  x={leftWallX - 8}
                  y={marginTop}
                  width="10"
                  height={totalLength * scaleY}
                  fill="#0284c7"
                  stroke="#0369a1"
                  strokeWidth="1.5"
                  rx="1"
                />
                {/* Embedment Highlight */}
                <rect
                  x={leftWallX - 8}
                  y={getY(excavationDepth)}
                  width="10"
                  height={(totalLength - excavationDepth) * scaleY}
                  fill="#1d4ed8"
                  opacity="0.85"
                />
              </g>

              {/* Right Wall */}
              <g id="rightWall">
                <rect
                  x={rightWallX - 2}
                  y={marginTop}
                  width="10"
                  height={totalLength * scaleY}
                  fill="#0284c7"
                  stroke="#0369a1"
                  strokeWidth="1.5"
                  rx="1"
                />
                <rect
                  x={rightWallX - 2}
                  y={getY(excavationDepth)}
                  width="10"
                  height={(totalLength - excavationDepth) * scaleY}
                  fill="#1d4ed8"
                  opacity="0.85"
                />
              </g>

              {/* ========================================================================= */}
              {/* CENTER KING POST SYSTEM (중간말뚝 상세 구조 및 지지력) */}
              {/* ========================================================================= */}
              <g id="centerKingPostSystem">
                {/* 1. Bedrock Socket Concrete Casing */}
                <rect
                  x={centerX - 16}
                  y={getY(totalLength - 4)}
                  width="32"
                  height={getY(totalLength + 4) - getY(totalLength - 4)}
                  fill="#e2e8f0"
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  rx="2"
                  opacity="0.9"
                />
                <rect
                  x={centerX - 16}
                  y={getY(totalLength - 4)}
                  width="32"
                  height={getY(totalLength + 4) - getY(totalLength - 4)}
                  fill="url(#deckHatch)"
                  opacity="0.5"
                />

                {/* 2. Steel Column Body (H-Beam Graphic) */}
                {/* Web Column Fill */}
                <rect
                  x={centerX - 6}
                  y={marginTop + 14}
                  width="12"
                  height={getY(totalLength + 3) - (marginTop + 14)}
                  fill="#0284c7"
                  stroke="#0369a1"
                  strokeWidth="1.5"
                />
                {/* Left Flange */}
                <rect
                  x={centerX - 8}
                  y={marginTop + 14}
                  width="4"
                  height={getY(totalLength + 3) - (marginTop + 14)}
                  fill="#38bdf8"
                />
                {/* Right Flange */}
                <rect
                  x={centerX + 4}
                  y={marginTop + 14}
                  width="4"
                  height={getY(totalLength + 3) - (marginTop + 14)}
                  fill="#38bdf8"
                />
                {/* Centerline */}
                <line
                  x1={centerX}
                  y1={marginTop + 14}
                  x2={centerX}
                  y2={getY(totalLength + 3)}
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="6 3"
                />

                {/* 3. Upward Geotechnical Bearing Reaction Vectors at Pile Tip */}
                <g id="pileTipBearing">
                  <line x1={centerX - 10} y1={getY(totalLength + 3)} x2={centerX - 10} y2={getY(totalLength + 1)} stroke="#059669" strokeWidth="2" />
                  <polygon points={`${centerX - 13},${getY(totalLength + 1.5)} ${centerX - 10},${getY(totalLength + 0.5)} ${centerX - 7},${getY(totalLength + 1.5)}`} fill="#059669" />

                  <line x1={centerX} y1={getY(totalLength + 3)} x2={centerX} y2={getY(totalLength + 0.5)} stroke="#059669" strokeWidth="2.5" />
                  <polygon points={`${centerX - 3.5},${getY(totalLength + 1.2)} ${centerX},${getY(totalLength)} ${centerX + 3.5},${getY(totalLength + 1.2)}`} fill="#059669" />

                  <line x1={centerX + 10} y1={getY(totalLength + 3)} x2={centerX + 10} y2={getY(totalLength + 1)} stroke="#059669" strokeWidth="2" />
                  <polygon points={`${centerX + 7},${getY(totalLength + 1.5)} ${centerX + 10},${getY(totalLength + 0.5)} ${centerX + 13},${getY(totalLength + 1.5)}`} fill="#059669" />
                </g>

                {/* 4. Center Post Foundation Callout Annotation */}
                <g transform={`translate(${centerX + 20}, ${getY(totalLength + 1) - 18})`}>
                  <rect
                    x="0"
                    y="0"
                    width="180"
                    height="28"
                    rx="3"
                    fill="#ffffff"
                    stroke="#059669"
                    strokeWidth="1.2"
                    className="drop-shadow-sm"
                  />
                  <text
                    x="8"
                    y="12"
                    fill="#065f46"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    중간말뚝 암반소켓 지지층 근입
                  </text>
                  <text
                    x="8"
                    y="23"
                    fill="#475569"
                    fontSize="8.5"
                  >
                    허용지지력 Qa = {calcResult.safety.centerPost?.allowableBearingCapacity ?? 1850} kN (Fs={calcResult.safety.centerPost?.bearingSafetyFactor ?? 2.72})
                  </text>
                </g>

                {/* 5. Center Post Top Performance Badge (간섭 없는 위치에 깔끔한 화이트/골드 박스로 배치) */}
                <g id="centerPostLiveBadge" transform={`translate(${centerX + 22}, ${marginTop + 24})`}>
                  <rect
                    x="0"
                    y="0"
                    width="170"
                    height="32"
                    rx="4"
                    fill="#ffffff"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    className="drop-shadow-sm"
                  />
                  <text x="8" y="13" fill="#b45309" fontSize="9" fontWeight="bold">
                    중간말뚝 {settings.centerPost?.specName?.split(' ')[0] || 'H-300×300'}
                  </text>
                  <text x="8" y="25" fill="#334155" fontSize="8">
                    연직력 Pv={calcResult.safety.centerPost?.totalVerticalLoad ?? 680}kN | 지지력 Fs={calcResult.safety.centerPost?.bearingSafetyFactor ?? 2.72} (안전)
                  </text>
                </g>
              </g>

              {/* ========================================================================= */}
              {/* INSTALLED SUPPORTS: STRUTS, ANCHORS & HYBRID SYSTEMS */}
              {/* ========================================================================= */}
              {activeStruts.map((st) => {
                const yStrut = getY(st.depth);
                const res = calcResult.strutResults.find((r) => r.tier === st.tier);
                const isSafe = res?.isSafe ?? true;
                const isHybrid = st.type === 'HYBRID';
                const isAnchor = st.type === 'GROUND_ANCHOR';
                const isStrutOnly = !isHybrid && !isAnchor;
                const config = st.anchorConfig || {
                  anchorsBetweenStruts: 3,
                  strandCount: 4,
                  anchorAngle: 20,
                  anchorLoadRatio: 0.65,
                };
                const angleRad = ((config.anchorAngle || 20) * Math.PI) / 180;
                const anchorLenPx = 120; // 앵커 길이 그래픽 표현

                return (
                  <g key={st.id} id={`support-tier-${st.tier}`}>
                    {/* Wale (띠장) on Left & Right Wall */}
                    <rect
                      x={leftWallX}
                      y={yStrut - 7}
                      width="12"
                      height="14"
                      fill={isHybrid ? '#a855f7' : isAnchor ? '#f59e0b' : '#f59e0b'}
                      stroke={isHybrid ? '#7e22ce' : isAnchor ? '#d97706' : '#d97706'}
                      strokeWidth="1.2"
                      rx="2"
                    />
                    <rect
                      x={rightWallX - 12}
                      y={yStrut - 7}
                      width="12"
                      height="14"
                      fill={isHybrid ? '#a855f7' : isAnchor ? '#f59e0b' : '#f59e0b'}
                      stroke={isHybrid ? '#7e22ce' : isAnchor ? '#d97706' : '#d97706'}
                      strokeWidth="1.2"
                      rx="2"
                    />

                    {/* --------------------------------------------------------------- */}
                    {/* CASE 1 & CASE 3: STRUT BEAM (버팀보 또는 복합공법 광간격 버팀보) */}
                    {/* --------------------------------------------------------------- */}
                    {(isStrutOnly || isHybrid) && (
                      <g id={`strut-beam-${st.tier}`}>
                        {/* Strut Beam Left Half */}
                        <rect
                          x={leftWallX + 12}
                          y={yStrut - (isHybrid ? 4 : 5)}
                          width={centerX - 10 - (leftWallX + 12)}
                          height={isHybrid ? 8 : 10}
                          fill={isHybrid ? '#7c3aed' : isSafe ? '#0284c7' : '#ef4444'}
                          stroke={isHybrid ? '#5b21b6' : isSafe ? '#0369a1' : '#dc2626'}
                          strokeWidth="1.2"
                          strokeDasharray={isHybrid ? '8 3' : undefined}
                          rx="2"
                          opacity={isHybrid ? 0.9 : 1.0}
                        />

                        {/* Strut Beam Right Half */}
                        <rect
                          x={centerX + 10}
                          y={yStrut - (isHybrid ? 4 : 5)}
                          width={rightWallX - 12 - (centerX + 10)}
                          height={isHybrid ? 8 : 10}
                          fill={isHybrid ? '#7c3aed' : isSafe ? '#0284c7' : '#ef4444'}
                          stroke={isHybrid ? '#5b21b6' : isSafe ? '#0369a1' : '#dc2626'}
                          strokeWidth="1.2"
                          strokeDasharray={isHybrid ? '8 3' : undefined}
                          rx="2"
                          opacity={isHybrid ? 0.9 : 1.0}
                        />

                        {/* Hydraulic Jack / Preload Indicator */}
                        <circle cx={leftWallX + 32} cy={yStrut} r="4.5" fill="#facc15" stroke="#b45309" strokeWidth="1" />
                        <circle cx={rightWallX - 32} cy={yStrut} r="4.5" fill="#facc15" stroke="#b45309" strokeWidth="1" />

                        {/* Center Post Bracing Connection */}
                        <g id={`cleat-${st.id}`}>
                          <rect
                            x={centerX - 12}
                            y={yStrut - 8}
                            width="24"
                            height="16"
                            fill={isHybrid ? '#9333ea' : '#d97706'}
                            stroke={isHybrid ? '#c084fc' : '#f59e0b'}
                            strokeWidth="1.2"
                            rx="2"
                          />
                          <circle cx={centerX - 6} cy={yStrut - 3.5} r="1.2" fill="#ffffff" />
                          <circle cx={centerX + 6} cy={yStrut - 3.5} r="1.2" fill="#ffffff" />
                          <circle cx={centerX - 6} cy={yStrut + 3.5} r="1.2" fill="#ffffff" />
                          <circle cx={centerX + 6} cy={yStrut + 3.5} r="1.2" fill="#ffffff" />
                        </g>
                      </g>
                    )}

                    {/* --------------------------------------------------------------- */}
                    {/* CASE 2 & CASE 3: GROUND ANCHORS (앵커 전용 또는 복합공법 사이 앵커) */}
                    {/* --------------------------------------------------------------- */}
                    {(isAnchor || isHybrid) && (
                      <g id={`anchors-tier-${st.tier}`}>
                        {/* Left Wall Anchor Free Length + Bond Length */}
                        <line
                          x1={leftWallX}
                          y1={yStrut}
                          x2={leftWallX - anchorLenPx * Math.cos(angleRad)}
                          y2={yStrut + anchorLenPx * Math.sin(angleRad)}
                          stroke={isHybrid ? '#9333ea' : '#ea580c'}
                          strokeWidth={isHybrid ? 2.5 : 3.0}
                        />
                        {/* Left Anchor Grout Body (정착장) */}
                        <line
                          x1={leftWallX - anchorLenPx * 0.45 * Math.cos(angleRad)}
                          y1={yStrut + anchorLenPx * 0.45 * Math.sin(angleRad)}
                          x2={leftWallX - anchorLenPx * Math.cos(angleRad)}
                          y2={yStrut + anchorLenPx * Math.sin(angleRad)}
                          stroke="#cbd5e1"
                          strokeWidth="8"
                          strokeLinecap="round"
                          opacity="0.85"
                        />
                        <line
                          x1={leftWallX - anchorLenPx * 0.45 * Math.cos(angleRad)}
                          y1={yStrut + anchorLenPx * 0.45 * Math.sin(angleRad)}
                          x2={leftWallX - anchorLenPx * Math.cos(angleRad)}
                          y2={yStrut + anchorLenPx * Math.sin(angleRad)}
                          stroke={isHybrid ? '#7e22ce' : '#c2410c'}
                          strokeWidth={isHybrid ? 2.5 : 3.0}
                          strokeDasharray="4 2"
                        />

                        {/* Right Wall Anchor Free Length + Bond Length */}
                        <line
                          x1={rightWallX}
                          y1={yStrut}
                          x2={rightWallX + anchorLenPx * Math.cos(angleRad)}
                          y2={yStrut + anchorLenPx * Math.sin(angleRad)}
                          stroke={isHybrid ? '#9333ea' : '#ea580c'}
                          strokeWidth={isHybrid ? 2.5 : 3.0}
                        />
                        {/* Right Anchor Grout Body (정착장) */}
                        <line
                          x1={rightWallX + anchorLenPx * 0.45 * Math.cos(angleRad)}
                          y1={yStrut + anchorLenPx * 0.45 * Math.sin(angleRad)}
                          x2={rightWallX + anchorLenPx * Math.cos(angleRad)}
                          y2={yStrut + anchorLenPx * Math.sin(angleRad)}
                          stroke="#cbd5e1"
                          strokeWidth="8"
                          strokeLinecap="round"
                          opacity="0.85"
                        />
                        <line
                          x1={rightWallX + anchorLenPx * 0.45 * Math.cos(angleRad)}
                          y1={yStrut + anchorLenPx * 0.45 * Math.sin(angleRad)}
                          x2={rightWallX + anchorLenPx * Math.cos(angleRad)}
                          y2={yStrut + anchorLenPx * Math.sin(angleRad)}
                          stroke={isHybrid ? '#7e22ce' : '#c2410c'}
                          strokeWidth={isHybrid ? 2.5 : 3.0}
                          strokeDasharray="4 2"
                        />

                        {/* Anchor Head Plate (지압판) */}
                        <rect x={leftWallX - 4} y={yStrut - 6} width="4" height="12" fill="#0f172a" rx="1" />
                        <rect x={rightWallX} y={yStrut - 6} width="4" height="12" fill="#0f172a" rx="1" />
                      </g>
                    )}

                    {/* --------------------------------------------------------------- */}
                    {/* LIVE ANNOTATION BADGES FOR THIS TIER */}
                    {/* --------------------------------------------------------------- */}
                    {/* Left Span Label */}
                    <rect
                      x={leftWallX + 36}
                      y={yStrut - 19}
                      width={isHybrid ? 148 : 124}
                      height="16"
                      rx="3"
                      fill="#ffffff"
                      stroke={isHybrid ? '#9333ea' : isAnchor ? '#ea580c' : isSafe ? '#0284c7' : '#ef4444'}
                      strokeWidth="1.2"
                      className="drop-shadow-xs"
                    />
                    <text
                      x={leftWallX + 36 + (isHybrid ? 74 : 62)}
                      y={yStrut - 7.5}
                      fill={isHybrid ? '#6b21a8' : isAnchor ? '#9a3412' : isSafe ? '#0369a1' : '#b91c1c'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isHybrid
                        ? `★ ${st.tier}단 복합 (스트럿+앵커3공)`
                        : isAnchor
                        ? `${st.tier}단 앵커 T = ${Math.round((res?.totalAxialForce ?? 280) * 0.8)} kN`
                        : `${st.tier}단 스트럿 N = ${res?.totalAxialForce ?? 0} kN`}
                    </text>

                    {/* Right Span Label */}
                    <rect
                      x={rightWallX - (isHybrid ? 184 : 148)}
                      y={yStrut - 19}
                      width={isHybrid ? 148 : 124}
                      height="16"
                      rx="3"
                      fill="#ffffff"
                      stroke={isHybrid ? '#9333ea' : isAnchor ? '#ea580c' : isSafe ? '#0284c7' : '#ef4444'}
                      strokeWidth="1.2"
                      className="drop-shadow-xs"
                    />
                    <text
                      x={rightWallX - (isHybrid ? 184 : 148) + (isHybrid ? 74 : 62)}
                      y={yStrut - 7.5}
                      fill={isHybrid ? '#6b21a8' : isAnchor ? '#9a3412' : isSafe ? '#0369a1' : '#b91c1c'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {isHybrid
                        ? `@${st.horizontalSpacing}m 간격 / 띠장모멘트 65%상쇄`
                        : isAnchor
                        ? `@${st.horizontalSpacing}m 간격 (내부완전개방)`
                        : `응력비 ${res?.utilizationRatio ?? 0}% (${isSafe ? '안전' : 'NG'})`}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Diagram View: Earth & Water Pressure */}
          {viewMode === 'EARTH_PRESSURE' && (
            <g id="pressureDiagram">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#ffffff" />
              {/* Pressure Curve Area */}
              <path
                d={`M ${centerX} ${getY(0)} ${calcResult.points
                  .map((p) => `L ${centerX + (p.totalLateralPressure / maxPressure) * 220} ${getY(p.depth)}`)
                  .join(' ')} L ${centerX} ${getY(totalLength)} Z`}
                fill="#38bdf8"
                fillOpacity="0.25"
                stroke="#0284c7"
                strokeWidth="2.5"
              />
              {/* Water Pressure Sub-area */}
              <path
                d={`M ${centerX} ${getY(gwt)} ${calcResult.points
                  .filter((p) => p.depth >= gwt)
                  .map((p) => `L ${centerX + (p.waterPressure / maxPressure) * 220} ${getY(p.depth)}`)
                  .join(' ')} L ${centerX} ${getY(totalLength)} Z`}
                fill="#0284c7"
                fillOpacity="0.35"
                stroke="#0369a1"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* Center Datum Line */}
              <line x1={centerX} y1={marginTop} x2={centerX} y2={getY(totalLength)} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={leftWallX} y1={getY(excavationDepth)} x2={rightWallX} y2={getY(excavationDepth)} stroke="#d97706" strokeWidth="2" strokeDasharray="4 2" />

              {/* Title & Max Peak Tag */}
              <text x={centerX + 15} y={marginTop + 20} fill="#0369a1" fontSize="12" fontWeight="bold">
                겉보기 횡방향 토압+수압 분포 (Peck / Rankine)
              </text>
              <text x={centerX + 15} y={marginTop + 38} fill="#64748b" fontSize="10.5">
                최대 측압 P_max = {maxPressure.toFixed(1)} kN/m² (수압 포함)
              </text>
            </g>
          )}

          {/* Diagram View: Bending Moment Diagram (BMD) */}
          {viewMode === 'MOMENT_BMD' && (
            <g id="bmdDiagram">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#ffffff" />
              {/* BMD Area */}
              <path
                d={`M ${centerX} ${getY(0)} ${calcResult.points
                  .map((p) => `L ${centerX + (p.bendingMoment / maxMoment) * 240} ${getY(p.depth)}`)
                  .join(' ')} L ${centerX} ${getY(totalLength)} Z`}
                fill="#f59e0b"
                fillOpacity="0.25"
                stroke="#d97706"
                strokeWidth="2.5"
              />
              <line x1={centerX} y1={marginTop} x2={centerX} y2={getY(totalLength)} stroke="#94a3b8" strokeWidth="1.5" />

              {/* Active Strut lines */}
              {activeStruts.map((st) => (
                <g key={`bmd-${st.id}`}>
                  <line x1={centerX - 30} y1={getY(st.depth)} x2={centerX + 260} y2={getY(st.depth)} stroke="#0284c7" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={centerX - 35} y={getY(st.depth) + 4} fill="#0284c7" fontSize="9.5" textAnchor="end">
                    {st.tier}단 지보 (GL -{st.depth}m)
                  </text>
                </g>
              ))}

              <text x={centerX + 15} y={marginTop + 20} fill="#b45309" fontSize="12" fontWeight="bold">
                벽체 휨모멘트도 BMD (Bending Moment)
              </text>
              <text x={centerX + 15} y={marginTop + 38} fill="#64748b" fontSize="10.5">
                최대 휨모멘트 M_max = {maxMoment.toFixed(1)} kN·m/m (벽체 Zx={wall.sectionModulusZ}cm³)
              </text>
            </g>
          )}

          {/* Diagram View: Shear Force Diagram (SFD) */}
          {viewMode === 'SHEAR_SFD' && (
            <g id="sfdDiagram">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#ffffff" />
              <path
                d={`M ${centerX} ${getY(0)} ${calcResult.points
                  .map((p) => `L ${centerX + (p.shearForce / maxShear) * 200} ${getY(p.depth)}`)
                  .join(' ')} L ${centerX} ${getY(totalLength)} Z`}
                fill="#10b981"
                fillOpacity="0.25"
                stroke="#059669"
                strokeWidth="2.5"
              />
              <line x1={centerX} y1={marginTop} x2={centerX} y2={getY(totalLength)} stroke="#94a3b8" strokeWidth="1.5" />

              <text x={centerX + 15} y={marginTop + 20} fill="#047857" fontSize="12" fontWeight="bold">
                벽체 전단력도 SFD (Shear Force)
              </text>
              <text x={centerX + 15} y={marginTop + 38} fill="#64748b" fontSize="10.5">
                최대 전단력 V_max = {maxShear.toFixed(1)} kN/m
              </text>
            </g>
          )}

          {/* Diagram View: Wall Lateral Displacement (δ) */}
          {viewMode === 'DISPLACEMENT' && (
            <g id="dispDiagram">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#ffffff" />
              {/* Allowable Limit Guideline */}
              <line x1={centerX + 200} y1={marginTop} x2={centerX + 200} y2={getY(totalLength)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x={centerX + 205} y={marginTop + 14} fill="#dc2626" fontSize="9.5">
                관리기준 허용치 δ_allow (30mm)
              </text>

              {/* Displacement Curve */}
              <path
                d={`M ${centerX} ${getY(0)} ${calcResult.points
                  .map((p) => `L ${centerX + (p.displacement / 30) * 200} ${getY(p.depth)}`)
                  .join(' ')} L ${centerX} ${getY(totalLength)} Z`}
                fill="#ec4899"
                fillOpacity="0.25"
                stroke="#db2777"
                strokeWidth="2.5"
              />
              <line x1={centerX} y1={marginTop} x2={centerX} y2={getY(totalLength)} stroke="#94a3b8" strokeWidth="1.5" />

              <text x={centerX + 15} y={marginTop + 20} fill="#be185d" fontSize="12" fontWeight="bold">
                벽체 수평변위 곡선 (Lateral Displacement)
              </text>
              <text x={centerX + 15} y={marginTop + 38} fill="#64748b" fontSize="10.5">
                최대 수평변위 δ_max = {maxDisp.toFixed(1)} mm ({calcResult.safety.displacementRatio}% 수준)
              </text>
            </g>
          )}

          {/* Diagram View: Ground Settlement Profile */}
          {viewMode === 'SETTLEMENT' && (
            <g id="settlementDiagram">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#ffffff" />
              {/* Peck's Empirical Settlement Basin Curve */}
              <path
                d={`M ${leftWallX} ${marginTop} C ${leftWallX - 80} ${marginTop + maxDisp * 1.8}, ${marginLeft + 50} ${marginTop + maxDisp * 0.4}, ${marginLeft} ${marginTop}`}
                fill="#8b5cf6"
                fillOpacity="0.25"
                stroke="#7c3aed"
                strokeWidth="2.5"
              />
              <path
                d={`M ${rightWallX} ${marginTop} C ${rightWallX + 80} ${marginTop + maxDisp * 1.8}, ${width - marginRight - 50} ${marginTop + maxDisp * 0.4}, ${width - marginRight} ${marginTop}`}
                fill="#8b5cf6"
                fillOpacity="0.25"
                stroke="#7c3aed"
                strokeWidth="2.5"
              />
              <line x1={marginLeft} y1={marginTop} x2={width - marginRight} y2={marginTop} stroke="#94a3b8" strokeWidth="1.5" />

              <text x={centerX} y={marginTop + 35} fill="#6d28d9" fontSize="12" fontWeight="bold" textAnchor="middle">
                배면 지반 지표침하 영향 포락선 (Peck / Clough Model)
              </text>
              <text x={centerX} y={marginTop + 52} fill="#64748b" fontSize="10.5" textAnchor="middle">
                최대 지표침하량 S_max ≈ {(maxDisp * 0.75).toFixed(1)} mm (영향거리 d ≈ {(excavationDepth * 2.0).toFixed(1)}m)
              </text>
            </g>
          )}

          {/* Multi View (4-in-1 Dashboard) */}
          {viewMode === 'MULTI_VIEW' && (
            <g id="multiViewGrid">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#ffffff" />
              {/* Split 4 Columns */}
              {/* 1. Cross Section mini */}
              <g transform={`translate(${marginLeft + 15}, 0)`}>
                <rect x="0" y={marginTop} width="160" height={totalLength * scaleY} fill="#f1f5f9" stroke="#cbd5e1" />
                <rect x="30" y={marginTop} width="100" height={(excavationDepth) * scaleY} fill="#ffffff" />
                <line x1="30" y1={getY(excavationDepth)} x2="130" y2={getY(excavationDepth)} stroke="#d97706" strokeWidth="2" />
                <text x="80" y={marginTop - 8} fill="#1e293b" fontSize="10" fontWeight="bold" textAnchor="middle">1. 지반단면</text>
              </g>

              {/* 2. Earth Pressure */}
              <g transform={`translate(${marginLeft + 195}, 0)`}>
                <rect x="0" y={marginTop} width="160" height={totalLength * scaleY} fill="#f1f5f9" stroke="#cbd5e1" />
                <path
                  d={`M 80 ${getY(0)} ${calcResult.points.map((p) => `L ${80 + (p.totalLateralPressure / maxPressure) * 60} ${getY(p.depth)}`).join(' ')} L 80 ${getY(totalLength)} Z`}
                  fill="#0284c7"
                  fillOpacity="0.35"
                  stroke="#0369a1"
                  strokeWidth="2"
                />
                <text x="80" y={marginTop - 8} fill="#0369a1" fontSize="10" fontWeight="bold" textAnchor="middle">2. 토압 (P_max {maxPressure.toFixed(0)}kPa)</text>
              </g>

              {/* 3. BMD */}
              <g transform={`translate(${marginLeft + 375}, 0)`}>
                <rect x="0" y={marginTop} width="160" height={totalLength * scaleY} fill="#f1f5f9" stroke="#cbd5e1" />
                <path
                  d={`M 80 ${getY(0)} ${calcResult.points.map((p) => `L ${80 + (p.bendingMoment / maxMoment) * 60} ${getY(p.depth)}`).join(' ')} L 80 ${getY(totalLength)} Z`}
                  fill="#f59e0b"
                  fillOpacity="0.35"
                  stroke="#d97706"
                  strokeWidth="2"
                />
                <text x="80" y={marginTop - 8} fill="#b45309" fontSize="10" fontWeight="bold" textAnchor="middle">3. 휨모멘트 (M_max {maxMoment.toFixed(0)}kNm)</text>
              </g>

              {/* 4. Displacement */}
              <g transform={`translate(${marginLeft + 555}, 0)`}>
                <rect x="0" y={marginTop} width="160" height={totalLength * scaleY} fill="#f1f5f9" stroke="#cbd5e1" />
                <path
                  d={`M 80 ${getY(0)} ${calcResult.points.map((p) => `L ${80 + (p.displacement / maxDisp) * 60} ${getY(p.depth)}`).join(' ')} L 80 ${getY(totalLength)} Z`}
                  fill="#ec4899"
                  fillOpacity="0.35"
                  stroke="#db2777"
                  strokeWidth="2"
                />
                <text x="80" y={marginTop - 8} fill="#be185d" fontSize="10" fontWeight="bold" textAnchor="middle">4. 변위 (δ_max {maxDisp.toFixed(1)}mm)</text>
              </g>
            </g>
          )}

          {/* Depth Scale Ruler on the Left Axis */}
          <g id="depthRuler">
            <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={marginTop + totalLength * scaleY} stroke="#64748b" strokeWidth="1.5" />
            {Array.from({ length: Math.floor(totalLength / 2) + 1 }).map((_, idx) => {
              const d = idx * 2;
              const y = getY(d);
              return (
                <g key={`tick-${d}`}>
                  <line x1={marginLeft - 5} y1={y} x2={marginLeft} y2={y} stroke="#94a3b8" strokeWidth="1.2" />
                  <text x={marginLeft - 8} y={y + 3.5} fill="#475569" fontSize="9" fontWeight="500" textAnchor="end">
                    -{d}m
                  </text>
                </g>
              );
            })}
          </g>

          {/* Hover Depth Indicator Line & Tooltip */}
          {hoverPoint && (
            <g id="hoverIndicator">
              <line
                x1={marginLeft}
                y1={getY(hoverPoint.depth)}
                x2={width - marginRight}
                y2={getY(hoverPoint.depth)}
                stroke="#e11d48"
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />
              <circle cx={marginLeft} cy={getY(hoverPoint.depth)} r="3.5" fill="#e11d48" />
            </g>
          )}
        </svg>

        {/* Live Hover Tooltip Panel */}
        {hoverPoint && (
          <div className="absolute bottom-4 right-4 bg-white/95 border border-slate-200 backdrop-blur-md rounded p-3.5 shadow-lg text-xs text-slate-700 z-10 w-72 pointer-events-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 font-bold text-blue-700">
              <span>심도: GL -{hoverPoint.depth.toFixed(1)}m</span>
              <span className="text-slate-500 font-normal">{hoverPoint.soilName}</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-slate-600">
              <div>총 측압(토압+수압):</div>
              <div className="text-right font-mono font-bold text-blue-600">
                {hoverPoint.totalLateralPressure} kN/m²
              </div>
              <div>정수압:</div>
              <div className="text-right font-mono text-cyan-600">{hoverPoint.waterPressure} kN/m²</div>
              <div>휨모멘트 M:</div>
              <div className="text-right font-mono font-bold text-amber-600">
                {hoverPoint.bendingMoment} kN·m/m
              </div>
              <div>전단력 V:</div>
              <div className="text-right font-mono text-emerald-600">{hoverPoint.shearForce} kN/m</div>
              <div>벽체 수평변위 δ:</div>
              <div className="text-right font-mono font-bold text-rose-600">
                {hoverPoint.displacement} mm
              </div>
              {hoverPoint.strutReaction && (
                <>
                  <div className="text-amber-700 font-medium">버팀보 반력:</div>
                  <div className="text-right font-mono font-bold text-amber-700">
                    {hoverPoint.strutReaction} kN/m
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block" />
            <span>벽체: {wall.name}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span>설치 지보: {activeStruts.length}개단</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-yellow-500 inline-block" />
            <span>중간말뚝: {settings.centerPost?.specName?.split(' ')[0] || 'H-300×300'} (Qa = {calcResult.safety.centerPost?.allowableBearingCapacity ?? 1850}kN)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
            <span>지하수위: GL -{gwt}m</span>
          </span>
        </div>
        <div className="text-slate-400 italic text-[11px]">
          * 단면도 위에 마우스를 올리면 심도별 상세 응력 및 수평토압이 실시간 연산됩니다.
        </div>
      </div>
    </div>
  );
};
