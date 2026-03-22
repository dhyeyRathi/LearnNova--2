import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { motion } from 'motion/react';
import { Shield, User, Upload, Camera, CheckCircle2, Sparkles, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function VerificationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    idDocument: null as File | null,
    certificate: null as File | null,
    selfie: null as File | null,
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Documents', icon: Upload },
    { number: 3, title: 'Selfie Verification', icon: Camera },
  ];

  const completionPercentage = (currentStep / steps.length) * 100;

  const handleFileUpload = (field: 'idDocument' | 'certificate' | 'selfie', file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast.success('Verification Rocket Launched! 🚀', {
      description: 'Your verification is under review. We\'ll notify you soon!'
    });

    // Show success screen instead of auto-redirect
    setIsSubmitted(true);
  };

  // Success Screen
  if (isSubmitted) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-8"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30">
                <CheckCircle2 className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            <h1 className="text-4xl font-bold mb-4">
              Verification <span className="text-red-600">Submitted!</span>
            </h1>

            <p className="text-xl text-slate-600 mb-8">
              We're reviewing your information
            </p>

            <Card className="p-8 bg-white/70 backdrop-blur-xl border-white/40 shadow-xl mb-8 text-left">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">What happens next?</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">→</span>
                      <span>Our team reviews your verification within 2-3 business days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">→</span>
                      <span>You'll receive an email notification about the status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">→</span>
                      <span>Once approved, you'll unlock all instructor features</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/dashboard/instructor')}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Return to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/courses')}
              >
                Browse Courses
              </Button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <BackButton />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full mb-4">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="text-sm font-semibold text-red-600">
              Identity Verification
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Unlock Your <span className="text-red-600">Full Potential</span>
          </h1>
          <p className="text-slate-600 text-lg">
            Complete verification to access all instructor features and build amazing courses
          </p>
        </motion.div>

        {/* Progress Circle */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionPercentage / 100)}`}
                className="transition-all duration-500"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Math.round(completionPercentage)}%
                </div>
                <div className="text-xs text-slate-500">Complete</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stepper */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      currentStep > step.number
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/30'
                        : currentStep === step.number
                        ? 'bg-red-500 shadow-lg shadow-red-500/30'
                        : 'bg-white/70 backdrop-blur-sm border-2 border-slate-200'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    ) : (
                      <step.icon
                        className={`w-7 h-7 ${
                          currentStep === step.number ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                    )}
                  </div>
                  <span className="text-xs mt-2 font-medium text-slate-600">{step.title}</span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-1 mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step.number
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content with Glassmorphism */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 bg-white/70 backdrop-blur-xl border-white/40 shadow-xl">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Personal Information</h3>
                    <p className="text-sm text-slate-500">Let's start with the basics</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Legal Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full name as per ID"
                      className="bg-white/50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="bg-white/50 border-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about your teaching experience and expertise..."
                      rows={4}
                      className="bg-white/50 border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Documents */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Document Upload</h3>
                    <p className="text-sm text-slate-500">Upload your verification documents</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* ID Document */}
                  <div className="space-y-2">
                    <Label>Government-Issued ID *</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => e.target.files && handleFileUpload('idDocument', e.target.files[0])}
                        className="hidden"
                        id="idDocument"
                      />
                      <label
                        htmlFor="idDocument"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-white/50 hover:bg-white/80 transition-all group"
                      >
                        {formData.idDocument ? (
                          <div className="text-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-700">{formData.idDocument.name}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-red-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG or PDF (max. 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Teaching Certificate */}
                  <div className="space-y-2">
                    <Label>Teaching Certificate or Credentials (Optional)</Label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => e.target.files && handleFileUpload('certificate', e.target.files[0])}
                        className="hidden"
                        id="certificate"
                      />
                      <label
                        htmlFor="certificate"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-white/50 hover:bg-white/80 transition-all group"
                      >
                        {formData.certificate ? (
                          <div className="text-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-700">{formData.certificate.name}</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold text-red-600">Click to upload</span> certificates
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Boost your credibility</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Selfie Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Selfie Verification</h3>
                    <p className="text-sm text-slate-500">Take a selfie holding your ID</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex gap-3">
                      <Sparkles className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <p className="font-semibold mb-1">Tips for a great selfie:</p>
                        <ul className="list-disc list-inside space-y-1 text-red-700">
                          <li>Ensure good lighting and clear visibility</li>
                          <li>Hold your ID next to your face</li>
                          <li>Make sure both your face and ID are clearly visible</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => e.target.files && handleFileUpload('selfie', e.target.files[0])}
                      className="hidden"
                      id="selfie"
                    />
                    <label
                      htmlFor="selfie"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-white/50 hover:bg-white/80 transition-all group relative overflow-hidden"
                    >
                      {formData.selfie ? (
                        <div className="text-center">
                          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                          <p className="text-sm font-medium text-slate-700">{formData.selfie.name}</p>
                          <p className="text-xs text-slate-500 mt-2">Looking good! 📸</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Camera className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-sm text-slate-600">
                            <span className="font-semibold text-red-600">Tap to take a selfie</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">or upload from gallery</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="min-w-32"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="min-w-32 bg-red-500 hover:bg-red-600 text-white"
              >
                {currentStep === steps.length ? (
                  <span className="flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Submit & Launch
                  </span>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-slate-500">
            🔒 Your information is secure and encrypted. We value your trust.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}