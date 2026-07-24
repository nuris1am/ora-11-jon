import * as XLSX from 'xlsx';

/**
 * Export array of data objects to an Excel (.xlsx) file and trigger browser download
 */
export function exportToExcel(data, fileName = 'Ora_11_Jon_Report', sheetName = 'Report') {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-fit column widths
    const colWidths = Object.keys(data[0] || {}).map(key => {
      const maxLength = Math.max(
        key.toString().length,
        ...data.map(row => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: Math.min(Math.max(maxLength + 4, 12), 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Failed to export Excel report:', error);
  }
}

/**
 * Generate formatted payment report data for Excel export
 */
export function formatPaymentsForExcel(paymentsList = [], membersList = []) {
  const memberMap = new Map(membersList.map(m => [m.id, m]));

  return paymentsList.map((p, index) => {
    const member = memberMap.get(p.memberId) || {};
    const share = Number(member.share || 1);
    const baseMonthlyAmount = share * 1000;
    const penalty = Number(p.penaltyAmount || 0);
    const reopening = Number(p.reopeningFee || 0);

    return {
      'Sl No': index + 1,
      'Member ID': member.id || p.memberId,
      'Member Name': member.name || 'N/A',
      'Shares Owned': share,
      'Monthly Rate (BDT)': baseMonthlyAmount,
      'Payment Status': p.status || 'UNPAID',
      'Payment Date': p.paymentDate || 'Not Paid Yet',
      'Penalty Applied': p.penaltyApplied ? 'YES' : 'NO',
      'Penalty Amount (BDT)': penalty,
      'Reopening Fee (BDT)': reopening,
      'Total Amount Paid (BDT)': p.status === 'PAID' ? Number(p.amountPaid || 0) : 0,
      'Total Due Amount (BDT)': p.status === 'UNPAID' ? baseMonthlyAmount + penalty + reopening : 0,
      'Account Status': p.isAccountFrozen ? 'TEMPORARILY CLOSED' : 'ACTIVE'
    };
  });
}

/**
 * Format Summary Metrics for Excel Export
 */
export function formatSummaryForExcel(dashboardSummary) {
  const { monthly, currentYear, lifetime } = dashboardSummary;

  return [
    { 'Category': 'Monthly Total Target Amount', 'Amount (BDT)': monthly.totalMonthlyAmount, 'Period': 'Current Month' },
    { 'Category': 'Monthly Collected Amount', 'Amount (BDT)': monthly.monthlyCollectedAmount, 'Period': 'Current Month' },
    { 'Category': 'Monthly Due Amount', 'Amount (BDT)': monthly.monthlyDueAmount, 'Period': 'Current Month' },
    { 'Category': 'Monthly Penalty Collected', 'Amount (BDT)': monthly.monthlyPenaltyCollected, 'Period': 'Current Month' },
    { 'Category': 'Monthly Penalty Due', 'Amount (BDT)': monthly.monthlyPenaltyDue, 'Period': 'Current Month' },
    
    { 'Category': 'Current Year Collected Amount', 'Amount (BDT)': currentYear.totalCollectedAmount, 'Period': `Year ${currentYear.year}` },
    { 'Category': 'Current Year Due Amount', 'Amount (BDT)': currentYear.totalDueAmount, 'Period': `Year ${currentYear.year}` },
    { 'Category': 'Current Year Penalty Collected', 'Amount (BDT)': currentYear.penaltyCollectedAmount, 'Period': `Year ${currentYear.year}` },
    { 'Category': 'Current Year Penalty Due', 'Amount (BDT)': currentYear.penaltyDueAmount, 'Period': `Year ${currentYear.year}` },
    { 'Category': 'Current Year Invested Amount', 'Amount (BDT)': currentYear.investAmount, 'Period': `Year ${currentYear.year}` },
    { 'Category': 'Current Year Uninvested Fund', 'Amount (BDT)': currentYear.notInvestAmount, 'Period': `Year ${currentYear.year}` },
    { 'Category': 'Current Year Profit Amount', 'Amount (BDT)': currentYear.profitAmount, 'Period': `Year ${currentYear.year}` },
    { 'Category': 'Current Year Loss Amount', 'Amount (BDT)': currentYear.lossAmount, 'Period': `Year ${currentYear.year}` },

    { 'Category': 'Lifetime Total Collected Amount', 'Amount (BDT)': lifetime.totalCollectedAmount, 'Period': 'All Years (Lifetime)' },
    { 'Category': 'Lifetime Total Due Amount', 'Amount (BDT)': lifetime.totalDueAmount, 'Period': 'All Years (Lifetime)' },
    { 'Category': 'Lifetime Penalty Collected Amount', 'Amount (BDT)': lifetime.penaltyCollectedAmount, 'Period': 'All Years (Lifetime)' },
    { 'Category': 'Lifetime Penalty Due Amount', 'Amount (BDT)': lifetime.penaltyDueAmount, 'Period': 'All Years (Lifetime)' },
    { 'Category': 'Lifetime Invested Amount', 'Amount (BDT)': lifetime.investAmount, 'Period': 'All Years (Lifetime)' },
    { 'Category': 'Lifetime Uninvested Fund', 'Amount (BDT)': lifetime.notInvestAmount, 'Period': 'All Years (Lifetime)' },
    { 'Category': 'Lifetime Profit Amount', 'Amount (BDT)': lifetime.profitAmount, 'Period': 'All Years (Lifetime)' },
    { 'Category': 'Lifetime Loss Amount', 'Amount (BDT)': lifetime.lossAmount, 'Period': 'All Years (Lifetime)' }
  ];
}
