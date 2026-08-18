import os
import base64
import io
from PIL import Image

src_dir = 'public/assets/materials'
images = {}
for fname in os.listdir(src_dir):
    if fname.endswith(('.jpg', '.png', '.jpeg')):
        key = os.path.splitext(fname)[0]
        fpath = os.path.join(src_dir, fname)
        img = Image.open(fpath)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.thumbnail((1024, 768), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=82, optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        data_uri = f'data:image/jpeg;base64,{b64}'
        images[key] = data_uri
        print(f'{key}: original={os.path.getsize(fpath)} bytes, compressed={len(buf.getvalue())} bytes, base64_len={len(data_uri)}')

ts_content = '// Auto-generated standalone embedded base64 images for temporary earth retention materials\n'
ts_content += 'export const MATERIAL_IMAGES: Record<string, string> = {\n'
for k, v in images.items():
    ts_content += f'  "{k}": "{v}",\n'
ts_content += '};\n'

os.makedirs('src/utils', exist_ok=True)
with open('src/utils/materialImages.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print('Wrote src/utils/materialImages.ts successfully!')
