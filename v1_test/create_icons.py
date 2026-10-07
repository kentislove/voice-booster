import zlib
import struct
import math

def create_png(width, height, draw_func):
    # RGBA 影像緩衝區
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # 每行的濾波器型別 (0 = None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    # 壓縮影像數據
    compressed = zlib.compress(bytes(raw_data))
    
    # PNG 檔案頭
    png_bytes = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR 區塊
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png_bytes.extend(struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc))
    
    # IDAT 區塊
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png_bytes.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc))
    
    # IEND 區塊
    iend_crc = zlib.crc32(b'IEND')
    png_bytes.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc))
    
    return bytes(png_bytes)

def icon_pixel(x, y, w, h):
    # 計算正規化座標 (-1 到 1)
    nx = (x / w) * 2 - 1
    ny = (y / h) * 2 - 1
    dist = math.sqrt(nx * nx + ny * ny)

    # 圓角方塊背景
    if abs(nx) > 0.85 or abs(ny) > 0.85:
        return (0, 0, 0, 0) # 透明邊緣

    # 漸層藍底色彩 (從湛藍到亮青)
    t = (y / h)
    r = int(2 + t * 50)
    g = int(132 + t * 50)
    b = int(199 + t * 40)

    # 簡易喇叭與音波造型光暈
    if dist < 0.35:
        # 中心亮白色核心
        return (255, 255, 255, 255)
    elif 0.45 < dist < 0.65 and nx > 0:
        # 右側聲波擴散弧線
        return (224, 242, 254, 240)
    
    return (r, g, b, 255)

for size in [16, 48, 128]:
    png_content = create_png(size, size, icon_pixel)
    with open(f"icon{size}.png", "wb") as f:
        f.write(png_content)
    print(f"成功生成 icon{size}.png")
