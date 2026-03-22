import { Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from '../components/ui/sonner';
import AIAssistant from '../components/AIAssistant';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function RootContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If authenticated and on homepage, redirect to courses
    if (isAuthenticated && !isLoading && location.pathname === '/') {
      navigate('/courses', { replace: true });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen relative bg-white">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-white" />
          <div className="absolute top-[-20%] right-[-8%] w-[500px] h-[500px] rounded-full bg-red-100/30 blur-[80px]" />
          <div className="absolute bottom-[-15%] left-[-6%] w-[450px] h-[450px] rounded-full bg-amber-100/25 blur-[70px]" />
        </div>
        <div className="relative z-10">
          {isLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-red-100 border-t-red-500 animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Loading...</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
        <AIAssistant />
        <Toaster position="top-right" richColors />
      </div>
    </>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}
