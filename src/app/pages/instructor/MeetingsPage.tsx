import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { courses, enrollments, users } from '../../data/mockData';
import {
  Video, Plus, Send, Calendar, Clock, Link2, Users, Search,
  CheckCircle2, Mail, ExternalLink, GraduationCap, Trash2, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Meeting {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  meetingLink: string;
  date: string;
  time: string;
  duration: string;
  sentTo: string[];
  createdAt: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const initialMeetings: Meeting[] = [
  {
    id: 'meet-1',
    title: 'React Hooks Deep Dive - Live Session',
    courseId: 'course-1',
    courseName: 'Master React & TypeScript',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    date: '2026-03-25',
    time: '10:00',
    duration: '60 min',
    sentTo: ['learner-1', 'learner-2'],
    createdAt: '2026-03-20',
    status: 'scheduled',
  },
  {
    id: 'meet-2',
    title: 'Q&A: UI Design Principles',
    courseId: 'course-2',
    courseName: 'UI/UX Design Fundamentals',
    meetingLink: 'https://zoom.us/j/1234567890',
    date: '2026-03-22',
    time: '14:00',
    duration: '45 min',
    sentTo: ['learner-1'],
    createdAt: '2026-03-19',
    status: 'completed',
  },
  {
    id: 'meet-3',
    title: 'Node.js Architecture Workshop',
    courseId: 'course-3',
    courseName: 'Advanced Node.js Development',
    meetingLink: 'https://teams.microsoft.com/l/meetup/xyz',
    date: '2026-03-28',
    time: '16:00',
    duration: '90 min',
    sentTo: ['learner-1', 'learner-2', 'learner-3'],
    createdAt: '2026-03-21',
    status: 'scheduled',
  },
];

export default function MeetingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formMessage, setFormMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  if (!user || user.role !== 'tutor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card rounded-3xl p-12">
          <h2 className="text-2xl font-bold text-slate-700 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Instructor Access Required</h2>
          <p className="text-slate-600 mb-6">This page is only accessible to instructors.</p>
          <Button onClick={() => navigate('/courses')} className="bg-red-500 text-white rounded-xl">Go to Courses</Button>
        </div>
      </div>
    );
  }

  // Get instructor's courses only
  const myCourses = courses.filter(c => c.instructorId === user.id);

  // Get enrolled students for a specific course
  const getEnrolledStudents = (courseId: string) => {
    const enrolled = enrollments.filter(e => e.courseId === courseId);
    return enrolled.map(e => users.find(u => u.id === e.userId)).filter(Boolean) as typeof users;
  };

  // Get all enrolled students across all instructor's courses
  const allEnrolledStudents = useMemo(() => {
    const studentMap = new Map<string, typeof users[0]>();
    myCourses.forEach(course => {
      getEnrolledStudents(course.id).forEach(s => studentMap.set(s.id, s));
    });
    return Array.from(studentMap.values());
  }, []);

  // Students for selected course in form
  const courseStudents = formCourseId ? getEnrolledStudents(formCourseId) : allEnrolledStudents;

  const filteredMeetings = meetings.filter(m => {
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.courseName.toLowerCase().includes(q);
    }
    return true;
  });

  const resetForm = () => {
    setFormTitle('');
    setFormCourseId('');
    setFormLink('');
    setFormDate('');
    setFormTime('');
    setFormDuration('60');
    setFormMessage('');
    setSelectedStudents([]);
  };

  const handleCreateMeeting = () => {
    if (!formTitle.trim()) { toast.error('Meeting title is required'); return; }
    if (!formCourseId) { toast.error('Please select a course'); return; }
    if (!formLink.trim()) { toast.error('Meeting link is required'); return; }
    if (!formDate) { toast.error('Date is required'); return; }
    if (!formTime) { toast.error('Time is required'); return; }
    if (selectedStudents.length === 0) { toast.error('Select at least one student'); return; }

    const course = myCourses.find(c => c.id === formCourseId);
    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      title: formTitle,
      courseId: formCourseId,
      courseName: course?.title || '',
      meetingLink: formLink,
      date: formDate,
      time: formTime,
      duration: `${formDuration} min`,
      sentTo: selectedStudents,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'scheduled',
    };

    setMeetings(prev => [newMeeting, ...prev]);
    toast.success(`Meeting created & email sent to ${selectedStudents.length} student(s)!`);
    resetForm();
    setCreateOpen(false);
  };

  const handleSendEmail = () => {
    if (!selectedMeeting) return;
    if (selectedStudents.length === 0) { toast.error('Select at least one student'); return; }
    
    const studentNames = selectedStudents.map(id => users.find(u => u.id === id)?.name || 'Unknown').join(', ');
    toast.success(`Meeting link emailed to: ${studentNames}`);
    
    setMeetings(prev => prev.map(m => 
      m.id === selectedMeeting.id ? { ...m, sentTo: [...new Set([...m.sentTo, ...selectedStudents])] } : m
    ));
    setSelectedStudents([]);
    setFormMessage('');
    setSendEmailOpen(false);
    setSelectedMeeting(null);
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    toast.success('Meeting deleted');
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId) ? prev.filter(s => s !== studentId) : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (selectedStudents.length === courseStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(courseStudents.map(s => s.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusIconBg = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-amber-100 text-amber-600';
      case 'completed': return 'bg-emerald-100 text-emerald-600';
      case 'cancelled': return 'bg-slate-200 text-slate-500';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  const statusCounts = {
    all: meetings.length,
    scheduled: meetings.filter(m => m.status === 'scheduled').length,
    completed: meetings.filter(m => m.status === 'completed').length,
    cancelled: meetings.filter(m => m.status === 'cancelled').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Meetings
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200">
                <GraduationCap className="w-3.5 h-3.5" /> Instructor
              </span>
            </div>
            <p className="text-sm text-slate-400">Schedule live meetings and send links directly to your students</p>
          </div>
          <Button onClick={() => { resetForm(); setCreateOpen(true); }} className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm shadow-red-600/15 h-10 px-5 text-sm font-medium">
            <Plus className="w-5 h-5 mr-2" />
            New Meeting
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {([
            ['all', 'All Meetings', 'bg-red-50 text-red-600'],
            ['scheduled', 'Scheduled', 'bg-amber-50 text-amber-600'],
            ['completed', 'Completed', 'bg-emerald-50 text-emerald-600'],
            ['cancelled', 'Cancelled', 'bg-slate-100 text-slate-500']
          ] as const).map(([key, label, iconColor]) => (
            <Card
              key={key}
              onClick={() => setFilterStatus(key as any)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${filterStatus === key ? 'border-red-300 bg-red-50/30 shadow-md' : 'border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300'}`}
            >
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${iconColor} mb-3`}>
                <Video className="w-4 h-4" />
              </div>
              <p className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{statusCounts[key as keyof typeof statusCounts]}</p>
              <p className="text-xs text-slate-400 font-medium">{label}</p>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search meetings..." className="pl-10 h-10 bg-white rounded-xl border-slate-200 text-sm" />
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredMeetings.map((meeting, i) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${getStatusIconBg(meeting.status)} flex items-center justify-center`}>
                      <Video className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h3 className="font-semibold text-slate-800 truncate text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{meeting.title}</h3>
                        <Badge className={`${getStatusColor(meeting.status)} rounded-md text-[10px] capitalize font-medium border`}>
                          {meeting.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-medium mb-2">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {meeting.courseName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {meeting.time} ({meeting.duration})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {meeting.sentTo.length} student{meeting.sentTo.length !== 1 ? 's' : ''} notified
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                        <Link2 className="w-3 h-3" />
                        <span className="truncate max-w-xs">{meeting.meetingLink}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedMeeting(meeting); setSelectedStudents([]); setFormMessage(''); setSendEmailOpen(true); }}
                        className="rounded-lg text-xs border-slate-200"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(meeting.meetingLink, '_blank')}
                        className="rounded-lg text-xs border-slate-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />Open
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="rounded-lg text-xs border-slate-200 text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredMeetings.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-red-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No meetings found</h3>
              <p className="text-sm text-slate-400 mb-4">Schedule your first live meeting with students</p>
              <Button onClick={() => { resetForm(); setCreateOpen(true); }} className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm text-sm">
                <Plus className="w-4 h-4 mr-2" />New Meeting
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Schedule New Meeting
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">Meeting Title *</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Live Q&A Session" className="rounded-xl border-slate-200 h-10 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">Course *</Label>
              <select
                value={formCourseId}
                onChange={e => { setFormCourseId(e.target.value); setSelectedStudents([]); }}
                className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-sm"
              >
                <option value="">Select a course</option>
                {myCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">Meeting Link *</Label>
              <Input value={formLink} onChange={e => setFormLink(e.target.value)} placeholder="https://meet.google.com/..." className="rounded-xl border-slate-200 h-10 text-sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">Date *</Label>
                <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="rounded-xl border-slate-200 h-10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">Time *</Label>
                <Input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="rounded-xl border-slate-200 h-10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">Duration (min)</Label>
                <Input type="number" value={formDuration} onChange={e => setFormDuration(e.target.value)} className="rounded-xl border-slate-200 h-10 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-600">Custom Message (optional)</Label>
              <textarea
                value={formMessage}
                onChange={e => setFormMessage(e.target.value)}
                placeholder="Add a personal message..."
                className="w-full h-20 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-600">Send to Students *</Label>
                <Button variant="ghost" size="sm" onClick={selectAllStudents} className="text-xs text-red-600 font-medium rounded-lg h-7">
                  {selectedStudents.length === courseStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              {courseStudents.length === 0 ? (
                <p className="text-sm text-slate-400 py-3 text-center bg-slate-50 rounded-xl font-medium">
                  {formCourseId ? 'No students enrolled' : 'Select a course first'}
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {courseStudents.map(student => (
                    <label
                      key={student.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                        selectedStudents.includes(student.id) ? 'bg-red-50 ring-1 ring-red-200' : 'hover:bg-white'
                      }`}
                    >
                      <input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudent(student.id)} className="w-4 h-4 rounded accent-indigo-600" />
                      <img src={student.avatar} alt={student.name} className="w-7 h-7 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{student.name}</p>
                        <p className="text-xs text-slate-400 truncate">{student.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {selectedStudents.length > 0 && formTitle && formLink && (
              <div className="p-3.5 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-semibold text-red-600">Email Preview</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><span className="font-medium">To:</span> {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}</p>
                  <p><span className="font-medium">Subject:</span> You're invited: {formTitle}</p>
                  <p className="pt-1 text-slate-500">Hi [Student], you're invited to "{myCourses.find(c => c.id === formCourseId)?.title}" on {formDate ? new Date(formDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '...'} at {formTime || '...'}.{formMessage ? ` ${formMessage}` : ''}</p>
                  <p className="pt-1"><span className="font-medium">Link:</span> <span className="text-red-600">{formLink}</span></p>
                </div>
              </div>
            )}

            <div className="flex gap-2.5 justify-end pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl text-sm border-slate-200">Cancel</Button>
              <Button onClick={handleCreateMeeting} className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm shadow-sm">
                <Send className="w-4 h-4 mr-1.5" />Create & Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog (for existing meetings) */}
      <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
        <DialogContent className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Send Meeting Link
            </DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-medium text-slate-800 text-sm">{selectedMeeting.title}</p>
                <p className="text-xs text-slate-400 mt-1">{selectedMeeting.courseName} - {new Date(selectedMeeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedMeeting.time}</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                  <Link2 className="w-3 h-3" />
                  <span className="truncate">{selectedMeeting.meetingLink}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-600">Custom Message (optional)</Label>
                <textarea value={formMessage} onChange={e => setFormMessage(e.target.value)} placeholder="Add a note..." className="w-full h-16 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm resize-none" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-600">Select Students</Label>
                  <Button variant="ghost" size="sm" onClick={selectAllStudents} className="text-xs text-red-600 font-medium rounded-lg h-7">
                    {selectedStudents.length === allEnrolledStudents.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {allEnrolledStudents.map(student => {
                    const alreadySent = selectedMeeting.sentTo.includes(student.id);
                    return (
                      <label key={student.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${selectedStudents.includes(student.id) ? 'bg-red-50 ring-1 ring-red-200' : 'hover:bg-white'}`}>
                        <input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudent(student.id)} className="w-4 h-4 rounded accent-indigo-600" />
                        <img src={student.avatar} alt={student.name} className="w-7 h-7 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{student.name}</p>
                          <p className="text-xs text-slate-400 truncate">{student.email}</p>
                        </div>
                        {alreadySent && (
                          <Badge variant="secondary" className="text-[10px] rounded-md bg-emerald-50 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-0.5" />Sent
                          </Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <Button variant="outline" onClick={() => setSendEmailOpen(false)} className="rounded-xl text-sm border-slate-200">Cancel</Button>
                <Button onClick={handleSendEmail} className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm shadow-sm" disabled={selectedStudents.length === 0}>
                  <Send className="w-4 h-4 mr-1.5" />Send Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}