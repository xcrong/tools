/**
 * Generate OG images for the tools website
 * Uses canvas to create Cyber Terminal style share images
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors from the design system
const COLORS = {
  bgPrimary: '#0a0a0f',
  bgSecondary: '#12121a',
  bgCard: '#13131a',
  neonCyan: '#00f5ff',
  neonPink: '#ff00a0',
  neonGreen: '#00ff9d',
  neonYellow: '#ffee00',
  neonPurple: '#b829dd',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0b0',
  border: '#1f1f2e'
};

// Canvas dimensions (Twitter recommended: 1200x630)
const WIDTH = 1200;
const HEIGHT = 630;

function createBaseCanvas() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, COLORS.bgPrimary);
  gradient.addColorStop(1, COLORS.bgSecondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  // Grid pattern
  ctx.strokeStyle = 'rgba(0, 245, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  
  return { canvas, ctx };
}

function drawTerminalWindow(ctx, x, y, width, height, title, content, accentColor) {
  // Window shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  
  // Window background
  ctx.fillStyle = COLORS.bgCard;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 12);
  ctx.fill();
  
  // Border with accent glow
  ctx.shadowColor = accentColor;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Header
  ctx.fillStyle = COLORS.bgSecondary;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 40, [12, 12, 0, 0]);
  ctx.fill();
  
  // Traffic light dots
  const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
  dotColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 20 + i * 18, y + 20, 6, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Title
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(title, x + width - 20, y + 25);
  
  // Content
  ctx.fillStyle = COLORS.textPrimary;
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  
  const lines = content.split('\n');
  const lineHeight = 28;
  let contentY = y + 70;
  
  lines.forEach((line) => {
    ctx.fillStyle = COLORS.textSecondary;
    ctx.fillText(line, x + 30, contentY);
    contentY += lineHeight;
  });
  
  // Accent glow at top
  const glowGradient = ctx.createLinearGradient(x + width / 2, y, x + width / 2, y + 100);
  glowGradient.addColorStop(0, accentColor + '20');
  glowGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(x, y, width, 100);
}

function drawGlowingText(ctx, text, x, y, color, fontSize = 48) {
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

function drawMainTitle(ctx, title, subtitle) {
  const centerX = WIDTH / 2;
  
  // Main title with glow
  drawGlowingText(ctx, title, centerX, 140, COLORS.neonCyan, 56);
  
  // Subtitle
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = '20px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(subtitle, centerX, 180);
}

function drawFooter(ctx) {
  const footerY = HEIGHT - 60;
  
  // URL
  ctx.fillStyle = COLORS.neonCyan;
  ctx.font = 'bold 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('tools.xcrong.me', WIDTH / 2, footerY);
  
  // Status indicator
  ctx.fillStyle = COLORS.neonGreen;
  ctx.beginPath();
  ctx.arc(WIDTH / 2 - 100, footerY - 6, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('● ONLINE', WIDTH / 2 - 85, footerY);
  
  // Tool count
  ctx.fillStyle = COLORS.textSecondary;
  ctx.fillText('4 TOOLS ACTIVE', WIDTH / 2 + 100, footerY);
}

function generateHomeImage() {
  const { canvas, ctx } = createBaseCanvas();
  
  drawMainTitle(ctx, 'Developer Tools', 'MongoDB ObjectId · Timestamp · Video Downloader · Terminal SVG');
  
  // Draw mini terminal windows showcasing tools
  drawTerminalWindow(
    ctx,
    80,
    240,
    500,
    280,
    'mongo-objectid',
    '$ ObjectId("507f1f77bcf86cd799439011")\n→ 2012-10-08T21:47:12.000Z\n✓ Valid ObjectId',
    COLORS.neonCyan
  );
  
  drawTerminalWindow(
    ctx,
    620,
    240,
    500,
    280,
    'timestamp',
    '$ 1697500800\n→ 2023-10-17 00:00:00 UTC\n✓ Converted',
    COLORS.neonGreen
  );
  
  drawTerminalWindow(
    ctx,
    350,
    520,
    500,
    100,
    'term2svg',
    '$ term2svg --theme catppuccin\n✓ SVG Generated',
    COLORS.neonPurple
  );
  
  drawFooter(ctx);
  
  return canvas;
}

function generateToolImage(toolName, toolTitle, accentColor) {
  const { canvas, ctx } = createBaseCanvas();
  
  // Tool-specific accent
  const colors = {
    mongo: COLORS.neonCyan,
    timestamp: COLORS.neonGreen,
    doubao: COLORS.neonPink,
    term2svg: COLORS.neonPurple
  };
  
  const color = colors[toolName] || accentColor;
  
  drawMainTitle(ctx, toolTitle, 'tools.xcrong.me');
  
  // Large terminal window
  const examples = {
    mongo: '$ ObjectId("507f1f77bcf86cd799439011")\n→ Timestamp: 1351518432\n→ Date: 2012-10-29T01:47:12.000Z',
    timestamp: '$ 1697500800\n→ ISO: 2023-10-17T00:00:00.000Z\n→ Local: 2023/10/17 08:00:00',
    doubao: '$ https://v.douyin.com/...\n→ Author: @creator\n→ Resolution: 1080p\n→ Download Ready',
    term2svg: '$ npm install\n$ npm run build\n✓ Build complete in 1.2s'
  };
  
  drawTerminalWindow(
    ctx,
    200,
    240,
    800,
    320,
    toolName,
    examples[toolName] || 'Ready',
    color
  );
  
  drawFooter(ctx);
  
  return canvas;
}

// Main execution
function main() {
  const outputDir = path.join(__dirname, '../static');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('Generating OG images...');
  
  // Home page
  const homeCanvas = generateHomeImage();
  const homeBuffer = homeCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, 'og-image.png'), homeBuffer);
  console.log('✓ Generated og-image.png');
  
  // Tool pages
  const tools = [
    { name: 'mongo', title: 'MongoDB ObjectId', file: 'og-image-mongo.png' },
    { name: 'timestamp', title: 'Timestamp Converter', file: 'og-image-timestamp.png' },
    { name: 'doubao', title: 'Doubao Video', file: 'og-image-doubao.png' },
    { name: 'term2svg', title: 'term2svg', file: 'og-image-term2svg.png' }
  ];
  
  tools.forEach(tool => {
    const canvas = generateToolImage(tool.name, tool.title);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outputDir, tool.file), buffer);
    console.log(`✓ Generated ${tool.file}`);
  });
  
  console.log('\nAll OG images generated successfully!');
}

main();
