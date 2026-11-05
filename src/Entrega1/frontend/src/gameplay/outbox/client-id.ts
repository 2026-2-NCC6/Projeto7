const HEX = '0123456789abcdef';

export function clientSessionId(random: () => number = Math.random): string {
  const digits = Array.from({ length: 32 }, () => HEX[Math.floor(random() * 16)]);
  digits[12] = '4';
  digits[16] = HEX[(Math.floor(random() * 16) & 0x3) | 0x8];
  const id = digits.join('');
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}
