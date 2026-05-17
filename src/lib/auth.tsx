import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/* ============================================================================
   Auth context + useAuth hook — single source of truth for "who is signed in"
   across the helvi app.

   How it works:
     • On mount, AuthProvider reads the existing session synchronously from
       Supabase (which itself reads it from localStorage — see the client
       config in src/integrations/supabase/client.ts).
     • It then subscribes to supabase.auth.onAuthStateChange so the rest of the
       app reactively rerenders when the user signs in, signs out, or when
       Supabase auto-refreshes the access token.
     • Consumers call `useAuth()` to read `{ session, user, isLoading, signOut }`.

   Why a single provider rather than per-component `useEffect`s:
     • Avoids subscribing to onAuthStateChange in many places (each
       subscription would re-render its component on every token refresh —
       wasteful and easy to forget to clean up).
     • Gives the rest of the app a consistent "auth loading" state, so
       ProtectedRoute can hold its render until we actually know whether the
       user is signed in.
   ========================================================================= */

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  // `isLoading` stays true until we've read the initial session at least once
  // — protects against a flash of "signed out" UI on first paint.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Read whatever session Supabase already has cached locally.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsLoading(false);
    });

    // 2. Keep the session reactive: any sign-in, sign-out, or token refresh
    //    flips state through here.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will fire SIGNED_OUT and clear `session` reactively.
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, user: session?.user ?? null, isLoading, signOut }),
    [session, isLoading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Lightweight consumer hook. Throws if used outside <AuthProvider> — that's a
// developer mistake, not a runtime fallback to handle.
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
};
