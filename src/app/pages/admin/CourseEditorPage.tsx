import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { courses, lessons, quizzes, users } from '../../data/mockData';
import { Save, ArrowLeft, Upload, X, Plus, Eye, Video, FileText, Image as ImageIcon, HelpCircle, Edit, Trash2, Link as LinkIcon, GripVertical, Mail, UserPlus, Send, DollarSign, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export default function CourseEditorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Load courses from localStorage or fall back to mock data
  const [allCourses, setAllCourses] = useState(() => {
    try {
      const saved = localStorage.getItem('coursesList');
      if (saved) {
        return JSON.parse(saved);
      }
      return courses;
    } catch {
      return courses;
    }
  });
  
  // Load quizzes from localStorage or fall back to mock data
  const [allQuizzes, setAllQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem('quizzesList');
      if (saved) {
        return [...quizzes, ...JSON.parse(saved)];
      }
      return quizzes;
    } catch {
      return quizzes;
    }
  });
  
  const course = allCourses.find(c => c.id === id);
  const courseLessons = lessons.filter(l => l.courseId === id).sort((a, b) => a.order - b.order);
  const courseQuizzes = allQuizzes.filter(q => lessons.some(l => l.courseId === id && l.type === 'quiz' && l.content === q.id));

  // Course fields
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [coverImage, setCoverImage] = useState(course?.coverImage || '');
  const [published, setPublished] = useState(course?.published || false);
  const [visibility, setVisibility] = useState(course?.visibility || 'everyone');
  const [accessRule, setAccessRule] = useState(course?.accessRule || 'open');
  const [tags, setTags] = useState<string[]>(course?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [website, setWebsite] = useState('');
  const [courseAdmin, setCourseAdmin] = useState(user?.id || '');
  const [price, setPrice] = useState('');

  // Lesson editor state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<typeof lessons[0] | null>(null);
  const [lessonTab, setLessonTab] = useState('content');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonType, setLessonType] = useState<'video' | 'document' | 'image'>('video');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonResponsible, setLessonResponsible] = useState('');
  const [allowDownload, setAllowDownload] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [resources, setResources] = useState<Array<{ title: string; type: 'file' | 'link'; url: string }>>([]);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResType, setNewResType] = useState<'file' | 'link'>('link');

  // Attendee wizards
  const [addAttendeeOpen, setAddAttendeeOpen] = useState(false);
  const [contactAttendeeOpen, setContactAttendeeOpen] = useState(false);
  const [attendeeEmails, setAttendeeEmails] = useState<string[]>([]);
  const [newAttEmail, setNewAttEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'tutor')) navigate('/courses');
    if (!course && id !== 'new') navigate(user?.role === 'tutor' ? '/dashboard/instructor' : '/dashboard/admin');
  }, [user, course, id, navigate]);

  if (!user || (user.role !== 'admin' && user.role !== 'tutor')) return null;

  const handleSave = () => {
    if (!title.trim()) { toast.error('Course title is required'); return; }
    if (published && !website.trim() && !course) { toast.error('Website URL is required for published courses'); return; }
    
    // Update course in the list
    const updatedCourses = allCourses.map(c => 
      c.id === id 
        ? {
            ...c,
            title,
            description,
            coverImage,
            published,
            visibility,
            accessRule,
            tags
          }
        : c
    );
    setAllCourses(updatedCourses);
    
    // Save to localStorage
    localStorage.setItem('coursesList', JSON.stringify(updatedCourses));
    
    toast.success('Course updated successfully!');
    navigate('/dashboard/admin');
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Lesson editor functions
  const openLessonEditor = (lesson?: typeof lessons[0]) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description);
      setLessonType(lesson.type as any);
      setLessonContent(lesson.content);
      setLessonDuration(lesson.duration || '');
      setResources((lesson.resources || []).map(r => ({ title: r.title, type: r.type, url: r.url })));
    } else {
      setEditingLesson(null);
      setLessonTitle(''); setLessonDescription(''); setLessonType('video');
      setLessonContent(''); setLessonDuration(''); setResources([]);
      setLessonResponsible(''); setAllowDownload(false);
      setVideoFile(null);
    }
    setLessonTab('content');
    setLessonDialogOpen(true);
  };

  const saveLessonEditor = () => {
    if (!lessonTitle.trim()) { toast.error('Lesson title is required'); return; }
    toast.success(editingLesson ? 'Lesson updated!' : 'Lesson created!');
    setLessonDialogOpen(false);
  };

  const addResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) { toast.error('Fill in resource title and URL'); return; }
    setResources([...resources, { title: newResTitle, type: newResType, url: newResUrl }]);
    setNewResTitle(''); setNewResUrl('');
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (deleteConfirm === lessonId) {
      toast.success('Lesson deleted');
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(lessonId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleAddAttendee = () => {
    if (newAttEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAttEmail)) {
      setAttendeeEmails([...attendeeEmails, newAttEmail.trim()]);
      setNewAttEmail('');
    } else toast.error('Enter a valid email');
  };

  const handleSendInvites = () => {
    if (attendeeEmails.length === 0) { toast.error('Add at least one email'); return; }
    toast.success(`Invitations sent to ${attendeeEmails.length} learner(s)!`);
    setAttendeeEmails([]);
    setAddAttendeeOpen(false);
  };

  const handleContactSend = () => {
    if (!contactSubject.trim() || !contactMessage.trim()) { toast.error('Subject and message required'); return; }
    toast.success('Message sent to all enrolled learners!');
    setContactSubject(''); setContactMessage('');
    setContactAttendeeOpen(false);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'from-red-500 to-amber-500';
      case 'document': return 'from-red-500 to-amber-500';
      case 'image': return 'from-red-500 to-amber-500';
      case 'quiz': return 'from-amber-500 to-orange-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard/admin')} className="rounded-xl">
              <ArrowLeft className="w-5 h-5 mr-2" />Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 bg-clip-text text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {course ? 'Edit Course' : 'Create Course'}
              </h1>
              <p className="text-slate-500 text-sm">{course?.title || 'Configure your course settings and content'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Publish toggle */}
            <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2">
              <Label htmlFor="pub-toggle" className="text-sm cursor-pointer">
                {published ? <Badge className="bg-gradient-to-r from-red-500 to-amber-500 text-white">Published</Badge> : <Badge variant="secondary">Draft</Badge>}
              </Label>
              <Switch id="pub-toggle" checked={published} onCheckedChange={setPublished} />
            </div>
            {/* Preview */}
            {course && (
              <Button variant="outline" onClick={() => navigate(`/course/${course.id}`)} className="rounded-xl">
                <Eye className="w-4 h-4 mr-2" />Preview
              </Button>
            )}
            {/* Add Attendees */}
            <Button variant="outline" onClick={() => setAddAttendeeOpen(true)} className="rounded-xl">
              <UserPlus className="w-4 h-4 mr-2" />Add Attendees
            </Button>
            {/* Contact Attendees */}
            <Button variant="outline" onClick={() => setContactAttendeeOpen(true)} className="rounded-xl">
              <Mail className="w-4 h-4 mr-2" />Contact
            </Button>
            {/* Save */}
            <Button onClick={handleSave} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl shadow-lg shadow-red-500/20">
              <Save className="w-4 h-4 mr-2" />Save
            </Button>
          </div>
        </div>

        {/* Cover Image Upload */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="glass-card rounded-3xl overflow-hidden">
            {coverImage ? (
              <div className="relative h-48 group">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="outline" className="bg-white/90 rounded-xl" onClick={() => setCoverImage('')}>
                    <X className="w-4 h-4 mr-2" />Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-40 bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                  <Upload className="w-10 h-10 mx-auto mb-2 text-red-300" />
                  <p className="text-sm text-slate-500">Course Cover Image</p>
                  <Input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="Paste image URL..." className="mt-2 max-w-xs mx-auto rounded-xl bg-white/80 text-sm" />
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Course Title & Tags inline */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
          <Card className="glass-card rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title" className="rounded-xl bg-white/50" />
              </div>
              <div className="space-y-2">
                <Label>Website {published && '*'}</Label>
                <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://learnnova.com/course/..." className="rounded-xl bg-white/50" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} placeholder="Add tag..." className="rounded-xl bg-white/50 flex-1" />
                <Button onClick={handleAddTag} variant="outline" className="rounded-xl"><Plus className="w-4 h-4" /></Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="pl-3 pr-1.5 py-1 rounded-lg">
                      {tag}
                      <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1.5 hover:text-red-600"><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="glass-card rounded-xl p-1 mb-6">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>

            {/* CONTENT TAB - Lessons List */}
            <TabsContent value="content">
              <Card className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Lessons ({courseLessons.length})</h2>
                  <Button onClick={() => openLessonEditor()} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl shadow-lg shadow-red-500/20">
                    <Plus className="w-4 h-4 mr-2" />Add Content
                  </Button>
                </div>
                {courseLessons.length > 0 ? (
                  <div className="space-y-3">
                    {courseLessons.map((lesson, i) => (
                      <motion.div key={lesson.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group">
                        <div className="flex items-center gap-3 p-4 glass-card rounded-2xl hover:shadow-lg transition-all">
                          <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getLessonTypeColor(lesson.type)} flex items-center justify-center shadow-md`}>
                            {getLessonIcon(lesson.type)}
                            <span className="sr-only">{lesson.type}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 truncate">{lesson.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Badge variant="outline" className="capitalize text-[10px] rounded-md">{lesson.type}</Badge>
                              {lesson.duration && <span>{lesson.duration}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => openLessonEditor(lesson)} className="rounded-lg h-8 w-8 p-0">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(lesson.id)}
                              className={`rounded-lg h-8 w-8 p-0 ${deleteConfirm === lesson.id ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-red-600'}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {deleteConfirm === lesson.id && (
                          <p className="text-xs text-red-500 mt-1 ml-14">Click again to confirm deletion</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50/50 rounded-2xl">
                    <FileText className="w-14 h-14 mx-auto mb-3 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No lessons yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Start building your course by adding content</p>
                    <Button onClick={() => openLessonEditor()} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />Add First Lesson
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* DESCRIPTION TAB */}
            <TabsContent value="description">
              <Card className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Course Description</h2>
                <p className="text-sm text-slate-500 mb-4">This description will be visible to learners on the course page.</p>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write a compelling description of your course. What will learners gain? What topics are covered? Who is this for?" rows={12} className="rounded-xl bg-white/50" />
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => toast.success('Description saved!')} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl">
                    <Save className="w-4 h-4 mr-2" />Save Description
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* OPTIONS TAB */}
            <TabsContent value="options">
              <Card className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Access & Visibility</h2>
                <div className="space-y-6 max-w-lg">
                  <div className="space-y-2">
                    <Label>Visibility — Who can see this course</Label>
                    <Select value={visibility} onValueChange={setVisibility}>
                      <SelectTrigger className="rounded-xl bg-white/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="signed-in">Signed-in Users Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">Controls who sees this course on the website</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Access Rule — Who can enroll</Label>
                    <Select value={accessRule} onValueChange={setAccessRule}>
                      <SelectTrigger className="rounded-xl bg-white/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open to All</SelectItem>
                        <SelectItem value="invitation">On Invitation</SelectItem>
                        <SelectItem value="payment">On Payment</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">Determines how learners gain access to this course</p>
                  </div>

                  {accessRule === 'payment' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                      <Label>Price (USD)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input value={price} onChange={e => setPrice(e.target.value)} placeholder="49.99" className="pl-9 rounded-xl bg-white/50" />
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-4 border-t border-slate-200/60 space-y-2">
                    <Label>Course Admin / Responsible</Label>
                    <Select value={courseAdmin} onValueChange={setCourseAdmin}>
                      <SelectTrigger className="rounded-xl bg-white/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {users.filter(u => u.role === 'admin' || u.role === 'tutor').map(u => (
                          <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">Person responsible for managing this course</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* QUIZ TAB */}
            <TabsContent value="quiz">
              <Card className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Quizzes ({courseQuizzes.length})</h2>
                  <Button onClick={() => navigate(`/admin/courses/${id}/quiz-builder`)} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl shadow-lg shadow-red-500/20">
                    <Plus className="w-4 h-4 mr-2" />Add Quiz
                  </Button>
                </div>
                {courseQuizzes.length > 0 ? (
                  <div className="space-y-3">
                    {courseQuizzes.map((quiz, i) => (
                      <div key={quiz.id} className="flex items-center gap-4 p-4 glass-card rounded-2xl group hover:shadow-lg transition-all">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{quiz.title}</h4>
                          <p className="text-xs text-slate-500">{quiz.questions.length} questions</p>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/courses/${id}/quiz-builder?quizId=${quiz.id}`)} className="rounded-lg">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-lg text-red-500 hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50/50 rounded-2xl">
                    <HelpCircle className="w-14 h-14 mx-auto mb-3 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No quizzes yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Add quizzes to test learner knowledge</p>
                    <Button onClick={() => navigate(`/admin/courses/${id}/quiz-builder`)} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />Create Quiz
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* LESSON EDITOR POPUP - 3 tabs */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="glass-card rounded-3xl border-white/40 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {editingLesson ? 'Edit Lesson' : 'Add Content'}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={lessonTab} onValueChange={setLessonTab} className="mt-2">
            <TabsList className="glass-card rounded-lg p-1 w-full">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
              <TabsTrigger value="attachments" className="flex-1">Attachments</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Lesson Title *</Label>
                <Input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} placeholder="Enter lesson title..." className="rounded-xl bg-white/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={lessonType} onValueChange={(v: any) => setLessonType(v)}>
                    <SelectTrigger className="rounded-xl bg-white/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Responsible (optional)</Label>
                  <Select value={lessonResponsible} onValueChange={setLessonResponsible}>
                    <SelectTrigger className="rounded-xl bg-white/50"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role === 'admin' || u.role === 'tutor').map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Type-specific fields */}
              {lessonType === 'video' && (
                <div className="space-y-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
                  {/* Drag & Drop Upload Area */}
                  <div 
                    className="border-2 border-dashed border-red-200 rounded-xl p-6 text-center bg-white/50 cursor-pointer hover:bg-red-100/30 transition-colors"
                    onClick={() => document.getElementById('video-input')?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('bg-red-100/50');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-red-100/50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file?.type.startsWith('video/')) {
                        setVideoFile(file);
                        setLessonContent(`[UPLOAD] ${file.name}`);
                      }
                    }}
                  >
                    <Video className="w-8 h-8 mx-auto mb-2 text-red-400" />
                    <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop video</p>
                    <p className="text-xs text-slate-400">MP4, WebM, OGG (Max 500MB)</p>
                    <input
                      id="video-input"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setVideoFile(file);
                          setLessonContent(`[UPLOAD] ${file.name}`);
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Show uploaded file info */}
                  {videoFile && (
                    <div className="p-3 bg-white/60 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">{videoFile.name}</p>
                          <p className="text-xs text-slate-400">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVideoFile(null);
                          setLessonContent('');
                        }}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input value={lessonDuration} onChange={e => setLessonDuration(e.target.value)} placeholder="e.g. 45 min" className="rounded-xl bg-white/80" />
                  </div>
                </div>
              )}
              {lessonType === 'document' && (
                <div className="space-y-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="space-y-2">
                    <Label>Document URL / Upload *</Label>
                    <Input value={lessonContent} onChange={e => setLessonContent(e.target.value)} placeholder="https://... or upload file" className="rounded-xl bg-white/80" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
                    <Label>Allow Download</Label>
                  </div>
                </div>
              )}
              {lessonType === 'image' && (
                <div className="space-y-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="space-y-2">
                    <Label>Image URL / Upload *</Label>
                    <Input value={lessonContent} onChange={e => setLessonContent(e.target.value)} placeholder="https://... or upload image" className="rounded-xl bg-white/80" />
                  </div>
                  {lessonContent && (
                    <img src={lessonContent} alt="Preview" className="h-32 rounded-xl object-cover" />
                  )}
                  <div className="flex items-center gap-3">
                    <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
                    <Label>Allow Download</Label>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Description Tab */}
            <TabsContent value="description" className="pt-2">
              <div className="space-y-2">
                <Label>Lesson Description</Label>
                <p className="text-xs text-slate-400">This description is shown to learners in the lesson player.</p>
                <Textarea value={lessonDescription} onChange={e => setLessonDescription(e.target.value)} placeholder="Describe what this lesson covers, learning objectives, key takeaways..." rows={10} className="rounded-xl bg-white/50" />
              </div>
            </TabsContent>

            {/* Attachments Tab */}
            <TabsContent value="attachments" className="pt-2 space-y-4">
              <p className="text-sm text-slate-500">Add extra resources that appear alongside this lesson for learners.</p>
              {resources.length > 0 && (
                <div className="space-y-2">
                  {resources.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl">
                      <div className="flex items-center gap-2">
                        {res.type === 'link' ? <LinkIcon className="w-4 h-4 text-red-500" /> : <Upload className="w-4 h-4 text-emerald-500" />}
                        <div>
                          <p className="text-sm font-medium">{res.title}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[300px]">{res.url}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setResources(resources.filter((_, idx) => idx !== i))} className="h-7 w-7 p-0 text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2 p-4 bg-slate-50/50 rounded-xl">
                <Input value={newResTitle} onChange={e => setNewResTitle(e.target.value)} placeholder="Resource title" className="rounded-xl bg-white/80 text-sm" />
                <div className="flex gap-2">
                  <Input value={newResUrl} onChange={e => setNewResUrl(e.target.value)} placeholder="URL or file path" className="rounded-xl bg-white/80 text-sm flex-1" />
                  <Select value={newResType} onValueChange={(v: any) => setNewResType(v)}>
                    <SelectTrigger className="w-24 rounded-xl bg-white/80 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addResource} variant="outline" className="rounded-xl"><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60">
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={saveLessonEditor} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl">
              {editingLesson ? 'Update' : 'Create'} Lesson
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD ATTENDEES WIZARD */}
      <Dialog open={addAttendeeOpen} onOpenChange={setAddAttendeeOpen}>
        <DialogContent className="glass-card rounded-3xl border-white/40 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <UserPlus className="w-5 h-5 inline mr-2 text-red-500" />Add Attendees
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-500">Invite learners by email to enroll in this course.</p>
            <div className="flex gap-2">
              <Input type="email" value={newAttEmail} onChange={e => setNewAttEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddAttendee()} placeholder="learner@example.com" className="rounded-xl bg-white/50" />
              <Button onClick={handleAddAttendee} variant="outline" className="rounded-xl"><Plus className="w-4 h-4" /></Button>
            </div>
            {attendeeEmails.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {attendeeEmails.map((email, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-xl text-sm">
                    <span>{email}</span>
                    <button onClick={() => setAttendeeEmails(attendeeEmails.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAddAttendeeOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSendInvites} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl">
                <Send className="w-4 h-4 mr-2" />Send Invites ({attendeeEmails.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONTACT ATTENDEES WIZARD */}
      <Dialog open={contactAttendeeOpen} onOpenChange={setContactAttendeeOpen}>
        <DialogContent className="glass-card rounded-3xl border-white/40 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Mail className="w-5 h-5 inline mr-2 text-red-500" />Contact Enrolled Learners
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-500">Send a message to all learners enrolled in this course.</p>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input value={contactSubject} onChange={e => setContactSubject(e.target.value)} placeholder="e.g. Important course update" className="rounded-xl bg-white/50" />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} placeholder="Write your message to all enrolled learners..." rows={6} className="rounded-xl bg-white/50" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setContactAttendeeOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleContactSend} className="bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl">
                <Send className="w-4 h-4 mr-2" />Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}