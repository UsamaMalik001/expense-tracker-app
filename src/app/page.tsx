"use client";

import AuthForm from "@/components/auth/AuthForm";
import ExpensesPage from "@/components/Expenses/ExpensesModal";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log("Current session:", currentSession);
    setSession(currentSession.data.session);
  };

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      {session ? (
        <>
          <ExpensesPage session={session} />
        </>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}
