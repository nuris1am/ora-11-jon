'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, Users, PieChart, ShieldAlert, FileSpreadsheet, 
  Bell, Heart, PlusCircle, CheckCircle, XCircle, AlertTriangle, 
  Calendar, Filter, RefreshCw, Layers, TrendingUp, TrendingDown, ArrowLeft
} from 'lucide-react';
import { exportToExcel, formatPaymentsForExcel, formatSummaryForExcel } from '../../lib/excel-export';
import { MONTHLY_RATE_PER_SHARE } from '../../lib/financial-calculator';

export default function FinancialDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMemberPayment, setSelectedMemberPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ paymentDate: '', status: 'PAID', amountPaid: '' });

  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'GENERAL', author: 'Executive Member' });

  const [showCharityModal, setShowCharityModal] = useState(false);
  const [charityForm, setCharityForm] = useState({ title: '', allocatedAmount: '', disbursedAmount: '', beneficiary: '', notes: '' });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/financials');
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f3eb', color: '#084d36', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <h2>ওরা এগারো জন সমিতি - লোড হচ্ছে...</h2>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', background: '#f8f3eb', minHeight: '100vh' }}>
        <h2>ডেটা লোড করতে সমস্যা হয়েছে</h2>
        <p>{error}</p>
        <button onClick={fetchData} style={{ marginTop: '1rem', padding: '10px 20px', background: '#0d6e4c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>পুনরায় চেষ্টা করুন</button>
      </div>
    );
  }

  const { members = [], financials = {}, dashboard = {} } = data;
  const { monthly = {}, currentYear = {}, lifetime = {} } = dashboard;

  // Combine members with current month payment data
  const monthPayments = (financials.payments || []).filter(
    p => p.month === Number(selectedMonth) && p.year === Number(selectedYear)
  );
  const paymentMap = new Map(monthPayments.map(p => [p.memberId, p]));

  const memberPaymentRows = members.map(m => {
    const p = paymentMap.get(m.id);
    const shares = Number(m.share || 1);
    const monthlyPayable = shares * MONTHLY_RATE_PER_SHARE;
    const isPaid = p?.status === 'PAID';
    const isFrozen = p?.isAccountFrozen || false;
    const penaltyApplied = p?.penaltyApplied || false;
    const penaltyAmount = p?.penaltyAmount || 0;
    const reopeningFee = p?.reopeningFee || 0;

    return {
      memberId: m.id,
      name: m.name,
      phone: m.phone || 'N/A',
      shares,
      monthlyPayable,
      status: p ? p.status : 'UNPAID',
      paymentDate: p?.paymentDate || null,
      penaltyApplied,
      penaltyAmount,
      reopeningFee,
      isAccountFrozen: isFrozen,
      rawRecord: p
    };
  });

  // Filtered rows for current table
  const filteredRows = memberPaymentRows.filter(row => {
    if (selectedStatus === 'PAID' && row.status !== 'PAID') return false;
    if (selectedStatus === 'UNPAID' && row.status !== 'UNPAID') return false;
    if (selectedStatus === 'FROZEN' && !row.isAccountFrozen) return false;
    if (searchQuery && !row.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Excel Export Handler
  const handleExportPaymentsExcel = () => {
    const formatted = formatPaymentsForExcel(monthPayments, members);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[selectedMonth - 1];
    exportToExcel(formatted, `Ora_11_Jon_Payments_${monthName}_${selectedYear}`, `Payments ${monthName} ${selectedYear}`);
  };

  const handleExportSummaryExcel = () => {
    const formatted = formatSummaryForExcel(dashboard);
    exportToExcel(formatted, `Ora_11_Jon_Financial_Summary_${selectedYear}`, 'Financial Summary');
  };

  // Payment Submit
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberPayment) return;

    try {
      const res = await fetch('/api/financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_PAYMENT',
          payload: {
            memberId: selectedMemberPayment.memberId,
            month: selectedMonth,
            year: selectedYear,
            paymentDate: paymentForm.paymentDate,
            status: paymentForm.status,
            amountPaid: paymentForm.amountPaid || selectedMemberPayment.monthlyPayable
          }
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowPaymentModal(false);
        fetchData();
      } else {
        alert(json.message || 'Payment submission failed');
      }
    } catch (err) {
      alert('Error updating payment: ' + err.message);
    }
  };

  // Notice Submit
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD_NOTICE', payload: noticeForm })
      });
      const json = await res.json();
      if (json.success) {
        setShowNoticeModal(false);
        setNoticeForm({ title: '', content: '', category: 'GENERAL', author: 'Executive Member' });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Charity Submit
  const handleCharitySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_CHARITY',
          payload: {
            year: selectedYear,
            title: charityForm.title,
            allocatedAmount: Number(charityForm.allocatedAmount) || 0,
            disbursedAmount: Number(charityForm.disbursedAmount) || 0,
            beneficiary: charityForm.beneficiary,
            notes: charityForm.notes
          }
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowCharityModal(false);
        setCharityForm({ title: '', allocatedAmount: '', disbursedAmount: '', beneficiary: '', notes: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f3eb', color: '#1a1a2e', fontFamily: 'sans-serif', paddingBottom: '3rem' }}>
      
      {/* HEADER NAVBAR */}
      <header style={{ background: 'linear-gradient(135deg, #0d6e4c 0%, #084d36 100%)', color: '#fff', padding: '1.25rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/" style={{ color: '#e8b554', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '6px' }}>
                <ArrowLeft size={16} /> হোমপেজে ফিরুন
              </Link>
              <ShieldAlert size={28} color="#e8b554" />
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>ওরা এগারো জন সমিতি - ফাইন্যান্স পোর্টাল</h1>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px', color: '#e8b554' }}>
              Ora 11 Jon Co-operative Association • Financial Management System & Excel Reports
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
              👥 16 Members
            </span>
            <span style={{ background: '#e8b554', color: '#084d36', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
              📊 26 Total Shares (26,000 Tk/month)
            </span>
            <button 
              onClick={handleExportSummaryExcel} 
              style={{ background: '#fff', color: '#0d6e4c', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <FileSpreadsheet size={18} /> Export Full Financial Excel
            </button>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '8px', padding: '0 1rem', overflowX: 'auto' }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard Summary', icon: PieChart },
            { id: 'payments', label: '💳 Payment Tracker & Current Month', icon: DollarSign },
            { id: 'investments', label: '📈 Investments & Profit/Loss', icon: TrendingUp },
            { id: 'notices', label: '📢 Notice Board', icon: Bell },
            { id: 'charity', label: '🤲 Charity Calculation', icon: Heart },
            { id: 'members', label: '👥 Members List', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #0d6e4c' : '3px solid transparent',
                  color: isActive ? '#084d36' : '#555',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} color={isActive ? '#0d6e4c' : '#777'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <main style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1rem' }}>

        {/* TAB 1: DASHBOARD SUMMARY */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#084d36', fontWeight: '800' }}>ড্যাশবোর্ড ও আর্থিক সারসংক্ষেপ (Dashboard Summary)</h2>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Real-time overview of monthly targets, yearly performance, penalty metrics, investments, and lifetime funds.</p>
              </div>
            </div>

            {/* SECTION 1: MONTHLY OVERVIEW */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '2px solid #f0f7f3', paddingBottom: '0.5rem' }}>
                <Calendar size={22} color="#0d6e4c" />
                <h3 style={{ fontSize: '1.2rem', color: '#084d36' }}>১. চলতি মাসের হিসাব (Current Month Summary)</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                <MetricCard title="Total Monthly Target" value={`${monthly.totalMonthlyAmount?.toLocaleString()} BDT`} subtext="26 Shares × 1,000 Tk" color="#0d6e4c" icon={DollarSign} />
                <MetricCard title="Monthly Collected Amount" value={`${monthly.monthlyCollectedAmount?.toLocaleString()} BDT`} subtext="Collected this month" color="#15a370" icon={CheckCircle} />
                <MetricCard title="Monthly Due Amount" value={`${monthly.monthlyDueAmount?.toLocaleString()} BDT`} subtext="Pending collection" color="#d9534f" icon={XCircle} />
                <MetricCard title="Penalty Collected / Due" value={`${monthly.monthlyPenaltyCollected} / ${monthly.monthlyPenaltyDue} BDT`} subtext="50/100 BDT per share late penalty" color="#f0ad4e" icon={AlertTriangle} />
              </div>
            </div>

            {/* SECTION 2: CURRENT YEAR OVERVIEW */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '2px solid #f0f7f3', paddingBottom: '0.5rem' }}>
                <TrendingUp size={22} color="#0d6e4c" />
                <h3 style={{ fontSize: '1.2rem', color: '#084d36' }}>২. চলতি বছরের হিসাব ({currentYear.year} Current Year Summary)</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <MetricCard title="Year Total Collected" value={`${currentYear.totalCollectedAmount?.toLocaleString()} BDT`} subtext="Annual savings collected" color="#0d6e4c" />
                <MetricCard title="Year Total Due" value={`${currentYear.totalDueAmount?.toLocaleString()} BDT`} subtext="Annual savings pending" color="#d9534f" />
                <MetricCard title="Year Penalty Collected" value={`${currentYear.penaltyCollectedAmount?.toLocaleString()} BDT`} subtext="Late fees collected" color="#f0ad4e" />
                <MetricCard title="Year Penalty Due" value={`${currentYear.penaltyDueAmount?.toLocaleString()} BDT`} subtext="Uncollected late fees" color="#e74c3c" />
                <MetricCard title="Invested Amount" value={`${currentYear.investAmount?.toLocaleString()} BDT`} subtext="Active investments" color="#2980b9" />
                <MetricCard title="Uninvested Reserve Fund" value={`${currentYear.notInvestAmount?.toLocaleString()} BDT`} subtext="Cash reserve in fund" color="#8e44ad" />
                <MetricCard title="Current Year Profit" value={`${currentYear.profitAmount?.toLocaleString()} BDT`} subtext="Returns generated" color="#27ae60" />
                <MetricCard title="Current Year Loss" value={`${currentYear.lossAmount?.toLocaleString()} BDT`} subtext="Expenses & losses" color="#c0392b" />
              </div>
            </div>

            {/* SECTION 3: LIFETIME (ALL YEARS) OVERVIEW */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '2px solid #f0f7f3', paddingBottom: '0.5rem' }}>
                <Layers size={22} color="#0d6e4c" />
                <h3 style={{ fontSize: '1.2rem', color: '#084d36' }}>৩. সর্বমোট/বিগত সকল বছরের হিসাব (Lifetime All-Time Summary)</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <MetricCard title="Lifetime Collected" value={`${lifetime.totalCollectedAmount?.toLocaleString()} BDT`} subtext="All-time savings collected" color="#0d6e4c" />
                <MetricCard title="Lifetime Due" value={`${lifetime.totalDueAmount?.toLocaleString()} BDT`} subtext="All-time dues pending" color="#d9534f" />
                <MetricCard title="Lifetime Penalty Collected" value={`${lifetime.penaltyCollectedAmount?.toLocaleString()} BDT`} subtext="Total late fees received" color="#f0ad4e" />
                <MetricCard title="Lifetime Penalty Due" value={`${lifetime.penaltyDueAmount?.toLocaleString()} BDT`} subtext="Total late fees pending" color="#e74c3c" />
                <MetricCard title="Lifetime Invested" value={`${lifetime.investAmount?.toLocaleString()} BDT`} subtext="Total invested capital" color="#2980b9" />
                <MetricCard title="Lifetime Reserve Fund" value={`${lifetime.notInvestAmount?.toLocaleString()} BDT`} subtext="Available liquid cash" color="#8e44ad" />
                <MetricCard title="Lifetime Total Profit" value={`${lifetime.profitAmount?.toLocaleString()} BDT`} subtext="Total returns earned" color="#27ae60" />
                <MetricCard title="Lifetime Total Loss" value={`${lifetime.lossAmount?.toLocaleString()} BDT`} subtext="Total expenses & losses" color="#c0392b" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT TRACKER & CURRENT MONTH TABLE */}
        {activeTab === 'payments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#084d36', fontWeight: '800' }}>চলতি মাসের সঞ্চয় ও জরিমানা তালিকা (Payment & Penalty Tracker)</h2>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Track who has paid, payment dates, late penalties, and account freeze statuses.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleExportPaymentsExcel}
                  style={{ background: '#0d6e4c', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <FileSpreadsheet size={18} /> Export Table to Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* LATE PENALTY RULE HIGHLIGHT */}
            <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#856404', fontSize: '0.88rem' }}>
              <strong>📌 পেমেন্ট ও জরিমানা নীতিমালার নিয়ম (Rules):</strong><br />
              • প্রতি মাসের সঞ্চয় <strong>১০ তারিখের আগে</strong> পরিশোধ করতে হবে (১,০০০ টাকা / শেয়ার)।<br />
              • ১০ তারিখ পার হলে প্রতি শেয়ারে <strong>৫০ টাকা বিলম্ব ফি/জরিমানা</strong> যুক্ত হবে।<br />
              • টানা ৩ মাস অপরিশোধিত থাকলে ৩য় মাসের ১০ তারিখের পর <strong>অ্যাকাউন্ট সাময়িক বন্ধ (Frozen)</strong> হয়ে যাবে এবং পুনঃরায় অ্যাকাউন্ট চালু ফি <strong>৫০ টাকা / শেয়ার</strong> দিতে হবে।<br />
              • ৪র্থ মাস থেকে অ্যাকাউন্ট চালুর পূর্ব পর্যন্ত প্রতি শেয়ারে জরিমানা <strong>১০০ টাকা / মাস</strong> হিসেবে প্রযোজ্য হবে (যেমন: ৫০ + ৫০ + ৫০ + ১০০ + ১০০...)।
            </div>

            {/* FILTER BAR */}
            <div style={{ background: '#fff', padding: '1.2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={18} color="#0d6e4c" />
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>ফিল্টার করুন:</span>
              </div>

              {/* Month Selector */}
              <div>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', fontWeight: '600' }}
                >
                  {['জানুয়ারি (Jan)', 'ফেব্রুয়ারি (Feb)', 'মার্চ (Mar)', 'এপ্রিল (Apr)', 'মে (May)', 'জুন (Jun)', 'জুলাই (Jul)', 'আগস্ট (Aug)', 'সেপ্টেম্বর (Sep)', 'অক্টোবর (Oct)', 'নভেম্বর (Nov)', 'ডিসেম্বর (Dec)'].map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year Selector */}
              <div>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', fontWeight: '600' }}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>

              {/* Status Selector */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', fontWeight: '600' }}
                >
                  <option value="ALL">সকল সদস্য (All Members)</option>
                  <option value="PAID">পরিশোধিত (Paid Only)</option>
                  <option value="UNPAID">বকেয়া (Unpaid Only)</option>
                  <option value="FROZEN">বন্ধ অ্যাকাউন্ট (Account Frozen)</option>
                </select>
              </div>

              {/* Search Box */}
              <div style={{ marginLeft: 'auto' }}>
                <input
                  type="text"
                  placeholder="সদস্যের নাম খুঁজুন..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '0.9rem', width: '220px' }}
                />
              </div>
            </div>

            {/* TABLE */}
            <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{ background: '#0d6e4c', color: '#fff', fontSize: '0.88rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px' }}>ক্র: নং</th>
                      <th style={{ padding: '14px' }}>সদস্যের নাম (Member Name)</th>
                      <th style={{ padding: '14px' }}>শেয়ার সংখ্যা</th>
                      <th style={{ padding: '14px' }}>মাসিক প্রদেয় (BDT)</th>
                      <th style={{ padding: '14px' }}>স্ট্যাটাস (Status)</th>
                      <th style={{ padding: '14px' }}>পরিশোধের তারিখ</th>
                      <th style={{ padding: '14px' }}>বিলম্ব ফি / জরিমানা (Penalty)</th>
                      <th style={{ padding: '14px' }}>মোট জমাকৃত / বকেয়া</th>
                      <th style={{ padding: '14px', textAlign: 'center' }}>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                          কোনো রেকর্ড পাওয়া যায়নি (No records matching filters)
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, idx) => (
                        <tr key={row.memberId} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                          <td style={{ padding: '12px 14px', fontWeight: '600' }}>{idx + 1}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: '700', color: '#084d36' }}>{row.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#777' }}>📞 {row.phone}</div>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: '700', color: '#333' }}>
                            <span style={{ background: '#e9ecef', padding: '4px 10px', borderRadius: '12px' }}>
                              {row.shares} Share(s)
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: '700' }}>
                            {row.monthlyPayable.toLocaleString()} Tk
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {row.isAccountFrozen ? (
                              <span style={{ background: '#721c24', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                                🔒 ACCOUNT FROZEN
                              </span>
                            ) : row.status === 'PAID' ? (
                              <span style={{ background: '#d4edda', color: '#155724', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                                 PAID
                              </span>
                            ) : (
                              <span style={{ background: '#f8d7da', color: '#721c24', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700' }}>
                                ❌ UNPAID
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {row.paymentDate ? (
                              <span style={{ color: '#27ae60', fontWeight: '600' }}>📅 {row.paymentDate}</span>
                            ) : (
                              <span style={{ color: '#aaa', fontStyle: 'italic' }}>অপরিশোধিত</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {row.penaltyApplied ? (
                              <div style={{ color: '#c0392b', fontWeight: '700' }}>
                                ⚠️ +{row.penaltyAmount} Tk {row.reopeningFee > 0 && `(Reopen: +${row.reopeningFee}Tk)`}
                              </div>
                            ) : (
                              <span style={{ color: '#27ae60' }}>0 Tk (সঠিক সময়)</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: '700' }}>
                            {row.status === 'PAID' ? (
                              <span style={{ color: '#27ae60' }}>{(row.monthlyPayable + row.penaltyAmount).toLocaleString()} Tk (Paid)</span>
                            ) : (
                              <span style={{ color: '#c0392b' }}>{(row.monthlyPayable + row.penaltyAmount + row.reopeningFee).toLocaleString()} Tk (Due)</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedMemberPayment(row);
                                setPaymentForm({
                                  paymentDate: row.paymentDate || new Date().toISOString().split('T')[0],
                                  status: row.status,
                                  amountPaid: row.monthlyPayable + row.penaltyAmount
                                });
                                setShowPaymentModal(true);
                              }}
                              style={{ background: '#0d6e4c', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                            >
                              হিসাব আপডেট
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INVESTMENTS & PROFIT/LOSS */}
        {activeTab === 'investments' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#084d36', fontWeight: '800' }}>বিনিয়োগ এবং লাভ-ক্ষতি হিসাব (Investments & Profit/Loss)</h2>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Track association investments, expected returns, and yearly profit/loss balance sheets.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Investments List */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#084d36', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '2px solid #f0f7f3', paddingBottom: '0.5rem' }}>
                  💼 বিনিয়োগ প্রকল্পসমূহ (Active Investments)
                </h3>
                {(financials.investments || []).map(inv => (
                  <div key={inv.id} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#084d36' }}>{inv.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>তারিখ: {inv.date} | স্ট্যাটাস: <strong>{inv.status}</strong></div>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600' }}>
                      <span>বিনিয়োগ: {inv.investedAmount?.toLocaleString()} Tk</span>
                      <span style={{ color: '#27ae60' }}>মুনাফা: {inv.actualReturn?.toLocaleString()} Tk</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Profit & Loss Entries */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#084d36', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '2px solid #f0f7f3', paddingBottom: '0.5rem' }}>
                  📊 লাভ ও ক্ষতি বিবরণী (Profit & Loss Ledger)
                </h3>
                {(financials.profitLoss || []).map(pl => (
                  <div key={pl.id} style={{ background: '#fafafa', borderLeft: `4px solid ${pl.type === 'PROFIT' ? '#27ae60' : '#c0392b'}`, borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                      <span>{pl.category} ({pl.description})</span>
                      <span style={{ color: pl.type === 'PROFIT' ? '#27ae60' : '#c0392b' }}>
                        {pl.type === 'PROFIT' ? '+' : '-'}{pl.amount?.toLocaleString()} Tk
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#777', marginTop: '4px' }}>তারিখ: {pl.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NOTICE BOARD */}
        {activeTab === 'notices' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#084d36', fontWeight: '800' }}>নোটিশ বোর্ড (Association Notice Board)</h2>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Important updates and notices for all 16 members of Ora 11 Jon.</p>
              </div>
              <button
                onClick={() => setShowNoticeModal(true)}
                style={{ background: '#0d6e4c', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <PlusCircle size={18} /> নতুন নোটিশ যোগ করুন
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {(financials.notices || []).map(notice => (
                <div key={notice.id} style={{ background: '#fff', borderLeft: '5px solid #0d6e4c', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#084d36', fontWeight: '700' }}>{notice.title}</h3>
                    <span style={{ background: notice.category === 'URGENT' ? '#f8d7da' : '#e9ecef', color: notice.category === 'URGENT' ? '#721c24' : '#333', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
                      {notice.category}
                    </span>
                  </div>
                  <p style={{ color: '#444', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '12px' }}>{notice.content}</p>
                  <div style={{ fontSize: '0.82rem', color: '#888', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                    <span>প্রকাশক: {notice.author}</span>
                    <span>📅 {new Date(notice.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CHARITY CALCULATOR */}
        {activeTab === 'charity' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#084d36', fontWeight: '800' }}>চ্যারিটি ও কল্যাণ ফান্ড হিসাব (Charity & Welfare Calculation)</h2>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Calculate and log charity distribution to social and community development projects.</p>
              </div>
              <button
                onClick={() => setShowCharityModal(true)}
                style={{ background: '#0d6e4c', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <PlusCircle size={18} /> চ্যারিটি বিতরণ এন্ট্রি
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
              <h3 style={{ color: '#084d36', fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '2px solid #f0f7f3', paddingBottom: '0.5rem' }}>
                🤲 সাম্প্রতিক চ্যারিটি বিতরণসমূহ (Charity Disbursements Log)
              </h3>
              {(financials.charity || []).map(c => (
                <div key={c.id} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '10px', padding: '1.2rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.05rem', color: '#084d36' }}>
                    <span>{c.title}</span>
                    <span style={{ color: '#27ae60' }}>{c.disbursedAmount?.toLocaleString()} BDT</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '6px' }}>গ্রহীতা / সুবিধাভোগী: <strong>{c.beneficiary}</strong></div>
                  <div style={{ fontSize: '0.85rem', color: '#777', marginTop: '4px' }}>নোট: {c.notes} | তারিখ: {c.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MEMBERS DIRECTORY */}
        {activeTab === 'members' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#084d36', fontWeight: '800' }}>সদস্য তালিকা (16 Members & Shares Overview)</h2>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>All 16 registered association members and share ownership distribution.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {members.map(m => (
                <div key={m.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '4px solid #0d6e4c' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#084d36' }}>{m.name}</h3>
                    <span style={{ background: '#e8b554', color: '#084d36', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                      {m.share} Share(s)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: '1.6' }}>
                    <div>📍 ঠিকানা: {m.address}</div>
                    <div>💼 কর্মস্থল: {m.workingLocation}</div>
                    <div>📞 মোবাইল: {m.phone || 'N/A'}</div>
                    <div style={{ marginTop: '6px', fontWeight: '700', color: '#0d6e4c' }}>
                      মাসিক সঞ্চয় প্রদেয়: {(m.share * 1000).toLocaleString()} Tk
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: RECORD PAYMENT */}
      {showPaymentModal && selectedMemberPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', maxWidth: '480px', width: '100%', padding: '1.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#084d36', fontWeight: '800', marginBottom: '1rem' }}>
              পেমেন্ট হিসাব আপডেট: {selectedMemberPayment.name}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#555', marginBottom: '1rem' }}>
              শেয়ার: <strong>{selectedMemberPayment.shares} Share(s)</strong> | বেসিক প্রদেয়: <strong>{selectedMemberPayment.monthlyPayable.toLocaleString()} Tk</strong>
            </p>

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>পরিশোধের স্ট্যাটাস:</label>
                <select
                  value={paymentForm.status}
                  onChange={e => setPaymentForm({ ...paymentForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                  <option value="PAID">PAID (পরিশোধিত)</option>
                  <option value="UNPAID">UNPAID (বকেয়া)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>পরিশোধের তারিখ (Payment Date):</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>প্রাপ্ত মোট টাকা (সহ জরিমানা/ফি):</label>
                <input
                  type="number"
                  value={paymentForm.amountPaid}
                  onChange={e => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#0d6e4c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  সংরক্ষণ করুন (Save)
                </button>
                <button type="button" onClick={() => setShowPaymentModal(false)} style={{ padding: '12px 18px', background: '#ccc', color: '#333', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  বাতিল (Cancel)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NOTICE */}
      {showNoticeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', maxWidth: '500px', width: '100%', padding: '1.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#084d36', fontWeight: '800', marginBottom: '1rem' }}>নতুন নোটিশ যোগ করুন</h3>
            <form onSubmit={handleNoticeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>নোটিশ শিরোনাম (Title):</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>ক্যাটাগরি:</label>
                <select
                  value={noticeForm.category}
                  onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="URGENT">URGENT</option>
                  <option value="FINANCIAL">FINANCIAL</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>বিস্তারিত বিবরণ (Content):</label>
                <textarea
                  rows={4}
                  required
                  value={noticeForm.content}
                  onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#0d6e4c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  নোটিশ প্রকাশ করুন
                </button>
                <button type="button" onClick={() => setShowNoticeModal(false)} style={{ padding: '12px 18px', background: '#ccc', color: '#333', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CHARITY */}
      {showCharityModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', maxWidth: '500px', width: '100%', padding: '1.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#084d36', fontWeight: '800', marginBottom: '1rem' }}>নতুন চ্যারিটি বিতরণ বিবরণ</h3>
            <form onSubmit={handleCharitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>প্রকল্পের নাম (Title):</label>
                <input
                  type="text"
                  required
                  value={charityForm.title}
                  onChange={e => setCharityForm({ ...charityForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>বিতরণকৃত টাকার পরিমাণ (BDT):</label>
                <input
                  type="number"
                  required
                  value={charityForm.disbursedAmount}
                  onChange={e => setCharityForm({ ...charityForm, disbursedAmount: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>গ্রহীতা / সুবিধাভোগী (Beneficiary):</label>
                <input
                  type="text"
                  required
                  value={charityForm.beneficiary}
                  onChange={e => setCharityForm({ ...charityForm, beneficiary: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '4px' }}>নোট (Notes):</label>
                <textarea
                  rows={3}
                  value={charityForm.notes}
                  onChange={e => setCharityForm({ ...charityForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#0d6e4c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  সেভ করুন
                </button>
                <button type="button" onClick={() => setShowCharityModal(false)} style={{ padding: '12px 18px', background: '#ccc', color: '#333', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component for Dashboard Metric Cards
function MetricCard({ title, value, subtext, color = '#0d6e4c', icon: Icon }) {
  return (
    <div style={{ background: '#fff', border: `1px solid #eee`, borderLeft: `5px solid ${color}`, borderRadius: '12px', padding: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#666', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
        <span>{title}</span>
        {Icon && <Icon size={18} color={color} />}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: color, margin: '4px 0' }}>
        {value}
      </div>
      {subtext && <div style={{ fontSize: '0.78rem', color: '#888' }}>{subtext}</div>}
    </div>
  );
}
