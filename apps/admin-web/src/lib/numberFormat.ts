type FormatNumberOptions = {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

function toFiniteNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;

  const parsed = parseFormattedNumber(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumber(value: string | number | null | undefined, options: FormatNumberOptions = {}) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: options.maximumFractionDigits ?? 20,
    minimumFractionDigits: options.minimumFractionDigits ?? 0
  }).format(toFiniteNumber(value));
}

export function formatInteger(value: string | number | null | undefined) {
  return formatNumber(Math.trunc(toFiniteNumber(value)), { maximumFractionDigits: 0 });
}

export function formatDecimal(value: string | number | null | undefined) {
  const numericValue = toFiniteNumber(value);
  return formatNumber(numericValue, {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 2
  });
}

export function parseFormattedNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value?.trim()) return 0;

  const normalized = value.trim().replace(/\s/g, "");
  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma) {
    const parsed = Number(normalized.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (hasDot) {
    const parts = normalized.split(".");
    const lastPart = parts[parts.length - 1] ?? "";
    const dotIsDecimal = parts.length === 2 && lastPart.length !== 3;
    const parsed = Number(dotIsDecimal ? normalized : parts.join(""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
