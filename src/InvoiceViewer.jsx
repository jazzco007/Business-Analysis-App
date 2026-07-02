import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const InvoiceViewer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setErrorMsg('');
    setInvoice(null);

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('invoice_no', searchQuery.trim())
      .single(); // တစ်ခုတည်းသာ ယူမည်

    if (error || !data) {
      setErrorMsg('ဘောက်ချာနံပါတ် ရှာမတွေ့ပါ။ အသေအချာ ပြန်စစ်ဆေးပါ။');
    } else {
      setInvoice(data);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>🔍</span> ဘောက်ချာ ရှာဖွေရန်
      </h2>

      {/* Search Box */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-600 mb-2">Invoice No. ရိုက်ထည့်ပါ</label>
            <input 
              type="text" 
              placeholder="ဥပမာ - INV-12345" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold" 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow transition disabled:opacity-50">
            {loading ? 'ရှာဖွေနေသည်...' : 'ရှာမည်'}
          </button>
        </form>
        {errorMsg && <p className="mt-4 text-red-500 font-medium">{errorMsg}</p>}
      </div>

      {/* Result Display */}
      {invoice && (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto border-t-8 border-blue-800">
          <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">INVOICE DETAILS</h1>
              <p className="text-blue-600 font-bold mt-1 text-lg">{invoice.invoice_no}</p>
            </div>
            <div className="text-right text-gray-600">
              <p className="font-semibold">Date: <span className="text-gray-800">{invoice.date}</span></p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-700 uppercase mb-2 border-b pb-1">Customer Info</h3>
            <p><span className="font-semibold text-gray-600 w-20 inline-block">Name:</span> {invoice.customer_name || '-'}</p>
            <p><span className="font-semibold text-gray-600 w-20 inline-block">Phone:</span> {invoice.customer_phone || '-'}</p>
            <p><span className="font-semibold text-gray-600 w-20 inline-block">Address:</span> {invoice.customer_address || '-'}</p>
          </div>

          <table className="w-full text-left mb-6">
            <thead>
              <tr className="bg-gray-800 text-white text-sm">
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Price (Ks)</th>
                <th className="p-3 text-right">Amount (Ks)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-3 font-medium text-gray-800">{item.name}</td>
                  <td className="p-3 text-center">{item.qty}</td>
                  <td className="p-3 text-right text-gray-600">{Number(item.price).toLocaleString()}</td>
                  <td className="p-3 text-right font-bold text-gray-800">{(item.qty * item.price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end text-right">
            <div className="w-64">
              <div className="flex justify-between py-2 text-gray-600"><span className="font-semibold">Subtotal:</span><span>{Number(invoice.sub_total).toLocaleString()} Ks</span></div>
              <div className="flex justify-between py-2 text-gray-600 border-b"><span className="font-semibold">Discount:</span><span>{Number(invoice.discount).toLocaleString()} Ks</span></div>
              <div className="flex justify-between py-3 text-xl"><span className="font-bold text-gray-800">Total:</span><span className="font-bold text-blue-700">{Number(invoice.grand_total).toLocaleString()} Ks</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceViewer;