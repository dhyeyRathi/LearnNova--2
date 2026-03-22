import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import BackButton from '../../components/BackButton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { courses, lessons } from '../../data/mockData';
import { Search, Plus, Eye, Clock, Tag, LayoutGrid, List, Edit, Share2, Crown, BookOpen, Copy, Check, ExternalLink, GripVertical, Trash2, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

type ViewMode = 'kanban' | 'list';

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coursesList, setCoursesList] = useState(() => {
    try {
      const saved = localStorage.getItem('coursesList');
      const userCourses = saved ? JSON.parse(saved) : [];
      return [...courses, ...userCourses];
    } catch {
      return courses;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [createOpen, setCreateOpen] = useState(false);
  const [courseCreationStep, setCourseCreationStep] = useState(1);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCoursePublisher, setNewCoursePublisher] = useState('');
  const [newCourseRefLinks, setNewCourseRefLinks] = useState('');
  const [newCourseResourceLinks, setNewCourseResourceLinks] = useState('');
  const [newCourseThumbnail, setNewCourseThumbnail] = useState<File | null>(null);
  const [newCourseThumbnailPreview, setNewCourseThumbnailPreview] = useState('');
  const [newCourseTags, setNewCourseTags] = useState('');
  const [newCourseQuizIntegration, setNewCourseQuizIntegration] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, []);

  useEffect(() => {
    localStorage.setItem('coursesList', JSON.stringify(coursesList.filter(c => c.id.startsWith('course-'))));
  }, [coursesList]);

  if (!user || (user.role !== 'admin' && user.role !== 'tutor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-12">
          <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Access Required</h2>
          <p className="text-[#7A766F] mb-6 text-sm">This dashboard is only accessible to administrators and instructors.</p>
          <Button onClick={() => navigate('/courses')} className="bg-[#2C3E6B] hover:bg-[#243356] text-white rounded-lg text-sm">Go to Courses</Button>
        </div>
      </div>
    );
  }

  const isInstructor = user.role === 'tutor';
  const isAdmin = user.role === 'admin';

  const getLessonCount = (courseId: string) => lessons.filter(l => l.courseId === courseId).length;
  const getTotalDuration = (courseId: string) => {
    const cls = lessons.filter(l => l.courseId === courseId);
    let total = 0;
    cls.forEach(l => {
      if (l.duration) {
        const num = parseInt(l.duration);
        if (!isNaN(num)) total += num;
      }
    });
    return total > 0 ? `${total} min` : '—';
  };

  const filteredCourses = coursesList.filter(c => {
    // Instructors only see their own courses
    if (isInstructor && c.instructorId !== user.id) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q));
  });

  const publishedCourses = filteredCourses.filter(c => c.published);
  const draftCourses = filteredCourses.filter(c => !c.published);

  const handleCreate = () => {
    if (courseCreationStep === 1) {
      if (!newCourseName.trim()) {
        toast.error('Course name is required');
        return;
      }
      setCourseCreationStep(2);
    } else if (courseCreationStep === 2) {
      // Create new course object
      const newCourse = {
        id: `course-${Date.now()}`,
        title: newCourseName,
        description: newCoursePublisher || 'Course by ' + (user?.email || 'Instructor'),
        coverImage: newCourseThumbnailPreview || 'https://via.placeholder.com/400x225?text=' + encodeURIComponent(newCourseName),
        instructorId: user?.id || 'unknown',
        instructorName: user?.email?.split('@')[0] || 'Instructor',
        duration: '0 min',
        views: 0,
        tags: newCourseTags ? newCourseTags.split(',').map(t => t.trim()).filter(Boolean) : [],
        published: false,
        visibility: 'everyone' as const,
        accessRule: 'open' as const,
        createdAt: new Date().toISOString(),
        rating: 0,
        reviewCount: 0,
      };
      
      // Add course to list
      setCoursesList([...coursesList, newCourse]);
      
      toast.success(`Course "${newCourseName}" created!`, {
        description: 'You can now add lessons and publish it',
      });
      
      // Reset all fields
      setNewCourseName('');
      setNewCoursePublisher('');
      setNewCourseRefLinks('');
      setNewCourseResourceLinks('');
      setNewCourseThumbnail(null);
      setNewCourseThumbnailPreview('');
      setNewCourseTags('');
      setNewCourseQuizIntegration('');
      setCourseCreationStep(1);
      setCreateOpen(false);
    }
  };

  const handleGoBack = () => {
    setCourseCreationStep(1);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCourseThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCourseThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseCreateDialog = () => {
    setCourseCreationStep(1);
    setNewCourseName('');
    setNewCoursePublisher('');
    setNewCourseRefLinks('');
    setNewCourseResourceLinks('');
    setNewCourseThumbnail(null);
    setNewCourseThumbnailPreview('');
    setNewCourseTags('');
    setNewCourseQuizIntegration('');
    setCreateOpen(false);
  };

  const handleShare = (courseId: string, courseTitle: string) => {
    const url = `${window.location.origin}/course/${courseId}`;
    setShareUrl(url);
    setShareOpen(true);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    setCourseToDelete({ id: courseId, title: courseTitle });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCourse = () => {
    if (courseToDelete) {
      // Actually delete from the state
      setCoursesList(coursesList.filter(c => c.id !== courseToDelete.id));
      toast.success(`Course "${courseToDelete.title}" deleted successfully`);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const CourseCard = ({ course, index }: { course: typeof courses[0]; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group"
    >
      <Card className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all relative">
        <div className="relative h-40 overflow-hidden">
          <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Badge className={`${course.published ? 'bg-[#2C3E6B]' : 'bg-[#7A766F]'} text-white rounded-md text-[10px] font-medium shadow-sm`}>
              {course.published ? 'Published' : 'Draft'}
            </Badge>
            <div className="flex gap-1.5">
              <Link to={`/admin/courses/${course.id}/edit`}>
                <Button size="sm" className="bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white rounded-lg h-7 w-7 p-0 shadow-sm">
                  <Edit className="w-3 h-3" />
                </Button>
              </Link>
              <Button size="sm" onClick={() => handleShare(course.id, course.title)} className="bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white rounded-lg h-7 w-7 p-0 shadow-sm">
                <Share2 className="w-3 h-3" />
              </Button>
              <Button size="sm" onClick={() => handleDeleteCourse(course.id, course.title)} className="rounded-lg h-7 w-7 p-0 shadow-sm bg-white/90 backdrop-blur-sm text-red-500 hover:bg-white">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[#1A1F2E] mb-1.5 line-clamp-1 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{course.title}</h3>
          <div className="flex flex-wrap gap-1 mb-3">
            {course.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] rounded bg-[#2C3E6B]/[0.05] text-[#2C3E6B]/60 px-1.5 py-0.5 font-medium">{tag}</Badge>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-[#F7F6F3] rounded-lg py-1.5">
              <Eye className="w-3 h-3 mx-auto mb-0.5 text-[#7A766F]" />
              <span className="font-semibold text-[#1A1F2E]">{course.views}</span>
              <p className="text-[10px] text-[#7A766F]">Views</p>
            </div>
            <div className="bg-[#F7F6F3] rounded-lg py-1.5">
              <BookOpen className="w-3 h-3 mx-auto mb-0.5 text-[#7A766F]" />
              <span className="font-semibold text-[#1A1F2E]">{getLessonCount(course.id)}</span>
              <p className="text-[10px] text-[#7A766F]">Lessons</p>
            </div>
            <div className="bg-[#F7F6F3] rounded-lg py-1.5">
              <Clock className="w-3 h-3 mx-auto mb-0.5 text-[#7A766F]" />
              <span className="font-semibold text-[#1A1F2E] text-[10px]">{getTotalDuration(course.id)}</span>
              <p className="text-[10px] text-[#7A766F]">Duration</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const CourseListItem = ({ course, index }: { course: typeof courses[0]; index: number }) => (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
      <Card className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center gap-4">
          <img src={course.coverImage} alt={course.title} className="w-20 h-14 object-cover rounded-lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-800 truncate text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{course.title}</h3>
              <Badge className={`${course.published ? 'bg-[#2C3E6B]/10 text-[#2C3E6B]' : 'bg-[#7A766F]/10 text-[#7A766F]'} rounded-md text-[10px] font-medium`}>
                {course.published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#7A766F] font-medium">
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{course.tags.slice(0, 2).join(', ')}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{course.views}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{getLessonCount(course.id)} lessons</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{getTotalDuration(course.id)}</span>
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link to={`/admin/courses/${course.id}/edit`}>
              <Button variant="outline" size="sm" className="rounded-lg text-xs border-slate-200"><Edit className="w-3.5 h-3.5 mr-1.5" />Edit</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => handleShare(course.id, course.title)} className="rounded-lg text-xs border-slate-200">
              <Share2 className="w-3.5 h-3.5 mr-1.5" />Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDeleteCourse(course.id, course.title)} className="rounded-lg text-xs border-slate-200 text-red-500">
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />Delete
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Course Dashboard
              </h1>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2C3E6B]/[0.06] text-[#2C3E6B] rounded-md text-xs font-medium">
                  <Crown className="w-3.5 h-3.5" /> Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2C3E6B]/[0.06] text-[#2C3E6B] rounded-md text-xs font-medium">
                  <GraduationCap className="w-3.5 h-3.5" /> Instructor
                </span>
              )}
            </div>
            <p className="text-sm text-[#7A766F]">{isAdmin ? 'Manage all courses, lessons, and content' : 'Manage your courses, lessons, and content'}</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg h-10 px-5 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" /> Create Course
          </Button>
        </div>

        {/* Search & Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search courses..." className="pl-10 h-10 bg-white rounded-lg border-[#E5E2DC] text-sm" />
          </div>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')}
              className={`rounded-md text-xs h-8 ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />Kanban
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}
              className={`rounded-md text-xs h-8 ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              <List className="w-3.5 h-3.5 mr-1.5" />List
            </Button>
          </div>
        </div>

        {/* Kanban */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#2C3E6B]" />
                <h2 className="text-sm font-medium text-[#1A1F2E]">Published ({publishedCourses.length})</h2>
              </div>
              <div className="space-y-3 p-4 bg-[#2C3E6B]/[0.02] rounded-lg border border-dashed border-[#E5E2DC] min-h-[200px]">
                {publishedCourses.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)}
                {publishedCourses.length === 0 && <p className="text-center text-sm text-[#7A766F] py-8">No published courses</p>}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#7A766F]" />
                <h2 className="text-sm font-medium text-[#1A1F2E]">Drafts ({draftCourses.length})</h2>
              </div>
              <div className="space-y-3 p-4 bg-[#7A766F]/[0.02] rounded-lg border border-dashed border-[#E5E2DC] min-h-[200px]">
                {draftCourses.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)}
                {draftCourses.length === 0 && <p className="text-center text-sm text-[#7A766F] py-8">No draft courses</p>}
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {viewMode === 'list' && (
          <div className="space-y-2">
            {filteredCourses.map((course, i) => <CourseListItem key={course.id} course={course} index={i} />)}
          </div>
        )}

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-xl bg-[#2C3E6B]/[0.06] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#2C3E6B]/20" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1F2E] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No courses found</h3>
            <p className="text-sm text-[#7A766F]">Try adjusting your search query</p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="bg-white rounded-xl border border-[#E5E2DC] shadow-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {courseCreationStep === 1 ? 'Course Name' : 'Course Details'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Step 1: Course Name Only */}
            {courseCreationStep === 1 && (
              <div className="space-y-1.5">
                <Label className="text-[13px] text-[#1A1F2E]">Course Name *</Label>
                <Input 
                  value={newCourseName} 
                  onChange={e => setNewCourseName(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="e.g. Advanced React Patterns" 
                  className="rounded-lg border-[#E5E2DC] h-10 text-sm" 
                  autoFocus
                />
              </div>
            )}

            {/* Step 2: Additional Details */}
            {courseCreationStep === 2 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-[#1A1F2E]">Publisher Name</Label>
                  <Input 
                    value={newCoursePublisher} 
                    onChange={e => setNewCoursePublisher(e.target.value)} 
                    placeholder="e.g. John Doe, Tech Academy" 
                    className="rounded-lg border-[#E5E2DC] h-10 text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-[#1A1F2E]">Reference Links (comma-separated)</Label>
                  <Input 
                    value={newCourseRefLinks} 
                    onChange={e => setNewCourseRefLinks(e.target.value)} 
                    placeholder="e.g. https://example.com, https://docs.com" 
                    className="rounded-lg border-[#E5E2DC] h-10 text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-[#1A1F2E]">Resource Links (comma-separated)</Label>
                  <Input 
                    value={newCourseResourceLinks} 
                    onChange={e => setNewCourseResourceLinks(e.target.value)} 
                    placeholder="e.g. https://resources.com, https://files.com" 
                    className="rounded-lg border-[#E5E2DC] h-10 text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-[#1A1F2E]">Thumbnail</Label>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleThumbnailChange} 
                      className="hidden" 
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="flex-1 cursor-pointer">
                      <div className="rounded-lg border border-[#E5E2DC] h-10 flex items-center px-3 text-sm text-[#7A766F] hover:bg-[#F9F7F3] transition-colors">
                        {newCourseThumbnail ? newCourseThumbnail.name : 'Choose image...'}
                      </div>
                    </label>
                  </div>
                  {newCourseThumbnailPreview && (
                    <img src={newCourseThumbnailPreview} alt="Preview" className="rounded-lg h-20 w-20 object-cover" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-[#1A1F2E]">Tags (comma-separated)</Label>
                  <Input 
                    value={newCourseTags} 
                    onChange={e => setNewCourseTags(e.target.value)} 
                    placeholder="e.g. React, Advanced, JavaScript" 
                    className="rounded-lg border-[#E5E2DC] h-10 text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] text-[#1A1F2E]">Quiz Integration (optional)</Label>
                  <Input 
                    value={newCourseQuizIntegration} 
                    onChange={e => setNewCourseQuizIntegration(e.target.value)} 
                    placeholder="Select existing quiz ID or leave blank" 
                    className="rounded-lg border-[#E5E2DC] h-10 text-sm" 
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2.5 justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={courseCreationStep === 1 ? handleCloseCreateDialog : handleGoBack} 
                className="rounded-lg text-sm border-[#E5E2DC]"
              >
                {courseCreationStep === 1 ? 'Cancel' : 'Back'}
              </Button>
              <Button 
                onClick={handleCreate} 
                className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                {courseCreationStep === 1 ? 'Next' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="bg-white rounded-xl border border-[#E5E2DC] shadow-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#1A1F2E]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Share Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="rounded-lg border-[#E5E2DC] bg-[#F7F6F3] text-sm" />
              <Button onClick={handleCopy} variant="outline" className="rounded-lg border-[#E5E2DC] flex-shrink-0">
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button onClick={() => { window.open(shareUrl, '_blank'); }} variant="outline" className="w-full rounded-lg border-[#E5E2DC] text-sm">
              <ExternalLink className="w-4 h-4 mr-2" />Open in New Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white rounded-xl border border-[#E5E2DC] shadow-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Delete Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">
                Are you sure you want to delete <strong>"{courseToDelete?.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setDeleteDialogOpen(false)} 
                className="rounded-lg border-[#E5E2DC]"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDeleteCourse} 
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Delete Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}