import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Supabase ချိတ်ဆက်ခြင်း

const InvoiceGenerator = () => {
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNo: 'INV-' + Math.floor(Math.random() * 100000),
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerPhone: '',
    customerAddress: ''
  });

  const [items, setItems] = useState([{ id: 1, name: '', qty: 1, price: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [paperSize, setPaperSize] = useState('A4');
  const [isSaving, setIsSaving] = useState(false);

  const handleDetailChange = (e) => setInvoiceDetails({ ...invoiceDetails, [e.target.name]: e.target.value });
  const handleItemChange = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  const addItemRow = () => setItems([...items, { id: Date.now(), name: '', qty: 1, price: 0 }]);
  const removeItemRow = (id) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };

  const subTotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const grandTotal = subTotal - discount;

  // Database သို့ သိမ်းပြီးမှ Print ထုတ်မည့် Function
  const handleSaveAndPrint = async () => {
    if (!items[0].name) {
      alert("ကျေးဇူးပြု၍ ပစ္စည်းအမည် အနည်းဆုံးတစ်ခု ထည့်ပါ။"); return;
    }
    
    setIsSaving(true);
    const newInvoice = {
      invoice_no: invoiceDetails.invoiceNo,
      date: invoiceDetails.date,
      customer_name: invoiceDetails.customerName,
      customer_phone: invoiceDetails.customerPhone,
      customer_address: invoiceDetails.customerAddress,
      items: items, // JSONB အဖြစ် သိမ်းမည်
      sub_total: subTotal,
      discount: discount,
      grand_total: grandTotal
    };

    const { error } = await supabase.from('invoices').insert([newInvoice]);
    setIsSaving(false);

    if (error) {
      console.error(error);
      alert('ဘောက်ချာ သိမ်းဆည်းရာတွင် အမှားဖြစ်နေပါသည်။');
    } else {
      window.print(); // သိမ်းပြီးမှ Print ထုတ်မည်
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen py-8 flex flex-col items-center print:bg-white print:py-0">
      <div className="w-[210mm] max-w-full px-4 flex flex-col sm:flex-row justify-end items-center gap-4 mb-6 print:hidden">
        <div className="flex items-center bg-white px-4 py-2 rounded shadow-sm border border-gray-300">
          <label className="text-sm font-bold text-gray-700 mr-3 whitespace-nowrap">Paper Size :</label>
          <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="bg-transparent text-blue-700 font-bold focus:outline-none cursor-pointer outline-none">
            <option value="A4">A4 (Standard)</option>
            <option value="80mm">Thermal 80mm</option>
            <option value="58mm">Thermal 58mm</option>
          </select>
        </div>
        
        {/* Save & Print ခလုတ် */}
        <button onClick={handleSaveAndPrint} disabled={isSaving} className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-6 rounded shadow-lg flex items-center gap-2 transition disabled:opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          {isSaving ? 'သိမ်းဆည်းနေသည်...' : 'Save & Print'}
        </button>
      </div>

      {paperSize === 'A4' && (
        <div className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl flex flex-col print:shadow-none print:m-0 print:p-6 print:w-full print:min-h-0 print:h-auto text-gray-800 font-sans mx-auto box-border relative">
          <div className="border-b-2 border-gray-800 pb-5 mb-6">
            <h1 className="text-2xl font-extrabold text-blue-700 tracking-wide">Net Age Computers & IT Accessories</h1>
            <p className="text-sm text-gray-600 mt-1">No ( 5 ) , Yadanar Theinkha Street, Sangyi Qtr , Mingalardon Township , Yangon.</p>
            <p className="text-sm text-gray-600 font-medium mt-0.5">Phone: 09-943010284 , 09-750064261</p>
          </div>
          <div className="mb-6">
            <div className="border-b border-gray-300 pb-2 mb-4"><h3 className="font-bold text-gray-800 uppercase tracking-wide text-lg m-0">Invoice To</h3></div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex flex-col gap-3">
                <div className="flex items-center"><span className="w-20 text-sm font-semibold text-gray-700">Name:</span><input type="text" name="customerName" value={invoiceDetails.customerName} onChange={handleDetailChange} className="flex-1 border-b border-gray-400 bg-transparent focus:outline-none print:border-none py-1 text-sm text-gray-900" /></div>
                <div className="flex items-center"><span className="w-20 text-sm font-semibold text-gray-700">Address:</span><input type="text" name="customerAddress" value={invoiceDetails.customerAddress} onChange={handleDetailChange} className="flex-1 border-b border-gray-400 bg-transparent focus:outline-none print:border-none py-1 text-sm text-gray-900" /></div>
                <div className="flex items-center"><span className="w-20 text-sm font-semibold text-gray-700">Phone:</span><input type="text" name="customerPhone" value={invoiceDetails.customerPhone} onChange={handleDetailChange} className="flex-1 border-b border-gray-400 bg-transparent focus:outline-none print:border-none py-1 text-sm text-gray-900" /></div>
              </div>
              <div className="flex flex-col gap-3 pl-8">
                <div className="flex items-center"><span className="w-24 text-sm font-semibold text-gray-700">Invoice No:</span><input type="text" name="invoiceNo" value={invoiceDetails.invoiceNo} onChange={handleDetailChange} className="flex-1 border-b border-gray-400 bg-transparent focus:outline-none print:border-none font-medium py-1 text-sm text-gray-900" /></div>
                <div className="flex items-center"><span className="w-24 text-sm font-semibold text-gray-700">Date:</span><input type="date" name="date" value={invoiceDetails.date} onChange={handleDetailChange} className="flex-1 border-b border-gray-400 bg-transparent focus:outline-none print:border-none font-medium py-1 text-sm text-gray-900" /></div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <table className="w-full text-left mb-2 border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white print:bg-gray-200 print:text-black">
                  <th className="p-2 w-10 text-center border-b-2 border-gray-800 text-sm">No.</th>
                  <th className="p-2 border-b-2 border-gray-800 text-sm">Description</th>
                  <th className="p-2 w-20 text-center border-b-2 border-gray-800 text-sm">Qty</th>
                  <th className="p-2 w-28 text-right border-b-2 border-gray-800 text-sm">Price</th>
                  <th className="p-2 w-32 text-right border-b-2 border-gray-800 text-sm">Amount (Ks)</th>
                  <th className="p-2 w-8 text-center print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 print:hover:bg-transparent">
                    <td className="p-2 text-center text-sm">{index + 1}</td>
                    <td className="p-1"><input type="text" placeholder="Item Name..." value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="w-full p-1 bg-transparent focus:outline-none focus:bg-gray-100 border border-transparent rounded print:border-none print:p-0 text-sm" /></td>
                    <td className="p-1 text-center"><input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))} className="w-full p-1 text-center bg-transparent focus:outline-none focus:bg-gray-100 border border-transparent rounded print:border-none print:p-0 text-sm" /></td>
                    <td className="p-1 text-right"><input type="number" min="0" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} className="w-full p-1 text-right bg-transparent focus:outline-none focus:bg-gray-100 border border-transparent rounded print:border-none print:p-0 text-sm" /></td>
                    <td className="p-2 text-right font-medium text-sm">{(item.qty * item.price).toLocaleString()}</td>
                    <td className="p-1 text-center print:hidden"><button onClick={() => removeItemRow(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition" title="Remove Item"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addItemRow} className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 print:hidden bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition">+ Add Item</button>
          </div>
          <div className="flex justify-end mt-4 mb-8">
            <div className="w-[250px]">
              <div className="flex justify-between py-1.5 border-b"><span className="font-semibold text-gray-600 text-sm">Subtotal:</span><span className="font-semibold text-sm">{subTotal.toLocaleString()} Ks</span></div>
              <div className="flex justify-between py-1.5 border-b items-center print:hidden"><span className="font-semibold text-gray-600 text-sm">Discount:</span><div className="flex items-center"><input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-20 text-right border border-gray-300 p-0.5 rounded focus:outline-none focus:border-blue-500 text-sm" /><span className="ml-1 font-semibold text-sm">Ks</span></div></div>
              <div className="hidden print:flex justify-between py-1.5 border-b"><span className="font-semibold text-gray-600 text-sm">Discount:</span><span className="font-semibold text-sm">{discount.toLocaleString()} Ks</span></div>
              <div className="flex justify-between py-3 mt-1 border-t-2 border-gray-800 text-lg bg-gray-50 print:bg-transparent px-2 -mx-2"><span className="font-bold text-gray-800">Grand Total:</span><span className="font-bold text-blue-700">{grandTotal.toLocaleString()} Ks</span></div>
            </div>
          </div>
          <div className="mt-auto pt-8 pb-4 print:break-inside-avoid">
            <div className="flex justify-between items-end px-4"><div className="text-center w-48"><div className="border-t-2 border-gray-800 pt-2 font-semibold text-sm text-gray-800">Customer Signature</div></div><div className="text-center w-48"><div className="border-t-2 border-gray-800 pt-2 font-semibold text-sm text-gray-800">Authorized Signature</div></div></div>
            <div className="text-center w-full mt-16"><p className="font-bold text-gray-800 text-[15px] tracking-wide whitespace-nowrap">Thanks for shopping with us! We appreciate your trust.</p></div>
          </div>
        </div>
      )}

      {(paperSize === '80mm' || paperSize === '58mm') && (
        <div className={`bg-white shadow-2xl flex flex-col mx-auto box-border text-gray-900 font-sans print:shadow-none print:m-0 ${paperSize === '80mm' ? 'w-[80mm] p-[5mm] text-sm print:w-[80mm] print:p-0' : 'w-[58mm] p-[3mm] text-[11px] print:w-[58mm] print:p-0'}`}>
          <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2"><h2 className="font-extrabold uppercase tracking-tight">Net Age Computers</h2><p className="opacity-80 mt-1">Yadanar Theinkha St, Mingalardon Tsp</p><p className="opacity-80">Ph: 09-943010284</p></div>
          <div className="border-b border-dashed border-gray-400 pb-2 mb-2 flex flex-col gap-1">
            <div className="flex items-center"><span className="font-semibold mr-1">Inv:</span><input type="text" name="invoiceNo" value={invoiceDetails.invoiceNo} onChange={handleDetailChange} className="w-full bg-transparent focus:outline-none print:p-0" /></div>
            <div className="flex items-center"><span className="font-semibold mr-1">Date:</span><input type="date" name="date" value={invoiceDetails.date} onChange={handleDetailChange} className="w-full bg-transparent focus:outline-none print:p-0" /></div>
            <div className="flex items-center"><span className="font-semibold mr-1">To:</span><input type="text" name="customerName" placeholder="Customer Name" value={invoiceDetails.customerName} onChange={handleDetailChange} className="w-full bg-transparent focus:outline-none print:p-0" /></div>
          </div>
          <div className="w-full flex flex-col gap-2">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col border-b border-gray-200 pb-1 print:border-none print:pb-0">
                <div className="flex items-start"><span className="mr-1">{index + 1}.</span><input type="text" placeholder="Item Name..." value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="w-full bg-transparent focus:outline-none focus:bg-gray-100 font-semibold print:bg-transparent" /><button onClick={() => removeItemRow(item.id)} className="print:hidden text-red-500 hover:bg-red-100 px-1 rounded ml-1 text-xs">x</button></div>
                <div className="flex justify-between items-center pl-4 mt-0.5 opacity-90"><div className="flex items-center gap-1"><input type="number" min="1" value={item.qty} onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))} className="w-8 text-center bg-transparent focus:outline-none focus:bg-gray-100 border-b print:border-none" /><span>x</span><input type="number" min="0" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} className="w-16 text-right bg-transparent focus:outline-none focus:bg-gray-100 border-b print:border-none" /></div><span className="font-bold">{(item.qty * item.price).toLocaleString()}</span></div>
              </div>
            ))}
            <button onClick={addItemRow} className="mt-1 text-blue-600 font-medium flex items-center justify-center print:hidden bg-blue-50 py-1 rounded">+ Add Item</button>
          </div>
          <div className="border-t border-dashed border-gray-400 mt-2 pt-2 flex flex-col gap-1">
            <div className="flex justify-between"><span>Subtotal:</span><span>{subTotal.toLocaleString()}</span></div>
            <div className="flex justify-between items-center print:hidden"><span>Discount:</span><div className="flex items-center"><input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-16 text-right bg-transparent border-b border-gray-400 focus:outline-none focus:border-blue-500 p-0" /></div></div>
            <div className="hidden print:flex justify-between"><span>Discount:</span><span>{discount > 0 ? discount.toLocaleString() : '0'}</span></div>
            <div className="flex justify-between font-extrabold text-base mt-1 border-t border-gray-800 pt-1"><span>Total Ks:</span><span>{grandTotal.toLocaleString()}</span></div>
          </div>
          <div className="text-center mt-6 mb-2 font-bold opacity-80 flex flex-col items-center"><p>*** Thank You! ***</p></div>
        </div>
      )}
    </div>
  );
};

export default InvoiceGenerator;