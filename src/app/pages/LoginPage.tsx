import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect based on user role after successful login
  useEffect(() => {
    if (loginSuccess && user) {
      const redirectPath = user.role === 'admin' ? '/dashboard/admin' : '/courses';
      navigate(redirectPath);
    }
  }, [loginSuccess, user, navigate]);

  useEffect(() => {
    // Pre-fill email if coming from confirm-email page
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!email || !password) {
        toast.error('Please enter email and password');
        setIsLoading(false);
        return;
      }

      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back!');
        setLoginSuccess(true);
      } else {
        // Check if error is about email not being confirmed
        if (result.error?.includes('email') || result.error?.toLowerCase().includes('confirm')) {
          toast.error(result.error || 'Please confirm your email first');
          // Redirect to confirm-email page
          setTimeout(() => navigate('/confirm-email', { state: { email } }), 1000);
        } else {
          toast.error(result.error || 'Invalid email or password');
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'An error occurred during login';
      
      // Handle email-not-confirmed error
      if (errorMsg.includes('email') || errorMsg.toLowerCase().includes('confirm')) {
        toast.error('Please confirm your email first');
        setTimeout(() => navigate('/confirm-email', { state: { email } }), 1000);
      } else {
        toast.error(errorMsg);
        setIsLoading(false);
      }
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 z-20">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-[#7A766F] hover:bg-red-50 hover:text-red-600 rounded-lg text-[13px] h-8">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-[380px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500 mb-4">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-[#1A1F2E] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Welcome back</h1>
          <p className="text-sm text-[#7A766F]">Sign in to continue learning</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E2DC] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] text-[#1A1F2E]">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-lg border-[#E5E2DC] bg-[#F7F6F3] focus:bg-white focus:border-amber-400 focus:border-2 text-sm" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] text-[#1A1F2E]">Password</Label>
              <Input id="password" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 rounded-lg border-[#E5E2DC] bg-[#F7F6F3] focus:bg-white focus:border-amber-400 focus:border-2 text-sm" required />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight className="ml-2 w-3.5 h-3.5" />
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#E5E2DC]/50">
            <p className="text-center text-sm text-[#7A766F]">
              Don't have an account? <Link to="/signup" className="text-red-600 font-medium hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}