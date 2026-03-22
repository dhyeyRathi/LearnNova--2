import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { motion } from 'motion/react';
import { GraduationCap, ArrowLeft, Upload, CheckCircle2, Sparkles, Rocket, User, Briefcase, FileText, Camera, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { submitApplication } from '../services/applicationsService';
import DashboardLayout from '../components/DashboardLayout';

export default function TutorApplicationPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    expertise: '',
    yearsExperience: '',
    bio: '',
    motivation: '',
    linkedIn: '',
    portfolio: '',
    idDocument: null as File | null,
    teachingCert: null as File | null,
    selfie: null as File | null,
  });

  // Initialize form with user data only once when user loads
  useEffect(() => {
    if (user && !isInitialized) {
      setForm(prev => {
        // Only update if these fields are still empty
        if (prev.fullName === '' && prev.email === '') {
          return {
            ...prev,
            fullName: user.name || '',
            email: user.email || '',
          };
        }
        return prev;
      });
      setIsInitialized(true);
    }
  }, []); // Empty dependency array - run only once on mount

  // Memoize max date calculation
  const maxDate = useMemo(() => {
    const today = new Date();
    const date = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return date.toISOString().split('T')[0];
  }, []);

  // Memoize form update handlers to prevent re-renders
  const updateForm = useCallback((updates: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Experience', icon: Briefcase },
    { number: 3, title: 'Documents', icon: FileText },
  ];

  const handleSubmit = useCallback(() => {
    // Save to applications service so admin sees it
    submitApplication({
      userId: user?.id || `applicant-${Date.now()}`,
      userName: form.fullName,
      userEmail: form.email,
      userAvatar: user?.avatar,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
      message: `Expertise: ${form.expertise} | ${form.yearsExperience} years experience\n\n${form.motivation}\n\nBio: ${form.bio}`,
    });

    // Confetti
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#8b5cf6', '#ec4899'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#8b5cf6', '#ec4899'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    setIsSubmitted(true);
    toast.success('Application Submitted! ✨');
  }, [user, form]);

  const handleFileUpload = useCallback((field: 'idDocument' | 'teachingCert' | 'selfie', file: File) => {
    updateForm({ [field]: file });
  }, [updateForm]);

  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      if (!form.fullName || !form.email || !form.phone || !form.dob) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (currentStep === 2) {
      if (!form.expertise || !form.yearsExperience || !form.bio || !form.motivation) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, form, steps.length, handleSubmit]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const completionPercentage = (currentStep / steps.length) * 100;

  // Memoize wrapper component to prevent recreation
  const LayoutWrapper = useMemo(() => {
    return isAuthenticated ? DashboardLayout : ({ children }: { children: React.ReactNode }) => <div className="min-h-screen"><Navbar />{children}</div>;
  }, [isAuthenticated]);

  // Success screen
  if (isSubmitted) {
    return (
      <LayoutWrapper>
        <div className="max-w-3xl mx-auto px-4 py-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="relative inline-block mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [0, -50], x: [0, Math.cos(i * 60 * Math.PI / 180) * 40] }}
                  transition={{ duration: 2, delay: 0.5 + i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-yellow-400"
                />
              ))}
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Application Submitted! <br />
              <span className="text-red-600">Your Teaching Journey Begins ✨</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xl text-slate-600 mb-8">
              Our admin team will review your application
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-3xl p-8 shadow-xl mb-8 text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">What happens next?</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">→</span><span>Our admin reviews your application within 2-3 business days</span></li>
                    <li className="flex items-start gap-2"><span className="text-amber-600 font-bold">→</span><span>You'll receive an email notification about the decision</span></li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold">→</span><span>Once approved, you'll get full tutor access to create & manage courses</span></li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
                Back to Home
              </Button>
              <Button variant="outline" onClick={() => navigate('/courses')} className="rounded-xl">Browse Courses</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 p-6 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-slate-700 italic">"Great educators don't just teach—they inspire, empower, and transform lives."</p>
              <p className="text-sm text-slate-500 mt-2">— The LearnNova Team</p>
            </motion.div>
          </motion.div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500 hover:text-red-600 rounded-xl mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full mb-4">
            <Crown className="w-5 h-5 text-red-600" />
            <span className="text-sm font-semibold text-red-600">Tutor Application</span>
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Become a <span className="text-red-600">LearnNova Tutor</span>
          </h1>
          <p className="text-slate-600 text-lg">Share your expertise and inspire the next generation of learners</p>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex justify-center mb-8">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="7" fill="none" className="text-slate-200" />
              <circle cx="56" cy="56" r="48" stroke="url(#prog-grad)" strokeWidth="7" fill="none"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${2 * Math.PI * 48 * (1 - completionPercentage / 100)}`}
                className="transition-all duration-500" strokeLinecap="round" />
              <defs><linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#ef4444" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{Math.round(completionPercentage)}%</div>
                <div className="text-xs text-slate-500">Step {currentStep}/{steps.length}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stepper */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    currentStep > step.number ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/30'
                    : currentStep === step.number ? 'bg-red-500 shadow-lg shadow-red-500/30'
                    : 'bg-white/70 backdrop-blur-sm border-2 border-slate-200'
                  }`}>
                    {currentStep > step.number ? <CheckCircle2 className="w-6 h-6 text-white" />
                    : <step.icon className={`w-6 h-6 ${currentStep === step.number ? 'text-white' : 'text-slate-400'}`} />}
                  </div>
                  <span className="text-xs mt-2 font-medium text-slate-600">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-3 rounded-full transition-all duration-300 ${currentStep > step.number ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Card className="p-8 glass-card rounded-3xl shadow-xl border-white/40">

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Personal Information</h3>
                    <p className="text-sm text-slate-500">Tell us about yourself</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Your full legal name" className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input type="date" value={form.dob} onChange={e => updateForm({ dob: e.target.value })} max={maxDate} className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Teaching Experience */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Teaching Experience</h3>
                    <p className="text-sm text-slate-500">Share your expertise and background</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Area of Expertise *</Label>
                    <Select value={form.expertise} onValueChange={v => setForm({ ...form, expertise: v })}>
                      <SelectTrigger className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 transition-all"><SelectValue placeholder="Select your field" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend Development</SelectItem>
                        <SelectItem value="backend">Backend Development</SelectItem>
                        <SelectItem value="fullstack">Full-Stack Development</SelectItem>
                        <SelectItem value="mobile">Mobile Development</SelectItem>
                        <SelectItem value="devops">DevOps & Cloud</SelectItem>
                        <SelectItem value="data">Data Science & AI</SelectItem>
                        <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="uiux">UI/UX Design</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience *</Label>
                    <Select value={form.yearsExperience} onValueChange={v => setForm({ ...form, yearsExperience: v })}>
                      <SelectTrigger className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 transition-all"><SelectValue placeholder="Select years" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Professional Bio *</Label>
                  <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about your professional background, certifications, and teaching experience..." rows={4} className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                </div>

                <div className="space-y-2">
                  <Label>Why do you want to teach on LearnNova? *</Label>
                  <Textarea value={form.motivation} onChange={e => setForm({ ...form, motivation: e.target.value })} placeholder="What motivates you to become a tutor? How will you help learners succeed?" rows={4} className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>LinkedIn Profile (optional)</Label>
                    <Input value={form.linkedIn} onChange={e => setForm({ ...form, linkedIn: e.target.value })} placeholder="https://linkedin.com/in/..." className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label>Portfolio / Website (optional)</Label>
                    <Input value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} placeholder="https://..." className="bg-white/50 rounded-xl border border-black focus:border-amber-400 focus:border-2 focus:bg-white transition-all" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documents & Proof */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Upload Documents</h3>
                    <p className="text-sm text-slate-500">Verify your identity and teaching credentials</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Sparkles className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-semibold mb-1">Required documents:</p>
                      <ul className="list-disc list-inside space-y-1 text-red-700">
                        <li>Government-issued ID (passport, driver's license, national ID)</li>
                        <li>Proof of teaching — certificate, diploma, or employer letter</li>
                        <li>A clear selfie holding your ID for verification</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ID Upload */}
                <div className="space-y-2">
                  <Label>Government-Issued ID *</Label>
                  <input type="file" accept="image/*,.pdf" onChange={e => e.target.files && handleFileUpload('idDocument', e.target.files[0])} className="hidden" id="idDoc" />
                  <label htmlFor="idDoc" className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-white/50 hover:bg-white/80 transition-all group">
                    {form.idDocument ? (
                      <div className="text-center"><CheckCircle2 className="w-7 h-7 text-green-500 mx-auto mb-1" /><p className="text-sm font-medium text-slate-700">{form.idDocument.name}</p></div>
                    ) : (
                      <div className="text-center"><Upload className="w-7 h-7 text-slate-400 mx-auto mb-1 group-hover:scale-110 transition-transform" /><p className="text-sm text-slate-600"><span className="font-semibold text-red-600">Click to upload</span> your ID</p><p className="text-xs text-slate-400 mt-0.5">PNG, JPG or PDF (max 10MB)</p></div>
                    )}
                  </label>
                </div>

                {/* Teaching Proof */}
                <div className="space-y-2">
                  <Label>Proof of Teaching / Certificate *</Label>
                  <input type="file" accept="image/*,.pdf" onChange={e => e.target.files && handleFileUpload('teachingCert', e.target.files[0])} className="hidden" id="teachCert" />
                  <label htmlFor="teachCert" className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-white/50 hover:bg-white/80 transition-all group">
                    {form.teachingCert ? (
                      <div className="text-center"><CheckCircle2 className="w-7 h-7 text-green-500 mx-auto mb-1" /><p className="text-sm font-medium text-slate-700">{form.teachingCert.name}</p></div>
                    ) : (
                      <div className="text-center"><Upload className="w-7 h-7 text-slate-400 mx-auto mb-1 group-hover:scale-110 transition-transform" /><p className="text-sm text-slate-600"><span className="font-semibold text-red-600">Upload</span> your teaching certificate or proof</p><p className="text-xs text-slate-400 mt-0.5">Diploma, employer letter, or credential</p></div>
                    )}
                  </label>
                </div>

                {/* Selfie with ID */}
                <div className="space-y-2">
                  <Label>Selfie holding your ID *</Label>
                  <input type="file" accept="image/*" capture="user" onChange={e => e.target.files && handleFileUpload('selfie', e.target.files[0])} className="hidden" id="selfieUp" />
                  <label htmlFor="selfieUp" className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-white/50 hover:bg-white/80 transition-all group relative overflow-hidden">
                    {form.selfie ? (
                      <div className="text-center"><CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" /><p className="text-sm font-medium text-slate-700">{form.selfie.name}</p><p className="text-xs text-slate-500 mt-1">Looking great! 📸</p></div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Camera className="w-8 h-8 text-white" /></div>
                        <p className="text-sm text-slate-600"><span className="font-semibold text-red-600">Take a selfie</span> or upload from gallery</p>
                        <p className="text-xs text-slate-400 mt-0.5">Hold your ID next to your face clearly</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="min-w-32 rounded-xl">Back</Button>
              <Button onClick={handleNext} className="min-w-32 bg-red-500 hover:bg-red-600 text-white rounded-xl">
                {currentStep === steps.length ? (
                  <span className="flex items-center gap-2"><Rocket className="w-4 h-4" /> Submit Application</span>
                ) : 'Continue'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { icon: '🎓', title: 'Teach Your Way', desc: 'Create courses on your schedule' },
            { icon: '💰', title: 'Earn Revenue', desc: 'Get paid for your expertise' },
            { icon: '🌍', title: 'Global Reach', desc: 'Inspire learners worldwide' }
          ].map((benefit, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }}
              className="glass-card rounded-2xl p-4 text-center">
              <div className="text-3xl mb-2">{benefit.icon}</div>
              <h4 className="font-semibold mb-1">{benefit.title}</h4>
              <p className="text-xs text-slate-600">{benefit.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">🔒 Your information is secure and encrypted. We value your trust.</p>
        </div>
      </div>
    </LayoutWrapper>
  );
}