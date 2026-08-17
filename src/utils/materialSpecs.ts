// 내역서 및 현장 설계도서 기반 자재 규격 라이브러리 (Material Specifications)

export interface HPileSpec {
  id: string;
  name: string;
  size: string; // e.g. "H-300×305×15×15"
  height: number; // mm
  width: number; // mm
  webThickness: number; // mm
  flangeThickness: number; // mm
  unitWeight: number; // kg/m
  areaA: number; // cm²
  momentOfInertiaIx: number; // cm4
  momentOfInertiaIy: number; // cm4
  sectionModulusZx: number; // cm³
  sectionModulusZy: number; // cm³
  allowableBendingStress: number; // MPa
  steelGrade: 'SS275' | 'SM355';
  notes: string;
}

export interface WaleSpec {
  id: string;
  name: string;
  type: 'SINGLE' | 'DOUBLE';
  section: string;
  areaA: number; // cm²
  momentOfInertiaI: number; // cm4
  sectionModulusZ: number; // cm³
  allowableBendingStress: number; // MPa
  unitWeight: number; // kg/m
  connectionType: string; // C-1, C-2, C-3
  cornerType: string; // D-1
  bracketType: string; // O-1, O-2, O-5, O-6
}

export interface StrutSpec {
  id: string;
  name: string;
  category: 'H_BEAM' | 'PIPE' | 'ANCHOR';
  section: string;
  outerDiameter?: number; // mm (for pipe)
  thickness?: number; // mm
  areaA: number; // cm²
  momentOfInertiaI: number; // cm4
  sectionModulusZ: number; // cm³
  allowableAxialStress: number; // MPa
  unitWeight: number; // kg/m
  jackSpec: string; // e.g. "스크류잭 1,000kN"
  wedgeSpec: string; // e.g. "K-1 TYPE"
  connectionSpec: string; // e.g. "S-2 TYPE (H-300×305)"
}

export interface CenterPostSpec {
  id: string;
  name: string;
  section: string;
  height: number;
  width: number;
  webThickness: number;
  flangeThickness: number;
  areaA: number; // cm²
  momentOfInertiaIx: number; // cm4
  momentOfInertiaIy: number; // cm4
  radiusOfGyrationRx: number; // cm
  radiusOfGyrationRy: number; // cm
  allowableAxialStress: number; // MPa
  unitWeight: number; // kg/m
  typicalBearingCapacity: number; // kN (풍화암/연암 근입시 허용연직지지력 Qa)
  notes: string;
}

export interface DeckGirderSpec {
  id: string;
  name: string;
  section: string;
  spanLength: number; // m
  sectionModulusZ: number; // cm³
  momentOfInertiaI: number; // cm4
  unitWeight: number; // kg/m
  allowableBendingStress: number; // MPa
}

export interface ReinforcementSpec {
  category: string;
  name: string;
  spec: string;
  unit: string;
  unitWeight?: string;
  usage: string;
}

export interface BOQItem {
  code: string;
  category: string;
  subCategory: string;
  name: string;
  spec: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

// 1. H-Pile 규격 (내역서 기준: H-250, H-300×300, H-300×305, H-440, H-700)
export const H_PILE_SPECS: HPileSpec[] = [
  {
    id: 'hp-300-305-sm355',
    name: 'H-300×305×15×15 (SM355) - 내역서 표준 엄지말뚝',
    size: '300×305×15×15mm',
    height: 300,
    width: 305,
    webThickness: 15,
    flangeThickness: 15,
    unitWeight: 106.0,
    areaA: 134.8,
    momentOfInertiaIx: 22400,
    momentOfInertiaIy: 7110,
    sectionModulusZx: 1470,
    sectionModulusZy: 466,
    allowableBendingStress: 210,
    steelGrade: 'SM355',
    notes: '내역서 1년 사용료, 박기, 뽑기, 두부정리 및 이음 표준 적용 규격',
  },
  {
    id: 'hp-440-300',
    name: 'H-440×300×11×18 (SM355) - 중앙주형보 침보 및 대형말뚝',
    size: '440×300×11×18mm',
    height: 440,
    width: 300,
    webThickness: 11,
    flangeThickness: 18,
    unitWeight: 124.0,
    areaA: 157.4,
    momentOfInertiaIx: 56100,
    momentOfInertiaIy: 8120,
    sectionModulusZx: 2550,
    sectionModulusZy: 541,
    allowableBendingStress: 210,
    steelGrade: 'SM355',
    notes: '내역서 B-1 TYPE 중앙주형보 침보 및 고심도 흙막이용',
  },
  {
    id: 'hp-700-300',
    name: 'H-700×300×13×24 (SM355) - 대형 주형보 및 초고강성 말뚝',
    size: '700×300×13×24mm',
    height: 700,
    width: 300,
    webThickness: 13,
    flangeThickness: 24,
    unitWeight: 185.0,
    areaA: 235.5,
    momentOfInertiaIx: 201000,
    momentOfInertiaIy: 10800,
    sectionModulusZx: 5760,
    sectionModulusZy: 722,
    allowableBendingStress: 210,
    steelGrade: 'SM355',
    notes: '내역서 80.219 ton 강재운반 및 1년 사용료 적용 규격',
  },
  {
    id: 'hp-250-250',
    name: 'H-250×250×9×14 (SS275) - 지보 및 경량 흙막이',
    size: '250×250×9×14mm',
    height: 250,
    width: 250,
    webThickness: 9,
    flangeThickness: 14,
    unitWeight: 72.4,
    areaA: 92.2,
    momentOfInertiaIx: 10800,
    momentOfInertiaIy: 3650,
    sectionModulusZx: 864,
    sectionModulusZy: 292,
    allowableBendingStress: 190,
    steelGrade: 'SS275',
    notes: '내역서 띠장재(H-250) 및 소운반 적용',
  },
  {
    id: 'hp-300-300',
    name: 'H-300×300×10×15 (SS275) - 일반 가시설 규격',
    size: '300×300×10×15mm',
    height: 300,
    width: 300,
    webThickness: 10,
    flangeThickness: 15,
    unitWeight: 94.0,
    areaA: 119.8,
    momentOfInertiaIx: 20400,
    momentOfInertiaIy: 6750,
    sectionModulusZx: 1360,
    sectionModulusZy: 450,
    allowableBendingStress: 190,
    steelGrade: 'SS275',
    notes: '내역서 152.821 ton 운반 및 강재사용료 적용',
  },
];

// 2. 띠장(Wale) 규격 (내역서 기준: H-300×305, H-250×250, H-440×300 및 연결 부속)
export const WALE_SPECS: WaleSpec[] = [
  {
    id: 'wale-2h-300-305',
    name: '2H-300×305×15×15 (2련 띠장) - 내역서 표준',
    type: 'DOUBLE',
    section: '2H-300×305×15×15',
    areaA: 269.6,
    momentOfInertiaI: 44800,
    sectionModulusZ: 2940,
    allowableBendingStress: 210,
    unitWeight: 212.0,
    connectionType: 'C-1 TYPE (H-300×305 연결판)',
    cornerType: 'D-1 TYPE (H-300×305 우각부 연결)',
    bracketType: 'O-1 (철근보걸이) / O-2 (앵글보걸이)',
  },
  {
    id: 'wale-h-300-305',
    name: 'H-300×305×15×15 (단일 띠장) - 내역서 439m 설치/철거',
    type: 'SINGLE',
    section: 'H-300×305×15×15',
    areaA: 134.8,
    momentOfInertiaI: 22400,
    sectionModulusZ: 1470,
    allowableBendingStress: 210,
    unitWeight: 106.0,
    connectionType: 'C-1 TYPE (H-300×305)',
    cornerType: 'D-1 TYPE (H-300×305)',
    bracketType: 'O-1 (철근보걸이) / O-2 (앵글보걸이)',
  },
  {
    id: 'wale-h-250-250',
    name: 'H-250×250×9×14 (단일 띠장) - 내역서 423m 설치/철거',
    type: 'SINGLE',
    section: 'H-250×250×9×14',
    areaA: 92.2,
    momentOfInertiaI: 10800,
    sectionModulusZ: 864,
    allowableBendingStress: 190,
    unitWeight: 72.4,
    connectionType: 'C-3 TYPE (H-250×250)',
    cornerType: 'D-1 TYPE',
    bracketType: 'O-5 (철근보걸이) / O-6 (앵글보걸이)',
  },
  {
    id: 'wale-2h-440-300',
    name: '2H-440×300×11×18 (대형 2련 띠장)',
    type: 'DOUBLE',
    section: '2H-440×300×11×18',
    areaA: 314.8,
    momentOfInertiaI: 112200,
    sectionModulusZ: 5100,
    allowableBendingStress: 210,
    unitWeight: 248.0,
    connectionType: 'C-2 TYPE (H-440×300)',
    cornerType: 'D-1 TYPE',
    bracketType: 'O-1 / O-2 TYPE',
  },
];

// 3. 버팀보 (Strut) 및 축력재 규격
export const STRUT_SPECS: StrutSpec[] = [
  {
    id: 'strut-h-300-305',
    name: 'H-300×305×15×15 버팀보 (내역서 한면제작 및 S-2연결)',
    category: 'H_BEAM',
    section: 'H-300×305×15×15',
    areaA: 134.8,
    momentOfInertiaI: 22400,
    sectionModulusZ: 1470,
    allowableAxialStress: 160,
    unitWeight: 106.0,
    jackSpec: '스크류잭 1,000kN (100tonf)',
    wedgeSpec: '화타쐐기 K-1 / K-2 TYPE',
    connectionSpec: 'S-2 TYPE (H-300×305 연결)',
  },
  {
    id: 'strut-pipe-609-12',
    name: '원형강관 버팀보 Φ609.6×12t (STK490 / SM355)',
    category: 'PIPE',
    section: 'Φ609.6×12t',
    outerDiameter: 609.6,
    thickness: 12,
    areaA: 225.3,
    momentOfInertiaI: 99400,
    sectionModulusZ: 3260,
    allowableAxialStress: 160,
    unitWeight: 177.0,
    jackSpec: '유압 스크류잭 1,000kN',
    wedgeSpec: '화타쐐기 K-1 TYPE',
    connectionSpec: 'S-2 TYPE 볼트 플랜지 이음',
  },
  {
    id: 'strut-pipe-609-14',
    name: '원형강관 버팀보 Φ609.6×14t (STK490)',
    category: 'PIPE',
    section: 'Φ609.6×14t',
    outerDiameter: 609.6,
    thickness: 14,
    areaA: 262.0,
    momentOfInertiaI: 114000,
    sectionModulusZ: 3740,
    allowableAxialStress: 160,
    unitWeight: 206.0,
    jackSpec: '유압 스크류잭 1,000kN',
    wedgeSpec: '화타쐐기 K-1 TYPE',
    connectionSpec: 'S-2 TYPE 플랜지 이음',
  },
  {
    id: 'strut-pipe-711-14',
    name: '원형강관 버팀보 Φ711.2×14t',
    category: 'PIPE',
    section: 'Φ711.2×14t',
    outerDiameter: 711.2,
    thickness: 14,
    areaA: 306.6,
    momentOfInertiaI: 187000,
    sectionModulusZ: 5260,
    allowableAxialStress: 160,
    unitWeight: 241.0,
    jackSpec: '유압 스크류잭 1,500kN',
    wedgeSpec: '화타쐐기 K-1 TYPE',
    connectionSpec: '플랜지 고력볼트 이음',
  },
  {
    id: 'strut-anchor-pc127',
    name: '어스앵커 PC강선 φ12.7mm (4가닥) - 내역서 기준',
    category: 'ANCHOR',
    section: 'φ12.7mm 4가닥 (D105mm 천공)',
    areaA: 3.95, // 0.987 * 4 cm²
    momentOfInertiaI: 0,
    sectionModulusZ: 0,
    allowableAxialStress: 1200, // MPa
    unitWeight: 3.1, // kg/m
    jackSpec: 'PC 유압 인장기 (7mm PC콘 조립)',
    wedgeSpec: '지압판 Base Plate (300×300×25t)',
    connectionSpec: '토사/풍화암 천공 D105mm 그라우팅',
  },
];

// 4. 중간말뚝 (Center King Post) 규격 라이브러리
export const CENTER_POST_SPECS: CenterPostSpec[] = [
  {
    id: 'cp-300-300',
    name: 'H-300×300×10×15 (SM355) - 도심지 표준 중간말뚝',
    section: 'H-300×300×10×15',
    height: 300,
    width: 300,
    webThickness: 10,
    flangeThickness: 15,
    areaA: 119.8,
    momentOfInertiaIx: 20400,
    momentOfInertiaIy: 6750,
    radiusOfGyrationRx: 13.1,
    radiusOfGyrationRy: 7.51,
    allowableAxialStress: 160,
    unitWeight: 94.0,
    typicalBearingCapacity: 1500,
    notes: '지하철 개착구간 1열 중간말뚝 표준, 복공판 및 DB-24 하중 지지 (F-1 연결재/G-2 가새 적용)',
  },
  {
    id: 'cp-300-305',
    name: 'H-300×305×15×15 (SM355) - 내역서 고강도 중간말뚝',
    section: 'H-300×305×15×15',
    height: 300,
    width: 305,
    webThickness: 15,
    flangeThickness: 15,
    areaA: 134.8,
    momentOfInertiaIx: 22400,
    momentOfInertiaIy: 7110,
    radiusOfGyrationRx: 12.9,
    radiusOfGyrationRy: 7.26,
    allowableAxialStress: 165,
    unitWeight: 106.0,
    typicalBearingCapacity: 1850,
    notes: '내역서 실적용 자재, 엄지말뚝과 동일 규격으로 자재 수급성 우수 및 지반 지지력 증대',
  },
  {
    id: 'cp-350-350',
    name: 'H-350×350×12×19 (SM355) - 중하중/대지간 중간말뚝',
    section: 'H-350×350×12×19',
    height: 350,
    width: 350,
    webThickness: 12,
    flangeThickness: 19,
    areaA: 173.9,
    momentOfInertiaIx: 39800,
    momentOfInertiaIy: 13600,
    radiusOfGyrationRx: 15.2,
    radiusOfGyrationRy: 8.84,
    allowableAxialStress: 170,
    unitWeight: 137.0,
    typicalBearingCapacity: 2200,
    notes: '굴착폭 22m 이상 또는 버팀보 단수 5단 이상 심도 가시설용 고내력 중간말뚝',
  },
  {
    id: 'cp-400-400',
    name: 'H-400×400×13×21 (SM355) - 초중하중 중간말뚝',
    section: 'H-400×400×13×21',
    height: 400,
    width: 400,
    webThickness: 13,
    flangeThickness: 21,
    areaA: 218.7,
    momentOfInertiaIx: 66600,
    momentOfInertiaIy: 22400,
    radiusOfGyrationRx: 17.5,
    radiusOfGyrationRy: 10.1,
    allowableAxialStress: 175,
    unitWeight: 172.0,
    typicalBearingCapacity: 2800,
    notes: '중차량 전용 차로 복공구간 및 고심도(GL -30m) 정거장 본체 가시설용',
  },
];

// 5. 복공 주형보 (Decking Girder) 규격
export const DECK_GIRDER_SPECS: DeckGirderSpec[] = [
  {
    id: 'dg-400-400',
    name: 'H-400×400×13×21 (L=10.0m) - 복공 주형보 표준',
    section: 'H-400×400×13×21',
    spanLength: 10.0,
    sectionModulusZ: 3330,
    momentOfInertiaI: 66600,
    unitWeight: 172.0,
    allowableBendingStress: 210,
  },
  {
    id: 'dg-440-300',
    name: 'H-440×300×11×18 (L=10.0m) - 내역서 침보/주형보',
    section: 'H-440×300×11×18',
    spanLength: 10.0,
    sectionModulusZ: 2550,
    momentOfInertiaI: 56100,
    unitWeight: 124.0,
    allowableBendingStress: 210,
  },
  {
    id: 'dg-700-300',
    name: 'H-700×300×13×24 (L=20.0m) - 무지주 대경간 주형보',
    section: 'H-700×300×13×24',
    spanLength: 20.0,
    sectionModulusZ: 5760,
    momentOfInertiaI: 201000,
    unitWeight: 185.0,
    allowableBendingStress: 210,
  },
];

// 6. 보강재, 브레이싱, 부속품 목록 (내역서 공종 상세)
export const REINFORCEMENT_SPECS: ReinforcementSpec[] = [
  {
    category: 'ㄷ-형강 (Channel)',
    name: 'ㄷ-형강 중간말뚝 연결재 (F-1 TYPE)',
    spec: 'ㄷ-380×100×10.5×16mm',
    unit: 'm / 개소',
    unitWeight: '54.5 kg/m',
    usage: '내역서 765m 설치/철거, F-1 TYPE 중간말뚝 연결재',
  },
  {
    category: 'L-형강 (Angle)',
    name: 'L-형강 수평/사재 가새 및 중간파일 브레이싱 (G-2 TYPE)',
    spec: 'L-90×90×10mm',
    unit: 'm / 개소',
    unitWeight: '13.3 kg/m',
    usage: '내역서 1,066m 가설, 중간파일 브레이싱 102개소(G-2)',
  },
  {
    category: '버팀보 보강재',
    name: '버팀보 보강 브라켓 (B-4, B-5, B-6 TYPE)',
    spec: 'H-300×305 기반 B-4 / B-5 / B-6 TYPE',
    unit: '개소',
    usage: '내역서 400개소 설치, 버팀보 국부좌굴 및 단부 보강',
  },
  {
    category: 'U-볼트',
    name: 'U-볼트 (U-1 TYPE / U-6 TYPE)',
    spec: 'U-1: H-300 + ㄷ-380 / U-6: ㄷ-380 + ㄷ-380',
    unit: '개소',
    usage: '내역서 124개소 체결, 띠장 및 중간말뚝 형강 결속',
  },
  {
    category: '스티프너 (Stiffener)',
    name: 'H-형강 웨브 스티프너 (I-1 TYPE)',
    spec: 'I-1 TYPE (H-300×305)',
    unit: '개소',
    usage: '내역서 56개소 설치, 띠장 및 버팀보 지압점 보강',
  },
  {
    category: '복공판 및 주형보',
    name: '도로 복공판 및 주형보 시스템',
    spec: 'H형 2000×1000×200mm / 주형보 600~800mm (5~11m)',
    unit: 'm² / 본',
    usage: '내역서 복공판 642m², 외측(A-1 H-300×305), 중앙(B-1 H-440×300)',
  },
  {
    category: '토류판 (Lagging)',
    name: '목재 토류판 및 경량 강재 토류판',
    spec: '목재 T=6cm (60mm) / 강재 T=1.2mm',
    unit: 'm²',
    usage: '내역서 목재 76m², 강재토류판 1,715m² 가설',
  },
  {
    category: '지반보강 (Grouting)',
    name: '차수보강 그라우팅 및 쏘일시멘트',
    spec: '토사/풍화암 D1,000 × C.T.C 800mm / 쏘일시멘트 1:15',
    unit: 'm / m³',
    usage: '내역서 1,695m 차수보강, 토류판 배면 수밀성 확보',
  },
];

// 5. 실제 첨부 내역서 데이터 추출 테이블 (총계약 내역 기준)
export const ATTACHED_BOQ_DATA: BOQItem[] = [
  // 2-1-2-1 말뚝박기용천공 및 항타
  {
    code: '2-1-2-1-1',
    category: '천공 및 항타',
    subCategory: '천공',
    name: '말뚝박기용 천공 및 항타',
    spec: 'D500mm, 케이싱 사용',
    unit: 'm',
    quantity: 1464.0,
    unitPrice: 56942,
    totalPrice: 83363088,
    notes: '엄지말뚝 매설용 천공 (φ500)',
  },
  {
    code: '2-1-2-1-2',
    category: '천공 및 항타',
    subCategory: '되메우기',
    name: '천공홀 되메우기',
    spec: 'φ500mm',
    unit: 'm',
    quantity: 1333.0,
    unitPrice: 10571,
    totalPrice: 14091143,
    notes: '말뚝 근입 후 모래/시멘트 충진',
  },
  // 2-1-2-2 강재운반 및 소운반
  {
    code: '2-1-2-2-1',
    category: '강재운반',
    subCategory: 'H-Pile',
    name: 'H-Pile 운반 (250×250×9×14)',
    spec: '250×250×9×14mm',
    unit: 'ton',
    quantity: 27.747,
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    code: '2-1-2-2-2',
    category: '강재운반',
    subCategory: 'H-Pile',
    name: 'H-Pile 운반 (300×300×10×15)',
    spec: '300×300×10×15mm',
    unit: 'ton',
    quantity: 152.821,
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    code: '2-1-2-2-3',
    category: '강재운반',
    subCategory: 'H-Pile',
    name: 'H-Pile 운반 (300×305×15×15)',
    spec: '300×305×15×15mm',
    unit: 'ton',
    quantity: 167.289,
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    code: '2-1-2-2-4',
    category: '강재운반',
    subCategory: 'H-Pile',
    name: 'H-Pile 운반 (440×300×11×18)',
    spec: '440×300×11×18mm',
    unit: 'ton',
    quantity: 80.219,
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    code: '2-1-2-2-5',
    category: '강재운반',
    subCategory: 'H-Pile',
    name: 'H-Pile 운반 (700×300×13×24)',
    spec: '700×300×13×24mm',
    unit: 'ton',
    quantity: 80.219,
    unitPrice: 0,
    totalPrice: 0,
  },
  {
    code: '2-1-2-2-6',
    category: '강재운반',
    subCategory: '복공판',
    name: '복공판 소운반 (설치/철거)',
    spec: 'H형, 2000×1000×200mm',
    unit: 'ton',
    quantity: 150.15,
    unitPrice: 7135,
    totalPrice: 1071320,
  },
  // 2-1-2-3 강재사용료
  {
    code: '2-1-2-3-1',
    category: '강재사용료',
    subCategory: 'H-Pile',
    name: 'H-Pile 사용료 (1개년, 300×305 SM355)',
    spec: '1개년, 300×305×15×15mm (SM355)',
    unit: 'ton',
    quantity: 194.092,
    unitPrice: 711432,
    totalPrice: 138083259,
    notes: '메인 흙막이 엄지말뚝',
  },
  {
    code: '2-1-2-3-2',
    category: '강재사용료',
    subCategory: 'H-Pile',
    name: 'H-Pile 사용료 (1개년, 700×300)',
    spec: '1개년, 700×300×13×24mm',
    unit: 'ton',
    quantity: 74.971,
    unitPrice: 767820,
    totalPrice: 57564233,
  },
  {
    code: '2-1-2-3-3',
    category: '강재사용료',
    subCategory: '복공판',
    name: '복공판 사용료 (1개년)',
    spec: '1개년, H형 2000×1000×200mm',
    unit: 'ton',
    quantity: 150.15,
    unitPrice: 1355138,
    totalPrice: 203473970,
  },
  // 2-1-2-4 H-Pile 박기 및 뽑기
  {
    code: '2-1-2-4-1',
    category: '말뚝시공',
    subCategory: 'H-Pile',
    name: 'H-Pile 이음 (용접)',
    spec: '300×305×15×15mm',
    unit: '개소',
    quantity: 85.0,
    unitPrice: 476830,
    totalPrice: 40530550,
  },
  {
    code: '2-1-2-4-2',
    category: '말뚝시공',
    subCategory: 'H-Pile',
    name: 'H-Pile 뽑기 (측면)',
    spec: '측면, 300×305×15×15mm',
    unit: '본',
    quantity: 113.0,
    unitPrice: 63116,
    totalPrice: 7132108,
  },
  // 2-1-2-5 주형보
  {
    code: '2-1-2-5-1',
    category: '주형보',
    subCategory: '주형보설치',
    name: '주형보 설치 (l=6~8m, 9~11m)',
    spec: '600~800mm, l=6~11m',
    unit: '본',
    quantity: 40.0,
    unitPrice: 275000,
    totalPrice: 11075606,
  },
  {
    code: '2-1-2-5-2',
    category: '주형보',
    subCategory: '침보',
    name: '중앙주형보 침보 설치/철거 (B-1 TYPE)',
    spec: 'B-1 TYPE, H-440×300',
    unit: 'm',
    quantity: 158.0,
    unitPrice: 53282,
    totalPrice: 8418556,
  },
  {
    code: '2-1-2-5-3',
    category: '주형보',
    subCategory: '브레이싱',
    name: '주형보 브레이싱 (X-1 단부 / X-2 중앙)',
    spec: 'X-1 / X-2 TYPE',
    unit: '개소',
    quantity: 200.0,
    unitPrice: 155000,
    totalPrice: 31268360,
  },
  // 2-1-2-6 띠장재
  {
    code: '2-1-2-6-1',
    category: '띠장',
    subCategory: '띠장설치',
    name: '띠장재 설치 (H-300×305)',
    spec: 'H-300×305',
    unit: 'm',
    quantity: 439.0,
    unitPrice: 27416,
    totalPrice: 12035624,
  },
  {
    code: '2-1-2-6-2',
    category: '띠장',
    subCategory: '띠장설치',
    name: '띠장재 설치 (H-250×250)',
    spec: 'H-250×250',
    unit: 'm',
    quantity: 423.0,
    unitPrice: 27416,
    totalPrice: 11596968,
  },
  {
    code: '2-1-2-6-3',
    category: '띠장',
    subCategory: '연결재',
    name: '띠장재 연결재 (C-1, C-2, C-3)',
    spec: 'C-1(H-300), C-2(H-440), C-3(H-250)',
    unit: '개소',
    quantity: 79.0,
    unitPrice: 50000,
    totalPrice: 3936529,
  },
  {
    code: '2-1-2-6-4',
    category: '띠장',
    subCategory: '보걸이',
    name: '보걸이 설치 (철근/앵글 O-1, O-2, O-5, O-6)',
    spec: 'O-1 ~ O-6 TYPE',
    unit: '개소',
    quantity: 566.0,
    unitPrice: 25700,
    totalPrice: 14546189,
  },
  // 2-1-2-7 버팀보
  {
    code: '2-1-2-7-1',
    category: '버팀보',
    subCategory: '버팀보설치',
    name: '버팀보 제작 및 설치 (H-300×305)',
    spec: 'H-300×305 (한면제작, 3~8m 이하)',
    unit: '본/개소',
    quantity: 148.0,
    unitPrice: 195000,
    totalPrice: 28432792,
  },
  {
    code: '2-1-2-7-2',
    category: '버팀보',
    subCategory: '연결재',
    name: '버팀보 연결재 (S-2 TYPE)',
    spec: 'S-2 TYPE, H-300×305',
    unit: '개소',
    quantity: 40.0,
    unitPrice: 100368,
    totalPrice: 4014720,
  },
  {
    code: '2-1-2-7-3',
    category: '버팀보',
    subCategory: '화타쐐기',
    name: '화타쐐기 제작 및 설치 (K-1, K-2)',
    spec: 'K-1 TYPE / K-2 TYPE',
    unit: '개소',
    quantity: 188.0,
    unitPrice: 390000,
    totalPrice: 73328624,
  },
  {
    code: '2-1-2-7-4',
    category: '버팀보',
    subCategory: '스크류잭',
    name: '유압 스크류잭 설치 및 선하중 긴장',
    spec: '스크류잭, 1000kN (100tonf)',
    unit: '개소',
    quantity: 80.0,
    unitPrice: 75572,
    totalPrice: 6045760,
  },
  // 2-1-2-8 보강재
  {
    code: '2-1-2-8-1',
    category: '보강재',
    subCategory: '형강',
    name: 'ㄷ-형강 설치 (380×100×10.5×16)',
    spec: '1개년, 380×100×10.5×16mm',
    unit: 'm',
    quantity: 765.0,
    unitPrice: 46129,
    totalPrice: 35288685,
  },
  {
    code: '2-1-2-8-2',
    category: '보강재',
    subCategory: '형강',
    name: 'L-형강 설치 (90×90×10)',
    spec: '1개년, 90×90×10mm',
    unit: 'm',
    quantity: 1066.0,
    unitPrice: 10433,
    totalPrice: 11121578,
  },
  {
    code: '2-1-2-8-3',
    category: '보강재',
    subCategory: '버팀보보강',
    name: '버팀보 보강재 설치 (B-4, B-5, B-6)',
    spec: 'B-4, B-5, B-6 TYPE (H-300×305)',
    unit: '개소',
    quantity: 400.0,
    unitPrice: 47000,
    totalPrice: 18726376,
  },
  {
    code: '2-1-2-8-4',
    category: '보강재',
    subCategory: '중간파일',
    name: '중간파일 브레이싱 (G-2 Type)',
    spec: 'G-2 Type (L-90×90×10mm)',
    unit: '개소',
    quantity: 102.0,
    unitPrice: 123040,
    totalPrice: 12550080,
  },
  {
    code: '2-1-2-8-5',
    category: '보강재',
    subCategory: 'U볼트',
    name: 'U-볼트 설치 (U-1, U-6 TYPE)',
    spec: 'U-1 TYPE (H+ㄷ) / U-6 TYPE (ㄷ+ㄷ)',
    unit: '개소',
    quantity: 124.0,
    unitPrice: 56500,
    totalPrice: 7012732,
  },
  {
    code: '2-1-2-8-6',
    category: '보강재',
    subCategory: '스티프너',
    name: '스티프너 설치 (I-1 TYPE)',
    spec: 'I-1 TYPE, H-300×305',
    unit: '개소',
    quantity: 56.0,
    unitPrice: 9434,
    totalPrice: 528304,
  },
  // 2-1-2-9 토류판
  {
    code: '2-1-2-9-1',
    category: '토류판',
    subCategory: '목재토류판',
    name: '목재토류판 설치',
    spec: 'T = 6cm, 1개년초과',
    unit: 'm²',
    quantity: 76.0,
    unitPrice: 68316,
    totalPrice: 5192016,
  },
  {
    code: '2-1-2-9-2',
    category: '토류판',
    subCategory: '강재토류판',
    name: '강재토류판 설치',
    spec: 'T = 1.2mm, 1개년초과',
    unit: 'm²',
    quantity: 1715.0,
    unitPrice: 86416,
    totalPrice: 148203440,
  },
  // 2-1-2-10 어스앵커
  {
    code: '2-1-2-10-1',
    category: '어스앵커',
    subCategory: '천공',
    name: '어스앵커 천공 및 강선삽입',
    spec: '토사/풍화암 D105mm, PC강선 φ12.7mm 4가닥',
    unit: 'm',
    quantity: 797.0,
    unitPrice: 47000,
    totalPrice: 37593087,
  },
  {
    code: '2-1-2-10-2',
    category: '어스앵커',
    subCategory: '지압판',
    name: '지압판(Base Plate) 제작 및 설치/철거',
    spec: 'Base Plate & PC콘 7mm',
    unit: '개소',
    quantity: 88.0,
    unitPrice: 596578,
    totalPrice: 52498864,
  },
  // 2-1-3 차수그라우팅
  {
    code: '2-1-3-1',
    category: '지반보강',
    subCategory: '차수그라우팅',
    name: '차수보강 그라우팅 (토사/풍화암)',
    spec: 'D1,000 × C.T.C 800mm',
    unit: 'm',
    quantity: 1695.0,
    unitPrice: 84000,
    totalPrice: 142316122,
  },
];
