import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface Profil {
  id: string;
  username: string | null;
  email: string | null;
  role: string;
}

interface AuthState {
  user: User | null;
  profil: Profil | null;
  laden: boolean;
  abmelden: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profil: null,
  laden: true,
  abmelden: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLaden(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfil(null);
      return;
    }
    supabase
      .from("profiles")
      .select("id, username, email, role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfil((data as Profil) ?? null));
  }, [user?.id]);

  const abmelden = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profil, laden, abmelden }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
