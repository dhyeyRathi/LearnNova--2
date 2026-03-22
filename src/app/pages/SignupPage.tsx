import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { GraduationCap, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    if (!name || !email || !password || !confirmPassword) { 
      setError('Please fill in all fields'); 
      setIsSubmitting(false); 
      return; 
    }
    if (password !== confirmPassword) { 
      setError('Passwords do not match'); 
      setIsSubmitting(false); 
      return; 
    }
    if (password.length < 6) { 
      setError('Password must be at least 6 characters'); 
      setIsSubmitting(false); 
      return; 
    }
    
    try {
      const result = await signup(email, password, name);
      if (result.success) {
        toast.success('Account created! Please confirm your email.');
        // Store email in localStorage for confirmation page
        localStorage.setItem('signupEmail', email);
        // Redirect to email confirmation page
        setTimeout(() => navigate('/confirm-email', { state: { email } }), 100);
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during signup';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', value: name, onChange: setName },
    { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', value: email, onChange: setEmail },
    { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', value: password, onChange: setPassword },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', value: confirmPassword, onChange: setConfirmPassword },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 z-20">
        <Link to="/"><Button variant="ghost" className="text-[#7A766F] hover:bg-red-50 hover:text-red-600 rounded-lg text-[13px] h-8"><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Back</Button></Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[380px] relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-red-600" style={{ fontFamily: "'DM Serif Display', serif" }}>LearnNova</span>
        </Link>

        <div className="bg-white rounded-xl border border-[#E5E2DC] p-6">
          <div className="text-center mb-5">
            <h2 className="text-lg font-semibold text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Create your account</h2>
            <p className="text-sm text-[#7A766F] mt-0.5">Start your learning journey today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <Alert variant="destructive" className="rounded-lg"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            {fields.map(f => (
              <div key={f.id} className="space-y-1.5">
                <Label htmlFor={f.id} className="text-[13px] text-[#1A1F2E]">{f.label}</Label>
                <Input id={f.id} type={f.type} placeholder={f.placeholder} value={f.value} onChange={e => f.onChange(e.target.value)} className="h-10 rounded-lg border-[#E5E2DC] bg-[#F7F6F3] focus:bg-white focus:border-amber-400 focus:border-2 text-sm" />
              </div>
            ))}
            <Button type="submit" className="w-full h-10 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="ml-2 w-3.5 h-3.5" /></>}
            </Button>
            <div className="text-center text-sm text-[#7A766F] pt-1">
              Already have an account? <Link to="/login" className="text-[#2C3E6B] font-medium hover:underline">Sign in</Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}