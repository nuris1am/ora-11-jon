/**
 * Financial Calculation Engine for Ora 11 Jon Association
 * Rules:
 * - 16 Members, 26 Total Shares
 * - 1,000 BDT per share per month (Base monthly income: 26,000 BDT)
 * - Due date: 10th of every month
 * - Late penalty:
 *   - Month 1: 50 BDT / share
 *   - Month 2: 50 BDT / share
 *   - Month 3: 50 BDT / share (Account Temporarily Closed / Frozen)
 *   - Reopening Charge: 50 BDT / share
 *   - Month 4+: 100 BDT / share / month until account is reopened & paid
 */

export const MONTHLY_RATE_PER_SHARE = 1000;
export const TOTAL_SHARES = 26;
export const TOTAL_MEMBERS = 16;
export const BASE_MONTHLY_TARGET = TOTAL_SHARES * MONTHLY_RATE_PER_SHARE; // 26,000 BDT

/**
 * Calculate penalty and account status based on consecutive unpaid months and payment date
 */
export function calculatePenaltyAndStatus({ shareCount, paymentDate, month, year, consecutiveUnpaidMonths = 0, isAlreadyFrozen = false }) {
  const shares = Number(shareCount) || 1;
  const isPaid = Boolean(paymentDate);

  let penaltyPerShare = 0;
  let isAccountFrozen = isAlreadyFrozen;
  let penaltyApplied = false;

  // Determine if late payment (after 10th of the month) or currently unpaid
  let isLate = false;
  if (paymentDate) {
    const day = new Date(paymentDate).getDate();
    if (day > 10) {
      isLate = true;
    }
  } else {
    // Unpaid
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth) || (year === currentYear && month === currentMonth && currentDay > 10)) {
      isLate = true;
    }
  }

  if (isLate || consecutiveUnpaidMonths > 0) {
    penaltyApplied = true;
    const monthsUnpaid = Math.max(1, consecutiveUnpaidMonths || 1);

    if (monthsUnpaid === 1) {
      penaltyPerShare = 50;
    } else if (monthsUnpaid === 2) {
      penaltyPerShare = 50;
    } else if (monthsUnpaid === 3) {
      penaltyPerShare = 50;
      isAccountFrozen = true;
    } else {
      // 4th month onwards
      penaltyPerShare = 100;
      isAccountFrozen = true;
    }
  }

  const totalPenalty = penaltyPerShare * shares;
  const reopeningFee = isAccountFrozen ? 50 * shares : 0;
  const monthlyPayable = shares * MONTHLY_RATE_PER_SHARE;

  return {
    monthlyPayable,
    isLate,
    penaltyApplied,
    penaltyPerShare,
    penaltyAmount: totalPenalty,
    isAccountFrozen,
    reopeningFee,
    totalDueWithPenalty: monthlyPayable + totalPenalty + reopeningFee
  };
}

/**
 * Compute Dashboard Metrics (Monthly, Current Year, Lifetime)
 */
export function computeDashboardSummary(members = [], payments = [], investments = [], profitLoss = []) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Total Shares count from actual members list
  const totalActiveShares = members.reduce((sum, m) => sum + Number(m.share || 1), 0);
  const totalMonthlyTarget = totalActiveShares * MONTHLY_RATE_PER_SHARE;

  // --- 1. Monthly Summary (Current Month) ---
  const currentMonthPayments = payments.filter(p => p.year === currentYear && p.month === currentMonth);
  const monthlyCollectedAmount = currentMonthPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);
  const monthlyDueAmount = Math.max(0, totalMonthlyTarget - monthlyCollectedAmount);

  const monthlyPenaltyCollected = currentMonthPayments.filter(p => p.status === 'PAID' && p.penaltyApplied).reduce((sum, p) => sum + Number(p.penaltyAmount || 0), 0);
  const monthlyPenaltyDue = currentMonthPayments.filter(p => p.status === 'UNPAID' && p.penaltyApplied).reduce((sum, p) => sum + Number(p.penaltyAmount || 0), 0);

  // --- 2. Current Year Summary ---
  const yearPayments = payments.filter(p => p.year === currentYear);
  const yearTargetAmount = totalMonthlyTarget * currentMonth; // Target up to current month of the year

  const currentYearCollectedAmount = yearPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);
  const currentYearDueAmount = Math.max(0, yearTargetAmount - currentYearCollectedAmount);

  const currentYearPenaltyCollected = yearPayments.filter(p => p.status === 'PAID' && p.penaltyApplied).reduce((sum, p) => sum + Number(p.penaltyAmount || 0), 0);
  const currentYearPenaltyDue = yearPayments.filter(p => p.status === 'UNPAID' && p.penaltyApplied).reduce((sum, p) => sum + Number(p.penaltyAmount || 0), 0);

  const yearInvestments = investments.filter(i => i.year === currentYear);
  const currentYearInvestedAmount = yearInvestments.reduce((sum, i) => sum + Number(i.investedAmount || 0), 0);
  const currentYearUninvestedAmount = yearInvestments.reduce((sum, i) => sum + Number(i.uninvestedAmount || 0), 0);

  const yearPL = profitLoss.filter(pl => pl.year === currentYear);
  const currentYearProfitAmount = yearPL.filter(pl => pl.type === 'PROFIT').reduce((sum, pl) => sum + Number(pl.amount || 0), 0);
  const currentYearLossAmount = yearPL.filter(pl => pl.type === 'LOSS').reduce((sum, pl) => sum + Number(pl.amount || 0), 0);

  // --- 3. Lifetime (All Years) Summary ---
  const lifetimeCollectedAmount = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);
  const lifetimePenaltyCollected = payments.filter(p => p.status === 'PAID' && p.penaltyApplied).reduce((sum, p) => sum + Number(p.penaltyAmount || 0), 0);
  const lifetimePenaltyDue = payments.filter(p => p.status === 'UNPAID' && p.penaltyApplied).reduce((sum, p) => sum + Number(p.penaltyAmount || 0), 0);

  // Total Lifetime Expected Target (assuming 2 years of history if prior payments exist)
  const allYears = Array.from(new Set(payments.map(p => p.year)));
  const totalMonthsInHistory = allYears.reduce((acc, y) => acc + (y === currentYear ? currentMonth : 12), 0) || 12;
  const lifetimeTargetAmount = totalMonthlyTarget * totalMonthsInHistory;
  const lifetimeDueAmount = Math.max(0, lifetimeTargetAmount - lifetimeCollectedAmount);

  const lifetimeProfitAmount = profitLoss.filter(pl => pl.type === 'PROFIT').reduce((sum, pl) => sum + Number(pl.amount || 0), 0);
  const lifetimeLossAmount = profitLoss.filter(pl => pl.type === 'LOSS').reduce((sum, pl) => sum + Number(pl.amount || 0), 0);

  const lifetimeInvestedAmount = investments.reduce((sum, i) => sum + Number(i.investedAmount || 0), 0);
  const lifetimeNotInvestedAmount = Math.max(0, (lifetimeCollectedAmount + lifetimeProfitAmount) - lifetimeInvestedAmount);

  return {
    totalActiveShares,
    totalMonthlyTarget,
    monthly: {
      totalMonthlyAmount: totalMonthlyTarget,
      monthlyCollectedAmount,
      monthlyDueAmount,
      monthlyPenaltyCollected,
      monthlyPenaltyDue
    },
    currentYear: {
      year: currentYear,
      totalCollectedAmount: currentYearCollectedAmount,
      totalDueAmount: currentYearDueAmount,
      penaltyCollectedAmount: currentYearPenaltyCollected,
      penaltyDueAmount: currentYearPenaltyDue,
      investAmount: currentYearInvestedAmount,
      notInvestAmount: currentYearUninvestedAmount,
      profitAmount: currentYearProfitAmount,
      lossAmount: currentYearLossAmount
    },
    lifetime: {
      totalCollectedAmount: lifetimeCollectedAmount,
      totalDueAmount: lifetimeDueAmount,
      penaltyCollectedAmount: lifetimePenaltyCollected,
      penaltyDueAmount: lifetimePenaltyDue,
      investAmount: lifetimeInvestedAmount,
      notInvestAmount: Math.max(0, lifetimeNotInvestedAmount),
      profitAmount: lifetimeProfitAmount,
      lossAmount: lifetimeLossAmount
    }
  };
}
