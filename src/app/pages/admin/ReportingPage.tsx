import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import BackButton from '../../components/BackButton';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { users, courses, userProgress, lessons } from '../../data/mockData';
import { Search, Users as UsersIcon, BookOpen, TrendingUp, Clock, CheckCircle, Target, Settings2, PlayCircle, Crown, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

type StatusFilter = 'all' | 'yet-to-start' | 'in-progress' | 'completed';

const allColumns = [
  { key: 'srNo', label: 'Sr. No.' },
  { key: 'courseName', label: 'Course Name' },
  { key: 'participant', label: 'Participant Name' },
  { key: 'enrolledDate', label: 'Enrolled Date' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'timeSpent', label: 'Time Spent' },
  { key: 'completion', label: 'Completion %' },
  { key: 'completedDate', label: 'Completed Date' },
  { key: 'status', label: 'Status' },
];

export default function ReportingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(allColumns.map(c => c.key));

  if (!user || (user.role !== 'admin' && user.role !== 'tutor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-700">Admin Access Required</h2>
          <Button onClick={() => navigate('/courses')} className="mt-4 rounded-xl">Go to Courses</Button>
        </div>
      </div>
    );
  }

  // Build per-enrollment rows
  const enrollmentRows = userProgress.map(progress => {
    const learner = users.find(u => u.id === progress.userId);
    const course = courses.find(c => c.id === progress.courseId);
    const courseLessons = lessons.filter(l => l.courseId === progress.courseId);
    const totalLessons = courseLessons.length;
    const completedCount = progress.completedLessons.length;
    const completionPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isCompleted = completionPct === 100;
    const isStarted = completedCount > 0;

    let status: 'Yet to Start' | 'In Progress' | 'Completed' = 'Yet to Start';
    if (isCompleted) status = 'Completed';
    else if (isStarted) status = 'In Progress';

    return {
      id: `${progress.userId}-${progress.courseId}`,
      learner,
      course,
      enrolledDate: course?.createdAt || '—',
      startDate: isStarted ? progress.lastAccessed : '—',
      timeSpent: progress.timeSpent,
      completionPct,
      completedDate: isCompleted ? progress.lastAccessed : '—',
      status,
    };
  });

  // Also add learners with no progress (yet to start)
  const learnersWithProgress = new Set(userProgress.map(p => p.userId));
  const learnerUsers = users.filter(u => u.role === 'learner');
  // For learners with no enrollments at all, add mock "yet to start" for a few courses
  learnerUsers.forEach(learner => {
    if (!learnersWithProgress.has(learner.id)) {
      const publishedCourses = courses.filter(c => c.published);
      if (publishedCourses.length > 0) {
        enrollmentRows.push({
          id: `${learner.id}-${publishedCourses[0].id}`,
          learner,
          course: publishedCourses[0],
          enrolledDate: '2026-03-15',
          startDate: '—',
          timeSpent: 0,
          completionPct: 0,
          completedDate: '—',
          status: 'Yet to Start',
        });
      }
    }
  });

  const filteredRows = enrollmentRows.filter(row => {
    if (!row.learner || !row.course) return false;
    // Status filter
    if (statusFilter === 'yet-to-start' && row.status !== 'Yet to Start') return false;
    if (statusFilter === 'in-progress' && row.status !== 'In Progress') return false;
    if (statusFilter === 'completed' && row.status !== 'Completed') return false;
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return row.learner.name.toLowerCase().includes(q) || row.course.title.toLowerCase().includes(q) || row.learner.email.toLowerCase().includes(q);
    }
    return true;
  });

  // Stats
  const totalParticipants = new Set(enrollmentRows.map(r => r.learner?.id)).size;
  const yetToStart = enrollmentRows.filter(r => r.status === 'Yet to Start').length;
  const inProgress = enrollmentRows.filter(r => r.status === 'In Progress').length;
  const completed = enrollmentRows.filter(r => r.status === 'Completed').length;

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isCol = (key: string) => visibleColumns.includes(key);

  const statCards = [
    { label: 'Total Participants', value: totalParticipants, icon: UsersIcon, color: 'from-red-500 to-amber-500', filter: 'all' as StatusFilter },
    { label: 'Yet to Start', value: yetToStart, icon: PlayCircle, color: 'from-amber-500 to-orange-500', filter: 'yet-to-start' as StatusFilter },
    { label: 'In Progress', value: inProgress, icon: TrendingUp, color: 'from-red-500 to-red-600', filter: 'in-progress' as StatusFilter },
    { label: 'Completed', value: completed, icon: CheckCircle, color: 'from-red-500 to-amber-500', filter: 'completed' as StatusFilter },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Yet to Start':
        return <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg text-xs shadow-sm">Yet to Start</Badge>;
      case 'In Progress':
        return <Badge className="bg-red-500 text-white rounded-lg text-xs shadow-sm">In Progress</Badge>;
      case 'Completed':
        return <Badge className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-lg text-xs shadow-sm">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton label="Dashboard" to="/dashboard/admin" />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Reporting Dashboard
              </h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/20">
                <Crown className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">Admin</span>
              </div>
            </div>
            <p className="text-slate-600">Track learner progress and course performance</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card
                onClick={() => setStatusFilter(statusFilter === card.filter ? 'all' : card.filter)}
                className={`p-6 rounded-3xl cursor-pointer transition-all relative overflow-hidden group ${
                  statusFilter === card.filter
                    ? `bg-red-500 text-white shadow-2xl shadow-red-500/20 scale-[1.02]`
                    : 'glass-card hover:shadow-xl'
                }`}
              >
                <div className="absolute top-[-20px] right-[-20px] w-[80px] h-[80px] rounded-full border-2 border-white/10" />
                <div className="flex items-center justify-between mb-2">
                  <card.icon className={`w-8 h-8 ${statusFilter === card.filter ? 'text-white/80' : 'text-slate-400'}`} />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusFilter === card.filter ? 'bg-white/20' : `bg-gradient-to-br ${card.color}`}`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className={`text-4xl font-bold mb-1 ${statusFilter === card.filter ? '' : 'text-slate-800'}`}>{card.value}</p>
                <p className={`text-sm ${statusFilter === card.filter ? 'text-white/80' : 'text-slate-500'}`}>{card.label}</p>
                {statusFilter === card.filter && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/20 text-white text-xs">Active Filter</Badge>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Table Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-slate-100/50">
              <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Learner Progress
                <span className="text-sm font-normal text-slate-400 ml-3">({filteredRows.length} records)</span>
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search learners or courses..." className="pl-10 rounded-xl glass-card border-white/40" />
                </div>
                {/* Column Customizer */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="rounded-xl">
                      <Settings2 className="w-4 h-4 mr-2" />Columns
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="glass-card border-l-white/40">
                    <SheetHeader>
                      <SheetTitle className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Customize Columns</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-3">
                      {allColumns.map(col => (
                        <div key={col.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-colors">
                          <Checkbox
                            id={`col-${col.key}`}
                            checked={visibleColumns.includes(col.key)}
                            onCheckedChange={() => toggleColumn(col.key)}
                          />
                          <Label htmlFor={`col-${col.key}`} className="cursor-pointer flex-1">{col.label}</Label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-2">
                      <Button variant="outline" onClick={() => setVisibleColumns(allColumns.map(c => c.key))} className="rounded-xl flex-1">
                        Show All
                      </Button>
                      <Button variant="outline" onClick={() => setVisibleColumns(['srNo', 'courseName', 'participant', 'status'])} className="rounded-xl flex-1">
                        Minimal
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    {isCol('srNo') && <TableHead className="w-16">Sr.</TableHead>}
                    {isCol('courseName') && <TableHead>Course</TableHead>}
                    {isCol('participant') && <TableHead>Participant</TableHead>}
                    {isCol('enrolledDate') && <TableHead>Enrolled</TableHead>}
                    {isCol('startDate') && <TableHead>Started</TableHead>}
                    {isCol('timeSpent') && <TableHead>Time Spent</TableHead>}
                    {isCol('completion') && <TableHead>Completion</TableHead>}
                    {isCol('completedDate') && <TableHead>Completed</TableHead>}
                    {isCol('status') && <TableHead>Status</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-red-50/30 transition-colors"
                    >
                      {isCol('srNo') && <TableCell className="font-medium text-slate-400">{index + 1}</TableCell>}
                      {isCol('courseName') && (
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <img src={row.course?.coverImage} alt="" className="w-10 h-7 rounded-md object-cover" />
                            <span className="font-medium text-slate-700 text-sm">{row.course?.title}</span>
                          </div>
                        </TableCell>
                      )}
                      {isCol('participant') && (
                        <TableCell>
                          <Link to={`/admin/student/${row.learner?.id}`} className="flex items-center gap-2.5 group/link">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={row.learner?.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-red-400 to-amber-600 text-white text-xs">
                                {row.learner?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm group-hover/link:text-red-600 transition-colors flex items-center gap-1">
                                {row.learner?.name}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                              </p>
                              <p className="text-xs text-slate-400">{row.learner?.email}</p>
                            </div>
                          </Link>
                        </TableCell>
                      )}
                      {isCol('enrolledDate') && <TableCell className="text-sm text-slate-600">{row.enrolledDate}</TableCell>}
                      {isCol('startDate') && <TableCell className="text-sm text-slate-600">{row.startDate}</TableCell>}
                      {isCol('timeSpent') && (
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{row.timeSpent > 0 ? `${row.timeSpent} min` : '—'}</span>
                          </div>
                        </TableCell>
                      )}
                      {isCol('completion') && (
                        <TableCell>
                          <div className="w-28">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold">{row.completionPct}%</span>
                            </div>
                            <Progress value={row.completionPct} className="h-2" />
                          </div>
                        </TableCell>
                      )}
                      {isCol('completedDate') && <TableCell className="text-sm text-slate-600">{row.completedDate}</TableCell>}
                      {isCol('status') && <TableCell>{getStatusBadge(row.status)}</TableCell>}
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredRows.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-red-300" />
                </div>
                <p className="text-slate-500">No matching records found</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}