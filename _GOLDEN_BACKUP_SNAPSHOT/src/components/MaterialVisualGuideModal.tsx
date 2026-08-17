import React, { useState } from 'react';
import {
  X,
  Shield,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  BookOpen,
  Camera,
  Layers as LayersIcon,
  Maximize2,
  ZoomIn,
} from 'lucide-react';

interface MaterialVisualGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMember?: string;
}

interface MemberDetail {
  id: string;
  name: string;
  engName: string;
  nickname: string;
  color: string;
  photoUrl: string;
  photoCaption: string;
  summary: string;
  function: string;
  constructionStep: string;
  whyNeeded: string;
  standardSpec: string;
  svgType: 'H_PILE' | 'WALE' | 'STRUT' | 'WEDGE' | 'JACK' | 'DECK' | 'BRACING' | 'LAGGING' | 'OVERVIEW';
}

const MATERIAL_MEMBERS: MemberDetail[] = [
  {
    id: 'OVERVIEW',
    name: '가시설 전체 조립도',
    engName: 'Overall Earth Retention System',
    nickname: '지하 가시설 뼈대 총람',
    color: '#2563eb',
    photoUrl: '/assets/materials/overview.jpg',
    photoCaption: '실제 도심지 대심도 지하정거장 굴착 현장: 상부 복공판, 엄지말뚝, 띠장, 다단 버팀보(Strut), 중간말뚝이 웅장하게 결합된 전경',
    summary: '엄지말뚝, 토류판, 띠장, 버팀보, 화타쐐기, 스크류잭, 브레이싱이 유기적으로 결합된 전체 흙막이 지보 구조입니다.',
    function: '토압과 수압을 벽체(말뚝+토류판) → 띠장 → 버팀보 순으로 전달하여 굴착 공간을 붕괴 없이 안전하게 확보',
    constructionStep: '①천공 및 엄지말뚝 근입 → ②복공 주형보/복공판 설치 → ③단계별 굴착 및 토류판 끼움 → ④띠장 거치 및 화타쐐기 밀착 → ⑤버팀보 거치 및 스크류잭 선하중 가압 → ⑥브레이싱 보강',
    whyNeeded: '지하철, 지하정거장, 고층 빌딩 굴착 시 주변 도로와 건물이 침하되거나 무너지지 않도록 지탱하는 필수 임시 구조물',
    standardSpec: 'KDS 21 30 00 (가설흙막이설계기준), SM355 고강도 구조용 강재 표준',
    svgType: 'OVERVIEW',
  },
  {
    id: 'H_PILE',
    name: '1. 엄지말뚝 (H-Pile)',
    engName: 'Soldier Pile / H-Pile',
    nickname: '흙막이벽의 든든한 연직 척추 기둥',
    color: '#0284c7',
    photoUrl: '/assets/materials/hpile_lagging.jpg',
    photoCaption: 'D500 오거 천공 후 암반층에 근입된 H형강(H-300×305) 엄지말뚝과 하부 시멘트밀크 그라우팅 시공 전경',
    summary: '지중에 약 1.5~2.0m 간격으로 수직 천공 후 풍화암/연암 지지층까지 박아 넣는 H형강 기둥입니다.',
    function: '토류판을 양 옆 플랜지 틈새에 끼워 지지하고, 흙이 밀고 들어오는 횡토압을 가장 먼저 받아내는 1차 구조 기둥',
    constructionStep: 'D500mm 오거 천공(GL -35~42m) → H형강 삽입 → 선단 시멘트 밀크 그라우팅 주입 및 고정',
    whyNeeded: '엄지말뚝이 깊은 암반층(소켓)에 굳건히 박혀있어야 굴착 바닥면 이하의 휨모멘트와 하부 토압을 지탱할 수 있습니다.',
    standardSpec: 'H-300×305×15×15 (SM355, Zx=1,470cm³), H-440×300 (중앙부/주형보용)',
    svgType: 'H_PILE',
  },
  {
    id: 'LAGGING',
    name: '2. 토류판 (Lagging)',
    engName: 'Timber / Steel Lagging',
    nickname: '말뚝 사이 흙을 막아주는 차수·토류 벽판',
    color: '#b45309',
    photoUrl: '/assets/materials/hpile_lagging.jpg',
    photoCaption: '굴착 진행에 맞춰 엄지말뚝 H형강 플랜지 안쪽에 정밀하게 끼워 넣은 목재 토류판(T=6cm) 시공 실물',
    summary: '굴착이 한 단계(1.5~2.0m) 진행될 때마다 엄지말뚝과 말뚝 사이 홈에 끼워 넣는 목재 또는 강재 판입니다.',
    function: '노출된 지층의 흙이 굴착 내부로 쏟아져 내리지 않도록 직접 차단하고 토압을 양쪽 엄지말뚝으로 전달',
    constructionStep: '지반 굴착(0.5~1.0m 단위) → 엄지말뚝 플랜지 안쪽에 토류판 끼움 → 뒷채움 흙/모래 다짐 및 부직포 설치',
    whyNeeded: '토류판이 없으면 흙이 무너져 내려 주변 지반이 가라앉고 도로가 붕괴됩니다.',
    standardSpec: '목재 토류판 T=6.0cm (미송 낙엽송 1등급), 강재 토류판 T=1.2mm (부식방지 아연도금)',
    svgType: 'LAGGING',
  },
  {
    id: 'WALE',
    name: '3. 띠장 (Wale)',
    engName: 'Horizontal Wale Beam',
    nickname: '여러 말뚝의 토압을 모아주는 수평 들보',
    color: '#7c3aed',
    photoUrl: '/assets/materials/wale_wedge_jack.jpg',
    photoCaption: '엄지말뚝 배면에 보걸이 브라켓(O-1)으로 거치된 2H-300 수평 띠장 및 볼트 결합 상세',
    summary: '엄지말뚝 벽면에 수평으로 길게 걸쳐 설치하는 H형강 보로, 단일(1H) 또는 복합(2H)으로 구성됩니다.',
    function: '각각의 엄지말뚝에 작용하는 점하중 형태의 토압을 한 줄로 모아 3~5m 간격의 버팀보(Strut)로 분산 전달',
    constructionStep: '엄지말뚝에 보걸이 브라켓(O-1) 용접/볼팅 → H형강 띠장 거치 → 화타쐐기 타격 고정',
    whyNeeded: '말뚝 하나하나마다 버팀보를 댈 수 없으므로, 수평 띠장보를 통해 넓은 간격의 버팀보로 하중을 효율적으로 전달합니다.',
    standardSpec: '2H-300×305 2련 띠장 (SM355, Z=2,940cm³), 2H-350×350, C-1 조인트 연결판',
    svgType: 'WALE',
  },
  {
    id: 'WEDGE',
    name: '4. 화타쐐기 (Wedge)',
    engName: 'Tightening Steel Wedge (화타쐐기)',
    nickname: '말뚝과 띠장 사이 빈틈을 없애는 밀착 쐐기',
    color: '#dc2626',
    photoUrl: '/assets/materials/wale_wedge_jack.jpg',
    photoCaption: '엄지말뚝 플랜지와 띠장 사이에 해머로 강하게 박아 넣어 유격을 0으로 압착한 화타쐐기(HWA-TA WEDGE) 실물',
    summary: '엄지말뚝 플랜지와 띠장 플랜지 사이의 미세한 틈새(유격)에 강하게 박아 넣는 삼각 단면의 특수 강재 쐐기입니다.',
    function: '시공 오차로 인해 발생하는 말뚝과 띠장 사이 유격을 0으로 만들어, 토압이 발생하는 즉시 지체 없이 버팀보로 전달되도록 함',
    constructionStep: '띠장 설치 후 말뚝 접촉부에 K-1/K-2 쐐기 삽입 → 대함마로 강하게 타격하여 완전 밀착 및 가용접',
    whyNeeded: '틈새가 있으면 흙막이벽이 수 cm 밀린 후에야 버팀보가 힘을 받게 되므로, 주변 도로 균열 및 지반 침하의 원인이 됩니다.',
    standardSpec: 'K-1 TYPE (H-300용 주철/강재), K-2 TYPE (H-440용)',
    svgType: 'WEDGE',
  },
  {
    id: 'STRUT',
    name: '5. 버팀보 (Strut)',
    engName: 'Cross Strut Beam',
    nickname: '양쪽 벽을 굳건히 버텨주는 수평 압축 기둥',
    color: '#059669',
    photoUrl: '/assets/materials/bracing.jpg',
    photoCaption: '굴착 벽체 사이를 가로질러 거대한 수평 토압을 지탱하는 H-300 버팀보 및 가새 체결 실물 전경',
    summary: '좌측 흙막이벽과 우측 흙막이벽 사이(지간 15~30m)를 가로질러 수평으로 배치하는 대형 H형강 또는 원형강관입니다.',
    function: '양쪽 벽체에서 밀려오는 막대한 토압을 맞대어 상쇄시키는 핵심 압축 부재',
    constructionStep: '양측 띠장 거치 완료 후 크레인으로 버팀보 인양 → 중간말뚝 보걸이에 안착 → 잭 연결 및 볼팅',
    whyNeeded: '굴착 폭이 깊어질수록 거대해지는 토압을 정면으로 버텨내는 가시설의 가장 핵심적인 내력 구조물입니다.',
    standardSpec: 'H-300×305 (SM355 한면제작 S-2 연결), Φ609.6×12t 원형강관, Φ812.8×16t 대구경',
    svgType: 'STRUT',
  },
  {
    id: 'JACK',
    name: '6. 유압 스크류잭 (Screw Jack)',
    engName: 'Hydraulic Screw Jack (1000kN)',
    nickname: '벽체 밀림을 사전에 막는 선하중 긴장 잭',
    color: '#ea580c',
    photoUrl: '/assets/materials/wale_wedge_jack.jpg',
    photoCaption: '버팀보 끝단에 직결되어 30톤(300kN) 선하중(Preload)을 가압하고 더블 락너트로 고정한 유압 스크류잭 실물',
    summary: '버팀보의 한쪽 끝단에 설치되는 100~200톤급의 고내력 나사식·유압식 긴장 장치입니다.',
    function: '버팀보 설치 직후 유압으로 미리 20~50톤의 힘(선하중 Preload)을 가해 벽체를 밖으로 밀어내어 변위를 0으로 억제',
    constructionStep: '버팀보 단부에 잭 조립 → 유압 펌프로 설계 선하중까지 가압 → 스크류 나사 너트 락킹으로 영구 고정',
    whyNeeded: '벽체가 변형되기 전에 미리 힘을 주어 흙의 이완과 주변 건물 침하를 사전에 원천 차단합니다.',
    standardSpec: '스크류잭 1,000kN (100tonf), 스크류잭 1,500kN (150tonf, S-2 볼트 플랜지 이음)',
    svgType: 'JACK',
  },
  {
    id: 'DECK',
    name: '7. 복공 주형보 & 복공판',
    engName: 'Deck Girder & Deck Plate',
    nickname: '공사 중에도 차량이 달리는 임시 도로',
    color: '#475569',
    photoUrl: '/assets/materials/deck_girder.jpg',
    photoCaption: '도심지 지상 차량(DB-24 하중)이 원활하게 통행하도록 받쳐주는 대형 H형강 주형보(Deck Girder)와 복공판 하부 뷰',
    summary: '굴착 상부에 차량 통행을 유지하기 위해 가설하는 대형 H형강 들보(주형보)와 미끄럼방지 강재 바닥판(복공판)입니다.',
    function: '덤프트럭 및 일반 차량(DB-24 하중, 43.2톤)이 굴착 상부를 안전하게 통행할 수 있도록 도로 노면 형성',
    constructionStep: '지표면 엄지말뚝 상단에 침보/주형보 거치 → 2.0×0.75m 복공판 연속 배열 및 볼팅 고정',
    whyNeeded: '도심지 도로를 완전 차단하지 않고 지하정거장 굴착 공사를 가능하게 해주는 핵심 시설입니다.',
    standardSpec: '주형보 H-400×400 / H-440×300 (A-1, B-1), 복공판 2000×1000×200mm (미끄럼방지 H형)',
    svgType: 'DECK',
  },
  {
    id: 'BRACING',
    name: '8. 보강재 & 브레이싱 (Bracing)',
    engName: 'Horizontal / Diagonal Bracing',
    nickname: '버팀보가 꺾이지 않도록 엮어주는 가새',
    color: '#0891b2',
    photoUrl: '/assets/materials/bracing.jpg',
    photoCaption: '압축력을 받는 H-300 버팀보 상하 플랜지에 U볼트(U-1) 및 스티프너로 X자 결합된 ㄷ-380/L-90 가새 실물',
    summary: '버팀보와 버팀보 사이, 또는 중간말뚝 사이에 X자형이나 수평으로 연결하는 L형강, ㄷ형강 부재입니다.',
    function: '압축력을 받는 긴 버팀보가 옆으로 꺾여 부러지는 좌굴(Buckling) 현상을 방지하여 허용내력을 2~3배 향상',
    constructionStep: '버팀보 설치 후 상하 플랜지에 U볼트(U-1) 및 스티프너(I-1)로 L-90, ㄷ-380 가새 볼팅 연결',
    whyNeeded: '강재는 압축력이 커지면 찌그러지기 쉬우므로, 가새로 묶어 지간 길이를 줄여주는 것이 구조역학적으로 필수입니다.',
    standardSpec: 'ㄷ-380×100×10.5×16 (F-1 TYPE), L-90×90×10 (G-2 TYPE), U볼트 U-1, U-6',
    svgType: 'BRACING',
  },
];

export const MaterialVisualGuideModal: React.FC<MaterialVisualGuideModalProps> = ({
  isOpen,
  onClose,
  initialMember = 'OVERVIEW',
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialMember);
  const [viewMode, setViewMode] = useState<'PHOTO' | 'DIAGRAM'>('PHOTO');

  if (!isOpen) return null;

  const currentMember = MATERIAL_MEMBERS.find((m) => m.id === selectedId) || MATERIAL_MEMBERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight">
                  지하 가시설(흙막이·지보공) 핵심 부재 실물 사진 & 3D 시공도감
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded border border-blue-400/40">
                  현장 실사 + 3D 도해
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                도면·내역서에 등장하는 엄지말뚝, 띠장, 버팀보, 화타쐐기, 스크류잭의 실제 현장 시공 사진과 원리를 해설합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Photo vs Diagram Toggle */}
            <div className="bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 flex items-center text-xs">
              <button
                onClick={() => setViewMode('PHOTO')}
                className={`px-2.5 py-1 rounded-md font-bold transition flex items-center space-x-1 cursor-pointer ${
                  viewMode === 'PHOTO'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>실물 사진</span>
              </button>
              <button
                onClick={() => setViewMode('DIAGRAM')}
                className={`px-2.5 py-1 rounded-md font-bold transition flex items-center space-x-1 cursor-pointer ${
                  viewMode === 'DIAGRAM'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayersIcon className="w-3.5 h-3.5" />
                <span>3D 도해</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Member Selector Bar (Pills) */}
        <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center space-x-1.5 overflow-x-auto shrink-0">
          {MATERIAL_MEMBERS.map((m) => {
            const isSelected = m.id === selectedId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: isSelected ? '#ffffff' : m.color }}
                />
                <span>{m.name.split(' ')[0]} {m.name.split(' ')[1] || ''}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50 text-xs">
          {/* Top Headline Card */}
          <div
            className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
            style={{
              backgroundColor: `${currentMember.color}08`,
              borderColor: `${currentMember.color}30`,
            }}
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-2xs"
                  style={{ backgroundColor: currentMember.color }}
                >
                  {currentMember.engName}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentMember.name}
                </h3>
              </div>
              <p className="text-sm font-semibold text-blue-900">
                "{currentMember.nickname}"
              </p>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                {currentMember.summary}
              </p>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shrink-0 text-right space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-medium">표준 설계 기준 규격</span>
              <span className="font-mono font-bold text-slate-800 text-xs block">
                {currentMember.standardSpec.split(',')[0]}
              </span>
            </div>
          </div>

          {/* Real Construction Photo / 3D Diagram Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left: High-Res Real Construction Photo or Interactive SVG Diagram (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-300 p-3 shadow-xs flex flex-col space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  {viewMode === 'PHOTO' ? (
                    <>
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>실제 시공 현장 실물 사진 (Real Construction Photo)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>3D 입체 개념도 및 시공 결합 상태</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-200">
                  {viewMode === 'PHOTO' ? '고화질 실사' : '3D 다이어그램'}
                </span>
              </div>

              {/* View Mode 1: High Resolution Photo Display */}
              {viewMode === 'PHOTO' ? (
                <div className="w-full h-[280px] sm:h-[340px] bg-slate-900 rounded-lg overflow-hidden relative group">
                  <img
                    src={currentMember.photoUrl}
                    alt={currentMember.name}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
                  />
                  {/* Photo Caption Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 text-white">
                    <div className="flex items-center space-x-1.5 text-sky-300 font-bold text-[11px] mb-0.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{currentMember.name} — 현장 실사 해설</span>
                    </div>
                    <p className="text-[10.5px] text-slate-200 leading-snug">
                      {currentMember.photoCaption}
                    </p>
                  </div>
                </div>
              ) : (
                /* View Mode 2: Dynamic SVG Visual by Type */
                <div className="w-full h-[280px] sm:h-[340px] bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative p-2 select-none">
                  {currentMember.svgType === 'OVERVIEW' && (
                    <svg viewBox="0 0 500 300" className="w-full h-full">
                      <rect x="0" y="0" width="500" height="40" fill="#0f172a" />
                      <line x1="20" y1="40" x2="480" y2="40" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />
                      <text x="30" y="32" fill="#94a3b8" fontSize="10" fontWeight="bold">GL ±0.0m 지표면 (도로)</text>
                      <rect x="20" y="40" width="80" height="240" fill="#1e293b" opacity="0.6" />
                      <rect x="400" y="40" width="80" height="240" fill="#1e293b" opacity="0.6" />
                      <text x="50" y="150" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">배면 토사</text>
                      <text x="440" y="150" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">배면 토사</text>
                      <rect x="100" y="32" width="300" height="8" fill="#475569" rx="1" />
                      <rect x="100" y="40" width="300" height="12" fill="#334155" />
                      <text x="250" y="26" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">🚗 복공판 & 주형보</text>
                      <rect x="95" y="40" width="12" height="250" fill="#0284c7" rx="1" />
                      <rect x="393" y="40" width="12" height="250" fill="#0284c7" rx="1" />
                      <g transform="translate(0, 75)">
                        <rect x="107" y="0" width="10" height="14" fill="#a855f7" rx="1" />
                        <rect x="383" y="0" width="10" height="14" fill="#a855f7" rx="1" />
                        <rect x="117" y="3" width="266" height="8" fill="#10b981" rx="1" />
                        <rect x="120" y="0" width="14" height="14" fill="#f97316" rx="2" />
                        <text x="250" y="0" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">1단 버팀보 (Strut 1단)</text>
                      </g>
                      <g transform="translate(0, 145)">
                        <rect x="107" y="0" width="10" height="14" fill="#a855f7" rx="1" />
                        <rect x="383" y="0" width="10" height="14" fill="#a855f7" rx="1" />
                        <rect x="117" y="3" width="266" height="8" fill="#10b981" rx="1" />
                        <rect x="120" y="0" width="14" height="14" fill="#f97316" rx="2" />
                        <text x="250" y="0" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">2단 버팀보 (Strut 2단)</text>
                      </g>
                    </svg>
                  )}
                  {currentMember.svgType !== 'OVERVIEW' && (
                    <div className="text-center text-slate-400 space-y-2">
                      <LayersIcon className="w-10 h-10 mx-auto text-blue-400 opacity-60" />
                      <p className="text-xs">상단 [실물 사진] 탭을 누르면 초고화질 현장 시공 실사를 확인하실 수 있습니다.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Engineering Principles & Why Needed Explanation (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Card 1: Core Function & Why Needed */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs border-b border-slate-100 pb-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>핵심 기능 및 필요성 (Why Needed)</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-900 block">• 구조적 역할:</span>
                    <span>{currentMember.function}</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-900 block">• 설치하지 않을 경우 위험:</span>
                    <span className="text-slate-600">{currentMember.whyNeeded}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Construction Sequence Step-by-Step */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-xs border-b border-slate-100 pb-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>현장 시공 절차 (Construction Sequence)</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {currentMember.constructionStep}
                </p>
              </div>

              {/* Card 3: Standard Specifications & Code */}
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">
                  Standards & Material Grade
                </span>
                <div className="font-semibold text-slate-900">
                  {currentMember.standardSpec}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Member Quick Navigation Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
              <span>■ 전체 가시설 핵심 8개 부재 사진 도감 바로가기</span>
              <span className="text-[10px] text-slate-400">카드를 클릭하여 상세 실사 사진을 확인하세요</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {MATERIAL_MEMBERS.map((m) => {
                const isSelected = m.id === selectedId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`p-2 rounded-lg border text-left transition flex flex-col justify-between space-y-1 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-400'
                        : 'bg-white hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: m.color }}
                      />
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                    </div>
                    <div>
                      <div className="font-bold text-[11px] text-slate-900 leading-tight">
                        {m.name.split('.')[1] || m.name}
                      </div>
                      <div className="text-[9.5px] text-slate-500 truncate font-mono">
                        {m.engName.split(' ')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-12 px-5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <Info className="w-4 h-4 text-blue-600" />
            <span>이 도감은 KDS 21 30 00 가설흙막이설계기준 및 실측 내역서(35건)를 바탕으로 제작되었습니다.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition cursor-pointer shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
