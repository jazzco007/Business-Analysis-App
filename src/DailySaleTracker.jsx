import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const DailySaleTracker = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Laptops'); 
  const [paymentMethod, setPaymentMethod] = useState('Cash'); 
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  
  // Table တွင် လအလိုက် စစ်ထုတ်ရန် State
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('daily_sales')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (!error) setSales(data || []);
    setLoading(false);
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // 🔴 အမြတ်ငွေကို ကြိုတင်တွက်ချက်ခြင်း
    const calculatedProfit = Number(sellingPrice) - Number(buyingPrice);

    const newSale = {
      date: date,
      item_name: itemName.trim(),
      category: category,
      payment_method: paymentMethod, 
      buying_price: Number(buyingPrice),
      selling_price: Number(sellingPrice),
      profit: calculatedProfit // 🔴 Database က တောင်းနေသော အမြတ်ငွေကိုပါ တစ်ပါတည်း ပို့ပေးလိုက်ပါပြီ
    };

    const { data, error } = await supabase
      .from('daily_sales')
      .insert([newSale])
      .select();

    if (error) {
      alert('Supabase Error: ' + error.message);
      console.error(error);
    } else {
      setSales([data[0], ...sales]);
      setItemName('');
      setBuyingPrice('');
      setSellingPrice('');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('ဤစာရင်းကို ဖျက်ရန် သေချာပါသလား?')) {
      const { error } = await supabase.from('daily_sales').delete().eq('id', id);
      if (!error) {
        setSales(sales.filter(sale => sale.id !== id));
      }
    }
  };

  const filteredSales = sales.filter(sale => sale.date.startsWith(filterMonth));
  const totalSales = filteredSales.reduce((sum, item) => sum + Number(item.selling_price), 0);
  const totalProfit = filteredSales.reduce((sum, item) => sum + (Number(item.selling_price) - Number(item.buying_price)), 0);
  const totalQty = filteredSales.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>💰</span> နေ့စဉ် အရောင်းမှတ်တမ်း
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">စုစုပေါင်း ရောင်းရငွေ</h3>
          <p className="text-3xl font-bold text-blue-600">{totalSales.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">စုစုပေါင်း အမြတ်ငွေ</h3>
          <p className="text-3xl font-bold text-green-500">{totalProfit.toLocaleString()} Ks</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-gray-600">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">ရောင်းရသည့် အရေအတွက်</h3>
          <p className="text-3xl font-bold text-gray-800">{totalQty} ခု</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6">အရောင်းစာရင်း အသစ်ထည့်ရန်</h3>
        <form onSubmit={handleAddSale} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-600 mb-1">ရက်စွဲ</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 mb-1">ပစ္စည်းအမည်</label>
            <input type="text" required value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" placeholder="ဥပမာ - Dell Latitude 7490" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-600 mb-1">အမျိုးအစား</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 bg-white">
              <option value="Laptops">Laptops</option>
              <option value="Accessories">Accessories</option>
              <option value="Desktops">Desktops</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-600 mb-1">ငွေချေစနစ်</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 bg-white">
              <option value="Cash">Cash</option>
              <option value="KPay">KPay</option>
              <option value="WavePay">WavePay</option>
              <option value="CBPay">CBPay</option>
              <option value="COD">COD</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-600 mb-1">ဝယ်ရင်းဈေး (Ks)</label>
            <input type="number" min="0" required value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" placeholder="0" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-600 mb-1">ရောင်းဈေး (Ks)</label>
            <input type="number" min="0" required value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500" placeholder="0" />
          </div>

          <div className="md:col-span-7 mt-2">
            <button type="submit" disabled={isSaving} className="bg-[#1a2b3c] hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded shadow transition disabled:opacity-50">
              {isSaving ? 'သိမ်းဆည်းနေသည်...' : '+ စာရင်းသွင်းမည်'}
            </button>
          </div>

        </form>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">အရောင်းမှတ်တမ်းများ</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-semibold">လအလိုက်ကြည့်ရန်:</label>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border border-gray-300 p-1.5 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500 font-semibold animate-pulse">ဒေတာများ ဆွဲယူနေပါသည်...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider border-b">
                  <th className="p-4">ရက်စွဲ</th>
                  <th className="p-4">ပစ္စည်းအမည်</th>
                  <th className="p-4 text-center">အမျိုးအစား</th>
                  <th className="p-4 text-center">ငွေချေစနစ်</th> 
                  <th className="p-4 text-right">ဝယ်ရင်းဈေး</th>
                  <th className="p-4 text-right">ရောင်းဈေး</th>
                  <th className="p-4 text-right">အမြတ်ငွေ</th>
                  <th className="p-4 text-center">လုပ်ဆောင်ချက်</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr><td colSpan="8" className="p-8 text-center text-gray-500">ဤလအတွက် အရောင်းစာရင်း မရှိသေးပါ။</td></tr>
                ) : (
                  filteredSales.map((sale) => {
                    const profit = Number(sale.selling_price) - Number(sale.buying_price);
                    return (
                      <tr key={sale.id} className="border-b hover:bg-gray-50 text-sm">
                        <td className="p-4 text-gray-600">{sale.date}</td>
                        <td className="p-4 font-bold text-gray-800">{sale.item_name}</td>
                        <td className="p-4 text-center">
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{sale.category}</span>
                        </td>
                        <td className="p-4 text-center text-gray-600 font-semibold">{sale.payment_method || 'Cash'}</td> 
                        <td className="p-4 text-right text-gray-600">{Number(sale.buying_price).toLocaleString()}</td>
                        <td className="p-4 text-right font-bold text-blue-600">{Number(sale.selling_price).toLocaleString()}</td>
                        <td className="p-4 text-right font-bold text-green-600">{profit.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDelete(sale.id)} className="text-red-500 hover:text-red-700 font-bold text-xs">
                            ဖျက်မည်
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySaleTracker;