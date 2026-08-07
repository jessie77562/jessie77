const defaults = {
  c: 1.5,
  n: 85,
  q: 60,
  monthlyPrice: 3.99,
  yearlyPrice: 12.99,
  cpi: 0.24,
  mFirst: 35,
  mSecond: 50,
  mThird: 65,
  mLater: 70,
  yFirst: 25,
  ySecond: 30,
  yThird: 40,
  yLater: 40
};

const ids = Object.keys(defaults);
const pct = (value) => Math.min(100, Math.max(0, value)) / 100;
const number = (id) => Number(document.getElementById(id).value) || 0;

function rateForRenewal(index, curve) {
  if (index === 1) return pct(curve.first);
  if (index === 2) return pct(curve.second);
  if (index === 3) return pct(curve.third);
  return pct(curve.later);
}

function lifetimeFactor(curve) {
  const first = pct(curve.first);
  const second = pct(curve.second);
  const third = pct(curve.third);
  const later = pct(curve.later);
  const tail = first * second * third;
  if (later === 1 && tail > 0) return Infinity;
  return 1 + first + first * second + tail / (1 - later || 1);
}

function getValues() {
  return {
    c: number("c"),
    n: number("n"),
    q: number("q"),
    monthlyPrice: number("monthlyPrice"),
    yearlyPrice: number("yearlyPrice"),
    cpi: number("cpi"),
    monthly: {
      first: number("mFirst"),
      second: number("mSecond"),
      third: number("mThird"),
      later: number("mLater")
    },
    yearly: {
      first: number("yFirst"),
      second: number("ySecond"),
      third: number("yThird"),
      later: number("yLater")
    }
  };
}

function calculate(values) {
  const conversion = pct(values.c);
  const netRate = pct(values.n);
  const monthlyShare = pct(values.q);
  const yearlyShare = 1 - monthlyShare;
  const checkpointMonths = new Set([1, 3, 6, 12, 24, 36, 60]);
  const checkpoints = new Map();

  let monthlyProbability = 1;
  let monthlyPayments = 0;
  let yearlyProbability = 1;
  let yearlyPayments = 0;
  let yearlyPaymentIndex = 0;
  let paybackMonth = values.cpi <= 0 ? 0 : null;

  for (let month = 1; month <= 12000; month += 1) {
    if (month > 1) monthlyProbability *= rateForRenewal(month - 1, values.monthly);
    monthlyPayments += monthlyProbability;

    if ((month - 1) % 12 === 0) {
      yearlyPaymentIndex += 1;
      if (yearlyPaymentIndex > 1) {
        yearlyProbability *= rateForRenewal(yearlyPaymentIndex - 1, values.yearly);
      }
      yearlyPayments += yearlyProbability;
    }

    const gross =
      monthlyShare * values.monthlyPrice * monthlyPayments +
      yearlyShare * values.yearlyPrice * yearlyPayments;
    const revenue = conversion * netRate * gross;
    if (checkpointMonths.has(month)) checkpoints.set(month, revenue);
    if (paybackMonth === null && revenue >= values.cpi) paybackMonth = month;
  }

  const monthlyLimit = monthlyShare === 0
    ? 0
    : monthlyShare * values.monthlyPrice * lifetimeFactor(values.monthly);
  const yearlyLimit = yearlyShare === 0
    ? 0
    : yearlyShare * values.yearlyPrice * lifetimeFactor(values.yearly);
  const lifetimeRevenue = conversion * netRate * (monthlyLimit + yearlyLimit);

  return {
    paybackMonth,
    lifetimeRevenue,
    recoveryRate: values.cpi > 0 ? lifetimeRevenue / values.cpi : Infinity,
    revenue24: checkpoints.get(24) || 0,
    checkpoints
  };
}

function money(value) {
  if (!Number.isFinite(value)) return "∞";
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2
  }).format(value);
}

function percent(value) {
  if (!Number.isFinite(value)) return "∞";
  return `${(value * 100).toFixed(value < 1 ? 1 : 0)}%`;
}

function period(month) {
  if (month === null) return "无法回本";
  if (month === 0) return "立即回本";
  if (month <= 12) return `第 ${month} 个月`;
  const years = Math.floor((month - 1) / 12);
  const months = month - years * 12;
  return months === 12 ? `${years + 1} 年` : `${years} 年 ${months} 个月`;
}

function render() {
  const values = getValues();
  const result = calculate(values);
  const hasPayback = result.paybackMonth !== null;
  const limitBelowCost = Number.isFinite(result.lifetimeRevenue) && result.lifetimeRevenue < values.cpi;
  const yearlyShare = Math.max(0, 100 - values.q);

  document.getElementById("yearlyShareHint").textContent = `年订阅占比自动计算为 ${yearlyShare.toFixed(0)}%`;
  document.getElementById("monthlyShareLabel").textContent = `${values.q.toFixed(0)}% 付费用户`;
  document.getElementById("yearlyShareLabel").textContent = `${yearlyShare.toFixed(0)}% 付费用户`;
  document.getElementById("paybackValue").textContent = period(result.paybackMonth);
  document.getElementById("resultPanel").classList.toggle("is-positive", hasPayback);
  document.getElementById("resultNote").textContent = hasPayback
    ? `第 ${result.paybackMonth} 个月累计净收入首次覆盖 ${money(values.cpi)}。`
    : limitBelowCost
      ? `最终收入上限低于 ${money(values.cpi)}，延长生命周期也无法回本。`
      : "预计回本时间超过 1,000 年，请提高转化或调整单位经济模型。";

  document.getElementById("revenue24").textContent = money(result.revenue24);
  document.getElementById("lifetimeRevenue").textContent = money(result.lifetimeRevenue);
  document.getElementById("recoveryRate").textContent = percent(result.recoveryRate);
  document.getElementById("recoveryGap").textContent = money(Math.max(0, values.cpi - result.lifetimeRevenue));

  document.getElementById("timeline").innerHTML = [1, 3, 6, 12, 24, 36, 60]
    .map((month) => {
      const revenue = result.checkpoints.get(month) || 0;
      const progress = values.cpi > 0 ? Math.min(100, (revenue / values.cpi) * 100) : 100;
      return `
        <div class="timeline-row">
          <span>${month}月</span>
          <div class="track" aria-hidden="true"><span style="width:${progress}%"></span></div>
          <strong>${money(revenue)}</strong>
        </div>`;
    })
    .join("");
}

function reset() {
  ids.forEach((id) => {
    document.getElementById(id).value = defaults[id];
  });
  render();
}

document.querySelectorAll("input").forEach((input) => input.addEventListener("input", render));
document.getElementById("resetButton").addEventListener("click", reset);
reset();
