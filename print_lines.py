with open('src/components/AnchorComparisonModal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(4860, 4890):
    print(f"{i+1}: {lines[i].rstrip()}")
