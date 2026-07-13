import { useMemo, useState } from "react";
import {
  calculateCompoundInterest,
  calculateEMI,
  calculateFD,
  calculateFlatRateLoan,
  calculateLoanAffordability,
  calculatePercentage,
  calculatePercentageChange,
  calculateProfitLoss,
  calculateRD,
  calculateROI,
  calculateSimpleInterest,
  calculateTaxExclusive,
  calculateTaxInclusive,
  applyPercentageChange,
  formatINR,
  formatPercent,
} from "@/lib/finance/calculators";
import { Field, parseNum, ResultBox, ResultRow, TabBar, ToolShell } from "./shared";

type FinanceTab =
  | "emi"
  | "interest"
  | "rd-fd"
  | "roi"
  | "pnl"
  | "percentage"
  | "loan";

const TABS: Array<{ id: FinanceTab; label: string }> = [
  { id: "emi", label: "EMI / Loan" },
  { id: "interest", label: "Interest" },
  { id: "rd-fd", label: "RD & FD" },
  { id: "roi", label: "ROI" },
  { id: "pnl", label: "Profit & Loss" },
  { id: "percentage", label: "Percentage" },
  { id: "loan", label: "Affordability" },
];

export function FinanceCalculatorTool() {
  const [tab, setTab] = useState<FinanceTab>("emi");

  return (
    <ToolShell
      title="Finance Calculator"
      subtitle="EMI, simple & compound interest, RD, FD, ROI, profit/loss, percentages, and loan affordability. All calculations run in your browser — nothing is sent anywhere."
    >
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {tab === "emi" && <EmiCalculator />}
      {tab === "interest" && <InterestCalculator />}
      {tab === "rd-fd" && <RdFdCalculator />}
      {tab === "roi" && <RoiCalculator />}
      {tab === "pnl" && <PnlCalculator />}
      {tab === "percentage" && <PercentageCalculator />}
      {tab === "loan" && <AffordabilityCalculator />}
    </ToolShell>
  );
}

function EmiCalculator() {
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate] = useState("10.5");
  const [tenure, setTenure] = useState("20");
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");
  const [mode, setMode] = useState<"reducing" | "flat">("reducing");
  const [showSchedule, setShowSchedule] = useState(false);

  const reducing = useMemo(
    () => calculateEMI(parseNum(principal), parseNum(rate), parseNum(tenure) * (tenureUnit === "years" ? 12 : 1)),
    [principal, rate, tenure, tenureUnit]
  );
  const flat = useMemo(
    () => calculateFlatRateLoan(parseNum(principal), parseNum(rate), parseNum(tenure) * (tenureUnit === "years" ? 12 : 1)),
    [principal, rate, tenure, tenureUnit]
  );
  const result = mode === "flat" ? flat : reducing;
  const schedule = mode === "reducing" ? reducing.schedule : [];

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex gap-2 mb-2">
          {(["reducing", "flat"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`text-xs font-mono uppercase px-3 py-1 rounded-full border ${
                mode === m ? "border-accent bg-accent/10" : "border-border text-muted-foreground"
              }`}
            >
              {m === "reducing" ? "Reducing balance" : "Flat rate"}
            </button>
          ))}
        </div>
        <Field id="emi-p" label="Loan amount" value={principal} onChange={setPrincipal} suffix="₹" />
        <Field id="emi-r" label="Interest rate (p.a.)" value={rate} onChange={setRate} suffix="%" step="0.1" />
        <div className="grid grid-cols-[1fr_auto] items-end gap-2"><Field id="emi-t" label="Tenure" value={tenure} onChange={setTenure} suffix={tenureUnit} /><button type="button" onClick={() => { setTenureUnit(tenureUnit === "years" ? "months" : "years"); setTenure(tenureUnit === "years" ? String(parseNum(tenure) * 12) : String(parseNum(tenure) / 12)); }} className="h-[42px] rounded-lg border border-border px-3 text-xs text-muted-foreground hover:text-foreground">Use {tenureUnit === "years" ? "months" : "years"}</button></div>
      </div>
      <ResultBox title="Results">
        <ResultRow label="Monthly EMI" value={formatINR(result.emi)} highlight />
        <ResultRow label="Total payment" value={formatINR(result.totalPayment)} />
        <ResultRow label="Total interest" value={formatINR(result.totalInterest)} />
        {mode === "reducing" && schedule.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="mt-4 text-xs font-mono uppercase text-accent hover:underline"
          >
            {showSchedule ? "Hide" : "Show"} amortization schedule
          </button>
        )}
      </ResultBox>
      {showSchedule && schedule.length > 0 && (
        <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                <th className="px-4 py-2 text-left font-mono text-xs uppercase">Month</th>
                <th className="px-4 py-2 text-right font-mono text-xs uppercase">EMI</th>
                <th className="px-4 py-2 text-right font-mono text-xs uppercase">Principal</th>
                <th className="px-4 py-2 text-right font-mono text-xs uppercase">Interest</th>
                <th className="px-4 py-2 text-right font-mono text-xs uppercase">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.month} className="border-b border-border/50">
                  <td className="px-4 py-2">{row.month}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatINR(row.emi, 0)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatINR(row.principal, 0)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatINR(row.interest, 0)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatINR(row.balance, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InterestCalculator() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("5");
  const [type, setType] = useState<"simple" | "compound">("compound");
  const [frequency, setFrequency] = useState("12");

  const result = useMemo(() => {
    const p = parseNum(principal);
    const r = parseNum(rate);
    const t = parseNum(years);
    if (type === "simple") return calculateSimpleInterest(p, r, t);
    return calculateCompoundInterest(p, r, t, parseNum(frequency, 12));
  }, [principal, rate, years, type, frequency]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["simple", "compound"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`text-xs font-mono uppercase px-3 py-1 rounded-full border ${
                type === t ? "border-accent bg-accent/10" : "border-border text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Field id="int-p" label="Principal" value={principal} onChange={setPrincipal} suffix="₹" />
        <Field id="int-r" label="Rate (p.a.)" value={rate} onChange={setRate} suffix="%" />
        <Field id="int-y" label="Time" value={years} onChange={setYears} suffix="years" />
        {type === "compound" && (
          <Field
            id="int-f"
            label="Compounding per year"
            value={frequency}
            onChange={setFrequency}
            placeholder="12 = monthly, 4 = quarterly"
          />
        )}
      </div>
      <ResultBox title="Results">
        <ResultRow label="Maturity amount" value={formatINR(result.amount)} highlight />
        <ResultRow label="Interest earned" value={formatINR(result.interest)} />
      </ResultBox>
    </div>
  );
}

function RdFdCalculator() {
  const [mode, setMode] = useState<"rd" | "fd">("rd");
  const [amount, setAmount] = useState("5000");
  const [rate, setRate] = useState("6.5");
  const [months, setMonths] = useState("60");

  const result = useMemo(() => {
    const r = parseNum(rate);
    const m = parseNum(months);
    if (mode === "rd") return calculateRD(parseNum(amount), r, m);
    return calculateFD(parseNum(amount), r, m);
  }, [mode, amount, rate, months]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["rd", "fd"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`text-xs font-mono uppercase px-3 py-1 rounded-full border ${
                mode === m ? "border-accent bg-accent/10" : "border-border text-muted-foreground"
              }`}
            >
              {m === "rd" ? "Recurring deposit" : "Fixed deposit"}
            </button>
          ))}
        </div>
        <Field
          id="rd-amount"
          label={mode === "rd" ? "Monthly deposit" : "Lump sum deposit"}
          value={amount}
          onChange={setAmount}
          suffix="₹"
        />
        <Field id="rd-rate" label="Rate (p.a.)" value={rate} onChange={setRate} suffix="%" />
        <Field id="rd-months" label="Tenure" value={months} onChange={setMonths} suffix="months" />
      </div>
      <ResultBox title="Results">
        {mode === "rd" && "invested" in result && (
          <ResultRow label="Total invested" value={formatINR(result.invested)} />
        )}
        <ResultRow
          label="Maturity amount"
          value={formatINR("maturity" in result ? result.maturity : result.amount)}
          highlight
        />
        <ResultRow label="Interest earned" value={formatINR(result.interest)} />
      </ResultBox>
    </div>
  );
}

function RoiCalculator() {
  const [initial, setInitial] = useState("100000");
  const [finalVal, setFinalVal] = useState("180000");
  const [years, setYears] = useState("3");

  const result = useMemo(() => {
    return calculateROI(parseNum(initial), parseNum(finalVal), parseNum(years) || undefined);
  }, [initial, finalVal, years]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Field id="roi-i" label="Initial investment" value={initial} onChange={setInitial} suffix="₹" />
        <Field id="roi-f" label="Final value" value={finalVal} onChange={setFinalVal} suffix="₹" />
        <Field id="roi-y" label="Duration (optional, for CAGR)" value={years} onChange={setYears} suffix="years" />
      </div>
      <ResultBox title="Results">
        <ResultRow
          label={result.profit >= 0 ? "Profit" : "Loss"}
          value={formatINR(Math.abs(result.profit))}
          highlight
        />
        <ResultRow label="ROI" value={formatPercent(result.roiPercent)} />
        {result.annualized !== null && (
          <ResultRow label="CAGR (annualized)" value={formatPercent(result.annualized)} />
        )}
      </ResultBox>
    </div>
  );
}

function PnlCalculator() {
  const [cost, setCost] = useState("800");
  const [sell, setSell] = useState("1200");

  const result = useMemo(() => calculateProfitLoss(parseNum(cost), parseNum(sell)), [cost, sell]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Field id="pnl-cp" label="Cost price" value={cost} onChange={setCost} suffix="₹" />
        <Field id="pnl-sp" label="Selling price" value={sell} onChange={setSell} suffix="₹" />
      </div>
      <ResultBox title="Results">
        <ResultRow
          label={result.isProfit ? "Profit" : "Loss"}
          value={formatINR(Math.abs(result.diff))}
          highlight
        />
        <ResultRow label="On cost (markup)" value={formatPercent(result.profitPercent)} />
        <ResultRow label="Margin on sale" value={formatPercent(result.margin)} />
      </ResultBox>
    </div>
  );
}

function PercentageCalculator() {
  const [mode, setMode] = useState<"of" | "change" | "apply" | "tax-add" | "tax-incl">("of");
  const [a, setA] = useState("1000");
  const [b, setB] = useState("18");
  const [increase, setIncrease] = useState(true);

  const result = useMemo(() => {
    const va = parseNum(a);
    const vb = parseNum(b);
    if (mode === "of") return { rows: [{ label: `${vb}% of ${va}`, value: formatINR(calculatePercentage(va, vb)), highlight: true }] };
    if (mode === "change")
      return {
        rows: [{ label: "Percentage change", value: formatPercent(calculatePercentageChange(va, vb)), highlight: true }],
      };
    if (mode === "apply")
      return {
        rows: [
          {
            label: increase ? `${va} increased by ${vb}%` : `${va} decreased by ${vb}%`,
            value: formatINR(applyPercentageChange(va, vb, increase), 2),
            highlight: true,
          },
        ],
      };
    if (mode === "tax-add") {
      const r = calculateTaxExclusive(va, vb);
      return {
        rows: [
          { label: "Base amount", value: formatINR(r.base) },
          { label: `Tax (${formatPercent(vb, 0)})`, value: formatINR(r.tax) },
          { label: "Total (incl. tax)", value: formatINR(r.total), highlight: true },
        ],
      };
    }
    const r = calculateTaxInclusive(va, vb);
    return {
      rows: [
        { label: "Total (incl. tax)", value: formatINR(r.total) },
        { label: `Tax (${formatPercent(vb, 0)})`, value: formatINR(r.tax) },
        { label: "Base (excl. tax)", value: formatINR(r.base), highlight: true },
      ],
    };
  }, [mode, a, b, increase]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["of", "X% of Y"],
              ["change", "% change"],
              ["apply", "+ / −"],
              ["tax-add", "+ tax"],
              ["tax-incl", "Tax included"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`text-xs font-mono uppercase px-3 py-1 rounded-full border ${
                mode === id ? "border-accent bg-accent/10" : "border-border text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Field
          id="pct-a"
          label={
            mode === "of"
              ? "Value (Y)"
              : mode === "change"
                ? "From"
                : mode === "tax-add"
                  ? "Base amount (excl. tax)"
                  : mode === "tax-incl"
                    ? "Total (incl. tax)"
                    : "Value"
          }
          value={a}
          onChange={setA}
          suffix={mode.startsWith("tax") ? "₹" : ""}
        />
        <Field
          id="pct-b"
          label={
            mode === "of"
              ? "Percent (X)"
              : mode === "change"
                ? "To"
                : mode.startsWith("tax")
                  ? "Tax rate (GST/VAT)"
                  : "Percent"
          }
          value={b}
          onChange={setB}
          suffix={mode === "change" ? "" : "%"}
        />
        {mode === "apply" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIncrease(true)}
              className={`text-xs font-mono uppercase px-3 py-1 rounded-full border ${
                increase ? "border-accent bg-accent/10" : "border-border"
              }`}
            >
              Increase
            </button>
            <button
              type="button"
              onClick={() => setIncrease(false)}
              className={`text-xs font-mono uppercase px-3 py-1 rounded-full border ${
                !increase ? "border-accent bg-accent/10" : "border-border"
              }`}
            >
              Decrease
            </button>
          </div>
        )}
      </div>
      <ResultBox title="Result">
        {result.rows.map((row) => (
          <ResultRow
            key={row.label}
            label={row.label}
            value={row.value}
            highlight={"highlight" in row && row.highlight}
          />
        ))}
      </ResultBox>
    </div>
  );
}

function AffordabilityCalculator() {
  const [income, setIncome] = useState("80000");
  const [existingEmi, setExistingEmi] = useState("15000");
  const [rate, setRate] = useState("9");
  const [tenure, setTenure] = useState("240");
  const [ratio, setRatio] = useState("50");

  const result = useMemo(() => {
    return calculateLoanAffordability(
      parseNum(income),
      parseNum(existingEmi),
      parseNum(rate),
      parseNum(tenure),
      parseNum(ratio, 50)
    );
  }, [income, existingEmi, rate, tenure, ratio]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Field id="aff-inc" label="Monthly net income" value={income} onChange={setIncome} suffix="₹" />
        <Field id="aff-emi" label="Existing EMIs" value={existingEmi} onChange={setExistingEmi} suffix="₹" />
        <Field id="aff-rate" label="Expected interest rate" value={rate} onChange={setRate} suffix="%" />
        <Field id="aff-tenure" label="Loan tenure" value={tenure} onChange={setTenure} suffix="months" />
        <Field id="aff-ratio" label="Max EMI as % of income" value={ratio} onChange={setRatio} suffix="%" />
      </div>
      <ResultBox title="What you can afford">
        <ResultRow label="Max new EMI" value={formatINR(result.maxEmi)} highlight />
        <ResultRow label="Max loan amount" value={formatINR(result.maxLoan)} highlight />
        <p className="text-xs text-muted-foreground mt-4">
          Based on reducing-balance EMI. Banks typically cap EMIs at 40–50% of net monthly income.
        </p>
      </ResultBox>
    </div>
  );
}
