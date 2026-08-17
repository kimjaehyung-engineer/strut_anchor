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

  // Active struts for current stage
  const activeStruts = struts.filter(
    (s) => currentStage.activeStrutIds.includes(s.id) && s.depth <= excavationDepth + 0.1
  );

  // SVG coordinate transformation
  const width = 860;
  const height = 620;
  const marginTop = 55;
  const marginBottom = 35;
  const marginLeft = 65;
  const marginRight = 50;

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

  // Max values for diagram scaling
  const maxPressure = Math.max(1, ...calcResult.points.map((p) => p.totalLateralPressure));
  const maxMoment = Math.max(1, ...calcResult.points.map((p) => p.bendingMoment));
  const maxShear = Math.max(1, ...calcResult.points.map((p) => Math.abs(p.shearForce)));
  const maxDisp = Math.max(1, ...calcResult.points.map((p) => p.displacement));

  // Hover data point
  const hoverPoint = hoverDepth !== null ? calcResult.points.find((p) => Math.abs(p.depth - hoverDepth) < 0.3) : null;

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col">
      {/* Header View Switcher */}
      <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">
            실시간 지반·구조 연동 다이어그램
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
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
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
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
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
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
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
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
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
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
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
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
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

      {/* Main SVG Visualization */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[920px] h-auto font-sans"
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
            {/* Soil Gradients */}
            <linearGradient id="groundWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.7" />
            </linearGradient>
            <pattern id="soilFillPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#78716c" opacity="0.4" />
              <circle cx="7" cy="7" r="1.5" fill="#a8a29e" opacity="0.5" />
            </pattern>
            <pattern id="sandPattern" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="0.8" fill="#ca8a04" opacity="0.5" />
            </pattern>
            <pattern id="rockPattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M0 16 L16 0 M8 16 L16 8 M0 8 L8 0" stroke="#475569" strokeWidth="1" opacity="0.4" />
            </pattern>
            <pattern id="deckHatch" width="6" height="6" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="6" y2="6" stroke="#475569" strokeWidth="1" />
            </pattern>
          </defs>

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
                      opacity={0.35}
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
                      stroke="#475569"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                    {/* Layer Name Annotation */}
                    <text
                      x={marginLeft + 8}
                      y={yTop + 14}
                      fill="#e2e8f0"
                      fontSize="10"
                      fontWeight="bold"
                      className="drop-shadow"
                    >
                      {layer.name} (N={layer.nValue}, c={layer.cohesion}, φ={layer.frictionAngle}°)
                    </text>
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
                      opacity={0.35}
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
                      stroke="#475569"
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
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />
                {/* Right GWT Line */}
                <line
                  x1={rightWallX}
                  y1={getY(gwt)}
                  x2={width - marginRight}
                  y2={getY(gwt)}
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />
                <rect
                  x={marginLeft + 4}
                  y={getY(gwt) - 16}
                  width="110"
                  height="14"
                  rx="3"
                  fill="#0369a1"
                  opacity="0.9"
                />
                <text
                  x={marginLeft + 8}
                  y={getY(gwt) - 6}
                  fill="#e0f2fe"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  ▼ 지하수위 GL -{gwt.toFixed(1)}m
                </text>
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
                    opacity={0.5}
                  />
                );
              })}

              {/* Excavation Base Floor Line */}
              <line
                x1={leftWallX}
                y1={getY(excavationDepth)}
                x2={rightWallX}
                y2={getY(excavationDepth)}
                stroke="#f59e0b"
                strokeWidth="3.5"
              />
              <rect
                x={centerX - 70}
                y={getY(excavationDepth) - 18}
                width="140"
                height="16"
                rx="4"
                fill="#b45309"
              />
              <text
                x={centerX}
                y={getY(excavationDepth) - 6}
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                ▼ 현재 굴착면 GL -{excavationDepth.toFixed(1)}m
              </text>

              {/* Road Decking & Traffic Area */}
              <g id="roadDecking">
                {/* Surface Asphalt Ground */}
                <rect x={marginLeft} y={marginTop - 16} width={width - marginLeft - marginRight} height="16" fill="#1e293b" />
                {/* Road Lane Markings (White / Yellow Dashed) */}
                <line x1={marginLeft} y1={marginTop - 8} x2={leftWallX} y2={marginTop - 8} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8 6" />
                <line x1={rightWallX} y1={marginTop - 8} x2={width - marginRight} y2={marginTop - 8} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="8 6" />

                {/* Heavy Road Decking Plates (강재 복공판 2.0m x 0.75m, t=200mm) */}
                <rect
                  x={leftWallX}
                  y={marginTop - 20}
                  width={rightWallX - leftWallX}
                  height="20"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  rx="1"
                />
                <rect
                  x={leftWallX}
                  y={marginTop - 20}
                  width={rightWallX - leftWallX}
                  height="20"
                  fill="url(#deckHatch)"
                  opacity="0.75"
                />

                {/* Decking Main Girders (복공 주형보 H-400×400 / H-440×300) */}
                {/* Left Wall Support Girder */}
                <g id="leftGirder">
                  <rect x={leftWallX - 4} y={marginTop} width="24" height="14" fill="#334155" stroke="#94a3b8" strokeWidth="1" rx="1" />
                  <line x1={leftWallX - 4} y1={marginTop + 2} x2={leftWallX + 20} y2={marginTop + 2} stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1={leftWallX - 4} y1={marginTop + 12} x2={leftWallX + 20} y2={marginTop + 12} stroke="#cbd5e1" strokeWidth="1.5" />
                </g>
                {/* Right Wall Support Girder */}
                <g id="rightGirder">
                  <rect x={rightWallX - 20} y={marginTop} width="24" height="14" fill="#334155" stroke="#94a3b8" strokeWidth="1" rx="1" />
                  <line x1={rightWallX - 20} y1={marginTop + 2} x2={rightWallX + 4} y2={marginTop + 2} stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1={rightWallX - 20} y1={marginTop + 12} x2={rightWallX + 4} y2={marginTop + 12} stroke="#cbd5e1" strokeWidth="1.5" />
                </g>
                {/* Center King Post Top Girder & Cap Plate (두부 지압판 및 주형보) */}
                <g id="centerGirder">
                  <rect x={centerX - 24} y={marginTop} width="48" height="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" rx="1" />
                  <line x1={centerX - 24} y1={marginTop + 2} x2={centerX + 24} y2={marginTop + 2} stroke="#fcd34d" strokeWidth="1.5" />
                  <line x1={centerX - 24} y1={marginTop + 14} x2={centerX + 24} y2={marginTop + 14} stroke="#fcd34d" strokeWidth="1.5" />
                  {/* Stiffeners */}
                  <line x1={centerX - 10} y1={marginTop + 2} x2={centerX - 10} y2={marginTop + 14} stroke="#94a3b8" strokeWidth="1" />
                  <line x1={centerX + 10} y1={marginTop + 2} x2={centerX + 10} y2={marginTop + 14} stroke="#94a3b8" strokeWidth="1" />
                </g>

                {/* Traffic Vehicle Simulation (DB-24 Heavy Truck / 덤프트럭) */}
                <g id="trafficTruck" transform={`translate(${centerX - 75}, ${marginTop - 58})`}>
                  {/* Truck Body Shadow */}
                  <rect x="0" y="32" width="150" height="4" rx="2" fill="#0284c7" opacity="0.3" />
                  {/* Cargo Container (적재함) */}
                  <rect x="4" y="2" width="92" height="24" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="28" y1="2" x2="28" y2="26" stroke="#0369a1" strokeWidth="1" />
                  <line x1="56" y1="2" x2="56" y2="26" stroke="#0369a1" strokeWidth="1" />
                  <text x="50" y="16" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    DB-24 (24tonf)
                  </text>
                  {/* Truck Cabin (운전석) */}
                  <path d="M 96 10 L 118 10 L 132 20 L 132 26 L 96 26 Z" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                  {/* Windshield */}
                  <path d="M 112 12 L 124 20 L 102 20 L 102 12 Z" fill="#e0f2fe" opacity="0.9" />
                  {/* Chassis Line */}
                  <rect x="2" y="25" width="132" height="4" fill="#334155" />
                  {/* Truck Wheels (차륜) */}
                  {/* Front Wheel */}
                  <circle cx="118" cy="30" r="7" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                  <circle cx="118" cy="30" r="3" fill="#64748b" />
                  {/* Tandem Rear Axles (후륜 2축 - 집중하중 P=96kN) */}
                  <circle cx="30" cy="30" r="7" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="30" cy="30" r="3" fill="#f59e0b" />
                  <circle cx="52" cy="30" r="7" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="52" cy="30" r="3" fill="#f59e0b" />
                </g>

                {/* Traffic Wheel Load Vectors (DB-24 차륜 집중하중 작용선) */}
                <g id="wheelLoadVectors">
                  {/* Rear Axle 1 Vector */}
                  <line x1={centerX - 45} y1={marginTop - 21} x2={centerX - 45} y2={marginTop - 5} stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)" />
                  <polygon points={`${centerX - 48},${marginTop - 8} ${centerX - 45},${marginTop - 2} ${centerX - 42},${marginTop - 8}`} fill="#ef4444" />
                  {/* Rear Axle 2 Vector (Centered over King Post) */}
                  <line x1={centerX - 23} y1={marginTop - 21} x2={centerX - 23} y2={marginTop - 5} stroke="#ef4444" strokeWidth="2" />
                  <polygon points={`${centerX - 26},${marginTop - 8} ${centerX - 23},${marginTop - 2} ${centerX - 20},${marginTop - 8}`} fill="#ef4444" />
                  {/* Front Axle Vector */}
                  <line x1={centerX + 43} y1={marginTop - 21} x2={centerX + 43} y2={marginTop - 5} stroke="#f59e0b" strokeWidth="2" />
                  <polygon points={`${centerX + 40},${marginTop - 8} ${centerX + 43},${marginTop - 2} ${centerX + 46},${marginTop - 8}`} fill="#f59e0b" />
                  {/* Central Load Vector downward into King Post */}
                  <line x1={centerX} y1={marginTop - 20} x2={centerX} y2={marginTop + 8} stroke="#f59e0b" strokeWidth="3" />
                  <polygon points={`${centerX - 4},${marginTop + 2} ${centerX},${marginTop + 10} ${centerX + 4},${marginTop + 2}`} fill="#f59e0b" />
                </g>

                {/* Decking and Surcharge Title Callout */}
                <rect
                  x={centerX - 130}
                  y={marginTop - 74}
                  width="260"
                  height="16"
                  rx="3"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
                <text
                  x={centerX}
                  y={marginTop - 62}
                  fill="#e0f2fe"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  도로 복공판 DB-24 중차량하중 (P=96kN × 2륜, q={settings.surchargeLoad}kN/m²)
                </text>
              </g>

              {/* Retaining Walls (Left and Right) */}
              {/* Left Wall */}
              <g id="leftWall">
                <rect
                  x={leftWallX - 8}
                  y={marginTop}
                  width="10"
                  height={totalLength * scaleY}
                  fill="#0284c7"
                  stroke="#38bdf8"
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
                  opacity="0.8"
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
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  rx="1"
                />
                <rect
                  x={rightWallX - 2}
                  y={getY(excavationDepth)}
                  width="10"
                  height={(totalLength - excavationDepth) * scaleY}
                  fill="#1d4ed8"
                  opacity="0.8"
                />
              </g>

              {/* Center King Post System (교통하중 지지용 중간말뚝 상세 구조) */}
              <g id="centerKingPostSystem">
                {/* 1. Bedrock Socket Concrete Casing (암반 근입 기초 소켓 GL -20m ~ -28m) */}
                <rect
                  x={centerX - 16}
                  y={getY(totalLength - 4)}
                  width="32"
                  height={getY(totalLength + 4) - getY(totalLength - 4)}
                  fill="#334155"
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  rx="2"
                  opacity="0.85"
                />
                {/* Socket Bore Hole Texture */}
                <rect
                  x={centerX - 16}
                  y={getY(totalLength - 4)}
                  width="32"
                  height={getY(totalLength + 4) - getY(totalLength - 4)}
                  fill="url(#deckHatch)"
                  opacity="0.4"
                />

                {/* 2. Steel Column Body (H-300×300 / H-350×350 H-Beam Graphic) */}
                {/* Web Column Fill */}
                <rect
                  x={centerX - 6}
                  y={marginTop + 14}
                  width="12"
                  height={getY(totalLength + 3) - (marginTop + 14)}
                  fill="#1e293b"
                  stroke="#0284c7"
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
                {/* Central Stiffener / Centerline */}
                <line
                  x1={centerX}
                  y1={marginTop + 14}
                  x2={centerX}
                  y2={getY(totalLength + 3)}
                  stroke="#64748b"
                  strokeWidth="1"
                  strokeDasharray="6 3"
                />

                {/* 3. Upward Geotechnical Bearing Reaction Vectors at Pile Tip */}
                <g id="pileTipBearing">
                  <line x1={centerX - 10} y1={getY(totalLength + 3)} x2={centerX - 10} y2={getY(totalLength + 1)} stroke="#10b981" strokeWidth="2" />
                  <polygon points={`${centerX - 13},${getY(totalLength + 1.5)} ${centerX - 10},${getY(totalLength + 0.5)} ${centerX - 7},${getY(totalLength + 1.5)}`} fill="#10b981" />
                  
                  <line x1={centerX} y1={getY(totalLength + 3)} x2={centerX} y2={getY(totalLength + 0.5)} stroke="#10b981" strokeWidth="2.5" />
                  <polygon points={`${centerX - 3.5},${getY(totalLength + 1.2)} ${centerX},${getY(totalLength)} ${centerX + 3.5},${getY(totalLength + 1.2)}`} fill="#10b981" />

                  <line x1={centerX + 10} y1={getY(totalLength + 3)} x2={centerX + 10} y2={getY(totalLength + 1)} stroke="#10b981" strokeWidth="2" />
                  <polygon points={`${centerX + 7},${getY(totalLength + 1.5)} ${centerX + 10},${getY(totalLength + 0.5)} ${centerX + 13},${getY(totalLength + 1.5)}`} fill="#10b981" />
                </g>

                {/* 4. Center Post Foundation Callout Annotation */}
                <rect
                  x={centerX + 20}
                  y={getY(totalLength + 1) - 16}
                  width="180"
                  height="26"
                  rx="3"
                  fill="#0f172a"
                  stroke="#10b981"
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x={centerX + 26}
                  y={getY(totalLength + 1) - 4}
                  fill="#34d399"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  중간말뚝 암반소켓 지지층 근입
                </text>
                <text
                  x={centerX + 26}
                  y={getY(totalLength + 1) + 6}
                  fill="#94a3b8"
                  fontSize="8.5"
                >
                  허용지지력 Qa = {calcResult.safety.centerPost?.allowableBearingCapacity ?? 1850} kN (Fs={calcResult.safety.centerPost?.bearingSafetyFactor ?? 2.72})
                </text>
              </g>

              {/* Installed Struts (버팀보) and Wales (띠장) */}
              {activeStruts.map((st) => {
                const yStrut = getY(st.depth);
                const res = calcResult.strutResults.find((r) => r.tier === st.tier);
                const isSafe = res?.isSafe ?? true;

                return (
                  <g key={st.id}>
                    {/* Wale (띠장) on Left Wall */}
                    <rect
                      x={leftWallX}
                      y={yStrut - 7}
                      width="12"
                      height="14"
                      fill="#f59e0b"
                      stroke="#d97706"
                      strokeWidth="1"
                      rx="2"
                    />
                    {/* Wale on Right Wall */}
                    <rect
                      x={rightWallX - 12}
                      y={yStrut - 7}
                      width="12"
                      height="14"
                      fill="#f59e0b"
                      stroke="#d97706"
                      strokeWidth="1"
                      rx="2"
                    />

                    {/* Strut Beam Left Half (좌측 버팀보) */}
                    <rect
                      x={leftWallX + 12}
                      y={yStrut - 5}
                      width={centerX - 10 - (leftWallX + 12)}
                      height="10"
                      fill={isSafe ? '#0284c7' : '#ef4444'}
                      stroke={isSafe ? '#38bdf8' : '#f87171'}
                      strokeWidth="1.5"
                      rx="2"
                    />

                    {/* Strut Beam Right Half (우측 버팀보) */}
                    <rect
                      x={centerX + 10}
                      y={yStrut - 5}
                      width={rightWallX - 12 - (centerX + 10)}
                      height="10"
                      fill={isSafe ? '#0284c7' : '#ef4444'}
                      stroke={isSafe ? '#38bdf8' : '#f87171'}
                      strokeWidth="1.5"
                      rx="2"
                    />

                    {/* Hydraulic Jack / Preload Indicator */}
                    <circle cx={leftWallX + 35} cy={yStrut} r="5" fill="#facc15" stroke="#b45309" strokeWidth="1" />
                    <circle cx={rightWallX - 35} cy={yStrut} r="5" fill="#facc15" stroke="#b45309" strokeWidth="1" />

                    {/* Center Post Bracing Connection at Strut Intersection (중간말뚝-버팀보 F-1/G-2 연결 브라켓) */}
                    <g id={`cleat-${st.id}`}>
                      {/* Connection Cleat Box (F-1 ㄷ-380×100 연결재) */}
                      <rect
                        x={centerX - 14}
                        y={yStrut - 9}
                        width="28"
                        height="18"
                        fill="#d97706"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        rx="2"
                      />
                      {/* U-Bolt Fasteners */}
                      <circle cx={centerX - 8} cy={yStrut - 4} r="1.5" fill="#ffffff" />
                      <circle cx={centerX + 8} cy={yStrut - 4} r="1.5" fill="#ffffff" />
                      <circle cx={centerX - 8} cy={yStrut + 4} r="1.5" fill="#ffffff" />
                      <circle cx={centerX + 8} cy={yStrut + 4} r="1.5" fill="#ffffff" />

                      {/* Diagonal Bracing Angle Wings (G-2 L-90×90 가새) */}
                      <line x1={centerX - 14} y1={yStrut - 8} x2={centerX - 24} y2={yStrut - 16} stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1={centerX + 14} y1={yStrut - 8} x2={centerX + 24} y2={yStrut - 16} stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1={centerX - 14} y1={yStrut + 8} x2={centerX - 24} y2={yStrut + 16} stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1={centerX + 14} y1={yStrut + 8} x2={centerX + 24} y2={yStrut + 16} stroke="#f59e0b" strokeWidth="1.5" />
                    </g>

                    {/* Strut Label & Axial Force on Left Span */}
                    <rect
                      x={leftWallX + 48}
                      y={yStrut - 18}
                      width="120"
                      height="15"
                      rx="3"
                      fill="#0f172a"
                      stroke={isSafe ? '#38bdf8' : '#ef4444'}
                      strokeWidth="1"
                    />
                    <text
                      x={leftWallX + 108}
                      y={yStrut - 7}
                      fill={isSafe ? '#38bdf8' : '#fca5a5'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {st.tier}단 좌측 N = {res?.totalAxialForce ?? 0} kN
                    </text>

                    {/* Strut Label on Right Span */}
                    <rect
                      x={rightWallX - 168}
                      y={yStrut - 18}
                      width="120"
                      height="15"
                      rx="3"
                      fill="#0f172a"
                      stroke={isSafe ? '#38bdf8' : '#ef4444'}
                      strokeWidth="1"
                    />
                    <text
                      x={rightWallX - 108}
                      y={yStrut - 7}
                      fill={isSafe ? '#38bdf8' : '#fca5a5'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      응력비 {res?.utilizationRatio ?? 0}% ({isSafe ? '안전' : 'NG'})
                    </text>
                  </g>
                );
              })}

              {/* Center Post Overall Performance Callout Badge */}
              <g id="centerPostLiveBadge" transform={`translate(${centerX - 95}, ${marginTop + 24})`}>
                <rect
                  x="0"
                  y="0"
                  width="190"
                  height="34"
                  rx="4"
                  fill="#0f172a"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  className="drop-shadow-md"
                />
                <text x="95" y="13" fill="#fcd34d" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                  중간말뚝 (King Post) {settings.centerPost?.specName?.split(' ')[0] || 'H-300×300'}
                </text>
                <text x="95" y="26" fill="#e2e8f0" fontSize="8.5" textAnchor="middle">
                  연직력 Pv = {calcResult.safety.centerPost?.totalVerticalLoad ?? 680} kN | 지반지지력 Fs = {calcResult.safety.centerPost?.bearingSafetyFactor ?? 2.72} (안전)
                </text>
              </g>

              {/* Station Geometry Width Annotation */}
              <line
                x1={leftWallX}
                y1={marginTop - 26}
                x2={rightWallX}
                y2={marginTop - 26}
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <line x1={leftWallX} y1={marginTop - 32} x2={leftWallX} y2={marginTop - 20} stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1={rightWallX} y1={marginTop - 32} x2={rightWallX} y2={marginTop - 20} stroke="#cbd5e1" strokeWidth="1.5" />
              <text
                x={centerX}
                y={marginTop - 30}
                fill="#f1f5f9"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                정거장 굴착폭 B = {stationWidth.toFixed(1)}m (말뚝길이 L = {totalLength}m)
              </text>
            </g>
          )}

          {/* Diagram View: Earth & Water Pressure */}
          {viewMode === 'EARTH_PRESSURE' && (
            <g id="pressureDiagram">
              {/* Grid Background */}
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#0f172a" opacity="0.6" />
              {/* Pressure Curve Area */}
              <path
                d={`M ${centerX} ${getY(0)} ${calcResult.points
                  .map((p) => `L ${centerX + (p.totalLateralPressure / maxPressure) * 220} ${getY(p.depth)}`)
                  .join(' ')} L ${centerX} ${getY(totalLength)} Z`}
                fill="#38bdf8"
                fillOpacity="0.3"
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
                fillOpacity="0.4"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* Center Datum Line */}
              <line x1={centerX} y1={marginTop} x2={centerX} y2={getY(totalLength)} stroke="#64748b" strokeWidth="2" />
              <line x1={leftWallX} y1={getY(excavationDepth)} x2={rightWallX} y2={getY(excavationDepth)} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />

              {/* Title & Max Peak Tag */}
              <text x={centerX + 15} y={marginTop + 20} fill="#38bdf8" fontSize="13" fontWeight="bold">
                겉보기 횡방향 토압+수압 분포 (Peck / Rankine)
              </text>
              <text x={centerX + 15} y={marginTop + 38} fill="#94a3b8" fontSize="11">
                최대 측압 P_max = {maxPressure.toFixed(1)} kN/m² (수압 포함)
              </text>
            </g>
          )}

          {/* Diagram View: Bending Moment Diagram (BMD) */}
          {viewMode === 'MOMENT_BMD' && (
            <g id="bmdDiagram">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#0f172a" opacity="0.6" />
              {/* BMD Area */}
              <path
                d={`M ${centerX} ${getY(0)} ${calcResult.points
                  .map((p) => `L ${centerX + (p.bendingMoment / maxMoment) * 240} ${getY(p.depth)}`)
                  .join(' ')} L ${centerX} ${getY(totalLength)} Z`}
                fill="#f59e0b"
                fillOpacity="0.35"
                stroke="#d97706"
                strokeWidth="2.5"
              />
              <line x1={centerX} y1={marginTop} x2={centerX} y2={getY(totalLength)} stroke="#64748b" strokeWidth="2" />

              {/* Active Strut lines */}
              {activeStruts.map((st) => (
                <g key={`bmd-${st.id}`}>
                  <line x1={centerX - 30} y1={getY(st.depth)} x2={centerX + 260} y2={getY(st.depth)} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx={centerX} cy={getY(st.depth)} r="4" fill="#38bdf8" />
                  <text x={centerX - 40} y={getY(st.depth) + 4} fill="#38bdf8" fontSize="10" textAnchor="end">{st.tier}단 지점</text>
                </g>
              ))}

              <text x={centerX + 15} y={marginTop + 20} fill="#f59e0b" fontSize="13" fontWeight="bold">
                흙막이 벽체 휨모멘트도 (BMD)
              </text>
              <text x={centerX + 15} y={marginTop + 38} fill="#94a3b8" fontSize="11">
                최대 휨모멘트 M_max = {maxMoment.toFixed(1)} kN·m/m (벽체 응력 {calcResult.safety.maxBendingStress} MPa, {calcResult.safety.wallStressUtilization}%)
              </text>
            </g>
          )}

          {/* Diagram View: Shear Force Diagram (SFD) */}
          {viewMode === 'SHEAR_SFD' && (
            <g id="sfdDiagram">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#0f172a" opacity="0.6" />
              <path
                d={`M ${centerX} ${getY(0)} ${calcResult.points
                  .map((p) => `L ${centerX + (p.shearForce / maxShear) * 200} ${getY(p.depth)}`)
                  .join(' ')} L ${centerX} ${getY(totalLength)} Z`}
                fill="#10b981"
                fillOpacity="0.3"
                stroke="#059669"
                strokeWidth="2.5"
              />
              <line x1={centerX} y1={marginTop} x2={centerX} y2={getY(totalLength)} stroke="#64748b" strokeWidth="2" />
              <text x={centerX + 15} y={marginTop + 20} fill="#10b981" fontSize="13" fontWeight="bold">
                벽체 전단력도 (SFD)
              </text>
              <text x={centerX + 15} y={marginTop + 38} fill="#94a3b8" fontSize="11">
                최대 전단력 V_max = {maxShear.toFixed(1)} kN/m
              </text>
            </g>
          )}

          {/* Diagram View: Lateral Displacement */}
          {viewMode === 'DISPLACEMENT' && (
            <g id="dispDiagram">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#0f172a" opacity="0.6" />
              <path
                d={`M ${centerX} ${getY(0)} ${calcResult.points
                  .map((p) => `L ${centerX + (p.displacement / maxDisp) * 240} ${getY(p.depth)}`)
                  .join(' ')} L ${centerX} ${getY(totalLength)} Z`}
                fill="#ec4899"
                fillOpacity="0.3"
                stroke="#db2777"
                strokeWidth="2.5"
              />
              {/* Allowable displacement reference line */}
              <line
                x1={centerX + (calcResult.safety.allowableDisplacement / maxDisp) * 240}
                y1={marginTop}
                x2={centerX + (calcResult.safety.allowableDisplacement / maxDisp) * 240}
                y2={getY(totalLength)}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <line x1={centerX} y1={marginTop} x2={centerX} y2={getY(totalLength)} stroke="#64748b" strokeWidth="2" />

              <text x={centerX + 15} y={marginTop + 20} fill="#ec4899" fontSize="13" fontWeight="bold">
                벽체 수평변위 곡선 (Wall Lateral Deflection δ)
              </text>
              <text x={centerX + 15} y={marginTop + 38} fill="#94a3b8" fontSize="11">
                최대 변위 δ_max = {calcResult.safety.maxDisplacement} mm (허용치 {calcResult.safety.allowableDisplacement} mm)
              </text>
            </g>
          )}

          {/* Diagram View: Ground Settlement Profile */}
          {viewMode === 'SETTLEMENT' && (
            <g id="settlementDiagram">
              <rect x={marginLeft} y={marginTop} width={width - marginLeft - marginRight} height={totalLength * scaleY} fill="#0f172a" opacity="0.6" />
              {/* Ground Surface line */}
              <line x1={marginLeft} y1={marginTop + 120} x2={width - marginRight} y2={marginTop + 120} stroke="#94a3b8" strokeWidth="2" />
              {/* Settlement Trough */}
              <path
                d={`M ${marginLeft + 40} ${marginTop + 120} ${calcResult.safety.settlementProfile
                  .map((pt) => `L ${marginLeft + 40 + pt.distance * 10} ${marginTop + 120 + pt.settlement * 6}`)
                  .join(' ')}`}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
              />
              {/* Shaded settlement basin */}
              <path
                d={`M ${marginLeft + 40} ${marginTop + 120} ${calcResult.safety.settlementProfile
                  .map((pt) => `L ${marginLeft + 40 + pt.distance * 10} ${marginTop + 120 + pt.settlement * 6}`)
                  .join(' ')} L ${marginLeft + 40 + (calcResult.safety.settlementProfile[calcResult.safety.settlementProfile.length - 1]?.distance ?? 0) * 10} ${marginTop + 120} Z`}
                fill="#f43f5e"
                fillOpacity="0.25"
              />
              <text x={marginLeft + 40} y={marginTop + 60} fill="#f43f5e" fontSize="14" fontWeight="bold">
                배면 지표면 침하 영향 곡선 (Ground Settlement Trough - Peck / Clough)
              </text>
              <text x={marginLeft + 40} y={marginTop + 85} fill="#e2e8f0" fontSize="11">
                최대 지표침하량 S_max = {calcResult.safety.maxSettlement} mm (인접 건물 및 도로 영향 범위: 0 ~ {(excavationDepth * 2.5).toFixed(1)}m)
              </text>
            </g>
          )}

          {/* Diagram View: Multi-View (4-in-1 Dashboard) */}
          {viewMode === 'MULTI_VIEW' && (
            <g id="multiView">
              {/* 4 Columns: 1. 단면도(축소), 2. 토압, 3. 휨모멘트, 4. 변위 */}
              {/* Column 1: Mini Section */}
              <g transform="translate(60, 0)">
                <rect x="0" y={marginTop} width="160" height={totalLength * scaleY} fill="#1e293b" opacity="0.5" />
                <line x1="30" y1={marginTop} x2="30" y2={getY(totalLength)} stroke="#38bdf8" strokeWidth="4" />
                <line x1="130" y1={marginTop} x2="130" y2={getY(totalLength)} stroke="#38bdf8" strokeWidth="4" />
                <line x1="30" y1={getY(excavationDepth)} x2="130" y2={getY(excavationDepth)} stroke="#f59e0b" strokeWidth="3" />
                {activeStruts.map((s) => (
                  <line key={s.id} x1="30" y1={getY(s.depth)} x2="130" y2={getY(s.depth)} stroke="#ef4444" strokeWidth="2.5" />
                ))}
                <text x="80" y={marginTop - 8} fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">1. 가시설 단면</text>
              </g>

              {/* Column 2: Earth Pressure */}
              <g transform="translate(250, 0)">
                <rect x="0" y={marginTop} width="160" height={totalLength * scaleY} fill="#1e293b" opacity="0.5" />
                <line x1="10" y1={marginTop} x2="10" y2={getY(totalLength)} stroke="#64748b" strokeWidth="1.5" />
                <path
                  d={`M 10 ${getY(0)} ${calcResult.points
                    .map((p) => `L ${10 + (p.totalLateralPressure / maxPressure) * 130} ${getY(p.depth)}`)
                    .join(' ')} L 10 ${getY(totalLength)} Z`}
                  fill="#38bdf8"
                  fillOpacity="0.4"
                  stroke="#0284c7"
                  strokeWidth="2"
                />
                <text x="80" y={marginTop - 8} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">2. 토압 (P_max {maxPressure.toFixed(0)})</text>
              </g>

              {/* Column 3: Bending Moment */}
              <g transform="translate(440, 0)">
                <rect x="0" y={marginTop} width="160" height={totalLength * scaleY} fill="#1e293b" opacity="0.5" />
                <line x1="10" y1={marginTop} x2="10" y2={getY(totalLength)} stroke="#64748b" strokeWidth="1.5" />
                <path
                  d={`M 10 ${getY(0)} ${calcResult.points
                    .map((p) => `L ${10 + (p.bendingMoment / maxMoment) * 130} ${getY(p.depth)}`)
                    .join(' ')} L 10 ${getY(totalLength)} Z`}
                  fill="#f59e0b"
                  fillOpacity="0.4"
                  stroke="#d97706"
                  strokeWidth="2"
                />
                <text x="80" y={marginTop - 8} fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">3. 모멘트 (M_max {maxMoment.toFixed(0)})</text>
              </g>

              {/* Column 4: Displacement */}
              <g transform="translate(630, 0)">
                <rect x="0" y={marginTop} width="160" height={totalLength * scaleY} fill="#1e293b" opacity="0.5" />
                <line x1="10" y1={marginTop} x2="10" y2={getY(totalLength)} stroke="#64748b" strokeWidth="1.5" />
                <path
                  d={`M 10 ${getY(0)} ${calcResult.points
                    .map((p) => `L ${10 + (p.displacement / maxDisp) * 130} ${getY(p.depth)}`)
                    .join(' ')} L 10 ${getY(totalLength)} Z`}
                  fill="#ec4899"
                  fillOpacity="0.4"
                  stroke="#db2777"
                  strokeWidth="2"
                />
                <text x="80" y={marginTop - 8} fill="#ec4899" fontSize="11" fontWeight="bold" textAnchor="middle">4. 변위 (δ_max {maxDisp.toFixed(1)}mm)</text>
              </g>
            </g>
          )}

          {/* Depth Scale Ruler on the Left Axis */}
          <g id="depthRuler">
            <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={marginTop + totalLength * scaleY} stroke="#94a3b8" strokeWidth="1.5" />
            {Array.from({ length: Math.floor(totalLength / 2) + 1 }).map((_, idx) => {
              const d = idx * 2;
              const y = getY(d);
              return (
                <g key={`tick-${d}`}>
                  <line x1={marginLeft - 5} y1={y} x2={marginLeft} y2={y} stroke="#cbd5e1" strokeWidth="1.5" />
                  <text x={marginLeft - 8} y={y + 3.5} fill="#94a3b8" fontSize="9.5" textAnchor="end">
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
                stroke="#f43f5e"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <circle cx={marginLeft} cy={getY(hoverPoint.depth)} r="3.5" fill="#f43f5e" />
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
