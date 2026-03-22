import { useState, useEffect } from 'react'; // FIXED: Added useEffect
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import BackButton from '../../components/BackButton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { motion } from 'motion/react';
import { Crown, Check, X, Clock, Mail, User, Calendar, MessageSquare, Sparkles, Star } from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { type TutorApplication } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { getApplications, updateApplicationStatus } from '../../services/applicationsService'; // FIXED: Import application service
import { sendCredentialsEmail, sendApplicationRejectionEmail } from '../../../utils/email';

export default function TutorApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // FIXED: Load applications from localStorage on mount
  const loadApplications = () => {
    console.log('🔄 Loading applications from localStorage...');
    const loadedApplications = getApplications();
    console.log('📊 Loaded applications:', loadedApplications);
    console.log(`✅ Found ${loadedApplications.length} applications`);
    setApplications(loadedApplications);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white">
        <DashboardLayout>
          <div className="max-w-3xl mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold text-slate-700 mb-4">Access Denied</h1>
            <p className="text-slate-600 mb-6">This page is only accessible to administrators.</p>
            <Button onClick={() => navigate('/courses')}>Go to Courses</Button>
          </div>
        </DashboardLayout>
      </div>
    );
  }

  // Helper: Generate teacher ID
  const generateTeacherId = () => {
    return `tutor-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  };

  // Helper: Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Helper: Send credentials via email (simulated with toast)
  const handleApprove = async (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    // Generate teacher credentials
    const teacherId = generateTeacherId();
    const password = generatePassword();

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7']
    });

    setApplications(apps =>
      apps.map(app =>
        app.id === applicationId
          ? { ...app, status: 'approved' as const, reviewedAt: new Date().toISOString().split('T')[0], reviewedBy: user.id }
          : app
      )
    );

    // Send credentials email via Resend
    try {
      await sendCredentialsEmail(application.userEmail, teacherId, password, application.userName);
      toast.success(`Application approved and credentials sent to ${application.userEmail}! 📧`, {
        description: `Teacher ID: ${teacherId} | Password sent via email`
      });
    } catch (error) {
      console.error('Failed to send credentials email:', error);
      toast.error('Application approved but email failed to send', {
        description: 'Check your email configuration in the environment variables'
      });
    }

    // Update application status in the service
    updateApplicationStatus(applicationId, 'approved', user.id);
  };

  const handleReject = async (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setApplications(apps =>
      apps.map(app =>
        app.id === applicationId
          ? { ...app, status: 'rejected' as const, reviewedAt: new Date().toISOString().split('T')[0], reviewedBy: user.id }
          : app
      )
    );

    // Send rejection email via Resend
    try {
      await sendApplicationRejectionEmail(application.userEmail, application.userName);
      toast.success('Application rejected and notification sent', {
        description: `Rejection email sent to ${application.userEmail}`
      });
    } catch (error) {
      console.error('Failed to send rejection email:', error);
      toast.error('Application rejected but email failed to send');
    }

    // Update application status in the service
    updateApplicationStatus(applicationId, 'rejected', user.id);
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' ? true : app.status === filter
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackButton label="Dashboard" to="/dashboard/admin" />
        {/* Header with Admin Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full mb-4">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Admin Portal
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">
                Tutor <span className="bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">Applications</span>
              </h1>
              <p className="text-slate-600">Review and manage instructor applications to join the admin team</p>
            </div>
            <Button
              onClick={() => {
                loadApplications();
                toast.success('Applications refreshed! 🔄');
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4 bg-white/70 backdrop-blur-sm border-white/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Applications</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-amber-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/70 backdrop-blur-sm border-white/40 cursor-pointer hover:scale-105 transition-transform" onClick={() => setFilter('pending')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/70 backdrop-blur-sm border-white/40 cursor-pointer hover:scale-105 transition-transform" onClick={() => setFilter('approved')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-400 to-amber-500 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/70 backdrop-blur-sm border-white/40 cursor-pointer hover:scale-105 transition-transform" onClick={() => setFilter('rejected')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center">
                <X className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6"
        >
          {['all', 'pending', 'approved', 'rejected'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'default' : 'outline'}
              onClick={() => setFilter(filterOption as typeof filter)}
              className={filter === filterOption ? 'bg-gradient-to-r from-red-500 to-amber-600 text-white' : ''}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </motion.div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-red-100 to-amber-100 mb-4">
                <Star className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {filter === 'pending' ? 'No Pending Applications' : filter === 'all' ? 'No Applications Yet' : `No ${filter} Applications`}
              </h3>
              <p className="text-slate-500">
                {filter === 'pending' ? 'All caught up! Check back later for new applications.' : 'Waiting for rising stars to apply ✨'}
              </p>
            </motion.div>
          ) : (
            filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="p-6 bg-white/70 backdrop-blur-sm border-white/40 hover:shadow-lg transition-all">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* User Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                        <AvatarImage src={application.userAvatar} alt={application.userName} />
                        <AvatarFallback className="bg-gradient-to-br from-red-400 to-amber-600 text-white">
                          {application.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">{application.userName}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <Mail className="w-4 h-4" />
                              <span>{application.userEmail}</span>
                            </div>
                          </div>
                          <Badge
                            className={
                              application.status === 'pending'
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse shadow-lg shadow-yellow-500/30'
                                : application.status === 'approved'
                                ? 'bg-gradient-to-r from-red-400 to-amber-500 text-white shadow-lg shadow-red-500/30'
                                : 'bg-gradient-to-r from-red-400 to-rose-500 text-white'
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>

                        {/* Message */}
                        <div className="bg-slate-50 rounded-lg p-4 mt-3">
                          <div className="flex items-start gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5" />
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Application Message</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{application.message}</p>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Submitted {application.submittedAt}</span>
                          </div>
                          {application.reviewedAt && (
                            <div className="flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Reviewed {application.reviewedAt}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {application.status === 'pending' && (
                      <div className="flex md:flex-col gap-2">
                        <Button
                          onClick={() => handleApprove(application.id)}
                          className="flex-1 md:flex-none bg-gradient-to-r from-red-400 to-amber-500 hover:from-red-500 hover:to-amber-600 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(application.id)}
                          variant="outline"
                          className="flex-1 md:flex-none text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}