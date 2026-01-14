// Simple script to generate placeholder PWA icons
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
iconSizes.forEach(size => {
  const svgContent = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.1875)}" fill="#10b981"/>
  <path d="M${Math.round(size * 0.25)} ${Math.round(size * 0.5)}L${Math.round(size * 0.4375)} ${Math.round(size * 0.6875)}L${Math.round(size * 0.75)} ${Math.round(size * 0.3125)}" stroke="white" stroke-width="${Math.max(2, Math.round(size * 0.078125))}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgContent);
  console.log(`Generated icon-${size}x${size}.svg`);
});

// Generate apple-touch-icon (180x180)
const appleTouchIcon = `<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="33.75" fill="#10b981"/>
  <path d="M45 90L78.75 123.75L135 56.25" stroke="white" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIcon);
console.log('Generated apple-touch-icon.svg');

console.log('\n✅ Placeholder icons generated!');
console.log('📝 Note: These are SVG placeholders. For production, convert to PNG using:');
console.log('   - Online tools like https://cloudconvert.com/svg-to-png');
console.log('   - Or use a tool like sharp in Node.js');
console.log('   - Or design proper icons in Figma/Sketch');

