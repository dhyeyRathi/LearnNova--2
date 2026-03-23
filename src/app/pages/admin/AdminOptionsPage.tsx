import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import BackButton from '../../components/BackButton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Crown, Save, Globe, Shield, Bell, Users, Palette, Mail, DollarSign,
  BookOpen, Award, Lock, Eye, UserCheck, MessageSquare, Megaphone,
  Percent, Clock, Image as ImageIcon, FileText, CheckCircle, Settings,
  CreditCard, Receipt, Tag, RefreshCw, Banknote, AlertTriangle, Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function AdminOptionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // General
  const [platformName, setPlatformName] = useState('LearnNova');
  const [platformTagline, setPlatformTagline] = useState('Learn Without Limits');
  const [contactEmail, setContactEmail] = useState('support@learnnova.com');
  const [timezone, setTimezone] = useState('UTC');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);

  // Course defaults
  const [defaultVisibility, setDefaultVisibility] = useState('everyone');
  const [defaultAccess, setDefaultAccess] = useState('open');
  const [requireApproval, setRequireApproval] = useState(false);
  const [autoPublish, setAutoPublish] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState('50');
  const [allowedFormats, setAllowedFormats] = useState('mp4,pdf,png,jpg,docx');

  // Gamification
  const [gamificationEnabled, setGamificationEnabled] = useState(true);
  const [lessonCompletePoints, setLessonCompletePoints] = useState('5');
  const [courseCompletePoints, setCourseCompletePoints] = useState('50');
  const [quizBasePoints, setQuizBasePoints] = useState('10');
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [badgesEnabled, setBadgesEnabled] = useState(true);

  // Notifications
  const [emailOnEnroll, setEmailOnEnroll] = useState(true);
  const [emailOnComplete, setEmailOnComplete] = useState(true);
  const [emailOnQuizPass, setEmailOnQuizPass] = useState(false);
  const [emailDigest, setEmailDigest] = useState('weekly');
  const [adminAlertNewUser, setAdminAlertNewUser] = useState(true);
  const [adminAlertNewApp, setAdminAlertNewApp] = useState(true);

  // Payment
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [platformFee, setPlatformFee] = useState('10');
  const [payoutMethod, setPayoutMethod] = useState('manual');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [minCoursePrice, setMinCoursePrice] = useState('4.99');
  const [maxCoursePrice, setMaxCoursePrice] = useState('999.99');
  const [allowCoupons, setAllowCoupons] = useState(true);
  const [autoRefunds, setAutoRefunds] = useState(false);
  const [refundWindow, setRefundWindow] = useState('30');
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState('0');
  const [payoutSchedule, setPayoutSchedule] = useState('monthly');
  const [minPayoutAmount, setMinPayoutAmount] = useState('50');
  const [invoicePrefix, setInvoicePrefix] = useState('LN');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(false);
  const [trialDays, setTrialDays] = useState('7');

  // Security
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  if (!user || (user.role !== 'admin' && user.role !== 'tutor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Access Required</h2>
          <p className="text-slate-500 mt-2 mb-4">This page is only accessible to administrators.</p>
          <Button onClick={() => navigate('/courses')} className="bg-purple-600 text-white rounded-xl">Go to Courses</Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const SettingRow = ({ icon: Icon, iconColor, label, description, children }: {
    icon: any; iconColor: string; label: string; description: string; children: React.ReactNode;
  }) => (
    <div className="flex items-start gap-4 py-4 border-b border-slate-100/50 last:border-0">
      <div className={`w-10 h-10 rounded-xl ${iconColor} flex items-center justify-center shadow-md flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Dashboard" to="/dashboard/admin" />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-purple-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Platform Options
              </h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-full shadow-lg shadow-purple-600/20">
                <Crown className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">Admin</span>
              </div>
            </div>
            <p className="text-slate-600">Configure platform-wide settings, course defaults, and policies</p>
          </div>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/20 h-12 px-6 rounded-xl">
            <Save className="w-5 h-5 mr-2" />Save All Settings
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-white border-2 border-slate-100/80 rounded-2xl p-1.5 mb-8 flex-wrap justify-start gap-1 shadow-sm">
            <TabsTrigger value="general" className="gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 hover:bg-slate-50 transition-all text-sm font-medium"><Globe className="w-4 h-4" />General</TabsTrigger>
            <TabsTrigger value="courses" className="gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 hover:bg-slate-50 transition-all text-sm font-medium"><BookOpen className="w-4 h-4" />Course Defaults</TabsTrigger>
            <TabsTrigger value="gamification" className="gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 hover:bg-slate-50 transition-all text-sm font-medium"><Award className="w-4 h-4" />Gamification</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 hover:bg-slate-50 transition-all text-sm font-medium"><Bell className="w-4 h-4" />Notifications</TabsTrigger>
            <TabsTrigger value="payment" className="gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 hover:bg-slate-50 transition-all text-sm font-medium"><DollarSign className="w-4 h-4" />Payment</TabsTrigger>
            <TabsTrigger value="security" className="gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-b-2 data-[state=active]:border-purple-600 hover:bg-slate-50 transition-all text-sm font-medium"><Shield className="w-4 h-4" />Security</TabsTrigger>
          </TabsList>

          {/* GENERAL */}
          <TabsContent value="general">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>General Settings</h2>
                <p className="text-sm text-slate-400 mb-6">Platform identity and basic configuration</p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Platform Name</Label>
                      <Input value={platformName} onChange={e => setPlatformName(e.target.value)} className="rounded-xl bg-white/70 h-11 text-base font-medium" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tagline</Label>
                      <Input value={platformTagline} onChange={e => setPlatformTagline(e.target.value)} className="rounded-xl bg-white/70 h-11 text-base font-medium" />
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100/50 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Contact Email</Label>
                        <div className="text-xl font-semibold text-slate-900 mb-4">{contactEmail}</div>
                        <Input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="rounded-xl bg-white/70 h-11 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Timezone</Label>
                        <div className="text-xl font-semibold text-slate-900 mb-4">{timezone}</div>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger className="rounded-xl bg-white/70 h-11 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">Eastern (EST)</SelectItem>
                            <SelectItem value="PST">Pacific (PST)</SelectItem>
                            <SelectItem value="CET">Central European (CET)</SelectItem>
                            <SelectItem value="IST">India Standard (IST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100/50 space-y-4">
                  <div className="flex items-start justify-between p-5 rounded-2xl bg-white/40 border border-slate-100/80 hover:border-slate-200/80 transition-all">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-base">Maintenance Mode</p>
                      <p className="text-sm text-slate-500 mt-1">Temporarily disable public access to the platform</p>
                    </div>
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} className="ml-4" />
                  </div>
                  
                  <div className="flex items-start justify-between p-5 rounded-2xl bg-white/40 border border-slate-100/80 hover:border-slate-200/80 transition-all">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-base">Allow New Registrations</p>
                      <p className="text-sm text-slate-500 mt-1">Let new users sign up on the platform</p>
                    </div>
                    <Switch checked={allowRegistration} onCheckedChange={setAllowRegistration} className="ml-4" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* COURSE DEFAULTS */}
          <TabsContent value="courses">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Course Defaults</h2>
                <p className="text-sm text-slate-400 mb-6">Default settings applied to newly created courses</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Default Visibility</Label>
                    <Select value={defaultVisibility} onValueChange={setDefaultVisibility}>
                      <SelectTrigger className="rounded-xl bg-white/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="signed-in">Signed-in Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">Who can see new courses by default</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Access Rule</Label>
                    <Select value={defaultAccess} onValueChange={setDefaultAccess}>
                      <SelectTrigger className="rounded-xl bg-white/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open to All</SelectItem>
                        <SelectItem value="invitation">On Invitation</SelectItem>
                        <SelectItem value="payment">On Payment</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">Default enrollment access for new courses</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Max Upload File Size (MB)</Label>
                    <Input value={maxFileSize} onChange={e => setMaxFileSize(e.target.value)} type="number" className="rounded-xl bg-white/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Allowed File Formats</Label>
                    <Input value={allowedFormats} onChange={e => setAllowedFormats(e.target.value)} placeholder="mp4,pdf,png..." className="rounded-xl bg-white/50" />
                    <p className="text-xs text-slate-400">Comma-separated list of allowed extensions</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100/50">
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/40 border border-slate-100/80 hover:border-slate-200/80 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-200/50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-base">Require Admin Approval</p>
                      <p className="text-sm text-slate-500 mt-1">New courses must be approved by admin before publishing</p>
                    </div>
                    <Switch checked={requireApproval} onCheckedChange={setRequireApproval} className="ml-4 flex-shrink-0" />
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/40 border border-slate-100/80 hover:border-slate-200/80 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-base">Auto-publish on Creation</p>
                      <p className="text-sm text-slate-500 mt-1">Automatically publish courses when created (overrides approval)</p>
                    </div>
                    <Switch checked={autoPublish} onCheckedChange={setAutoPublish} className="ml-4 flex-shrink-0" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* GAMIFICATION */}
          <TabsContent value="gamification">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Gamification Settings</h2>
                <p className="text-sm text-slate-400 mb-8">Configure points, badges, and leaderboard</p>

                <div className="rounded-2xl bg-white/40 border border-slate-100/80 p-6 mb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-base">Enable Gamification</p>
                      <p className="text-sm text-slate-500 mt-1">Turn on points, badges, and rewards for the platform</p>
                    </div>
                    <Switch checked={gamificationEnabled} onCheckedChange={setGamificationEnabled} className="ml-4" />
                  </div>
                </div>

                {gamificationEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-3">
                        <p className="font-semibold text-slate-800">Lesson Complete Points</p>
                        <div className="text-5xl font-bold text-slate-900">{lessonCompletePoints}</div>
                        <Input value={lessonCompletePoints} onChange={e => setLessonCompletePoints(e.target.value)} type="number" className="rounded-xl bg-white/70 h-11 text-base" />
                        <p className="text-sm text-slate-500">Points per lesson completed</p>
                      </div>
                      <div className="space-y-3">
                        <p className="font-semibold text-slate-800">Course Complete Points</p>
                        <div className="text-5xl font-bold text-slate-900">{courseCompletePoints}</div>
                        <Input value={courseCompletePoints} onChange={e => setCourseCompletePoints(e.target.value)} type="number" className="rounded-xl bg-white/70 h-11 text-base" />
                        <p className="text-sm text-slate-500">Bonus for completing a course</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pt-8 border-t border-slate-100/50">
                      <div className="space-y-2">
                        <Label>Quiz Base Points</Label>
                        <Input value={quizBasePoints} onChange={e => setQuizBasePoints(e.target.value)} type="number" className="rounded-xl bg-white/70" />
                        <p className="text-xs text-slate-500">Points per correct quiz answer</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <SettingRow icon={Users} iconColor="bg-purple-600" label="Show Leaderboard" description="Display leaderboard ranking on learner dashboard">
                        <Switch checked={showLeaderboard} onCheckedChange={setShowLeaderboard} />
                      </SettingRow>
                      <SettingRow icon={Award} iconColor="bg-purple-600" label="Badges System" description="Award badges for milestones and achievements">
                        <Switch checked={badgesEnabled} onCheckedChange={setBadgesEnabled} />
                      </SettingRow>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Notification Settings</h2>
                <p className="text-sm text-slate-400 mb-6">Configure email notifications for learners and admins</p>

                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">Learner Notifications</h3>
                <SettingRow icon={Mail} iconColor="bg-purple-600" label="Email on Enrollment" description="Send confirmation email when a learner enrolls in a course">
                  <Switch checked={emailOnEnroll} onCheckedChange={setEmailOnEnroll} />
                </SettingRow>
                <SettingRow icon={CheckCircle} iconColor="from-emerald-500 to-green-500" label="Email on Completion" description="Notify learners when they complete a course">
                  <Switch checked={emailOnComplete} onCheckedChange={setEmailOnComplete} />
                </SettingRow>
                <SettingRow icon={Award} iconColor="bg-purple-600" label="Email on Quiz Pass" description="Send notification when a learner passes a quiz">
                  <Switch checked={emailOnQuizPass} onCheckedChange={setEmailOnQuizPass} />
                </SettingRow>
                <div className="flex items-start gap-4 py-4 border-b border-slate-100/50">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">Progress Digest Email</p>
                    <p className="text-xs text-slate-400 mt-0.5">Send periodic summary of learning progress</p>
                  </div>
                  <Select value={emailDigest} onValueChange={setEmailDigest}>
                    <SelectTrigger className="w-32 rounded-xl bg-white/50 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 mt-6">Admin Notifications</h3>
                <SettingRow icon={UserCheck} iconColor="bg-purple-600" label="New User Alert" description="Alert admins when a new user signs up">
                  <Switch checked={adminAlertNewUser} onCheckedChange={setAdminAlertNewUser} />
                </SettingRow>
                <SettingRow icon={FileText} iconColor="bg-purple-600" label="New Application Alert" description="Alert admins when a new tutor application is submitted">
                  <Switch checked={adminAlertNewApp} onCheckedChange={setAdminAlertNewApp} />
                </SettingRow>
              </Card>
            </motion.div>
          </TabsContent>

          {/* PAYMENT */}
          <TabsContent value="payment">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Main Toggle */}
              <Card className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Payment Settings</h2>
                <p className="text-sm text-slate-400 mb-6">Configure payment gateways, pricing rules, and payout policies</p>

                <SettingRow icon={DollarSign} iconColor="bg-purple-600" label="Enable Paid Courses" description="Allow courses to be sold for a price on the platform">
                  <Switch checked={paymentEnabled} onCheckedChange={setPaymentEnabled} />
                </SettingRow>
              </Card>

              {paymentEnabled && (
                <>
                  {/* Payment Gateways */}
                  <Card className="glass-card rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Payment Gateways</h3>
                    <p className="text-sm text-slate-400 mb-6">Connect your payment processors to accept payments</p>

                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl border-2 border-slate-100/80 bg-white/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center shadow-md">
                              <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">Stripe</p>
                              <p className="text-xs text-slate-400">Accept credit cards, Apple Pay, Google Pay</p>
                            </div>
                          </div>
                          <Switch checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
                        </div>
                        {stripeEnabled && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100/50">
                            <div className="space-y-2">
                              <Label className="text-xs">Publishable Key</Label>
                              <Input value={stripePublicKey} onChange={e => setStripePublicKey(e.target.value)} placeholder="pk_live_..." className="rounded-xl bg-white/50 text-sm" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Secret Key</Label>
                              <Input value={stripeSecretKey} onChange={e => setStripeSecretKey(e.target.value)} placeholder="sk_live_..." type="password" className="rounded-xl bg-white/50 text-sm" />
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl border-2 border-slate-100/80 bg-white/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-md">
                              <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">PayPal</p>
                              <p className="text-xs text-slate-400">Accept PayPal balance and linked accounts</p>
                            </div>
                          </div>
                          <Switch checked={paypalEnabled} onCheckedChange={setPaypalEnabled} />
                        </div>
                        {paypalEnabled && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-3 border-t border-slate-100/50">
                            <div className="space-y-2 max-w-md">
                              <Label className="text-xs">Client ID</Label>
                              <Input value={paypalClientId} onChange={e => setPaypalClientId(e.target.value)} placeholder="AX..." className="rounded-xl bg-white/50 text-sm" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Pricing & Currency */}
                  <Card className="glass-card rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Pricing & Currency</h3>
                    <p className="text-sm text-slate-400 mb-6">Set currency, pricing boundaries, and commission</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="rounded-xl bg-white/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Platform Fee (%)</Label>
                        <Input value={platformFee} onChange={e => setPlatformFee(e.target.value)} type="number" className="rounded-xl bg-white/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Price</Label>
                        <Input value={minCoursePrice} onChange={e => setMinCoursePrice(e.target.value)} type="number" className="rounded-xl bg-white/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Price</Label>
                        <Input value={maxCoursePrice} onChange={e => setMaxCoursePrice(e.target.value)} type="number" className="rounded-xl bg-white/50" />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100/50">
                      {/* Features Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Coupon Codes Card */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-slate-100/80 bg-gradient-to-br from-white/50 to-slate-50/30 p-5 hover:border-purple-200/50 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                              <Tag className="w-6 h-6 text-white" />
                            </div>
                            <Switch checked={allowCoupons} onCheckedChange={setAllowCoupons} />
                          </div>
                          <h3 className="font-semibold text-slate-800 text-sm mb-1">Allow Coupon Codes</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">Enable instructors to create discount codes for their courses</p>
                        </motion.div>

                        {/* Tax Collection Card */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border-2 border-slate-100/80 bg-gradient-to-br from-white/50 to-slate-50/30 p-5 hover:border-purple-200/50 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                              <Percent className="w-6 h-6 text-white" />
                            </div>
                            <Switch checked={taxEnabled} onCheckedChange={setTaxEnabled} />
                          </div>
                          <h3 className="font-semibold text-slate-800 text-sm mb-1">Enable Tax Collection</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">Automatically add tax to course purchases</p>
                        </motion.div>

                        {/* Free Trial Card */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border-2 border-slate-100/80 bg-gradient-to-br from-white/50 to-slate-50/30 p-5 hover:border-purple-200/50 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg">
                              <Clock className="w-6 h-6 text-white" />
                            </div>
                            <Switch checked={freeTrialEnabled} onCheckedChange={setFreeTrialEnabled} />
                          </div>
                          <h3 className="font-semibold text-slate-800 text-sm mb-1">Free Trial Period</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">Allow learners to preview paid courses before purchasing</p>
                        </motion.div>
                      </div>

                      {/* Conditional Settings */}
                      {taxEnabled && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-xl bg-purple-50/40 border border-purple-100/50">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-purple-900">Default Tax Rate (%)</Label>
                            <Input value={taxRate} onChange={e => setTaxRate(e.target.value)} type="number" className="rounded-xl bg-white/70 text-sm border-purple-100" />
                          </div>
                        </motion.div>
                      )}

                      {freeTrialEnabled && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 rounded-xl bg-purple-50/40 border border-purple-100/50">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-purple-900">Trial Duration (days)</Label>
                            <Input value={trialDays} onChange={e => setTrialDays(e.target.value)} type="number" className="rounded-xl bg-white/70 text-sm border-purple-100" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Card>

                  {/* Payouts & Refunds */}
                  <Card className="glass-card rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Payouts & Refunds</h3>
                    <p className="text-sm text-slate-400 mb-6">Configure instructor payouts and refund policies</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label>Payout Schedule</Label>
                        <Select value={payoutSchedule} onValueChange={setPayoutSchedule}>
                          <SelectTrigger className="rounded-xl bg-white/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Biweekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Payout Method</Label>
                        <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                          <SelectTrigger className="rounded-xl bg-white/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual Bank Transfer</SelectItem>
                            <SelectItem value="stripe">Stripe Connect</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Min Payout Amount</Label>
                        <Input value={minPayoutAmount} onChange={e => setMinPayoutAmount(e.target.value)} type="number" className="rounded-xl bg-white/50" />
                        <p className="text-xs text-slate-400">Minimum balance to trigger payout</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label>Refund Window (days)</Label>
                        <Input value={refundWindow} onChange={e => setRefundWindow(e.target.value)} type="number" className="rounded-xl bg-white/50" />
                        <p className="text-xs text-slate-400">Days after purchase a refund can be requested</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Invoice Prefix</Label>
                        <Input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} className="rounded-xl bg-white/50" />
                        <p className="text-xs text-slate-400">Prefix for generated invoice numbers</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100/50">
                      <SettingRow icon={RefreshCw} iconColor="bg-purple-600" label="Automatic Refunds" description="Automatically process refunds within the refund window without admin approval">
                        <Switch checked={autoRefunds} onCheckedChange={setAutoRefunds} />
                      </SettingRow>
                    </div>
                  </Card>
                </>
              )}
            </motion.div>
          </TabsContent>

          {/* SECURITY */}
          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Security Settings</h2>
                <p className="text-sm text-slate-400 mb-8">Configure authentication and access security</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8 pb-8 border-b border-slate-100/50">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Session Timeout (minutes)</Label>
                    <div className="text-5xl font-bold text-slate-900 mb-4">{sessionTimeout}</div>
                    <Input value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} type="number" className="rounded-xl bg-white/70 h-11 text-sm" />
                    <p className="text-sm text-slate-500 mt-3">Auto-logout after inactivity</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Max Login Attempts</Label>
                    <div className="text-5xl font-bold text-slate-900 mb-4">{maxLoginAttempts}</div>
                    <Input value={maxLoginAttempts} onChange={e => setMaxLoginAttempts(e.target.value)} type="number" className="rounded-xl bg-white/70 h-11 text-sm" />
                    <p className="text-sm text-slate-500 mt-3">Lock account after failed attempts</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/40 border border-slate-100/80 hover:border-slate-200/80 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-200/50 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-base">Force Password Change</p>
                      <p className="text-sm text-slate-500 mt-1">Require users to change password every 90 days</p>
                    </div>
                    <Switch checked={forcePasswordChange} onCheckedChange={setForcePasswordChange} className="ml-4 flex-shrink-0" />
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/40 border border-slate-100/80 hover:border-slate-200/80 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-base">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500 mt-1">Enable optional 2FA for all user accounts</p>
                    </div>
                    <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} className="ml-4 flex-shrink-0" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Save footer */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} className="bg-purple-600 text-white shadow-xl shadow-purple-600/20 h-12 px-8 rounded-xl">
            <Save className="w-5 h-5 mr-2" />Save All Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}