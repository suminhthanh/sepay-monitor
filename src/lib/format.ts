/** Format a number as Vietnamese currency string for display */
export function formatCurrencyVi(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format amount for TTS speech — converts to natural Vietnamese phrasing */
export function formatTtsAmount(amount: number): string {
  if (amount <= 0) return "0 đồng";

  const billion = Math.floor(amount / 1_000_000_000);
  const million = Math.floor((amount % 1_000_000_000) / 1_000_000);
  const thousand = Math.floor((amount % 1_000_000) / 1_000);
  const remainder = amount % 1_000;

  const parts: string[] = [];
  if (billion > 0) parts.push(`${billion} tỷ`);
  if (million > 0) parts.push(`${million} triệu`);
  if (thousand > 0) parts.push(`${thousand} nghìn`);
  if (remainder > 0) parts.push(`${remainder}`);

  return parts.join(" ") + " đồng";
}

/** Build TTS announcement text for a transaction */
export function buildTtsText(amountIn: number, amountOut: number): string {
  if (amountIn > 0) {
    const amountText = formatTtsAmount(amountIn);
    return `SePay báo có ${amountText}`;
  } else {
    const amountText = formatTtsAmount(amountOut);
    return `Đã chuyển ${amountText}`;
  }
}

/** Format date string for display */
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("vi-VN");
  } catch {
    return dateStr;
  }
}
