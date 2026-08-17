import React, { useState } from 'react';
import { ProjectSettings, SoilLayer, UtilityPipe } from '../types';
import {
  Layers,
  Maximize2,
  Minimize2,
  Compass,
  Box,
  SplitSquareVertical,
  Activity,
  Info,
  MapPin,
  Ruler,
  TrendingDown,
  Truck,
  Flame,
  Droplets,
  Radio,
  Zap,
} from 'lucide-react';

interface StationLayoutViewerProps {
  settings: ProjectSettings;
  layers: SoilLayer[];
  onOpenStrutDesign?: () => void;
}

export const StationLayoutViewer: React.FC<StationLayoutViewerProps> = ({
  settings,
  layers,
  onOpenStrutDesign,
}) => {
  const [viewMode, setViewMode] = useState<'COMPOSITE' | 'PLAN' | 'CROSS_SECTION' | 'LONG_PROFILE'>('COMPOSITE');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const stationWidth = settings.stationWidth || 20.0;
  const stationLength = settings.stationLength || 100.0;
  const finalDepth = settings.finalExcavationDepth || 22.0;
  const structHeight = settings.structureHeight || 14.5;
  const topCover = settings.topCoverDepth || 7.5;
  const gwt = settings.groundWaterTable || 4.5;
  const roadWidth = settings.roadWidth || 32.0;

  const utilities: UtilityPipe[] = settings.utilities || [
    { id: 'util-gas', name: '도시가스관 (D300)', type: 'GAS', depth: 3.2, offsetFromWall: 2.5, diameterMm: 300, color: '#d97706' },
    { id: 'util-water', name: '상수도 본관 (D500)', type: 'WATER', depth: 3.8, offsetFromWall: 6.5, diameterMm: 500, color: '#0284c7' },
    { id: 'util-telecom', name: '통신 광케이블 (D150)', type: 'TELECOM', depth: 3.0, offsetFromWall: 13.5, diameterMm: 150, color: '#059669' },
    { id: 'util-power', name: '한전 지중전력구 (D250)', type: 'POWER', depth: 4.5, offsetFromWall: 17.0, diameterMm: 250, color: '#dc2626' },
  ];

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-white/98 backdrop-blur-md' : ''
    }`}>
      {/* Header Toolbar */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-900">
            지하정거장 종합 계획도 (평면·단면·제원)
          </span>
          <span className="text-[11px] bg-blue-50 text-blue-800 border border-blue-200 font-mono font-bold px-2 py-0.5 rounded">
            B={stationWidth}m × L={stationLength}m (H={structHeight}m)
          </span>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg border border-slate-300/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('COMPOSITE')}
            className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'COMPOSITE'
                ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-blue-600" />
            <span>종합 (평면+단면)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('PLAN')}
            className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'PLAN'
                ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>평면도 (Plan)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('CROSS_SECTION')}
            className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'CROSS_SECTION'
                ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-emerald-600" />
            <span>횡단면도 (Cross)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('LONG_PROFILE')}
            className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'LONG_PROFILE'
                ? 'bg-white text-blue-700 shadow-2xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>종단면도 (Profile)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-slate-500 hover:text-slate-900 rounded transition ml-1"
            title={isFullscreen ? '화면 축소' : '화면 확대'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Visual Display Area (Bright Palette Theme) */}
      <div className="p-3.5 overflow-y-auto max-h-[720px] flex-1 space-y-3 bg-slate-100/60">
        {/* ========================================================================= */}
        {/* 1. COMPOSITE VIEW: PLAN VIEW (평면도 - 밝은색 도면) */}
        {/* ========================================================================= */}
        {(viewMode === 'COMPOSITE' || viewMode === 'PLAN') && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>지하정거장 상부 도로 및 굴착 평면 배치도 (Plan View)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                도로폭 W={roadWidth}m | 구조물 폭 B={stationWidth}m | 연장 L={stationLength}m
              </span>
            </div>

            {/* SVG Plan View Rendering (Bright Theme) */}
            <div className="w-full overflow-x-auto border border-slate-300 rounded-lg bg-slate-50 p-2">
              <svg viewBox="0 0 760 220" className="w-full h-auto select-none font-sans">
                {/* Background Grid */}
                <defs>
                  <pattern id="planGridLight" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#e2e8f0" strokeWidth="0.8" />
                    <line x1="0" y1="0" x2="0" y2="20" stroke="#e2e8f0" strokeWidth="0.8" />
                  </pattern>
                  <marker id="arrowPlan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M 0 0 L 6 3 L 0 6 Z" fill="#0284c7" />
                  </marker>
                </defs>
                <rect width="760" height="220" fill="#ffffff" />
                <rect width="760" height="220" fill="url(#planGridLight)" />

                {/* 1. Road Boundary (도로 폭 32m 영역 - 라이트 그레이) */}
                <rect x="40" y="20" width="680" height="180" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" rx="4" />
                
                {/* Road Lane Lines (차선 점선) */}
                <line x1="40" y1="50" x2="720" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 6" />
                <line x1="40" y1="170" x2="720" y2="170" stroke="#94a3b8" strokeWidth="1" strokeDasharray="8 6" />
                {/* Yellow Dual Centerline (중앙선) */}
                <line x1="40" y1="108" x2="720" y2="108" stroke="#eab308" strokeWidth="1.8" />
                <line x1="40" y1="112" x2="720" y2="112" stroke="#eab308" strokeWidth="1.8" />

                {(() => {
                  // Dynamic Plan View Height based on stationWidth
                  const planBoxH = Math.min((stationWidth / roadWidth) * 160, 172);
                  const planBoxY = 110 - planBoxH / 2;
                  const track1Y = planBoxY + planBoxH * 0.18;
                  const track2Y = planBoxY + planBoxH * 0.82;

                  return (
                    <g key="dynamicPlanBox">
                      {/* 2. Station Structure Boundary (정거장 구조물 경계 B=폭 × L=100m) */}
                      <rect
                        x="100"
                        y={planBoxY}
                        width="560"
                        height={planBoxH}
                        fill="#eff6ff"
                        fillOpacity="0.85"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeDasharray="6 3"
                        rx="2"
                      />

                      {/* Retaining Wall Soldier Piles (상하 주열선) */}
                      {Array.from({ length: 29 }).map((_, i) => (
                        <g key={`pile-top-${i}`}>
                          <circle cx={100 + i * 20} cy={planBoxY} r="3" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
                          <circle cx={100 + i * 20} cy={planBoxY + planBoxH} r="3" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
                        </g>
                      ))}

                      {/* Center King Posts (중간말뚝 1열 - 앰버) */}
                      {Array.from({ length: 15 }).map((_, i) => (
                        <g key={`kp-${i}`}>
                          <rect x={100 + i * 40 - 3.5} y={110 - 3.5} width="7" height="7" fill="#d97706" stroke="#78350f" strokeWidth="1" rx="1" />
                        </g>
                      ))}

                      {/* Platform Island (섬식 승강장 - 중앙) */}
                      <rect x="180" y={110 - Math.min(planBoxH * 0.28, 22)} width="400" height={Math.min(planBoxH * 0.56, 44)} fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" rx="3" />
                      <text x="380" y={114} fill="#1e40af" fontSize="10" fontWeight="bold" textAnchor="middle">
                        ■ 섬식 승강장 (Island Platform W=8.0m, L=100m)
                      </text>

                      {/* Up/Down Track Lines (상하행 궤도 선로) */}
                      <line x1="100" y1={track1Y} x2="660" y2={track1Y} stroke="#475569" strokeWidth="2.2" strokeDasharray="5 3" />
                      <text x="120" y={track1Y - 4} fill="#334155" fontSize="8" fontWeight="bold">◀ 상행선 선로 (Track 1)</text>
                      
                      <line x1="100" y1={track2Y} x2="660" y2={track2Y} stroke="#475569" strokeWidth="2.2" strokeDasharray="5 3" />
                      <text x="120" y={track2Y - 4} fill="#334155" fontSize="8" fontWeight="bold">▶ 하행선 선로 (Track 2)</text>

                      {/* Underground Utilities Alignments */}
                      <path d="M 40 46 L 720 46" stroke="#d97706" strokeWidth="2" strokeDasharray="5 3" />
                      <text x="50" y="43" fill="#b45309" fontSize="8" fontWeight="bold">도시가스관 D300 (GL-3.2m)</text>

                      <path d="M 40 78 L 720 78" stroke="#0284c7" strokeWidth="2" strokeDasharray="5 3" />
                      <text x="50" y="75" fill="#0369a1" fontSize="8" fontWeight="bold">상수도관 D500 (GL-3.8m)</text>

                      <path d="M 40 142 L 720 142" stroke="#059669" strokeWidth="1.8" strokeDasharray="5 3" />
                      <text x="50" y="139" fill="#047857" fontSize="8" fontWeight="bold">통신케이블 D150 (GL-3.0m)</text>

                      <path d="M 40 174 L 720 174" stroke="#dc2626" strokeWidth="2" strokeDasharray="5 3" />
                      <text x="50" y="171" fill="#b91c1c" fontSize="8" fontWeight="bold">한전전력구 D250 (GL-4.5m)</text>

                      {/* Dimension Arrows */}
                      <g id="dimensionArrowsLight">
                        {/* Length L=100m */}
                        <line x1="100" y1={198} x2="660" y2={198} stroke="#0284c7" strokeWidth="1.2" />
                        <rect x="330" y="190" width="100" height="16" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                        <text x="380" y="202" fill="#0284c7" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                          정거장 연장 L = {stationLength}m
                        </text>

                        {/* Width Dimension B */}
                        <line x1="82" y1={planBoxY} x2="82" y2={planBoxY + planBoxH} stroke="#0284c7" strokeWidth="1.2" />
                        <rect x="25" y={102} width="112" height="16" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                        <text x="81" y={114} fill="#0284c7" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                          구조물 폭 B={stationWidth}m
                        </text>
                      </g>
                    </g>
                  );
                })()}

                {/* Station Entrances (출입구 및 환기구) */}
                <rect x="120" y="6" width="54" height="14" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" rx="2" />
                <text x="147" y="16" fill="#334155" fontSize="8" textAnchor="middle" fontWeight="bold">1번 출입구</text>

                <rect x="586" y="6" width="54" height="14" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" rx="2" />
                <text x="613" y="16" fill="#334155" fontSize="8" textAnchor="middle" fontWeight="bold">2번 출입구</text>

                <rect x="120" y="200" width="54" height="14" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" rx="2" />
                <text x="147" y="210" fill="#334155" fontSize="8" textAnchor="middle" fontWeight="bold">3번 출입구</text>

                <rect x="586" y="200" width="54" height="14" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" rx="2" />
                <text x="613" y="210" fill="#334155" fontSize="8" textAnchor="middle" fontWeight="bold">환기탑/급배기</text>
              </svg>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. COMPOSITE VIEW: CROSS SECTION VIEW (횡단면도 - 밝은색 도면) */}
        {/* ========================================================================= */}
        {(viewMode === 'COMPOSITE' || viewMode === 'CROSS_SECTION') && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Box className="w-4 h-4 text-emerald-600" />
                <span>지하정거장 표준 횡단면도 & 2층 본체 구조물 (Cross Section)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                토피고 H_top={topCover}m | 본체높이 H_box={structHeight}m | 최종심도 GL -{finalDepth}m
              </span>
            </div>

            {/* SVG Cross Section Rendering (Bright Palette with Absolute Real-Depth Scaling) */}
            <div className="w-full overflow-x-auto border border-slate-300 rounded-lg bg-slate-50 p-2">
              <svg viewBox="0 0 760 340" className="w-full h-auto select-none font-sans">
                {/* Background */}
                <rect width="760" height="340" fill="#ffffff" />

                {(() => {
                  // Absolute Elevation Scale: 0 to 55m depth mapped to Y=40 to Y=300
                  const maxDisplayDepth = 55.0;
                  const toY = (d: number) => 40 + Math.min(d / maxDisplayDepth, 1.0) * 260;

                  // Absolute Horizontal Width Scale: Center at X=380, base width on stationWidth
                  const maxDisplayWidth = 36.0;
                  const boxPixelWidth = Math.min((stationWidth / maxDisplayWidth) * 520, 560);
                  const xLeftWall = 380 - boxPixelWidth / 2;
                  const xRightWall = 380 + boxPixelWidth / 2;

                  const yTopSlab = toY(topCover); // Top roof slab level (e.g. GL -7.5m -> ~75px)
                  const yBotSlab = toY(topCover + structHeight); // Bottom mat slab level (1F: 15.5m -> 113px, 6F: 49.5m -> 274px)
                  const structBoxHeight = yBotSlab - yTopSlab;
                  const stories = settings.storyCount ?? 2;
                  const storyHeight = structBoxHeight / stories;

                  const storyTitles =
                    stories === 1
                      ? ['[B1F] 대합실 & 섬식 승강장 통합 구역 (Concourse & Platform)']
                      : stories === 2
                      ? ['[B1F] 대합실·역무실·맞이방 구역 (Concourse Hall)', '[B2F] 승강장(섬식) & 본선 궤도 구역 (Platform Hall)']
                      : stories === 3
                      ? ['[B1F] 대합실·역무실 구역 (Concourse Hall)', '[B2F] 환승 통로 & 기계실 구역 (Transfer Hall)', '[B3F] 승강장(섬식) & 본선 궤도 구역 (Platform Hall)']
                      : stories === 4
                      ? [
                          '[B1F] 상가·맞이방·대합실 (Commercial & Concourse)',
                          '[B2F] 상부 1호선 승강장 (Line 1 Platform)',
                          '[B3F] 환승 대합실 & 기계실 (Transfer Hall)',
                          '[B4F] 하부 2호선 승강장 (Line 2 Platform)',
                        ]
                      : stories === 5
                      ? [
                          '[B1F] 상가·맞이방 구역 (Commercial Concourse)',
                          '[B2F] 대합실 & 역무실 구역 (Main Concourse)',
                          '[B3F] 도시철도 상부 승강장 (Metro Platform)',
                          '[B4F] 환승 대합실 & 기계/전기실 (Transfer & M/E Hall)',
                          '[B5F] 대심도 급행 승강장 (Deep Express Platform)',
                        ]
                      : [
                          '[B1F] 지하 상가 및 출입 통로 (Underground Mall)',
                          '[B2F] 대합실·역무실·맞이방 (Main Concourse)',
                          '[B3F] 일반 도시철도 승강장 (Metro Line 1)',
                          '[B4F] 대심도 환승센터 (Transfer Transit Center)',
                          '[B5F] 통합 기계실 & 전기실 (Plant & E/M Facilities)',
                          '[B6F] 초대심도 GTX 고속철 승강장 (GTX Platform)',
                        ];

                  // Find Weathered Rock / Hard Stratum Depth (풍화암/지지암반 심도 탐색)
                  let cumulativeLayerD = 0;
                  let rockTopDepth = 40.0; // default GL -40m
                  for (const l of layers) {
                    if (l.name.includes('풍화암') || l.name.includes('연암') || l.name.includes('경암') || l.type === 'WEATHERED_ROCK') {
                      rockTopDepth = cumulativeLayerD;
                      break;
                    }
                    cumulativeLayerD += l.thickness || 10.0;
                  }

                  // Wall embedment depth: 구조물 층수와 무관하게 반드시 안정 지지층(풍화암)에 최소 1.5m 이상 소켓 근입
                  const rockSocketDepth = Math.max(finalDepth + 3.0, rockTopDepth + 1.5);
                  const yWallBottom = Math.min(toY(rockSocketDepth), 285);
                  const wallHeight = yWallBottom - 40;

                  // Soil layers cumulative depth scaling
                  let currentLayerDepth = 0;

                  return (
                    <g id="crossSectionElements">
                      {/* 1. Ground Stratigraphy Layers (절대 지층 누적 심도 배경) */}
                      {layers.slice(0, 5).map((l, i) => {
                        const yStart = toY(currentLayerDepth);
                        const layerThick = l.thickness || 10.0;
                        currentLayerDepth += layerThick;
                        const yEnd = toY(currentLayerDepth);
                        const yH = Math.max(yEnd - yStart, 25);

                        return (
                          <g key={`strata-light-${l.id}`}>
                            <rect x="40" y={yStart} width="680" height={yH} fill={l.color} fillOpacity="0.30" />
                            <line x1="40" y1={yStart} x2="720" y2={yStart} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" />
                            <text x="48" y={yStart + 13} fill="#334155" fontSize="8.5" fontWeight="bold">
                              {l.name} (N={l.nValue}, c={l.cohesion}, φ={l.frictionAngle}°) [GL -{currentLayerDepth - layerThick}~-{currentLayerDepth}m]
                            </text>
                          </g>
                        );
                      })}

                      {/* 2. Road Surface Line (GL ±0.0m) & Traffic */}
                      <rect x="40" y="32" width="680" height="8" fill="#475569" />
                      <line x1="40" y1="40" x2="720" y2="40" stroke="#334155" strokeWidth="1.5" />
                      <text x="50" y="27" fill="#0284c7" fontSize="9" fontWeight="bold">▼ GL ±0.0m (도로면)</text>

                      {/* Road Decking & Vehicles (복공판 및 주형보 - 폭 연동) */}
                      <rect x={xLeftWall - 6} y="28" width={boxPixelWidth + 12} height="12" fill="#334155" stroke="#1e293b" strokeWidth="1" rx="1" />
                      <text x="380" y="24" fill="#b45309" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                        도로 복공판 + H-400 주형보 (DB-24 하중 지지)
                      </text>

                      {/* Underground Water Table (GWT) */}
                      <line x1="40" y1={toY(gwt)} x2="720" y2={toY(gwt)} stroke="#0284c7" strokeWidth="1.8" strokeDasharray="6 3" />
                      <text x="630" y={toY(gwt) - 5} fill="#0284c7" fontSize="8.5" fontWeight="bold">▼ 지하수위 GL -{gwt}m</text>

                      {/* 3. Retaining Walls (풍화암 지지층까지 깊숙이 근입되는 엄지말뚝) */}
                      <rect x={xLeftWall - 12} y="40" width="12" height={wallHeight} fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" rx="1" />
                      <rect x={xRightWall} y="40" width="12" height={wallHeight} fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" rx="1" />

                      {/* Rock Socket Shoes / Badges at Wall Tips */}
                      <polygon points={`${xLeftWall - 12},${yWallBottom} ${xLeftWall},${yWallBottom} ${xLeftWall - 6},${yWallBottom + 8}`} fill="#0369a1" />
                      <polygon points={`${xRightWall},${yWallBottom} ${xRightWall + 12},${yWallBottom} ${xRightWall + 6},${yWallBottom + 8}`} fill="#0369a1" />

                      {/* Center King Post (중간말뚝 - 풍화암 소켓 근입) */}
                      <rect x="375" y="40" width="10" height={wallHeight} fill="#d97706" stroke="#92400e" strokeWidth="1.2" />
                      <polygon points={`375,${yWallBottom} 385,${yWallBottom} 380,${yWallBottom + 8}`} fill="#92400e" />

                      <g transform={`translate(380, ${yWallBottom + 14})`}>
                        <rect x="-140" y="-9" width="280" height="18" rx="3" fill="#ffffff" stroke="#0369a1" strokeWidth="1" />
                        <text x="0" y="3.5" fill="#0369a1" fontSize="8" fontWeight="bold" textAnchor="middle">
                          ▼ 가시설벽체 & 중간말뚝 풍화암 지지층 소켓 근입 (GL -{rockSocketDepth.toFixed(1)}m, d ≥ 1.5m)
                        </text>
                      </g>

                      {/* 4. Underground Utilities (지하 3~5m 매설 지장물 파이프 - 폭 연동) */}
                      {utilities.map((u) => {
                        const xPos = xLeftWall + 8 + (u.offsetFromWall / stationWidth) * (boxPixelWidth - 16);
                        const yPos = toY(u.depth);
                        return (
                          <g key={`util-light-${u.id}`}>
                            <circle cx={xPos} cy={yPos} r="7" fill={u.color} stroke="#ffffff" strokeWidth="1.5" />
                            <circle cx={xPos} cy={yPos} r="3.5" fill="#ffffff" />
                            <g transform={`translate(${xPos - 38}, ${yPos - 20})`}>
                              <rect x="0" y="0" width="76" height="12" rx="2" fill="#ffffff" stroke={u.color} strokeWidth="1" />
                              <text x="38" y="9" fill={u.color} fontSize="7" fontWeight="bold" textAnchor="middle">
                                {u.name.split(' ')[0]} (-{u.depth}m)
                              </text>
                            </g>
                          </g>
                        );
                      })}

                      {/* 5. Underground Station Multi-Story RC Box Structure (폭과 높이 동시 연동) */}
                      {/* Structure Outer Shell & Inner Hall Background */}
                      <rect
                        x={xLeftWall}
                        y={yTopSlab}
                        width={boxPixelWidth}
                        height={structBoxHeight}
                        fill="#f8fafc"
                        stroke="#334155"
                        strokeWidth="2"
                        rx="2"
                      />

                      {/* Left & Right RC Side Walls (콘크리트 외벽체 T=1.0m) */}
                      <rect x={xLeftWall} y={yTopSlab} width="10" height={structBoxHeight} fill="#64748b" stroke="#334155" strokeWidth="0.8" />
                      <rect x={xRightWall - 10} y={yTopSlab} width="10" height={structBoxHeight} fill="#64748b" stroke="#334155" strokeWidth="0.8" />

                      {/* Top Roof Slab (콘크리트 상부 지붕 슬래브 T=1.2m) */}
                      <rect x={xLeftWall} y={yTopSlab} width={boxPixelWidth} height="13" fill="#64748b" stroke="#334155" strokeWidth="1.2" />
                      <text x="380" y={yTopSlab + 9.5} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                        상단 RC 지붕 슬래브 (Top Roof Slab, 토피고 H={topCover}m)
                      </text>

                      {/* Story Names & Concrete Intermediate Slabs */}
                      {Array.from({ length: stories }).map((_, sIdx) => {
                        const storyYTop = yTopSlab + sIdx * storyHeight;

                        return (
                          <g key={`story-slab-${sIdx}`}>
                            {/* Intermediate Slab (콘크리트 층간 슬래브 T=0.8m) */}
                            {sIdx > 0 && (
                              <rect
                                x={xLeftWall + 10}
                                y={storyYTop - 4}
                                width={boxPixelWidth - 20}
                                height="8"
                                fill="#94a3b8"
                                stroke="#475569"
                                strokeWidth="0.8"
                              />
                            )}
                            {/* Story Title Label */}
                            <text
                              x={xLeftWall + 16}
                              y={storyYTop + (stories >= 4 ? 14 : 22)}
                              fill="#1e293b"
                              fontSize={stories >= 4 ? '7.5' : '9'}
                              fontWeight="bold"
                            >
                              {storyTitles[sIdx] || `[B${sIdx + 1}F] 층별 시설 구역`}
                            </text>
                          </g>
                        );
                      })}

                      {/* Island Platform Concrete Block on Bottom Story (콘크리트 승강장) */}
                      <rect x={380 - Math.min(boxPixelWidth * 0.22, 60)} y={yBotSlab - 20} width={Math.min(boxPixelWidth * 0.44, 120)} height="9" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" rx="1" />
                      <text x="380" y={yBotSlab - 13} fill="#0f172a" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                        RC 섬식 승강장 (W=8.0m)
                      </text>

                      {/* Tracks on Left and Right */}
                      <rect x={xLeftWall + 18} y={yBotSlab - 15} width="36" height="3.5" fill="#334155" />
                      <text x={xLeftWall + 36} y={yBotSlab - 17} fill="#475569" fontSize="6.5" textAnchor="middle" fontWeight="bold">상행선 궤도</text>

                      <rect x={xRightWall - 54} y={yBotSlab - 15} width="36" height="3.5" fill="#334155" />
                      <text x={xRightWall - 36} y={yBotSlab - 17} fill="#475569" fontSize="6.5" textAnchor="middle" fontWeight="bold">하행선 궤도</text>

                      {/* Bottom Base Mat Slab (콘크리트 하부 바닥 기초 매트 슬래브 T=1.5m) */}
                      <rect x={xLeftWall} y={yBotSlab - 13} width={boxPixelWidth} height="13" fill="#64748b" stroke="#334155" strokeWidth="1.2" />
                      <text x="380" y={yBotSlab - 3.5} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                        하부 RC 기초 매트 슬래브 (Base Mat Slab, GL -{finalDepth}m)
                      </text>

                      {/* Dimension Annotations (실제 깊이에 따른 치수선 배지) */}
                      {/* Structure Height Dimension */}
                      <line x1={xRightWall + 15} y1={yTopSlab} x2={xRightWall + 15} y2={yBotSlab} stroke="#e11d48" strokeWidth="1.5" />
                      <rect x={xRightWall + 22} y={yTopSlab + structBoxHeight * 0.4 - 9} width="105" height="18" rx="3" fill="#ffffff" stroke="#e11d48" strokeWidth="1" />
                      <text x={xRightWall + 74} y={yTopSlab + structBoxHeight * 0.4 + 3} fill="#e11d48" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                        지하 {stories}층 H={structHeight}m
                      </text>

                      {/* Top Cover Dimension */}
                      <line x1={xRightWall + 15} y1="40" x2={xRightWall + 15} y2={yTopSlab} stroke="#0284c7" strokeWidth="1.5" />
                      <rect x={xRightWall + 22} y={40 + (yTopSlab - 40) * 0.3 - 8} width="105" height="17" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                      <text x={xRightWall + 74} y={40 + (yTopSlab - 40) * 0.3 + 4} fill="#0284c7" fontSize="8" fontWeight="bold" textAnchor="middle">
                        토피고 H_top={topCover}m
                      </text>

                      {/* Total Depth Dimension */}
                      <line x1={xLeftWall - 22} y1="40" x2={xLeftWall - 22} y2={yBotSlab} stroke="#d97706" strokeWidth="1.5" />
                      <rect x={xLeftWall - 132} y={yBotSlab * 0.65} width="105" height="18" rx="3" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
                      <text x={xLeftWall - 80} y={yBotSlab * 0.65 + 12} fill="#d97706" fontSize="8" fontWeight="bold" textAnchor="middle">
                        최종심도 H={finalDepth}m
                      </text>

                      {/* Structure Width Dimension B (단면 폭 치수선) */}
                      <line x1={xLeftWall} y1={yBotSlab + 18} x2={xRightWall} y2={yBotSlab + 18} stroke="#0284c7" strokeWidth="1.2" />
                      <rect x="325" y={yBotSlab + 9} width="110" height="16" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                      <text x="380" y={yBotSlab + 21} fill="#0284c7" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                        구조물 폭 B = {stationWidth}m
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. LONGITUDINAL PROFILE VIEW (정거장 100m 종단면도 - 층간 높이 대폭 확장 & 초고가독성) */}
        {/* ========================================================================= */}
        {viewMode === 'LONG_PROFILE' && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>지하정거장 본선 종단면도 (Longitudinal Profile L=100m)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                본선 터널 접속부 ↔ 정거장 본체 ↔ 터널 접속부
              </span>
            </div>

            {(() => {
              const stories = settings.storyCount ?? 2;
              const storyH = Math.max(34, Math.min(48, 210 / stories));
              const boxH = storyH * stories;
              const boxTopY = 55;
              const boxBotY = boxTopY + boxH;
              const svgHeight = boxBotY + 55;

              const longStoryTitles =
                stories === 1
                  ? ['[B1F] 대합실 & 승강장 통합 통로 구역']
                  : stories === 2
                  ? ['[B1F] 대합실·역무실·맞이방 구역', '[B2F] 승강장(섬식) & 본선 궤도 구역']
                  : stories === 3
                  ? ['[B1F] 대합실·역무실 구역', '[B2F] 환승 통로 & 기계실 구역', '[B3F] 승강장(섬식) & 본선 궤도 구역']
                  : stories === 4
                  ? [
                      '[B1F] 상가·맞이방·대합실',
                      '[B2F] 상부 1호선 승강장 구역',
                      '[B3F] 환승 대합실 & 기계실',
                      '[B4F] 하부 2호선 승강장 구역',
                    ]
                  : stories === 5
                  ? [
                      '[B1F] 상가·맞이방 구역',
                      '[B2F] 대합실 & 역무실 구역',
                      '[B3F] 도시철도 상부 승강장',
                      '[B4F] 환승 대합실 & 기계실',
                      '[B5F] 대심도 급행 승강장',
                    ]
                  : [
                      '[B1F] 지하 상가 및 출입 통로',
                      '[B2F] 대합실·역무실·맞이방',
                      '[B3F] 일반 도시철도 승강장',
                      '[B4F] 대심도 환승센터 구역',
                      '[B5F] 통합 기계실 & 전기실',
                      '[B6F] 초대심도 GTX 고속철 승강장',
                    ];

              return (
                <div className="w-full overflow-x-auto border border-slate-300 rounded-lg bg-slate-50 p-2">
                  <svg viewBox={`0 0 760 ${svgHeight}`} className="w-full h-auto select-none font-sans">
                    <rect width="760" height={svgHeight} fill="#ffffff" />
                    <rect width="760" height={svgHeight} fill="url(#planGridLight)" />
                    
                    {/* Surface Ground Profile */}
                    <path d="M 30 25 Q 200 23 400 27 T 730 25" fill="none" stroke="#0284c7" strokeWidth="2.2" />
                    <text x="40" y="18" fill="#0284c7" fontSize="9" fontWeight="bold">지표면 도로 선형 (GL ±0.0m)</text>

                    {/* 1. Station Main RC Box (100m - Concrete Theme) */}
                    <rect x="120" y={boxTopY} width="520" height={boxH} fill="#f8fafc" stroke="#334155" strokeWidth="2" rx="3" />
                    
                    {/* Top Concrete Slab */}
                    <rect x="120" y={boxTopY} width="520" height="10" fill="#64748b" stroke="#334155" strokeWidth="1" />
                    <text x="380" y={boxTopY + 7.5} fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                      상단 RC 지붕 슬래브 (Top Roof Slab, L={stationLength}m)
                    </text>

                    {/* Intermediate Slabs & Clear Story Titles */}
                    {Array.from({ length: stories }).map((_, sIdx) => {
                      const slabY = boxTopY + sIdx * storyH;
                      return (
                        <g key={`long-s-${sIdx}`}>
                          {sIdx > 0 && (
                            <rect x="120" y={slabY - 3} width="520" height="6" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
                          )}
                          {/* Story Background Alternating Band */}
                          <rect
                            x="122"
                            y={slabY + (sIdx > 0 ? 3 : 10)}
                            width="516"
                            height={storyH - (sIdx > 0 ? 6 : 13)}
                            fill={sIdx % 2 === 0 ? '#f1f5f9' : '#ffffff'}
                            fillOpacity="0.75"
                          />
                          {/* Center Story Title Text */}
                          <text
                            x="380"
                            y={slabY + storyH * 0.58}
                            fill="#0f172a"
                            fontSize={stories >= 5 ? '9.5' : '10.5'}
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {longStoryTitles[sIdx] || `[B${sIdx + 1}F] 지하 ${sIdx + 1}층 시설 구역`} (L={stationLength}m)
                          </text>
                        </g>
                      );
                    })}

                    {/* Bottom Concrete Mat Slab */}
                    <rect x="120" y={boxBotY - 10} width="520" height="10" fill="#64748b" stroke="#334155" strokeWidth="1" />
                    <text x="380" y={boxBotY - 2.5} fill="#ffffff" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                      하부 RC 기초 매트 슬래브 (Base Mat Slab)
                    </text>

                    {/* 2. Tunnel Geometry: H ≈ 10m (NATM/TBM Arch Profile at bottom track level) */}
                    {(() => {
                      const tunnelH = Math.max(44, Math.min(54, storyH * 1.25));
                      const tunnelTopY = boxBotY - 10 - tunnelH;
                      const trackLevelY = boxBotY - 14;

                      return (
                        <g id="bottomTunnelConnections">
                          {/* Continuous Track Baseline across Tunnels & Station Platform */}
                          <line x1="40" y1={trackLevelY} x2="720" y2={trackLevelY} stroke="#334155" strokeWidth="2.5" strokeDasharray="6 3" />

                          {/* Tunnel Connection Left (시점부 본선터널 - H=10m 마제형 아치) */}
                          <path
                            d={`M 40 ${boxBotY - 10} L 40 ${tunnelTopY + 12} Q 40 ${tunnelTopY} 52 ${tunnelTopY} L 120 ${tunnelTopY} L 120 ${boxBotY - 10} Z`}
                            fill="#f1f5f9"
                            stroke="#64748b"
                            strokeWidth="1.8"
                          />
                          {/* Tunnel Arch Lining Accent */}
                          <path
                            d={`M 40 ${tunnelTopY + 12} Q 40 ${tunnelTopY} 52 ${tunnelTopY} L 120 ${tunnelTopY}`}
                            fill="none"
                            stroke="#334155"
                            strokeWidth="2.5"
                          />
                          <text x="80" y={tunnelTopY + tunnelH * 0.45} fill="#1e293b" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                            본선터널(시점)
                          </text>
                          <text x="80" y={tunnelTopY + tunnelH * 0.45 + 12} fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                            (H≈10m 본선 접속)
                          </text>

                          {/* Tunnel Connection Right (종점부 본선터널 - H=10m 마제형 아치) */}
                          <path
                            d={`M 640 ${tunnelTopY} L 708 ${tunnelTopY} Q 720 ${tunnelTopY} 720 ${tunnelTopY + 12} L 720 ${boxBotY - 10} L 640 ${boxBotY - 10} Z`}
                            fill="#f1f5f9"
                            stroke="#64748b"
                            strokeWidth="1.8"
                          />
                          {/* Tunnel Arch Lining Accent */}
                          <path
                            d={`M 640 ${tunnelTopY} L 708 ${tunnelTopY} Q 720 ${tunnelTopY} 720 ${tunnelTopY + 12}`}
                            fill="none"
                            stroke="#334155"
                            strokeWidth="2.5"
                          />
                          <text x="680" y={tunnelTopY + tunnelH * 0.45} fill="#1e293b" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                            본선터널(종점)
                          </text>
                          <text x="680" y={tunnelTopY + tunnelH * 0.45 + 12} fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                            (H≈10m 본선 접속)
                          </text>
                        </g>
                      );
                    })()}

                    {/* Center King Post / Columns in Long Section */}
                    {Array.from({ length: 9 }).map((_, i) => (
                      <rect
                        key={`col-light-${i}`}
                        x={165 + i * 53}
                        y={boxTopY + 10}
                        width="7"
                        height={boxH - 20}
                        fill="#d97706"
                        opacity="0.85"
                        rx="1"
                      />
                    ))}

                    {/* Dimension Line */}
                    <line x1="120" y1={boxBotY + 22} x2="640" y2={boxBotY + 22} stroke="#0284c7" strokeWidth="1.2" />
                    <rect x="300" y={boxBotY + 13} width="160" height="18" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />
                    <text x="380" y={boxBotY + 25} fill="#0284c7" fontSize="9" fontWeight="bold" textAnchor="middle">
                      정거장 본체 유효 연장 L = {stationLength}m
                    </text>
                  </svg>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. KEY ENGINEERING SPECIFICATIONS SUMMARY CARDS (주요 제원 요약 패널) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-blue-600" />
              <span>정거장 구조물 제원 (평면)</span>
            </span>
            <div className="text-xs font-bold text-slate-800">
              폭 {stationWidth}m × 연장 {stationLength}m
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              최종 굴착심도 GL -{finalDepth}m
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-indigo-600" />
              <span>본체 구조물 제원</span>
            </span>
            <div className="text-xs font-bold text-indigo-900">
              높이 H={structHeight}m (지하 {settings.storyCount ?? 2}층 Box)
            </div>
            <div className="text-[10px] font-mono text-indigo-600">
              상단 토피고 GL -{topCover}m
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>도로 복공 & 교통하중</span>
            </span>
            <div className="text-xs font-bold text-slate-800">
              복공폭 {(settings.deckWidth ?? (stationWidth + 2.0)).toFixed(1)}m (원도로 {roadWidth}m)
            </div>
            <div className="text-[10px] font-mono text-amber-700 font-medium">
              H-400 주형보 + 중간말뚝 지지
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>지하 매설 지장물</span>
            </span>
            <div className="text-xs font-bold text-slate-800">
              가스/상수/통신/전력 4종
            </div>
            <div className="text-[10px] font-mono text-rose-600">
              매설심도 GL -3.0 ~ -4.5m
            </div>
          </div>
        </div>

        {/* Step 2 Shortcut Banner */}
        {onOpenStrutDesign && (
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white p-3 rounded-lg flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 p-1.5 rounded-md">
                <Box className="w-4 h-4 text-white" />
              </span>
              <div>
                <div className="font-bold text-xs">지반-가시설 구조해석 및 단계별 굴착 시뮬레이션</div>
                <div className="text-[11px] text-blue-100">
                  엄지말뚝, 버팀보, 띠장 부재 선정 및 KDS 7대 안전성 검토는 [2단계: 1안 버팀보 설계]에서 진행됩니다.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenStrutDesign}
              className="px-3 py-1.5 bg-white text-blue-800 hover:bg-blue-50 rounded text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              1안 버팀보 설계 바로가기 ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
