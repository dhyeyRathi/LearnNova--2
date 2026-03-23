import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Lock, CheckCircle, Loader2, AlertCircle, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { enrollInCourse } from '../../utils/supabase/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  price: number;
  userEmail?: string;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, courseId, courseTitle, price, userEmail, onPaymentSuccess }: PaymentModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'confirm' | 'payment' | 'processing' | 'success'>('confirm');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardNumberChange = (e: string) => {
    // Format as XXXX XXXX XXXX XXXX
    const value = e.replace(/\s/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: string) => {
    // Format as MM/YY
    const value = e.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 2) {
      setExpiryDate(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: string) => {
    setCvv(e.replace(/\D/g, '').slice(0, 3));
  };

  const validatePaymentForm = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid card number');
      return false;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      toast.error('Please enter expiry date (MM/YY)');
      return false;
    }
    if (!cvv || cvv.length !== 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    if (!cardName.trim()) {
      toast.error('Please enter cardholder name');
      return false;
    }
    return true;
  };

  const sendPaymentReceipt = async (email: string | undefined) => {
    console.log('=== REAL EMAIL RECEIPT VIA SUPABASE ===');
    console.log('User email provided:', email);

    if (!email) {
      console.warn('No email provided for receipt');
      toast.error('No email address available for receipt');
      return;
    }

    try {
      // Call Supabase Edge Function to send real email
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      console.log('Calling Supabase Edge Function...');

      const response = await fetch(`${supabaseUrl}/functions/v1/send-reciept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email,
          courseTitle,
          price,
          userName: user?.name || 'Learner',
        }),
      });

      console.log('Edge Function response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Edge Function error:', errorData);
        throw new Error(errorData.message || 'Failed to send email');
      }

      const result = await response.json();
      console.log('✅ Real email sent successfully:', result);

      toast.success(`📧 Receipt sent to ${email}!`);

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      console.error('Error details:', error.message);

      // Show user-friendly error but don't block payment success
      toast.error(`Payment successful! Email failed: ${error.message}`);
    }
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) return;
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      // All payments are valid now
      toast.success(`Payment of $${price.toFixed(2)} processed successfully!`);

      // Enroll user in the course
      console.log('Enrolling user in course:', { userId: user.id, courseId });
      await enrollInCourse(user.id, courseId);

      // Send receipt email
      console.log('=== STARTING EMAIL RECEIPT PROCESS ===');
      console.log('User email from props:', userEmail);
      console.log('User from context:', user?.email);

      const emailToUse = userEmail || user?.email;
      console.log('Final email to use:', emailToUse);

      await sendPaymentReceipt(emailToUse);

      setStep('success');

      // Auto close after 3 seconds
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error('Payment/enrollment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardName('');
    setStep('confirm');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Secure Payment</h2>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Confirm Step */}
              {step === 'confirm' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-sm text-white/60 mb-1">Course</p>
                    <h3 className="text-lg font-bold text-white">{courseTitle}</h3>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-sm text-white/60 mb-1">Total Price</p>
                    <p className="text-3xl font-bold text-white">
                      ${price.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-100">
                      Your payment information is encrypted and secure. No charges will appear on your card until you confirm payment.
                    </p>
                  </div>

                  {userEmail && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-start gap-3">
                      <Mail className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-emerald-100">
                        Receipt will be sent to <span className="font-semibold">{userEmail}</span>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={onClose}
                        className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border-2 border-slate-500 hover:border-slate-400 transition-colors"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <Button
                      onClick={() => setStep('payment')}
                      className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                    >
                      Proceed to Pay
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Payment Form Step */}
              {step === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Cardholder Name
                    </label>
                    <Input
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Card Number
                    </label>
                    <Input
                      value={cardNumber}
                      onChange={e => handleCardNumberChange(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Expiry Date
                      </label>
                      <Input
                        value={expiryDate}
                        onChange={e => handleExpiryChange(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        CVV
                      </label>
                      <Input
                        value={cvv}
                        onChange={e => handleCvvChange(e.target.value)}
                        placeholder="123"
                        maxLength={3}
                        type="password"
                        className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={() => {
                          resetForm();
                        }}
                        className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-white rounded-xl border-2 border-slate-500 hover:border-slate-400 transition-colors"
                      >
                        Back
                      </Button>
                    </motion.div>
                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay $${price.toFixed(2)}`
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Processing Step */}
              {step === 'processing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="relative w-16 h-16 mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                      className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full"
                    />
                  </div>
                  <p className="text-lg font-semibold text-white text-center">
                    Processing Payment...
                  </p>
                  <p className="text-sm text-white/60 text-center mt-2">
                    Please wait while we process your payment
                  </p>
                </motion.div>
              )}

              {/* Success Step */}
              {step === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-lg font-bold text-white text-center">
                    Payment Successful!
                  </p>
                  <p className="text-sm text-white/60 text-center mt-2">
                    You are now enrolled in {courseTitle}
                  </p>
                  <p className="text-xs text-emerald-300 text-center mt-3 flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" />
                    Receipt sent to your email
                  </p>
                  <p className="text-xs text-white/40 text-center mt-4">
                    Redirecting you to the course...
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-white/5 px-6 py-3 flex items-center justify-center text-xs text-white/50">
              <Lock className="w-3 h-3 mr-2" />
              Secured by mock payment gateway
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

