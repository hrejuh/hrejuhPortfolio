export function formatINR(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(decimals)}%`;
}

export type EMIResult = {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  schedule: Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
};

export function calculateEMI(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number
): EMIResult {
  const r = annualRatePercent / 12 / 100;
  let emi: number;

  if (tenureMonths <= 0 || principal <= 0) {
    return { emi: 0, totalPayment: 0, totalInterest: 0, schedule: [] };
  }

  if (r === 0) {
    emi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + r, tenureMonths);
    emi = (principal * r * factor) / (factor - 1);
  }

  const schedule: EMIResult["schedule"] = [];
  let balance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = r === 0 ? 0 : balance * r;
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);
    schedule.push({
      month,
      emi,
      principal: principalPart,
      interest,
      balance,
    });
  }

  const totalPayment = emi * tenureMonths;
  return {
    emi,
    totalPayment,
    totalInterest: totalPayment - principal,
    schedule,
  };
}

export function calculateSimpleInterest(
  principal: number,
  ratePercent: number,
  timeYears: number
) {
  const interest = (principal * ratePercent * timeYears) / 100;
  return { interest, amount: principal + interest };
}

export function calculateCompoundInterest(
  principal: number,
  ratePercent: number,
  timeYears: number,
  compoundingPerYear = 12
) {
  const rate = ratePercent / 100;
  const amount =
    principal * Math.pow(1 + rate / compoundingPerYear, compoundingPerYear * timeYears);
  return { amount, interest: amount - principal };
}

/** Indian RD — each monthly deposit compounds until maturity */
export function calculateRD(
  monthlyDeposit: number,
  annualRatePercent: number,
  tenureMonths: number
) {
  const r = annualRatePercent / 100 / 12;
  let maturity = 0;

  for (let month = 0; month < tenureMonths; month++) {
    const monthsRemaining = tenureMonths - month;
    maturity += monthlyDeposit * Math.pow(1 + r, monthsRemaining);
  }

  const invested = monthlyDeposit * tenureMonths;
  return { maturity, invested, interest: maturity - invested };
}

export function calculateFD(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
  compoundingPerYear = 4
) {
  const years = tenureMonths / 12;
  const rate = annualRatePercent / 100;
  const amount = principal * Math.pow(1 + rate / compoundingPerYear, compoundingPerYear * years);
  return { amount, interest: amount - principal };
}

export function calculateROI(initial: number, finalValue: number, years?: number) {
  const profit = finalValue - initial;
  const roiPercent = initial === 0 ? 0 : (profit / initial) * 100;
  const annualized =
    years && years > 0 && initial > 0
      ? (Math.pow(finalValue / initial, 1 / years) - 1) * 100
      : null;
  return { profit, roiPercent, annualized };
}

export function calculateProfitLoss(costPrice: number, sellingPrice: number) {
  const diff = sellingPrice - costPrice;
  const profitPercent = costPrice === 0 ? 0 : (diff / costPrice) * 100;
  const margin = sellingPrice === 0 ? 0 : (diff / sellingPrice) * 100;
  return {
    diff,
    profitPercent,
    margin,
    isProfit: diff >= 0,
  };
}

export function calculatePercentage(value: number, percent: number) {
  return (value * percent) / 100;
}

export function calculatePercentageChange(from: number, to: number) {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

export function applyPercentageChange(value: number, percent: number, increase: boolean) {
  const factor = 1 + (increase ? percent : -percent) / 100;
  return value * factor;
}

export type TaxResult = {
  base: number;
  tax: number;
  total: number;
};

/** Base amount + tax% (e.g. ₹1000 + 18% GST). */
export function calculateTaxExclusive(base: number, taxPercent: number): TaxResult {
  if (base <= 0 || taxPercent < 0) return { base: 0, tax: 0, total: 0 };
  const tax = (base * taxPercent) / 100;
  return { base, tax, total: base + tax };
}

/** Total already includes tax% (e.g. ₹1180 incl. 18% GST → base ₹1000, tax ₹180). */
export function calculateTaxInclusive(total: number, taxPercent: number): TaxResult {
  if (total <= 0 || taxPercent < 0) return { base: 0, tax: 0, total: 0 };
  const base = total / (1 + taxPercent / 100);
  const tax = total - base;
  return { base, tax, total };
}

export function calculateLoanAffordability(
  monthlyIncome: number,
  existingEmi: number,
  annualRatePercent: number,
  tenureMonths: number,
  maxEmiRatioPercent = 50
) {
  const maxEmi = Math.max(0, (monthlyIncome * maxEmiRatioPercent) / 100 - existingEmi);
  const r = annualRatePercent / 12 / 100;

  if (maxEmi <= 0 || tenureMonths <= 0) {
    return { maxEmi: 0, maxLoan: 0 };
  }

  if (r === 0) {
    return { maxEmi, maxLoan: maxEmi * tenureMonths };
  }

  const factor = Math.pow(1 + r, tenureMonths);
  const maxLoan = (maxEmi * (factor - 1)) / (r * factor);
  return { maxEmi, maxLoan };
}

export function calculateFlatRateLoan(
  principal: number,
  flatRatePercent: number,
  tenureMonths: number
) {
  const totalInterest = (principal * flatRatePercent * (tenureMonths / 12)) / 100;
  const totalPayment = principal + totalInterest;
  const emi = tenureMonths > 0 ? totalPayment / tenureMonths : 0;
  return { emi, totalPayment, totalInterest };
}
