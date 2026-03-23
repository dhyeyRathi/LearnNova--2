import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router';
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase, resendConfirmationEmail, verifyEmailToken } from '../../utils/supabase/client';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Handle email verification flow
  useEffect(() => {
    const verifyEmailConfirmation = async () => {
      try {
        setIsVerifying(true);
        
        // Check if user is already authenticated (Supabase set session after verification)
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        console.log('=== Email Verification Debug ===');
        console.log('Full URL:', window.location.href);
        console.log('Auth User:', authUser?.email);
        console.log('Auth Error:', authError);
        
        // If user is authenticated, they successfully verified their email
        if (authUser?.email && authUser?.email_confirmed_at) {
          console.log('User already verified via Supabase session:', authUser.email);
          setEmail(authUser.email);
          
          // Update database to mark as verified
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .single();
            
            if (!profileError && profile && !profile.is_verified) {
              await supabase
                .from('users')
                .update({ is_verified: true })
                .eq('id', authUser.id);
            }
          } catch (error) {
            console.error('Error updating user profile:', error);
          }
          
          setIsVerified(true);
          toast.success('Email verified successfully!');
          return;
        }
        
        // Check for manual token verification (fallback)
        const token = new URLSearchParams(window.location.search).get('token') ||
                      new URLSearchParams(window.location.search).get('code');
        
        if (token) {
          console.log('Found token in URL, verifying manually');
          try {
            const user = await verifyEmailToken(token);
            setEmail(user.email);
            setIsVerified(true);
            toast.success('Email verified successfully!');
            return;
          } catch (error) {
            console.error('Token verification error:', error);
            setVerifyError('Invalid or expired confirmation link. Please resend the email.');
          }
        }
        
        // No verification - show resend form
        console.log('No authentication detected, showing resend form');
        const storedEmail = localStorage.getItem('signupEmail');
        if (storedEmail) {
          setEmail(storedEmail);
        } else {
          navigate('/signup');
        }
      } catch (error) {
        console.error('Verification error:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmailConfirmation();
  }, [navigate]);

  // Handle countdown and auto-redirect on success
  useEffect(() => {
    if (!isVerified) return;
    
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVerified, navigate]);

  const handleResendEmail = async () => {
    if (!email || !canResend) return;

    try {
      setCanResend(false);
      await resendConfirmationEmail(email);
      
      setResendCount(prev => prev + 1);
      toast.success('Confirmation email resent! Check your inbox.');
      
      // Re-enable after 30 seconds
      setTimeout(() => setCanResend(true), 30000);
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('Failed to resend email. Please try again.');
      setCanResend(true);
    }
  };

  const handleGoBack = () => {
    localStorage.removeItem('signupEmail');
    navigate('/signup');
  };

  const handleProceedToLogin = () => {
    navigate('/login', { state: { email } });
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20"
        >
          <Loader2 className="w-20 h-20 text-purple-600" />
        </motion.div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl border border-green-200 p-8 shadow-lg text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-green-600">Email Verified!</h1>
            <p className="text-slate-600 mb-8">Your email has been successfully confirmed. You're all set!</p>
            
            <Button 
              onClick={handleProceedToLogin}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-semibold text-lg mb-4"
            >
              Go to Login
            </Button>
            
            <p className="text-sm text-slate-500">
              Redirecting in <span className="font-semibold text-slate-700">{redirectCountdown}</span> seconds...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <p className="text-lg font-semibold text-purple-700 mb-4">{email || 'your email'}</p>
            <p className="text-slate-600 text-sm">
              Click the link in the email to verify your account.
            </p>
            
            {verifyError && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700">{verifyError}</p>
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="font-semibold text-blue-900 mb-3">Steps:</p>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>✓ Check your email inbox</li>
              <li>✓ Click the verification link</li>
              <li>✓ Your account will be verified automatically</li>
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
            A confirmation email has been sent. Click the link to verify your email and then log in.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
