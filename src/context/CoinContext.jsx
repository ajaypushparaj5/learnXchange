import React, { createContext, useContext, useState, useEffect } from 'react'; // Added useState and useEffect here
import { supabase } from '../lib/supabaseClient';

const CoinContext = createContext();

export function CoinProvider({ children }) {
  const [balance, setBalance] = useState(0);

  // Helper to fetch balance
  const fetchBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('coin_balance')
      .eq('id', user.id)
      .single();
    
    if (data) setBalance(data.coin_balance);
  };

  // Initial load
  useEffect(() => {
    fetchBalance();

    // Listen for database changes (Real-time updates)
    const channel = supabase
      .channel('realtime_balance')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, 
      () => fetchBalance())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <CoinContext.Provider value={{ balance, fetchBalance }}>
      {children}
    </CoinContext.Provider>
  );
}

// At the bottom of CoinContext.jsx
export const useCoins = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error("useCoins must be used within a CoinProvider");
  }
  return context;
};