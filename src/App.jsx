import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';

import Dashboard from './Dashboard';
import DailySaleTracker from './DailySaleTracker';
import MonthlyOpExTracker from './MonthlyOpExTracker';
import RefundTracker from './RefundTracker';
import InvoiceGenerator from './InvoiceGenerator';
import InvoiceViewer from './InvoiceViewer';
import AnnualReport from './AnnualReport';

const App = () => {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout Error:", error.message);
  };

  if (!session) {
    return <Login />;
  }

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'ခြုံငုံသုံးသပ်ချက် (Dashboard)' },
    { id: 'dailySale', icon: '💰', label: 'နေ့စဉ် အရောင်းမှတ်တမ်း' },
    { id: 'monthlyOpEx', icon: '📉', label: 'လစဉ် ကုန်ကျစရိတ်' },
    { id: 'refund', icon: '↩️', label: 'ပြန်အမ်းစာရင်း' },
    { id: 'invoice', icon: '🧾', label: 'ဘောက်ချာ ထုတ်ရန်' },
    { id: 'invoiceViewer', icon: '🔍', label: 'ဘောက်ချာ ရှာဖွေရန်' },
    { id: 'annualReport', icon: '📑', label: 'နှစ်ချုပ် အစီရင်ခံစာ' }
  ];

  return (
    <div className="flex h-screen w-full bg-gray-100 font-sans overflow-hidden print:h-auto print:overflow-visible print:block">
      
      <aside className="w-64 h-full bg-gray-900 text-white flex flex-col shadow-2xl print:hidden flex-shrink-0 z-20">
        <div className="p-6 border-b border-gray-800 text-center flex-shrink-0">
          <h1 className="text-lg font-black tracking-wide text-blue-400">NET AGE - Aung Pyae</h1>
          <p className="text-[11px] text-gray-400 font-medium tracking-widest mt-1 uppercase">Business Analysis</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveTab(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                activeTab === menu.id 
                  ? 'bg-blue-600 text-white shadow-lg transform translate-x-1' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{menu.icon}</span>
              <span className="text-sm">{menu.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 text-center bg-gray-900 flex-shrink-0">
          <p className="text-xs text-gray-400 mb-3 truncate">Logged in as: {session?.user?.email || "Admin"}</p>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <span>🚪</span> ထွက်မည် (Logout)
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-x-hidden overflow-y-auto bg-gray-50 relative print:h-auto print:overflow-visible print:block">
        <div className="w-full min-h-full print:block">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'dailySale' && <DailySaleTracker />}
          {activeTab === 'monthlyOpEx' && <MonthlyOpExTracker />}
          {activeTab === 'refund' && <RefundTracker />}
          {activeTab === 'invoice' && <InvoiceGenerator />}
          {activeTab === 'invoiceViewer' && <InvoiceViewer />}
          {activeTab === 'annualReport' && <AnnualReport />}
        </div>
      </main>

    </div>
  );
};

export default App;