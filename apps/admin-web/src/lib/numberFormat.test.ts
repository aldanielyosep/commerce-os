import { describe, expect, it } from "vitest";
import { formatDecimal, formatInteger, formatNumber, parseFormattedNumber } from "./numberFormat";

describe("numberFormat", () => {
  it("formats integers with dot thousands separators", () => {
    expect(formatInteger(10000)).toBe("10.000");
    expect(formatNumber(1000000)).toBe("1.000.000");
  });

  it("formats decimals with comma decimal separators", () => {
    expect(formatDecimal(10500.5)).toBe("10.500,50");
    expect(formatNumber(10500.5, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe("10.500,50");
  });

  it("parses formatted Indonesian numbers", () => {
    expect(parseFormattedNumber("10.500,50")).toBe(10500.5);
    expect(parseFormattedNumber("10.000")).toBe(10000);
  });

  it("parses plain decimal values defensively", () => {
    expect(parseFormattedNumber("10500.50")).toBe(10500.5);
    expect(parseFormattedNumber("10500,50")).toBe(10500.5);
  });

  it("falls back to zero for empty or invalid values", () => {
    expect(parseFormattedNumber("")).toBe(0);
    expect(parseFormattedNumber("not-a-number")).toBe(0);
    expect(formatInteger("not-a-number")).toBe("0");
  });
});
