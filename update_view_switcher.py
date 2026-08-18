with open('src/components/AnchorComparisonModal.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add state for drawingViewMode
target_state = "  const [optToast3, setOptToast3] = useState<boolean>(false);"
replacement_state = """  const [optToast3, setOptToast3] = useState<boolean>(false);
  const [drawingViewMode, setDrawingViewMode] = useState<'SECTION' | 'PLAN'>('SECTION');"""

if target_state in code and "const [drawingViewMode" not in code:
    code = code.replace(target_state, replacement_state, 1)
    print("drawingViewMode state added!")

# 2. Update 2D Canvas header with Toggle buttons (단면도 / 평면도)
target_header = """                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      {activeTab === '3_HYBRID' || activeTab === 'HYBRID' ? (
                        <>
                          <Layers className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-950">2D 광간격 버팀보 + 앵커 복합 지보(Hybrid) 단면도</span>
                        </>
                      ) : activeTab === '2B_HIGH_ANGLE' || activeTab === '2B_STEEP' ? (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span className="text-indigo-950">2D 고각·급경사 앵커(θ=45°~60°) 배면 정착 단면도</span>
                        </>
                      ) : (
                        <>
                          <Anchor className="w-4 h-4 text-blue-600" />
                          <span>2D 그라운드 앵커 배면 정착 단면도</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                      {stageViewMode === 'FULL_FINAL' ? '최종 완성단면' : `Step ${activeStage.step}: GL -${currentExcavationDepth}m`}
                    </span>
                  </div>"""

replacement_header = """                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-2">
                      <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-300">
                        <button
                          type="button"
                          onClick={() => setDrawingViewMode('SECTION')}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                            drawingViewMode === 'SECTION'
                              ? 'bg-white text-blue-800 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Anchor className="w-3.5 h-3.5 text-blue-600" />
                          <span>📐 단면도</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDrawingViewMode('PLAN')}
                          className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                            drawingViewMode === 'PLAN'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <SplitSquareVertical className="w-3.5 h-3.5 text-yellow-300" />
                          <span>🗺️ 수평 평면도(광간격 배치)</span>
                        </button>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                      {drawingViewMode === 'PLAN' ? '수평 앵커+버팀보 광간격 평면도' : (stageViewMode === 'FULL_FINAL' ? '최종 완성단면' : `Step ${activeStage.step}: GL -${currentExcavationDepth}m`)}
                    </span>
                  </div>"""

if target_header in code:
    code = code.replace(target_header, replacement_header, 1)
    print("Header replaced with view switcher!")

with open('src/components/AnchorComparisonModal.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
