with open('src/components/AnchorComparisonModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target_lcc_block = """              <tr className="bg-slate-50 font-bold">
                <td className="py-2.5 px-2 text-left text-slate-900">⑥ 종합 LCC (보상비·공기 반영)</td>
                <td className="py-2.5 px-2 bg-amber-100/50 font-mono text-amber-950">
                  {(lcc1Manwon / 10000).toFixed(2)}억원 ({lcc1Manwon.toLocaleString()}만원)
                </td>
                <td className="py-2.5 px-2 bg-blue-100/50 font-mono text-rose-800">
                  {(lcc2AManwon / 10000).toFixed(2)}억원 (보상비+)
                </td>
                <td className="py-2.5 px-2 bg-indigo-100/50 font-mono text-indigo-950">
                  {(lcc2BManwon / 10000).toFixed(2)}억원 (사유지0m)
                </td>
                <td className="py-2.5 px-2 bg-purple-200/80 font-mono font-black text-purple-950 text-sm">
                  ★ {(lcc3Manwon / 10000).toFixed(2)}억원 ({lcc3Manwon.toLocaleString()}만원, 최적)
                </td>
              </tr>
              <tr className="border-t-2 border-slate-300">
                <td className="py-3 px-2 text-left font-black text-slate-900 bg-slate-100">⑦ 종합 추천 순위</td>"""

new_lcc_block = """              <tr className="bg-slate-50 font-bold">
                <td className="py-2.5 px-2 text-left text-slate-900">⑥ 종합 LCC (사유지 보상비 포함)</td>
                <td className="py-2.5 px-2 bg-amber-100/50 font-mono text-amber-950">
                  {(lcc1Manwon / 10000).toFixed(2)}억원 ({lcc1Manwon.toLocaleString()}만원)
                </td>
                <td className="py-2.5 px-2 bg-blue-100/50 font-mono text-rose-800">
                  {(lcc2AManwon / 10000).toFixed(2)}억원 (보상비+)
                </td>
                <td className="py-2.5 px-2 bg-indigo-100/50 font-mono text-indigo-950">
                  {(lcc2BManwon / 10000).toFixed(2)}억원 (사유지0m)
                </td>
                <td className="py-2.5 px-2 bg-purple-200/80 font-mono font-black text-purple-950 text-sm">
                  ★ {(lcc3Manwon / 10000).toFixed(2)}억원 ({lcc3Manwon.toLocaleString()}만원, 최적)
                </td>
              </tr>
              <tr className="bg-sky-50/40 font-bold border-t border-slate-200">
                <td className="py-2.5 px-2 text-left text-slate-800">⑦ LCC (사유지 보상비 제외 기준)</td>
                <td className="py-2.5 px-2 bg-amber-50/30 font-mono text-amber-900">
                  {(lcc1Manwon / 10000).toFixed(2)}억원 ({lcc1Manwon.toLocaleString()}만원)
                </td>
                <td className="py-2.5 px-2 bg-blue-50/70 font-mono text-blue-950 font-bold">
                  {((cost2AManwon + (120 * 132.5)) / 10000).toFixed(2)}억원 ({Math.round(cost2AManwon + (120 * 132.5)).toLocaleString()}만원)
                </td>
                <td className="py-2.5 px-2 bg-indigo-50/30 font-mono text-indigo-900">
                  {(lcc2BManwon / 10000).toFixed(2)}억원 ({lcc2BManwon.toLocaleString()}만원)
                </td>
                <td className="py-2.5 px-2 bg-purple-100/80 font-mono font-black text-purple-950 text-sm">
                  ★ {(lcc3Manwon / 10000).toFixed(2)}억원 ({lcc3Manwon.toLocaleString()}만원, 최우수)
                </td>
              </tr>
              <tr className="border-t-2 border-slate-300">
                <td className="py-3 px-2 text-left font-black text-slate-900 bg-slate-100">⑧ 종합 추천 순위</td>"""

if target_lcc_block in text:
    text = text.replace(target_lcc_block, new_lcc_block)
    with open('src/components/AnchorComparisonModal.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully added ⑦ LCC without land compensation row!")
else:
    print("target_lcc_block not found!")
