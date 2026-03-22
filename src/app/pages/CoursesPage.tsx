import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, Users, Clock, TrendingUp, Image as ImageIcon, Zap, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { courses as mockCourses } from '../data/mockData';

// Enrich mockData courses with additional UI properties for display
const enrichedCourses = mockCourses.map(course => ({
  ...course,
  instructor: course.instructorName,
  level: 'intermediate', // Default level
  students: course.views,
  price: course.accessRule === 'payment' ? 99.99 : 0,
  cover_image: course.coverImage,
}));

export default function CoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (courseId: string) => {
    setFailedImages(prev => new Set([...prev, courseId]));
  };

  const filteredCourses = useMemo(() => {
    return enrichedCourses.filter((course) => {
      const matchesLevel = !selectedLevel || course.level === selectedLevel;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesLevel && matchesSearch;
    });
  }, [selectedLevel, searchQuery]);

  const stats = [
    { label: 'Total Courses', value: enrichedCourses.length, icon: Target },
    { label: 'Average Rating', value: '4.7★', icon: Star },
    { label: 'Total Students', value: '9k+', icon: Users },
  ];

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-10 bg-gradient-to-br from-red-50 to-amber-50 rounded-2xl p-8 border border-red-100/50"
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
                        <stat.icon className="w-5 h-5 text-red-500" />
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
              <Zap className="w-4 h-4 text-amber-500" />
              Choose from {enrichedCourses.length} world-class courses
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
                  className="w-full px-5 py-3.5 rounded-xl border border-[#E5E2DC] bg-white focus:outline-none focus:border-amber-400 focus:border-2 text-sm shadow-sm hover:shadow-md transition-shadow"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(selectedLevel === level ? null : (level === 'all' ? null : level))}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      (selectedLevel === level || (level === 'all' && !selectedLevel))
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white border border-[#E5E2DC] text-[#7A766F] hover:border-red-200 hover:text-red-600'
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
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-red-50 to-amber-50">
                    {!failedImages.has(course.id) ? (
                      <img 
                        src={course.cover_image} 
                        alt={course.title} 
                        onError={() => handleImageError(course.id)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-50">
                        <div className="text-center">
                          <ImageIcon className="w-14 h-14 text-red-200 mx-auto mb-3" />
                          <p className="text-red-400 text-xs font-medium">Image unavailable</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Badge and Price Overlay */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                      <Badge className="bg-red-500 text-white text-xs font-semibold shadow-md">
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                      </Badge>
                      <div className="bg-white rounded-lg px-3 py-1.5 text-sm font-bold text-[#1A1F2E] shadow-md">${course.price}</div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-[#1A1F2E] group-hover:text-red-600 transition-colors duration-200 line-clamp-2 mb-2">{course.title}</h3>
                      <p className="text-sm text-[#7A766F] line-clamp-2">{course.description}</p>
                    </div>

                    {/* Instructor */}
                    <p className="text-xs text-[#7A766F] mb-4">by <span className="font-semibold text-[#1A1F2E]">{course.instructor}</span></p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#E5E2DC]/50 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-[#1A1F2E]">{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#7A766F]">
                        <Users className="w-4 h-4" />
                        <span>{(course.students / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#7A766F]">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap mb-5 flex-1">
                      {course.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[11px] bg-red-50 text-red-600 border-red-200 font-medium">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Enroll Button */}
                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200">
                      Enroll Now
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>


          {/* No Results State */}
          {filteredCourses.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
              <div className="bg-gradient-to-br from-red-50 to-amber-50 rounded-2xl p-12 inline-block border border-red-100/50 mb-6">
                <TrendingUp className="w-16 h-16 text-red-300 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1F2E] mb-3">No courses found</h3>
              <p className="text-[#7A766F] mb-8 max-w-md mx-auto">We couldn't find any courses matching your search. Try adjusting your filters or search query.</p>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 font-semibold"
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
