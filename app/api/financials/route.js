import { NextResponse } from 'next/server';
import { getMembersData, getFinancialsData, saveFinancialsData } from '../../../lib/db';
import { computeDashboardSummary, calculatePenaltyAndStatus } from '../../../lib/financial-calculator';

export async function GET() {
  try {
    const members = getMembersData();
    const financials = getFinancialsData();
    const dashboard = computeDashboardSummary(
      members,
      financials.payments || [],
      financials.investments || [],
      financials.profitLoss || []
    );

    return NextResponse.json({
      success: true,
      members,
      financials,
      dashboard
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, payload } = body;
    const financials = getFinancialsData();
    const members = getMembersData();

    if (action === 'RECORD_PAYMENT') {
      const { memberId, month, year, paymentDate, status, amountPaid } = payload;
      const member = members.find(m => m.id === Number(memberId));
      if (!member) {
        return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
      }

      const calc = calculatePenaltyAndStatus({
        shareCount: member.share,
        paymentDate,
        month,
        year
      });

      const existingIndex = financials.payments.findIndex(p => p.memberId === Number(memberId) && p.month === Number(month) && p.year === Number(year));
      
      const updatedPayment = {
        id: existingIndex >= 0 ? financials.payments[existingIndex].id : `PAY-${year}-${month}-${memberId}`,
        memberId: Number(memberId),
        year: Number(year),
        month: Number(month),
        amountPaid: status === 'PAID' ? (Number(amountPaid) || calc.monthlyPayable) : 0,
        paymentDate: status === 'PAID' ? (paymentDate || new Date().toISOString().split('T')[0]) : null,
        status: status || 'PAID',
        penaltyApplied: calc.penaltyApplied,
        penaltyAmount: calc.penaltyAmount,
        isAccountFrozen: calc.isAccountFrozen,
        reopeningFee: calc.reopeningFee
      };

      if (existingIndex >= 0) {
        financials.payments[existingIndex] = updatedPayment;
      } else {
        financials.payments.push(updatedPayment);
      }

      saveFinancialsData(financials);
      const dashboard = computeDashboardSummary(members, financials.payments, financials.investments, financials.profitLoss);

      return NextResponse.json({ success: true, payment: updatedPayment, dashboard });
    }

    if (action === 'IMPORT_PAYMENTS_EXCEL') {
      const { records, month, year } = payload;
      let importedCount = 0;

      records.forEach(row => {
        // Flexible field matching for Excel headers
        const memberId = row['Member ID'] || row['memberId'] || row['Sl No'];
        const memberName = row['Member Name'] || row['name'] || row['Member'];
        const status = (row['Payment Status'] || row['status'] || 'PAID').toString().toUpperCase().includes('PAID') ? 'PAID' : 'UNPAID';
        const rawDate = row['Payment Date'] || row['date'] || null;
        let paymentDate = null;
        if (status === 'PAID' && rawDate) {
          try {
            paymentDate = new Date(rawDate).toISOString().split('T')[0];
          } catch (e) {
            paymentDate = new Date().toISOString().split('T')[0];
          }
        }

        // Find member by ID or Name
        const member = members.find(m => 
          (memberId && m.id === Number(memberId)) || 
          (memberName && m.name.toLowerCase().trim() === memberName.toString().toLowerCase().trim())
        );

        if (member) {
          const calc = calculatePenaltyAndStatus({
            shareCount: member.share,
            paymentDate,
            month: Number(month),
            year: Number(year)
          });

          const existingIndex = financials.payments.findIndex(p => p.memberId === member.id && p.month === Number(month) && p.year === Number(year));
          
          const amountPaid = Number(row['Total Amount Paid (BDT)'] || row['amountPaid'] || calc.monthlyPayable);

          const updatedPayment = {
            id: existingIndex >= 0 ? financials.payments[existingIndex].id : `PAY-${year}-${month}-${member.id}`,
            memberId: member.id,
            year: Number(year),
            month: Number(month),
            amountPaid: status === 'PAID' ? amountPaid : 0,
            paymentDate: status === 'PAID' ? (paymentDate || new Date().toISOString().split('T')[0]) : null,
            status,
            penaltyApplied: calc.penaltyApplied,
            penaltyAmount: calc.penaltyAmount,
            isAccountFrozen: calc.isAccountFrozen,
            reopeningFee: calc.reopeningFee
          };

          if (existingIndex >= 0) {
            financials.payments[existingIndex] = updatedPayment;
          } else {
            financials.payments.push(updatedPayment);
          }
          importedCount++;
        }
      });

      saveFinancialsData(financials);
      const dashboard = computeDashboardSummary(members, financials.payments, financials.investments, financials.profitLoss);

      return NextResponse.json({ success: true, importedCount, dashboard });
    }

    if (action === 'ADD_INVESTMENT') {
      const newInv = {
        id: `INV-${Date.now()}`,
        ...payload,
        date: payload.date || new Date().toISOString().split('T')[0]
      };
      financials.investments.push(newInv);
      saveFinancialsData(financials);
      return NextResponse.json({ success: true, investment: newInv });
    }

    if (action === 'ADD_PROFIT_LOSS') {
      const newPL = {
        id: `PL-${Date.now()}`,
        ...payload,
        date: payload.date || new Date().toISOString().split('T')[0]
      };
      financials.profitLoss.push(newPL);
      saveFinancialsData(financials);
      return NextResponse.json({ success: true, profitLoss: newPL });
    }

    if (action === 'ADD_NOTICE') {
      const newNotice = {
        id: `NOT-${Date.now()}`,
        ...payload,
        date: new Date().toISOString()
      };
      financials.notices.unshift(newNotice);
      saveFinancialsData(financials);
      return NextResponse.json({ success: true, notice: newNotice });
    }

    if (action === 'ADD_CHARITY') {
      const newCharity = {
        id: `CHR-${Date.now()}`,
        ...payload,
        date: payload.date || new Date().toISOString().split('T')[0]
      };
      financials.charity.unshift(newCharity);
      saveFinancialsData(financials);
      return NextResponse.json({ success: true, charity: newCharity });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
