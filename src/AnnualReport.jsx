import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const AnnualReport = () => {
  const [loading, setLoading] = useState(true);
  const [allSales, setAllSales] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [allRefunds, setAllRefunds] = useState([]);

  // လက်ရှိနှစ်ကို Default အနေဖြင့် သတ်မှတ်ခြင်း
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const [salesRes, expensesRes, refundsRes] = await Promise.all([
        supabase.from('daily_sales').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('refunds').select('*')
      ]);

      setAllSales(salesRes.data || []);
      setAllExpenses(expensesRes.data || []);
      setAllRefunds(refundsRes.data || []);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const allDates = [...allSales.map(s => s.date), ...allExpenses.map(e => e.date), ...allRefunds.map(r => r.date)];
  const uniqueYears = [...new Set(allDates.map(d => d.substring(0, 4)))].sort().reverse();
  const availableYears = uniqueYears.length > 0 ? uniqueYears : [currentYear];

  const yearlySales = allSales.filter(s => s.date.startsWith(selectedYear));
  const yearlyExpenses = allExpenses.filter(e => e.date.startsWith(selectedYear));
  const yearlyRefunds = allRefunds.filter(r => r.date.startsWith(selectedYear));

  // ၁။ နှစ်ချုပ် အဓိက ကိန်းဂဏန်းများ
  const totalRevenue = yearlySales.reduce((sum, item) => sum + Number(item.selling_price), 0);
  const totalCOGS = yearlySales.reduce((sum, item) => sum + Number(item.buying_price), 0);
  const totalExpenses = yearlyExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalRefunds = yearlyRefunds.reduce((sum, item) => sum + Number(item.refund_amount), 0);
  const netProfit = totalRevenue - totalCOGS - totalExpenses - totalRefunds;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0;

  // ၂။ လအလိုက် တိုးတက်မှု (Monthly Trends)
  const monthNames = ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'];
  const monthlyTrendsData = monthNames.map((month, index) => {
    const monthPrefix = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
    
    const mSales = yearlySales.filter(s => s.date.startsWith(monthPrefix));
    const mExpenses = yearlyExpenses.filter(e => e.date.startsWith(monthPrefix));
    const mRefunds = yearlyRefunds.filter(r => r.date.startsWith(monthPrefix));

    const mRev = mSales.reduce((sum, item) => sum + Number(item.selling_price), 0);
    const mCOGS = mSales.reduce((sum, item) => sum + Number(item.buying_price), 0);
    const mExp = mExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const mRef = mRefunds.reduce((sum, item) => sum + Number(item.refund_amount), 0);
    const mProfit = mRev - mCOGS - mExp - mRef;

    return { name: month, ဝင်ငွေ: mRev, အမြတ်ငွေ: mProfit };
  });

  // ၃။ အရောင်းရဆုံး ပစ္စည်းများ (Top 10)
  const itemStats = {};
  yearlySales.forEach(sale => {
    if (!itemStats[sale.item_name]) {
      itemStats[sale.item_name] = { name: sale.item_name, count: 0, revenue: 0, profit: 0 };
    }
    itemStats[sale.item_name].count += 1;
    itemStats[sale.item_name].revenue += Number(sale.selling_price);
    itemStats[sale.item_name].profit += (Number(sale.selling_price) - Number(sale.buying_price));
  });
  const top10Items = Object.values(itemStats)
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
    .slice(0, 10);

  // ၄။ ကုန်ကျစရိတ် ခွဲခြမ်းစိတ်ဖြာမှု
  const expenseStats = {};
  yearlyExpenses.forEach(exp => {
    if (!expenseStats[exp.category]) expenseStats[exp.category] = 0;
    expenseStats[exp.category] += Number(exp.amount);
  });
  const expensePieData = Object.keys(expenseStats).map(key => ({
    name: key, value: expenseStats[key]
  }));
  const EXPENSE_COLORS = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen animate-pulse text-blue-600 font-bold text-xl">Report အချက်အလက်များ စုစည်းနေပါသည်...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans print:bg-white print:p-0 print:m-0">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 print:hidden">
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
          <span>📑</span> {selectedYear} နှစ်ချုပ် အစီရင်ခံစာ (Annual Report)
        </h2>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <label className="text-sm font-semibold text-gray-600 mr-3">နှစ်ရွေးရန်:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-blue-700 font-bold focus:outline-none cursor-pointer"
            >
              {!availableYears.includes(currentYear) && <option value={currentYear}>{currentYear}</option>}
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          
          <button onClick={handlePrint} className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-6 rounded-lg shadow flex items-center gap-2 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print / PDF
          </button>
        </div>
      </div>

      {/* Print သီးသန့် Header */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-wider uppercase">Annual Financial Report</h1>
        <h2 className="text-xl font-bold text-gray-600 mt-2">Net Age Computers & IT Accessories</h2>
        <p className="text-md font-semibold text-gray-500 mt-1">Fiscal Year : {selectedYear}</p>
      </div>

      {/* အပိုင်း ၁: နှစ်ချုပ် အဓိက ကိန်းဂဏန်းများ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8 print:grid-cols-3 print:gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 print:shadow-none print:border print:border-gray-300">
          <p className="text-gray-500 text-xs font-bold uppercase">စုစုပေါင်း ရောင်းရငွေ</p>
          <h3 className="text-xl lg:text-2xl font-bold text-blue-600 mt-1">{totalRevenue.toLocaleString()} Ks</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500 print:shadow-none print:border print:border-gray-300">
          <p className="text-gray-500 text-xs font-bold uppercase">ဝယ်ရင်းဈေး (COGS)</p>
          <h3 className="text-xl lg:text-2xl font-bold text-purple-600 mt-1">{totalCOGS.toLocaleString()} Ks</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500 print:shadow-none print:border print:border-gray-300">
          <p className="text-gray-500 text-xs font-bold uppercase">ကုန်ကျစရိတ်</p>
          <h3 className="text-xl lg:text-2xl font-bold text-orange-600 mt-1">{totalExpenses.toLocaleString()} Ks</h3>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 print:shadow-none print:border print:border-gray-300">
          <p className="text-gray-500 text-xs font-bold uppercase">စုစုပေါင်း ပြန်အမ်းငွေ</p>
          <h3 className="text-xl lg:text-2xl font-bold text-red-600 mt-1">{totalRefunds.toLocaleString()} Ks</h3>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 print:shadow-none print:border print:border-gray-300">
          <p className="text-gray-500 text-xs font-bold uppercase">အသားတင်အမြတ်</p>
          <h3 className={`text-xl lg:text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netProfit.toLocaleString()} Ks
          </h3>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-yellow-400 print:bg-white print:shadow-none print:border print:border-gray-300">
          <p className="text-gray-300 print:text-gray-500 text-xs font-bold uppercase">အမြတ်ရာခိုင်နှုန်း (Margin)</p>
          <h3 className="text-xl lg:text-2xl font-black text-yellow-400 mt-1 print:text-gray-800">{profitMargin}%</h3>
        </div>
      </div>

      {/* အပိုင်း ၂: လအလိုက် တိုးတက်မှု (Line Chart) */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 print:shadow-none print:border print:break-inside-avoid">
        <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">လအလိုက် ဝင်ငွေ နှင့် အမြတ်ငွေ အတက်အကျ (Monthly Trends)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value) => `${value.toLocaleString()} Ks`} />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="ဝင်ငွေ" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="အမြတ်ငွေ" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
        
        {/* အပိုင်း ၃: အရောင်းရဆုံး Top 10 (Table) */}
        <div className="bg-white p-6 rounded-xl shadow-sm print:shadow-none print:border print:mb-8 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">တစ်နှစ်တာ အရောင်းရဆုံး ပစ္စည်းများ (Top 10)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="p-3 border-b font-bold w-12 text-center">စဉ်</th>
                  <th className="p-3 border-b font-bold">ပစ္စည်းအမည်</th>
                  <th className="p-3 border-b font-bold text-center">အရေအတွက်</th>
                  <th className="p-3 border-b font-bold text-right">ရောင်းရငွေ</th>
                </tr>
              </thead>
              <tbody>
                {top10Items.length === 0 ? (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-500">ဒေတာ မရှိသေးပါ။</td></tr>
                ) : (
                  top10Items.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-center font-bold text-gray-500">{index + 1}</td>
                      <td className="p-3 text-sm font-semibold text-gray-800">{item.name}</td>
                      <td className="p-3 text-center text-sm font-bold text-blue-600">{item.count}</td>
                      <td className="p-3 text-right text-sm text-gray-600">{item.revenue.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* အပိုင်း ၄: ကုန်ကျစရိတ် ခွဲခြမ်းစိတ်ဖြာမှု (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm print:shadow-none print:border print:break-inside-avoid flex flex-col print:mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">ကုန်ကျစရိတ် ကဏ္ဍခွဲခြားမှု (Expenses Breakdown)</h3>
          
          {/* ပြင်ဆင်ချက်: min-h-[300px] နှင့် flex-1 အစား h-80 ဟု အတိအကျ ပြောင်းလဲသတ်မှတ်လိုက်ပါသည် */}
          <div className="w-full h-80 flex items-center justify-center">
            {expensePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} Ks`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm">ဤနှစ်အတွက် ကုန်ကျစရိတ် မှတ်တမ်းမရှိပါ။</div>
            )}
          </div>
        </div>
        
      </div>
      
      {/* Print အတွက် Footer အမှတ်အသား */}
      <div className="hidden print:block mt-12 text-center text-xs text-gray-400 font-medium">
        Generated by Net Age Business Analysis System &bull; Report Date: {new Date().toLocaleDateString()}
      </div>

    </div>
  );
};

export default AnnualReport;