import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [allSales, setAllSales] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [allRefunds, setAllRefunds] = useState([]);

  // လက်ရှိလကို Default အနေဖြင့် သတ်မှတ်ခြင်း
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      const [salesRes, expensesRes, refundsRes] = await Promise.all([
        supabase.from('daily_sales').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('refunds').select('*')
      ]);

      if (salesRes.error) console.error("Sales Error:", salesRes.error);
      if (expensesRes.error) console.error("Expenses Error:", expensesRes.error);
      if (refundsRes.error) console.error("Refunds Error:", refundsRes.error);

      setAllSales(salesRes.data || []);
      setAllExpenses(expensesRes.data || []);
      setAllRefunds(refundsRes.data || []);
      
      setLoading(false);
    };

    fetchAllData();
  }, []);

  const allDates = [
    ...allSales.map(s => s.date),
    ...allExpenses.map(e => e.date),
    ...allRefunds.map(r => r.date)
  ];
  
  const uniqueMonths = [...new Set(allDates.map(d => d.substring(0, 7)))].sort().reverse();
  const availableMonths = uniqueMonths.length > 0 ? uniqueMonths : [currentMonthStr];

  const formatMonthToBurmese = (yyyy_mm) => {
    if (!yyyy_mm) return '';
    const [year, month] = yyyy_mm.split('-');
    const monthNames = ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  };

  // ၃။ ရွေးချယ်ထားသော လအတွက်သာ Data များကို အလိုအလျောက် စစ်ထုတ်တွက်ချက်ခြင်း
  const currentSales = allSales.filter(s => s.date.substring(0, 7) === selectedMonth);
  const currentExpenses = allExpenses.filter(e => e.date.substring(0, 7) === selectedMonth);
  const currentRefunds = allRefunds.filter(r => r.date.substring(0, 7) === selectedMonth);

  // တွက်ချက်မှုများ (ဝယ်ရင်းဈေး ထပ်တိုးထားသည်)
  const totalRevenue = currentSales.reduce((sum, item) => sum + Number(item.selling_price), 0);
  const totalBuyingPrice = currentSales.reduce((sum, item) => sum + Number(item.buying_price), 0);
  const totalExpenses = currentExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalRefunds = currentRefunds.reduce((sum, item) => sum + Number(item.refund_amount), 0);
  
  // အသားတင်အမြတ် = ရောင်းရငွေ - ဝယ်ရင်းဈေး - ကုန်ကျစရိတ် - ပြန်အမ်းငွေ
  const netProfit = totalRevenue - totalBuyingPrice - totalExpenses - totalRefunds;

  // ၄။ Chart များအတွက် Data ပြင်ဆင်ခြင်း (ဝယ်ရင်းဈေး ပါဝင်လာသည်)
  const comparisonChartData = [
    { name: 'ရောင်းရငွေ', amount: totalRevenue },
    { name: 'ဝယ်ရင်းဈေး', amount: totalBuyingPrice },
    { name: 'ကုန်ကျစရိတ်', amount: totalExpenses }
  ];

  const refundImpactData = [
    { name: 'အောင်မြင်သော အရောင်း', value: Math.max(0, totalRevenue - totalRefunds) },
    { name: 'ပြန်အမ်းငွေ', value: totalRefunds }
  ];
  const COLORS = ['#10B981', '#EF4444']; 

  // ၅။ အရောင်းရဆုံး ပစ္စည်းများ (Hot Sale Items)
  const itemStats = {};
  currentSales.forEach(sale => {
    if (!itemStats[sale.item_name]) {
      itemStats[sale.item_name] = { name: sale.item_name, count: 0, revenue: 0 };
    }
    itemStats[sale.item_name].count += 1;
    itemStats[sale.item_name].revenue += Number(sale.selling_price);
  });

  const hotSaleItems = Object.values(itemStats)
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl font-bold text-blue-600 animate-pulse">
          Database မှ အချက်အလက်များ တွက်ချက်နေပါသည်...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      
      {/* Header နှင့် လရွေးချယ်ရန် Dropdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0 flex items-center gap-2">
          <span>📊</span> ခြုံငုံသုံးသပ်ချက် (Live Dashboard 🟢)
        </h2>
        
        <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <label className="text-sm font-semibold text-gray-600 mr-3 whitespace-nowrap">လရွေးချယ်ရန် :</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-blue-700 font-bold focus:outline-none cursor-pointer"
          >
            {!availableMonths.includes(currentMonthStr) && (
              <option value={currentMonthStr}>{formatMonthToBurmese(currentMonthStr)}</option>
            )}
            {availableMonths.map(month => (
              <option key={month} value={month}>{formatMonthToBurmese(month)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* အပိုင်း (၁) - KPIs (ဝယ်ရင်းဈေး ကတ် ထပ်တိုးထားသည်) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border-l-4 border-blue-500 transition hover:-translate-y-1 hover:shadow-md">
          <h3 className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">စုစုပေါင်း ရောင်းရငွေ</h3>
          <p className="text-lg lg:text-xl font-bold text-blue-600 mt-2">{totalRevenue.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border-l-4 border-purple-500 transition hover:-translate-y-1 hover:shadow-md">
          <h3 className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">စုစုပေါင်း ဝယ်ရင်းဈေး</h3>
          <p className="text-lg lg:text-xl font-bold text-purple-600 mt-2">{totalBuyingPrice.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border-l-4 border-orange-500 transition hover:-translate-y-1 hover:shadow-md">
          <h3 className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">စုစုပေါင်း ကုန်ကျစရိတ်</h3>
          <p className="text-lg lg:text-xl font-bold text-orange-600 mt-2">{totalExpenses.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border-l-4 border-red-500 transition hover:-translate-y-1 hover:shadow-md">
          <h3 className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">စုစုပေါင်း ပြန်အမ်းငွေ</h3>
          <p className="text-lg lg:text-xl font-bold text-red-600 mt-2">{totalRefunds.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border-l-4 border-green-500 transition hover:-translate-y-1 hover:shadow-md col-span-2 md:col-span-1 lg:col-span-1">
          <h3 className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider">အသားတင်အမြတ်</h3>
          <p className={`text-xl lg:text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netProfit.toLocaleString()} Ks
          </p>
        </div>
      </div>

      {/* အပိုင်း (၂) - Hot Sale Items (အရောင်းရဆုံး ပစ္စည်းများ) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>🔥</span> အရောင်းရဆုံး ပစ္စည်းများ (Top 5 Items)
          </h3>
          <span className="text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full">
            {formatMonthToBurmese(selectedMonth)} အတွက်
          </span>
        </div>
        
        {hotSaleItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotSaleItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-red-50 rounded-lg border border-gray-100 transition-colors duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                    ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-300'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">ဝင်ငွေ: {item.revenue.toLocaleString()} Ks</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-lg font-black text-gray-800 leading-tight">{item.count}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ခု ရောင်းရသည်</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            ဤလအတွက် အရောင်းစာရင်း မရှိသေးပါ။
          </div>
        )}
      </div>

      {/* အပိုင်း (၃) - Charts (ဂရပ်ဖ်များ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Bar Chart - ရောင်းရငွေ၊ ဝယ်ရင်းဈေး နှင့် ကုန်ကျစရိတ် နှိုင်းယှဉ်ချက် */}
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">ဝင်ငွေ၊ အရင်း နှင့် ကုန်ကျစရိတ် နှိုင်းယှဉ်ချက်</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}} 
                  formatter={(value) => [`${value.toLocaleString()} Ks`, 'ပမာဏ']}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={50}>
                  {comparisonChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'ရောင်းရငွေ' ? '#3B82F6' : entry.name === 'ဝယ်ရင်းဈေး' ? '#A855F7' : '#F97316'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - ပစ္စည်းပြန်အမ်းမှု အချိုးအစား */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ပစ္စည်းပြန်အမ်းမှု အချိုးအစား</h3>
          <p className="text-xs text-gray-500 mb-4">({formatMonthToBurmese(selectedMonth)} အတွက်)</p>
          <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[250px]">
            {totalRevenue > 0 || totalRefunds > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={refundImpactData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {refundImpactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} Ks`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="flex justify-center gap-6 mt-4 w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                    <span className="text-sm font-medium text-gray-700">အရောင်း</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                    <span className="text-sm font-medium text-gray-700">ပြန်အမ်းငွေ</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-400 text-sm font-medium h-full flex items-center">
                ဤလအတွက် အရောင်းစာရင်း မရှိသေးပါ
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;