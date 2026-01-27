import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './lib/supabaseClient';

// Import Page Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MeTab from './pages/MeTab';

// 1. Create a sub-component for Login to isolate the Auth Hook logic
function LoginScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-black text-center text-blue-600 mb-8 tracking-tighter">learnXchange</h1>
        <Auth 
          supabaseClient={supabase} 
          appearance={{ theme: ThemeSupa }} 
          providers={['google']} 
        />
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Prevent hooks from firing before we know the session state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-bold text-blue-600">
        Syncing learnXchange...
      </div>
    );
  }

  // If no user is logged in, show the LoginScreen sub-component
  if (!session) {
    return <LoginScreen />;
  }

  // If logged in, show the actual app
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar balance={100} />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/me" element={<MeTab session={session} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}