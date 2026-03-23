import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, Users, Clock, TrendingUp, Image as ImageIcon, Zap, Target, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getCourses, type Course } from '../../utils/supabase/client';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect admins to their dashboard
  if (user?.role === 'admin') {
    navigate('/dashboard/admin', { replace: true });
    return null;
  }

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Fetch courses from database
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleImageError = (courseId: string) => {
    setFailedImages(prev => new Set([...prev, courseId]));
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesLevel = !selectedLevel || course.level === selectedLevel;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesLevel && matchesSearch;
    });
  }, [courses, selectedLevel, searchQuery]);

  const stats = [
    { label: 'Total Courses', value: courses.length, icon: Target },
    { label: 'Average Rating', value: '4.7★', icon: Star },
    { label: 'Total Students', value: '9k+', icon: Users },
  ];

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Loading courses...</p>
              </motion.div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="text-center py-20">
              <div className="bg-purple-50 rounded-2xl p-12 inline-block border border-purple-100 mb-6">
                <TrendingUp className="w-16 h-16 text-purple-300 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Courses</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 font-semibold"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-[#1A1F2E] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-[#7A766F] text-lg mb-6">Ready to continue your learning journey?</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-4 border border-[#E5E2DC]">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-[#7A766F]">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-[#1A1F2E]">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Explore Section Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-3xl font-bold text-[#1A1F2E] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Explore Courses
            </h2>
            <p className="text-[#7A766F] flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              Choose from {courses.length} world-class courses
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses by name, topic, or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-[#E5E2DC] bg-white focus:outline-none focus:border-violet-400 focus:border-2 text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(selectedLevel === level ? null : (level === 'all' ? null : level))}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      (selectedLevel === level || (level === 'all' && !selectedLevel))
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-white border border-[#E5E2DC] text-[#7A766F] hover:border-purple-200 hover:text-purple-700'
                    }`}
                  >
                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>


          {/* Courses Grid */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/course/${course.id}`)}
                className="cursor-pointer h-full"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full flex flex-col border-[#E5E2DC] bg-white">
                  {/* Course Image Container */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50">
                    {!failedImages.has(course.id) ? (
                      <img
                        src={course.cover_image}
                        alt={course.title}
                        onError={() => handleImageError(course.id)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50">
                        <div className="text-center">
                          <ImageIcon className="w-14 h-14 text-purple-200 mx-auto mb-3" />
                          <p className="text-purple-500 text-xs font-medium">Image unavailable</p>
                        </div>
                      </div>
                    )}

                    {/* Badge and Price Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                      <Badge className="bg-purple-600 text-white text-xs font-semibold shadow-md">
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                      </Badge>
                      {course.access_rule === 'payment' && course.price && (
                        <div className="bg-white rounded-lg px-3 py-1.5 text-sm font-bold text-[#1A1F2E] shadow-md">
                          ${course.price.toFixed(2)}
                        </div>
                      )}
                      {course.access_rule === 'open' && (
                        <div className="bg-green-500 rounded-lg px-3 py-1.5 text-sm font-bold text-white shadow-md">
                          Free
                        </div>
                      )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-[#1A1F2E] group-hover:text-purple-700 transition-colors duration-200 line-clamp-2 mb-2">{course.title}</h3>
                      <p className="text-sm text-[#7A766F] line-clamp-2">{course.description}</p>
                    </div>

                    {/* Instructor */}
                    <p className="text-xs text-[#7A766F] mb-4">by <span className="font-semibold text-[#1A1F2E]">{course.instructor_name}</span></p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#E5E2DC]/50 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-violet-400 fill-violet-400" />
                        <span className="font-semibold text-[#1A1F2E]">{course.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#7A766F]">
                        <Users className="w-4 h-4" />
                        <span>{course.views >= 1000 ? `${(course.views / 1000).toFixed(1)}k` : course.views}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#7A766F]">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration || 'Self-paced'}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap mb-5 flex-1">
                      {course.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[11px] bg-purple-50 text-purple-700 border-purple-200 font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Enroll Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course.id}`);
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {course.access_rule === 'payment'
                        ? `Buy Now - $${course.price?.toFixed(2)}`
                        : 'Enroll Now'
                      }
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>


          {/* No Results State */}
          {filteredCourses.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-12 inline-block border border-purple-100/50 mb-6">
                <TrendingUp className="w-16 h-16 text-purple-300 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1F2E] mb-3">No courses found</h3>
              <p className="text-[#7A766F] mb-8 max-w-md mx-auto">We couldn't find any courses matching your search. Try adjusting your filters or search query.</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel(null);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 font-semibold"
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
