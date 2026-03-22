import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../utils/supabase/client';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get email from location state or localStorage
  useEffect(() => {
    const state = location.state as { email?: string };
    const storedEmail = localStorage.getItem('signupEmail');
    const emailToUse = state?.email || storedEmail;
    
    if (emailToUse) {
      setEmail(emailToUse);
      localStorage.setItem('signupEmail', emailToUse);
    } else {
      navigate('/signup');
    }
  }, [location, navigate]);

  const handleResendEmail = async () => {
    if (!email || !canResend) return;

    try {
      setCanResend(false);
      // Resend confirmation email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast.error('Failed to resend email. Please try again.');
        setCanResend(true);
        return;
      }

      setResendCount(prev => prev + 1);
      toast.success('Confirmation email resent!');
      
      // Re-enable after 30 seconds
      setTimeout(() => setCanResend(true), 30000);
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('Failed to resend email');
      setCanResend(true);
    }
  };

  const handleGoBack = () => {
    localStorage.removeItem('signupEmail');
    navigate('/signup');
  };

  const handleProceedToLogin = () => {
    setIsRedirecting(true);
    toast.success('Proceeding to login...');
    setTimeout(() => {
      navigate('/login', { state: { email } });
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-[#E5E2DC] p-8 shadow-lg">
          {/* Icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
              <Mail className="w-10 h-10 text-amber-500" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 text-slate-900">
              Confirm Your Email
            </h1>
            <p className="text-slate-600 mb-2">
              We've sent a confirmation email to:
            </p>
            <p className="text-lg font-semibold text-red-600 mb-4">{email || 'your email'}</p>
            <p className="text-slate-600 text-sm">
              Click the link in the email to verify your account.
            </p>
          </div>

          {/* Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="font-semibold text-blue-900 mb-3">Steps:</p>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>✓ Check your email inbox</li>
              <li>✓ Click the verification link</li>
              <li>✓ Return here and proceed to login</li>
            </ol>
          </div>

          {/* Didn't receive email */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-amber-900 mb-3">
              <strong>Didn't receive the email?</strong>
            </p>
            <ul className="text-sm text-amber-800 space-y-2 mb-4">
              <li>✓ Check your spam/junk folder</li>
              <li>✓ Check that you entered the correct email address</li>
            </ul>
            <Button
              onClick={handleResendEmail}
              disabled={!canResend || resendCount >= 3}
              variant="outline"
              className="w-full text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              {resendCount >= 3 ? 'Too many attempts' : canResend ? 'Resend Email' : 'Resending...'}
            </Button>
            {resendCount > 0 && resendCount < 3 && (
              <p className="text-xs text-amber-700 mt-2 text-center">
                Resent {resendCount} time{resendCount > 1 ? 's' : ''} • Can resend in 30 seconds
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleProceedToLogin}
              disabled={isRedirecting}
              className="w-full bg-red-500 hover:bg-red-600 text-white h-10"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Redirecting...
                </>
              ) : (
                "I've Confirmed My Email"
              )}
            </Button>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              Back to Sign Up
            </Button>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 text-center text-sm text-slate-600 px-4">
          <p>
            After confirming your email, you'll be able to sign in with your new account.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
