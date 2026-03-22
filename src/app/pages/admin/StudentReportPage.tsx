import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { users, courses, userProgress, lessons, quizzes, getBadgeLevel } from '../../data/mockData';
import {
  ArrowLeft, BookOpen, Clock, CheckCircle, Target, Award, HelpCircle,
  TrendingUp, Calendar, Mail, Crown, BarChart3, Zap, Star, Trophy
} from 'lucide-react';
import { motion } from 'motion/react';

export default function StudentReportPage() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || (user.role !== 'admin' && user.role !== 'tutor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Access Required</h2>
          <Button onClick={() => navigate('/courses')} className="mt-4 rounded-xl">Go to Courses</Button>
        </div>
      </div>
    );
  }

  const student = users.find(u => u.id === studentId);
  if (!student) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-4">Student Not Found</h2>
          <Button onClick={() => navigate('/admin/reports')} className="rounded-xl">Back to Reports</Button>
        </div>
      </DashboardLayout>
    );
  }

  const badge = getBadgeLevel(student.points);
  const studentProgress = userProgress.filter(p => p.userId === studentId);

  // Build course rows
  const courseRows = studentProgress.map(progress => {
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

    // Quiz results for this course
    const courseQuizResults = progress.quizResults || [];
    const totalQuizPoints = courseQuizResults.reduce((a, qr) => a + qr.pointsEarned, 0);

    return {
      course,
      totalLessons,
      completedCount,
      completionPct,
      status,
      timeSpent: progress.timeSpent,
      lastAccessed: progress.lastAccessed,
      quizResults: courseQuizResults,
      quizPoints: totalQuizPoints,
    };
  });

  // Also add courses student hasn't enrolled in
  const enrolledCourseIds = new Set(studentProgress.map(p => p.courseId));
  courses.filter(c => c.published && !enrolledCourseIds.has(c.id)).forEach(c => {
    courseRows.push({
      course: c,
      totalLessons: lessons.filter(l => l.courseId === c.id).length,
      completedCount: 0,
      completionPct: 0,
      status: 'Yet to Start' as const,
      timeSpent: 0,
      lastAccessed: '—',
      quizResults: [],
      quizPoints: 0,
    });
  });

  // Summary stats
  const totalEnrolled = studentProgress.length;
  const totalCompleted = courseRows.filter(r => r.status === 'Completed').length;
  const totalTimeSpent = courseRows.reduce((a, r) => a + r.timeSpent, 0);
  const avgCompletion = courseRows.length > 0
    ? Math.round(courseRows.filter(r => r.status !== 'Yet to Start' || enrolledCourseIds.has(r.course?.id || '')).reduce((a, r) => a + r.completionPct, 0) / (totalEnrolled || 1))
    : 0;
  const totalQuizPoints = courseRows.reduce((a, r) => a + r.quizPoints, 0);
  const totalQuizzesTaken = courseRows.reduce((a, r) => a + r.quizResults.length, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Yet to Start': return <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg text-xs shadow-sm">Yet to Start</Badge>;
      case 'In Progress': return <Badge className="bg-red-500 text-white rounded-lg text-xs shadow-sm">In Progress</Badge>;
      case 'Completed': return <Badge className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-lg text-xs shadow-sm">Completed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back + Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/reports')} className="rounded-xl">
            <ArrowLeft className="w-5 h-5 mr-2" />Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Student Report
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/20">
                <Crown className="w-4 h-4 text-white" />
                <span className="text-xs font-semibold text-white">Admin View</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Profile Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="glass-card rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-100/30 to-amber-100/20 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="relative flex items-start gap-6">
              <Avatar className="w-20 h-20 ring-4 ring-white shadow-xl">
                <AvatarImage src={student.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-amber-600 text-white text-2xl">
                  {student.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{student.name}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{student.email}</span>
                  <Badge variant="secondary" className="rounded-lg capitalize">{student.role}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-50 to-amber-50 rounded-full border border-red-100">
                    <span className="text-lg">{badge.icon}</span>
                    <div className="text-xs">
                      <p className="font-semibold text-red-700">{badge.level}</p>
                      <p className="text-red-400">{student.points} pts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>Member since Jan 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Enrolled', value: totalEnrolled, icon: BookOpen, color: 'from-red-500 to-amber-500' },
            { label: 'Completed', value: totalCompleted, icon: CheckCircle, color: 'from-red-500 to-amber-500' },
            { label: 'Avg Progress', value: `${avgCompletion}%`, icon: TrendingUp, color: 'from-red-500 to-red-600' },
            { label: 'Time Spent', value: `${totalTimeSpent}m`, icon: Clock, color: 'from-amber-500 to-orange-500' },
            { label: 'Quizzes Taken', value: totalQuizzesTaken, icon: HelpCircle, color: 'from-red-500 to-amber-500' },
            { label: 'Quiz Points', value: totalQuizPoints, icon: Trophy, color: 'from-red-500 to-amber-500' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="glass-card rounded-2xl p-4 text-center hover:shadow-xl transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-2 shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Course Progress Table */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100/50">
              <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Course Progress
                <span className="text-sm font-normal text-slate-400 ml-3">({courseRows.length} courses)</span>
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Quiz Score</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseRows.map((row, i) => (
                    <motion.tr key={row.course?.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-red-50/30 transition-colors">
                      <TableCell className="font-medium text-slate-400">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <img src={row.course?.coverImage} alt="" className="w-10 h-7 rounded-md object-cover" />
                          <div>
                            <p className="font-medium text-slate-700 text-sm">{row.course?.title}</p>
                            <p className="text-[10px] text-slate-400">{row.course?.instructorName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-28">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold">{row.completionPct}%</span>
                          </div>
                          <Progress value={row.completionPct} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          <span className="font-semibold text-slate-700">{row.completedCount}</span>
                          <span className="text-slate-400"> / {row.totalLessons}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{row.timeSpent > 0 ? `${row.timeSpent} min` : '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.quizResults.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-sm font-semibold text-amber-700">{row.quizPoints} pts</span>
                            <span className="text-[10px] text-slate-400">({row.quizResults.length} quiz{row.quizResults.length > 1 ? 'zes' : ''})</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{row.lastAccessed}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>

        {/* Quiz Results Detail */}
        {studentProgress.some(p => p.quizResults.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
            <Card className="glass-card rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <HelpCircle className="w-6 h-6 inline mr-2 text-amber-500" />
                Quiz Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentProgress.flatMap(p =>
                  p.quizResults.map(qr => {
                    const quiz = quizzes.find(q => q.id === qr.quizId);
                    const course = courses.find(c => c.id === p.courseId);
                    return (
                      <Card key={`${p.courseId}-${qr.quizId}`} className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                            <HelpCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-sm">{quiz?.title || 'Quiz'}</h4>
                            <p className="text-xs text-slate-400">{course?.title}</p>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                              <div className="text-center p-2 bg-white/60 rounded-lg">
                                <p className="text-lg font-bold text-slate-700">{qr.score}/{quiz?.questions.length || '?'}</p>
                                <p className="text-[10px] text-slate-400">Score</p>
                              </div>
                              <div className="text-center p-2 bg-white/60 rounded-lg">
                                <p className="text-lg font-bold text-amber-600">{qr.pointsEarned}</p>
                                <p className="text-[10px] text-slate-400">Points</p>
                              </div>
                              <div className="text-center p-2 bg-white/60 rounded-lg">
                                <p className="text-lg font-bold text-slate-700">{qr.attempts}</p>
                                <p className="text-[10px] text-slate-400">Attempts</p>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2">Completed on {qr.completedAt}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}