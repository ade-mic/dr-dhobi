# PNG Icon Generation Required

For production, convert the SVG icon to PNG formats using one of these methods:

## Method 1: Using sharp-cli (Recommended)
```bash
npm install -g sharp-cli
sharp -i public/icons/icon-192.svg -o public/icons/icon-72.png resize 72 72
sharp -i public/icons/icon-192.svg -o public/icons/icon-96.png resize 96 96
sharp -i public/icons/icon-192.svg -o public/icons/icon-128.png resize 128 128
sharp -i public/icons/icon-192.svg -o public/icons/icon-144.png resize 144 144
sharp -i public/icons/icon-192.svg -o public/icons/icon-152.png resize 152 152
sharp -i public/icons/icon-192.svg -o public/icons/icon-192.png resize 192 192
sharp -i public/icons/icon-192.svg -o public/icons/icon-384.png resize 384 384
sharp -i public/icons/icon-192.svg -o public/icons/icon-512.png resize 512 512
```

## Method 2: Online converter
Visit https://realfavicongenerator.net/ or https://favicon.io/
Upload icon-192.svg and generate all required sizes.

## Method 3: ImageMagick
```bash
convert public/icons/icon-192.svg -resize 72x72 public/icons/icon-72.png
# Repeat for all sizes: 96, 128, 144, 152, 192, 384, 512
```
