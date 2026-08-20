import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, 'dist');
const assetsDir = path.join(distDir, 'assets');

const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));
const jsFile = files.find(f => f.endsWith('.js'));

if (!jsFile) {
  console.error('JS file not found in dist/assets');
  process.exit(1);
}

let cssContent = '';
if (cssFile) {
  cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
} else {
  // Extract CSS from dist/index.html style tag if inlined
  const distIndexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  const styleMatch = distIndexHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    cssContent = styleMatch[1];
  }
}

const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');

const singleHtml = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>[4대안 구조안전·경제성 최적설계 재검토] 가시설 벽체 지지공법</title>
    <style>
${cssContent}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
${jsContent}
    </script>
  </body>
</html>`;

const targets = [
  path.resolve(__dirname, '부회장님_보고용_가시설_검토.html'),
  path.resolve(__dirname, 'public/부회장님_보고용_가시설_검토.html'),
  path.resolve(__dirname, 'dist/부회장님_보고용_가시설_검토.html'),
  path.resolve(__dirname, 'index.html'),
  path.resolve(__dirname, '가시설_벽체_지지공법_2안_최적설계_재검토.html'),
  path.resolve(__dirname, 'public/가시설_벽체_지지공법_2안_최적설계_재검토.html'),
  path.resolve(__dirname, 'dist/가시설_벽체_지지공법_2안_최적설계_재검토.html'),
  path.resolve(__dirname, '가시설_벽체_지지공법_적용V1.html'),
  path.resolve(__dirname, 'public/가시설_벽체_지지공법_적용V1.html'),
  path.resolve(__dirname, 'dist/가시설_벽체_지지공법_적용V1.html'),
  path.resolve(__dirname, '가시설_벽체_지지공법_적용V2.html'),
  path.resolve(__dirname, 'public/가시설_벽체_지지공법_적용V2.html'),
  path.resolve(__dirname, 'dist/가시설_벽체_지지공법_적용V2.html'),
];

console.log('Successfully bundled single HTML into:');
targets.forEach((target, idx) => {
  try {
    fs.writeFileSync(target, singleHtml, 'utf-8');
    console.log(`${idx + 1}. ${target}`);
  } catch (err) {
    console.warn(`Warning: Could not write ${target} (${err.message}).`);
  }
});

