import crypto from 'crypto';

export function generateCode(length: number = 6): string {
  return Math.random().toString().slice(2, 2 + length);
}

export function generateCaptcha(): { text: string; svg: string } {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let text = '';
  for (let i = 0; i < 4; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const colors = ['#c41e3a', '#8b0000', '#2d5016', '#1a365d'];
  const svg = `
    <svg width="120" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" fill="#f5f5f5" />
      ${text.split('').map((char, i) => {
        const angle = (Math.random() - 0.5) * 40;
        const x = 15 + i * 25;
        const y = 28 + (Math.random() - 0.5) * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `<text x="${x}" y="${y}" font-family="Arial" font-size="24" font-weight="bold" fill="${color}" transform="rotate(${angle} ${x} ${y})">${char}</text>`;
      }).join('')}
      ${Array.from({ length: 3 }).map(() => {
        const x1 = Math.random() * 120;
        const y1 = Math.random() * 40;
        const x2 = Math.random() * 120;
        const y2 = Math.random() * 40;
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1" opacity="0.5" />`;
      }).join('')}
    </svg>
  `;

  return { text, svg };
}

export function hashData(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}
