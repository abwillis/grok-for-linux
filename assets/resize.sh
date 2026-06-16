for s in 1024 512 256 128 96 64 48 32 16; do
  magick grok-for-linux.png \
    -resize "${s}x${s}" \
    -background none \
    -gravity center \
    -extent "${s}x${s}" \
    "${s}x${s}.png"
done

for s in 1024 512 256 128 96 64 48 32 16; do
  magick grok-for-linux.png \
    -filter Lanczos \
    -resize "${s}x${s}" \
    -background none \
    -gravity center \
    -extent "${s}x${s}" \
    "${s}x${s}.png"
done

magick \
  1024x1024.png \
  512x512.png \
  256x256.png \
  128x128.png \
  96x96.png \
  64x64.png \
  48x48.png \
  32x32.png \
  16x16.png \
  grok-for-linux.ico

magick \
  512x512.png \
  256x256.png \
  128x128.png \
  96x96.png \
  64x64.png \
  48x48.png \
  32x32.png \
  16x16.png \
  grok-for-linux.ico



w=$(magick identify -format "%w" grok.png)
h=$(magick identify -format "%h" grok.png)
x=$((w-1))
y=$((h-1))

magick grok-for-linux.png \
  -alpha set \
  -fuzz 3% \
  -fill "rgba(255,255,255,0)" \
  -draw "color 0,0 floodfill color ${x},0 floodfill color 0,${y} floodfill color ${x},${y} floodfill" \
  PNG32:grok-transparent.png



w=$(magick identify -format "%w" grok.png)
h=$(magick identify -format "%h" grok.png)
x=$((w-1))
y=$((h-1))

magick grok.png \
  -alpha set \
  -fuzz 3% \
  -fill "rgba(255,255,255,0)" \
  -draw "color 0,0 floodfill color ${x},0 floodfill color 0,${y} floodfill color ${x},${y} floodfill" \
  PNG32:grok-transparent.png

