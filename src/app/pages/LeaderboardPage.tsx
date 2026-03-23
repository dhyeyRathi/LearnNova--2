import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import BackButton from '../components/BackButton';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { users, getBadgeLevel, enrollments, userProgress } from '../data/mockData';
import { Trophy, Medal, Crown, TrendingUp, Star, BookOpen, Target, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { motion } from 'motion/react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'all' | 'monthly' | 'weekly'>('all');

  // Get all learners sorted by points
  const learners = users
    .filter(u => u.role === 'learner')
    .map(learner => {
      const badge = getBadgeLevel(learner.points);
      const enrolled = enrollments.filter(e => e.userId === learner.id).length;
      const completed = enrollments.filter(e => e.userId === learner.id && e.completed).length;
      const totalLessonsCompleted = userProgress
        .filter(p => p.userId === learner.id)
        .reduce((sum, p) => sum + p.completedLessons.length, 0);
      return {
        ...learner,
        badge,
        enrolled,
        completed,
        totalLessonsCompleted,
      };
    })
    .sort((a, b) => b.points - a.points);

  const currentUserRank = user ? learners.findIndex(l => l.id === user.id) + 1 : 0;
  const currentUserData = user ? learners.find(l => l.id === user.id) : null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-lg font-bold text-slate-400">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 ring-2 ring-amber-200/50';
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 ring-1 ring-slate-200/50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 ring-1 ring-orange-200/50';
    return 'glass-card';
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-purple-600/30">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Leaderboard
          </h1>
          <p className="text-slate-500">See how you rank among fellow learners</p>
        </motion.div>

        {/* Current User Rank Card */}
        {user && currentUserData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-3xl p-6 mb-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-500 to-purple-500" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
            <div className="absolute top-[-30px] right-[-30px] w-[120px] h-[120px] rounded-full border-2 border-white/10" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-xl">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold bg-gradient-to-br from-purple-700 to-violet-600 bg-clip-text text-transparent">
                      #{currentUserRank}
                    </span>
                  </div>
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Your Ranking</h2>
                  <p className="text-white/70">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center text-white">
                  <p className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{user.points}</p>
                  <p className="text-xs text-white/60">Points</p>
                </div>
                <div className="text-center text-white">
                  <p className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>#{currentUserRank}</p>
                  <p className="text-xs text-white/60">Rank</p>
                </div>
                <div className="text-center">
                  <span className="text-4xl">{currentUserData.badge.icon}</span>
                  <p className="text-xs text-white/60">{currentUserData.badge.level}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-end justify-center gap-4 mb-10"
        >
          {/* 2nd Place */}
          {learners[1] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <Avatar className="w-16 h-16 ring-4 ring-slate-300 shadow-xl">
                  <AvatarImage src={learners[1].avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white text-lg">{learners[1].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-white">2</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700 text-center max-w-[100px] truncate">{learners[1].name}</p>
              <p className="text-xs text-slate-400">{learners[1].points} pts</p>
              <div className="w-24 h-20 mt-2 rounded-t-2xl bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center">
                <Medal className="w-8 h-8 text-slate-500" />
              </div>
            </div>
          )}

          {/* 1st Place */}
          {learners[0] && (
            <div className="flex flex-col items-center -mb-4">
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-3xl mb-1"
              >
                👑
              </motion.div>
              <div className="relative mb-2">
                <Avatar className="w-20 h-20 ring-4 ring-amber-400 shadow-2xl">
                  <AvatarImage src={learners[0].avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xl">{learners[0].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">1</span>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-800 text-center max-w-[110px] truncate">{learners[0].name}</p>
              <p className="text-xs text-amber-600 font-semibold">{learners[0].points} pts</p>
              <div className="w-28 h-28 mt-2 rounded-t-2xl bg-gradient-to-b from-amber-300 to-amber-400 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-amber-700" />
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {learners[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <Avatar className="w-14 h-14 ring-4 ring-orange-300 shadow-xl">
                  <AvatarImage src={learners[2].avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">{learners[2].name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-bold text-white">3</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700 text-center max-w-[100px] truncate">{learners[2].name}</p>
              <p className="text-xs text-slate-400">{learners[2].points} pts</p>
              <div className="w-24 h-14 mt-2 rounded-t-2xl bg-gradient-to-b from-orange-200 to-orange-300 flex items-center justify-center">
                <Medal className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Full Rankings List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Full Rankings
          </h2>

          <div className="space-y-3">
            {learners.map((learner, index) => {
              const rank = index + 1;
              const isCurrentUser = user && learner.id === user.id;

              return (
                <motion.div
                  key={learner.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={`p-4 rounded-2xl border transition-all ${getRankBg(rank)} ${
                    isCurrentUser ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-600/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getRankIcon(rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className={`w-12 h-12 ${rank <= 3 ? 'ring-2 ring-amber-200' : ''}`}>
                      <AvatarImage src={learner.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {learner.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold truncate ${isCurrentUser ? 'text-purple-700' : 'text-slate-800'}`}>
                          {learner.name}
                        </p>
                        {isCurrentUser && (
                          <Badge className="bg-purple-100 text-purple-700 text-[10px] rounded-md">You</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <span>{learner.badge.icon}</span> {learner.badge.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {learner.enrolled} courses
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" /> {learner.completed} completed
                        </span>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xl font-bold ${rank === 1 ? 'text-amber-600' : rank <= 3 ? 'text-slate-700' : 'text-slate-600'}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {learner.points}
                      </p>
                      <p className="text-[10px] text-slate-400">points</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {learners.length === 0 && (
            <div className="text-center py-20 glass-card rounded-3xl">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No learners yet</h3>
              <p className="text-slate-500">Be the first to earn points!</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}