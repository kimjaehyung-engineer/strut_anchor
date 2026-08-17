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
  Bot,
  Sparkles,
  Send,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface AiEngineeringAdvisorProps {
  settings: ProjectSettings;
  layers: SoilLayer[];
  wall: WallSection;
  struts: StrutTier[];
  currentStage: ExcavationStage;
  calcResult: CalculationResult;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiEngineeringAdvisor: React.FC<AiEngineeringAdvisorProps> = ({
  settings,
  layers,
  wall,
  struts,
  currentStage,
  calcResult,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `안녕하세요! 지반 및 구조 가시설 AI 엔지니어링 어드바이저입니다. 현재 **${currentStage.name} (굴착심도 GL -${calcResult.currentExcavationDepth}m)** 에 대한 실시간 안정성 진단이 완료되었습니다. 무엇이든 질문하시거나 설계 최적화 의견을 요청하세요.`,
      timestamp: '지금',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate automated geotechnical diagnosis based on parameters
  const generateDiagnosis = () => {
    const findings: string[] = [];

    // 1. Water & Boiling check
    if (settings.groundWaterTable < calcResult.currentExcavationDepth) {
      findings.push(
        `💧 **지하수위 관리**: 현재 굴착심도(GL -${calcResult.currentExcavationDepth}m)가 지하수위(GL -${settings.groundWaterTable}m)보다 깊습니다. 굴착저면 침투압에 의한 보일링 안전율은 Fs=${calcResult.safety.boilingFs}로 ${calcResult.safety.boilingSafe ? '안전 범위' : '위험 수준'}입니다. ${wall.type === 'H_PILE_TIMBER' ? '토류판 배면으로 틈새 모래 유출이 우려되므로 차수그라우팅(LW/JSP) 보강을 권장합니다.' : '차수벽체 유지 관리에 유의하세요.'}`
      );
    }

    // 2. Wall Stress
    if (calcResult.safety.wallStressUtilization > 85) {
      findings.push(
        `⚠️ **벽체 휨응력 주의**: 벽체 응력비가 **${calcResult.safety.wallStressUtilization}%**에 도달했습니다. 지보재 단수를 추가하거나 프리로드(Preload)를 ${Math.round(struts[0]?.preloadTon * 1.2 || 30)}ton 수준으로 상향 조정을 검토하세요.`
      );
    } else {
      findings.push(
        `✅ **벽체 단면력 안정**: 현재 벽체 최대 휨모멘트 M_max=${calcResult.safety.maxBendingMoment} kN·m/m, 응력비 ${calcResult.safety.wallStressUtilization}%로 탄성 범위 내에서 안정적입니다.`
      );
    }

    // 3. Strut utilization
    const highStressStruts = calcResult.strutResults.filter((s) => s.utilizationRatio > 80);
    if (highStressStruts.length > 0) {
      findings.push(
        `🔩 **버팀보 축력 집중**: ${highStressStruts.map((s) => `${s.tier}단(${s.utilizationRatio}%)`).join(', ')} 버팀보의 축력이 높습니다. 중간말뚝(King Post) 설치 상태와 버팀보 수평 간격(@${highStressStruts[0]?.spacing}m)을 재확인하세요.`
      );
    }

    // 4. Instrumentation Recommendation
    findings.push(
      `📊 **시공 계측 권장**: 도로 복공구간이므로 **1) 지중경사계(Wall Inclinometer, 20m 간격)**, **2) 지하수위계(배면 3개소)**, **3) 스트럿 축력계(Load Cell, 각 단별 2조)**, **4) 도로 지표침하계(포장면)**를 배치하여 관리기준치(1차: 70%, 2차: 85%)로 모니터링하십시오.`
    );

    return findings;
  };

  const handleSend = (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsAnalyzing(true);

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('계획') || lower.includes('프로그램') || lower.includes('로드맵')) {
        reply = `**[개착가시설 프로그램 구축 계획 제안]**
1. **지반 모델**: 지층별 N치, c, φ, kh, GWT를 파라미터화하고 깊이별 수직 보간 연산자를 구축합니다.
2. **토압 모델**: 굴착 단계별로 Peck 겉보기 토압(사질토 0.65γHKa, 점성토 식)과 정수압을 산정합니다.
3. **구조 연산**: 굴착 깊이와 설치된 버팀보 지지점을 기준으로 연속보 하중분배 및 휨모멘트(BMD), 전단력(SFD), 벽체변위(δ)를 계산합니다.
4. **지반 안정성**: 히빙(5.7c/overburden), 보일링(icr/iexit), 파이핑, 근입깊이 수동토압 안전율을 KDS 기준으로 판정합니다.`;
      } else if (lower.includes('히빙') || lower.includes('heaving')) {
        reply = `**[히빙(Heaving) 검토 원리]**
- **정의**: 연약 점성토 지반을 굴착할 때, 굴착 배면의 흙 무게로 인해 굴착 바닥면의 점토가 불룩하게 솟아오르는 전단 파괴 현상입니다.
- **계산식**: $F_s = \\frac{5.7 \\cdot c}{\\gamma H + q} \\ge 1.2$
- **현재 계산 결과**: 점착력 $c$ 및 굴착심도 $H=${calcResult.currentExcavationDepth}m$에서 **$F_s = ${calcResult.safety.heavingFs}$** (${calcResult.safety.heavingSafe ? '안전' : '보강 필요'})입니다.`;
      } else if (lower.includes('보일링') || lower.includes('boiling')) {
        reply = `**[보일링(Boiling) 및 퀵샌드 검토 원리]**
- **정의**: 투수성이 큰 사질토 지반에서 지하수위 차로 인해 상향 침투류가 발생하여 유효응력이 0이 되어 모래가 물과 함께 솟구치는 현상입니다.
- **계산식**: $F_s = \\frac{i_{cr}}{i} = \\frac{(\\gamma_{sat}-\\gamma_w)/\\gamma_w}{\\Delta h / (2 D_{embed})} \\ge 1.5$
- **현재 계산 결과**: $F_s = ${calcResult.safety.boilingFs}$ (${calcResult.safety.boilingSafe ? '만족' : '위험'}). 수위 차가 클 경우 딥웰(Deep well) 양수 또는 차수벽 연장이 필요합니다.`;
      } else if (lower.includes('선하중') || lower.includes('preload') || lower.includes('프리로드')) {
        reply = `**[버팀보 Preload(선하중)의 효과]**
- 버팀보 설치 직후 유압잭으로 설계 축력의 30~50% 수준 선하중을 가하면 벽체 배면 변위 억제 및 도로 지표침하를 크게 줄일 수 있습니다.
- 현재 ${struts.length}개단 버팀보에 총 **${struts.reduce((acc, s) => acc + s.preloadTon, 0)} tonf**의 선하중이 계획되어 있습니다.`;
      } else {
        const diags = generateDiagnosis();
        reply = `**[현재 상태 실시간 기술 진단 의견]**\n\n` + diags.join('\n\n');
      }

      const aiMsg: Message = {
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsAnalyzing(false);
    }, 600);
  };

  const quickPrompts = [
    '프로그램 개발 계획 어떻게 수립해?',
    '현재 단계 지반 리스크 진단해줘',
    '보일링 및 히빙 안전율 원리',
    '버팀보 선하중(Preload) 효과',
  ];

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col h-[460px]">
      {/* Advisor Header */}
      <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1 bg-blue-50 text-blue-600 rounded border border-blue-200">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <span>AI 지반공학 엔지니어링 어드바이저</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              KDS 설계기준 기반 실시간 가시설 진단 & 컨설팅
            </div>
          </div>
        </div>
        <button
          onClick={() => handleSend('현재 단계 지반 리스크 진단해줘')}
          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold flex items-center space-x-1 shadow-xs transition"
        >
          <RefreshCw className="w-3 h-3 text-blue-600" />
          <span>실시간 진단</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs bg-slate-50/50">
        {messages.map((m, idx) => (
          <div
            key={`msg-${idx}`}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] p-3 rounded leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-1.5'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}
        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs py-1.5">
            <Bot className="w-4 h-4 text-blue-600 animate-spin" />
            <span>지반 및 구조 파라미터 해석 중...</span>
          </div>
        )}
      </div>

      {/* Quick Questions & Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        {/* Quick Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {quickPrompts.map((q, idx) => (
            <button
              key={`chip-${idx}`}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] whitespace-nowrap border border-slate-200 font-medium transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Text Box */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="지반 조건, 버팀보 배치, 히빙/보일링 검토 등 질문 입력..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
          />
          <button
            onClick={() => handleSend()}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
