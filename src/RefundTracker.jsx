import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const RefundTracker = () => {
  const [refundData, setRefundData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filter အတွက် State
  const [filterMonth, setFilterMonth] = useState('');

  // Form အတွက် State များ
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState(0); // အရင်က တောင်းဆိုထားသည့်အတိုင်း Default 0 ထားပါသည်
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  const [condition, setCondition] = useState('Restockable');

  // Component စတင်ချိန်တွင် Database မှ Data များ လှမ်းယူခြင်း
  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('refunds')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Refund Data ယူရာတွင် အမှားဖြစ်နေပါသည်:", error);
    } else {
      setRefundData(data || []);
    }
    setIsLoading(false);
  };

  // Database သို့ Refund အသစ် သိမ်းဆည်းခြင်း
  const handleAddRefund = async (e) => {
    e.preventDefault();
    if (!itemName || qty <= 0 || !refundAmount) {
      alert('ကျေးဇူးပြု၍ ပစ္စည်းအမည်၊ အရေအတွက် (၀ ထက်ကြီးရမည်) နှင့် ပြန်အမ်းငွေပမာဏကို ပြည့်စုံစွာ ထည့်ပါ။');
      return;
    }

    setIsSaving(true);
    const newRefund = {
      date: date,
      invoice_no: invoiceNo,
      customer_name: customerName,
      item_name: itemName,
      qty: Number(qty),
      refund_amount: Number(refundAmount),
      reason: reason,
      condition: condition
    };

    const { data, error } = await supabase
      .from('refunds')
      .insert([newRefund])
      .select();

    if (error) {
      console.error("Data သိမ်းရာတွင် အမှားဖြစ်နေပါသည်:", error);
      alert('စာရင်းသွင်းရာတွင် အမှားအယွင်းဖြစ်ပွားခဲ့ပါသည်။');
    } else {
      setRefundData([data[0], ...refundData]);
      
      // Form ကို ရှင်းလင်းခြင်း (ရက်စွဲမှလွဲ၍)
      setInvoiceNo('');
      setCustomerName('');
      setItemName('');
      setQty(0);
      setRefundAmount('');
      setReason('');
      setCondition('Restockable');
      
      alert('ပြန်အမ်းစာရင်း သိမ်းဆည်းခြင်း အောင်မြင်ပါသည်။');
    }
    setIsSaving(false);
  };

  // Database မှ အချက်အလက် ဖျက်ခြင်း
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("ဒီပြန်အမ်းစာရင်းကို တကယ်ဖျက်မှာ သေချာပြီလား?");
    if (confirmDelete) {
      const { error } = await supabase
        .from('refunds')
        .delete()
        .eq('id', id);

      if (error) {
        alert('ဖျက်ရာတွင် အမှားအယွင်းဖြစ်ပွားခဲ့ပါသည်။');
      } else {
        setRefundData(refundData.filter(refund => refund.id !== id));
      }
    }
  };

  // ရွေးချယ်ထားသော လအလိုက် Data များကို စစ်ထုတ်ခြင်း
  const displayedRefunds = filterMonth 
    ? refundData.filter(refund => refund.date.substring(0, 7) === filterMonth) 
    : refundData;

  // တွက်ချက်မှုများ
  const totalRefundAmount = displayedRefunds.reduce((sum, row) => sum + Number(row.refund_amount), 0);
  const totalRestockableQty = displayedRefunds.reduce((sum, row) => row.condition === 'Restockable' ? sum + Number(row.qty) : sum, 0);
  const totalDamagedQty = displayedRefunds.reduce((sum, row) => row.condition === 'Damaged' ? sum + Number(row.qty) : sum, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>↩️</span> ပစ္စည်းပြန်အမ်းစာရင်း (Refund & Return Tracker)
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 transition-all duration-300">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            {filterMonth ? 'ရွေးချယ်ထားသောလ၏ ပြန်အမ်းငွေ' : 'စုစုပေါင်း ပြန်အမ်းငွေ'}
          </h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{totalRefundAmount.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 transition-all duration-300">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">ပြန်ရောင်းနိုင်သော အရေအတွက်</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{totalRestockableQty} ခု</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-600 transition-all duration-300">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">ပျက်စီး/ဆုံးရှုံး အရေအတွက်</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{totalDamagedQty} ခု</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-gray-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">ပြန်အမ်းစာရင်း အသစ်ထည့်ရန်</h3>
        <form onSubmit={handleAddRefund} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ရက်စွဲ</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-red-400" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ဘောက်ချာ No. (Option)</label>
            <input type="text" placeholder="INV-" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-red-400" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ဝယ်ယူသူ အမည်</label>
            <input type="text" placeholder="အမည်..." value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-red-400" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ပစ္စည်းအမည်</label>
            <input type="text" required placeholder="ဥပမာ - Mouse" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-red-400" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">အရေအတွက်</label>
            <input type="number" min="1" required value={qty} onChange={(e) => setQty(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-red-400" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ပြန်အမ်းငွေ (Ks)</label>
            <input type="number" min="0" required placeholder="0" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-red-400" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-600 mb-1">အကြောင်းရင်း</label>
            <input type="text" placeholder="ဘာကြောင့် ပြန်အမ်းရသလဲ..." value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-red-400" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-600 mb-1">ပစ္စည်းအခြေအနေ</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-red-400 bg-white">
              <option value="Restockable">ပြန်ရောင်းနိုင်သည်</option>
              <option value="Damaged">ပျက်စီး/ချို့ယွင်း</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button type="submit" disabled={isSaving} className="w-full bg-gray-800 hover:bg-black text-white font-bold py-2.5 px-4 rounded shadow transition disabled:opacity-50">
              {isSaving ? 'သိမ်းနေသည်...' : '+ စာရင်းသွင်းမည်'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Section & Data Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        
        {/* Month Filter UI */}
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-700 mb-3 sm:mb-0">ပစ္စည်းပြန်အမ်းမှု မှတ်တမ်းများ</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">လအလိုက်ကြည့်ရန်:</label>
            <input 
              type="month" 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)} 
              className="border border-gray-300 p-1.5 rounded focus:outline-none focus:border-red-400 text-sm cursor-pointer"
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
              Database မှ အချက်အလက်များကို ဆွဲယူနေပါသည်...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b font-bold">ရက်စွဲ</th>
                  <th className="p-4 border-b font-bold">ဝယ်ယူသူ</th>
                  <th className="p-4 border-b font-bold">ပစ္စည်းအမည်</th>
                  <th className="p-4 border-b font-bold text-center">အရေအတွက်</th>
                  <th className="p-4 border-b font-bold text-right">ပြန်အမ်းငွေ</th>
                  <th className="p-4 border-b font-bold">အခြေအနေ</th>
                  <th className="p-4 border-b font-bold text-center">လုပ်ဆောင်ချက်</th>
                </tr>
              </thead>
              <tbody>
                {displayedRefunds.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500 bg-gray-50">
                      {filterMonth ? 'ရွေးချယ်ထားသော လအတွက် ပြန်အမ်းစာရင်း မရှိသေးပါ။' : 'လက်ရှိတွင် ပြန်အမ်းစာရင်း မရှိသေးပါ။'}
                    </td>
                  </tr>
                ) : (
                  displayedRefunds.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 text-sm text-gray-600">{row.date}</td>
                      <td className="p-4 text-sm font-semibold text-gray-800">
                        {row.customer_name || '-'} <br/>
                        <span className="text-xs text-gray-500 font-normal">{row.invoice_no}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-800">
                        {row.item_name} <br/>
                        <span className="text-xs text-gray-500">{row.reason}</span>
                      </td>
                      <td className="p-4 text-center text-sm">{row.qty}</td>
                      <td className="p-4 text-right text-sm font-bold text-red-600">{Number(row.refund_amount).toLocaleString()}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${row.condition === 'Restockable' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                          {row.condition === 'Restockable' ? 'ပြန်ရောင်းနိုင်သည်' : 'ပျက်စီး/ချို့ယွင်း'}
                        </span>
                      </td>
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

export default RefundTracker;