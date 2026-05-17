import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/* ============================================================================
   ProtectedRoute — small route guard.

   Wrap any route element that requires an authenticated user:

     <Route path="/konto" element={<ProtectedRoute><Konto /></ProtectedRoute>} />

   While the auth state is still loading, render nothing (briefly) so we don't
   flash the public landing page. Once known:
     • signed in     → render children
     • signed out    → redirect to /anmelden?next=<originally-requested path>
       so the user lands back where they tried to go after signing in.
   ========================================================================= */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  // Until the initial session has been read, render nothing. This prevents the
  // "signed-out redirect → signed-in user" flicker on first paint.
  if (isLoading) return null;

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/anmelden?next=${next}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
