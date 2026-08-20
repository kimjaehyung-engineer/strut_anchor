import os
import glob
import argparse

parser = argparse.ArgumentParser(description='Bundle Vite dist assets into one standalone HTML file.')
parser.add_argument('--output', default='strut_anchor_app_standalone.html')
parser.add_argument('--title', default='토공 가시설 지보체계 3대 대안(버팀보 vs 어스앵커 vs 복합공법) 비교·구조설계·시뮬레이션 시스템')
args = parser.parse_args()

dist_dir = 'dist'
assets_dir = os.path.join(dist_dir, 'assets')

js_files = glob.glob(os.path.join(assets_dir, '*.js'))
css_files = glob.glob(os.path.join(assets_dir, '*.css'))

if not js_files or not css_files:
    print("JS or CSS file not found in dist/assets")
    exit(1)

js_path = js_files[0]
css_path = css_files[0]

with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

html_template = f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{args.title}</title>
  <style>
{css_content}
  </style>
</head>
<body class="bg-slate-900 text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
  <div id="root"></div>
  <script>
{js_content}
  </script>
</body>
</html>
"""

# Save to root folder as standalone HTML
output_file = args.output
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html_template)

print(f"Successfully generated standalone HTML: {output_file} ({len(html_template)} bytes)")
