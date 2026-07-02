import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const MonthlyOpExTracker = () => {
  const [expensesData, setExpensesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filter အတွက် State (လအလိုက် ရွေးချယ်ရန်)
  const [filterMonth, setFilterMonth] = useState('');

  // Form အတွက် State များ
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('အထွေထွေ (General)');

  // Component စတင်ချိန်တွင် Database မှ Data များ လှမ်းယူခြင်း
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("ကုန်ကျစရိတ် Data ယူရာတွင် အမှားဖြစ်နေပါသည်:", error);
    } else {
      setExpensesData(data || []);
    }
    setIsLoading(false);
  };

  // Database သို့ ကုန်ကျစရိတ် အသစ် သိမ်းဆည်းခြင်း
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description || !amount) {
      alert('ကျေးဇူးပြု၍ အသုံးစရိတ် အကြောင်းအရာ နှင့် ပမာဏကို ထည့်ပါ။');
      return;
    }

    setIsSaving(true);
    const newExpense = {
      date: date,
      description: description,
      amount: Number(amount),
      category: category
    };

    const { data, error } = await supabase
      .from('expenses')
      .insert([newExpense])
      .select();

    if (error) {
      console.error("Data သိမ်းရာတွင် အမှားဖြစ်နေပါသည်:", error);
      alert('စာရင်းသွင်းရာတွင် အမှားအယွင်းဖြစ်ပွားခဲ့ပါသည်။');
    } else {
      setExpensesData([data[0], ...expensesData]);
      setDescription('');
      setAmount('');
      alert('ကုန်ကျစရိတ် မှတ်တမ်းတင်ခြင်း အောင်မြင်ပါသည်။');
    }
    setIsSaving(false);
  };

  // Database မှ အချက်အလက် ဖျက်ခြင်း
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("ဒီကုန်ကျစရိတ် စာရင်းကို တကယ်ဖျက်မှာ သေချာပြီလား?");
    if (confirmDelete) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        alert('ဖျက်ရာတွင် အမှားအယွင်းဖြစ်ပွားခဲ့ပါသည်။');
      } else {
        setExpensesData(expensesData.filter(expense => expense.id !== id));
      }
    }
  };

  // ရွေးချယ်ထားသော လအလိုက် Data များကို စစ်ထုတ်ခြင်း (Filtering)
  const displayedExpenses = filterMonth 
    ? expensesData.filter(expense => expense.date.substring(0, 7) === filterMonth) 
    : expensesData;

  // စစ်ထုတ်ထားသော Data များပေါ်မူတည်၍ စုစုပေါင်း ကုန်ကျစရိတ် တွက်ချက်ခြင်း
  const totalExpenses = displayedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>📉</span> လစဉ် ကုန်ကျစရိတ် မှတ်တမ်း
      </h2>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500 md:col-span-1 transition-all duration-300">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            {filterMonth ? 'ရွေးချယ်ထားသောလ၏ ကုန်ကျစရိတ်' : 'စုစုပေါင်း ကုန်ကျစရိတ်'}
          </h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">{totalExpenses.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-500 md:col-span-2 flex items-center">
          <p className="text-gray-600 text-sm">
            လုပ်ငန်းလည်ပတ်မှုအတွက် နေ့စဉ်/လစဉ် အသုံးပြုထားသော ငွေကြေးများကို ဤနေရာတွင် စနစ်တကျ မှတ်တမ်းတင်ထားနိုင်ပါသည်။ ထည့်သွင်းထားသော အချက်အလက်များကို Database တွင် လုံခြုံစွာ သိမ်းဆည်းထားမည် ဖြစ်ပါသည်။
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">အသုံးစရိတ် အသစ်ထည့်ရန်</h3>
        <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ရက်စွဲ</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-orange-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">အကြောင်းအရာ (Description)</label>
            <input type="text" required placeholder="ဥပမာ - မီတာခ, ဝန်ထမ်းလစာ..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-orange-500" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">အမျိုးအစား (Category)</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-orange-500 bg-white">
              <option value="ရုံးခန်းစရိတ် (Office)">ရုံးခန်းစရိတ် (Office)</option>
              <option value="လစာငွေ (Salary)">လစာငွေ (Salary)</option>
              <option value="သယ်ယူပို့ဆောင်ရေး (Transport)">သယ်ယူပို့ဆောင်ရေး (Transport)</option>
              <option value="ဈေးကွက်ရှာဖွေရေး (Marketing)">ဈေးကွက်ရှာဖွေရေး (Marketing)</option>
              <option value="အထွေထွေ (General)">အထွေထွေ (General)</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ပမာဏ (Ks)</label>
            <input type="number" min="0" required placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-orange-500" />
          </div>

          <div className="md:col-span-5 mt-2">
            <button type="submit" disabled={isSaving} className="w-full md:w-auto bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-8 rounded shadow transition disabled:opacity-50">
              {isSaving ? 'သိမ်းဆည်းနေသည်...' : '+ ကုန်ကျစရိတ် စာရင်းသွင်းမည်'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Section & Data Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        
        {/* Month Filter UI */}
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-700 mb-3 sm:mb-0">ကုန်ကျစရိတ် မှတ်တမ်းများ</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">လအလိုက်ကြည့်ရန်:</label>
            <input 
              type="month" 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)} 
              className="border border-gray-300 p-1.5 rounded focus:outline-none focus:border-orange-500 text-sm cursor-pointer"
            />
            {filterMonth && (
              <button 
                onClick={() => setFilterMonth('')} 
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-2 rounded transition whitespace-nowrap"
              >
                ✖ အားလုံးပြပါ
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">
              Database မှ အသုံးစရိတ်များကို ဆွဲယူနေပါသည်...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b font-bold w-32">ရက်စွဲ</th>
                  <th className="p-4 border-b font-bold">အကြောင်းအရာ</th>
                  <th className="p-4 border-b font-bold">အမျိုးအစား</th>
                  <th className="p-4 border-b font-bold text-right w-40">ပမာဏ (Ks)</th>
                  <th className="p-4 border-b font-bold text-center w-24">လုပ်ဆောင်ချက်</th>
                </tr>
              </thead>
              <tbody>
                {displayedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 bg-gray-50">
                      {filterMonth ? 'ရွေးချယ်ထားသော လအတွက် ကုန်ကျစရိတ် မှတ်တမ်း မရှိသေးပါ။' : 'လက်ရှိတွင် ကုန်ကျစရိတ် မှတ်တမ်း မရှိသေးပါ။'}
                    </td>
                  </tr>
                ) : (
                  displayedExpenses.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 text-sm text-gray-600">{row.date}</td>
                      <td className="p-4 text-sm font-semibold text-gray-800">{row.description}</td>
                      <td className="p-4 text-sm">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                          {row.category}
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm font-bold text-orange-600">{Number(row.amount).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition text-xs font-semibold">
                          ဖျက်မည်
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyOpExTracker;