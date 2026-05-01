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

import { Save, ArrowLeft, Upload, X, Plus, Eye, Video, FileText, Image as ImageIcon, HelpCircle, Edit, Trash2, Link as LinkIcon, GripVertical, Mail, UserPlus, Send, DollarSign, Crown, Loader2, CheckCircle2, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { uploadVideo, uploadThumbnail, formatFileSize, isCloudinaryConfigured } from '../../../utils/cloudinaryService';
import { 
  getCourse, createCourse, updateCourse, 
  getLessonsByCourse, createLesson, updateLesson, deleteLessonFromDB,
  getQuizzesByCourse,
  type Course, type Lesson
} from '../../../utils/supabase/client';
import { supabase } from '../../../utils/supabase/client';

export default function CourseEditorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNewCourse = id === 'new';

  // DB-loaded state
  const [course, setCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [courseQuizzes, setCourseQuizzes] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Course fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [accessRule, setAccessRule] = useState('open');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [website, setWebsite] = useState('');
  const [courseAdmin, setCourseAdmin] = useState(user?.id || '');
  const [price, setPrice] = useState('');

  // Lesson editor state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
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

  // Cloudinary upload states
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // ── Load data from Supabase ──────────────────────────────────────────
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'tutor')) {
      navigate('/courses');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load users for admin dropdown
        const { data: usersData } = await supabase.from('users').select('id, name, role').in('role', ['admin', 'tutor']);
        setAllUsers(usersData || []);

        if (!isNewCourse && id) {
          // Load existing course
          const courseData = await getCourse(id);
          if (!courseData) {
            toast.error('Course not found');
            navigate('/dashboard/admin');
            return;
          }

          // Tutor ownership check
          if (user.role === 'tutor' && courseData.instructor_id !== user.id) {
            toast.error('You can only edit courses you created');
            navigate('/dashboard/instructor');
            return;
          }

          setCourse(courseData);
          setTitle(courseData.title);
          setDescription(courseData.description || '');
          setCoverImage(courseData.cover_image || '');
          setPublished(courseData.is_published);
          setVisibility(courseData.visibility || 'public');
          setAccessRule(courseData.access_rule || 'open');
          setTags(courseData.tags || []);
          setPrice(courseData.price?.toString() || '');
          setCourseAdmin(courseData.instructor_id);

          // Load lessons & quizzes for this course
          const [lessonsData, quizzesData] = await Promise.all([
            getLessonsByCourse(id),
            getQuizzesByCourse(id),
          ]);
          setCourseLessons(lessonsData);
          setCourseQuizzes(quizzesData);
        }
      } catch (err) {
        console.error('Error loading course data:', err);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate, isNewCourse]);

  if (!user || (user.role !== 'admin' && user.role !== 'tutor')) return null;

  // ── Save to Supabase ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) { toast.error('Course title is required'); return; }
    if (published) {
      if (courseLessons.length === 0) {
        toast.error('Cannot publish: Course must have at least one lesson.');
        setPublished(false);
        return;
      }
      const hasVideo = courseLessons.some(l => l.type === 'video');
      if (!hasVideo) {
        toast.error('Cannot publish: Course must have at least one video lesson.');
        setPublished(false);
        return;
      }
    }
    
    setSaving(true);
    try {
      const totalMinutes = courseLessons.reduce((sum, lesson) => sum + (lesson.video_duration || 0), 0);
      let calculatedDuration = '0 mins';
      if (totalMinutes > 0) {
        if (totalMinutes < 60) {
          calculatedDuration = `${totalMinutes} mins`;
        } else {
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          calculatedDuration = m > 0 ? `${h}h ${m}m` : `${h}h`;
        }
      }

      const coursePayload = {
        title,
        description,
        cover_image: coverImage,
        is_published: published,
        visibility,
        access_rule: accessRule,
        tags,
        price: price ? parseFloat(price) : null,
        instructor_id: courseAdmin || user.id,
        instructor_name: allUsers.find(u => u.id === (courseAdmin || user.id))?.name || user.email?.split('@')[0] || 'Instructor',
        duration: calculatedDuration,
      };

      if (isNewCourse) {
        const newCourse = await createCourse(coursePayload);
        toast.success('Course created successfully!');
        navigate(`/admin/courses/${newCourse.id}/edit`);
      } else if (id) {
        await updateCourse(id, coursePayload);
        toast.success('Course updated successfully!');
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      toast.error(err.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // ── Lesson CRUD (Supabase) ───────────────────────────────────────────
  const openLessonEditor = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description || '');
      setLessonContent(lesson.content || lesson.video_url || '');
      setLessonDuration(lesson.video_duration ? `${lesson.video_duration} mins` : '');
      setResources([]);
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

  const parseDurationToMinutes = (durationStr: string): number | undefined => {
    if (!durationStr.trim()) return undefined;
    const match = durationStr.match(/(\d+(?:\.\d+)?)/);
    if (!match) return undefined;
    const val = parseFloat(match[1]);
    if (durationStr.toLowerCase().includes('h')) {
      return Math.round(val * 60);
    }
    return Math.round(val);
  };

  const saveLessonEditor = async () => {
    if (!lessonTitle.trim()) { toast.error('Lesson title is required'); return; }
    if (isNewCourse) { toast.error('Save the course first before adding lessons'); return; }
    
    try {
      const parsedDuration = parseDurationToMinutes(lessonDuration);

      if (editingLesson) {
        const updated = await updateLesson(editingLesson.id, {
          title: lessonTitle,
          description: lessonDescription,
          type: lessonType,
          content: lessonType !== 'video' ? lessonContent : undefined,
          video_url: lessonType === 'video' ? lessonContent : undefined,
          video_duration: parsedDuration,
        });
        setCourseLessons(prev => prev.map(l => l.id === updated.id ? updated : l));
        toast.success('Lesson updated!');
      } else {
        const created = await createLesson({
          course_id: id!,
          title: lessonTitle,
          description: lessonDescription,
          type: lessonType,
          content: lessonType !== 'video' ? lessonContent : undefined,
          video_url: lessonType === 'video' ? lessonContent : undefined,
          sequence_number: courseLessons.length + 1,
          video_duration: parsedDuration,
        });
        setCourseLessons(prev => [...prev, created]);
        toast.success('Lesson created!');
      }
      setLessonDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save lesson');
    }
  };

  const handlePublishToggle = (val: boolean) => {
    if (val) {
      if (courseLessons.length === 0) {
        toast.error('Cannot publish: Course must have at least one lesson.');
        return;
      }
      const hasVideo = courseLessons.some(l => l.type === 'video');
      if (!hasVideo) {
        toast.error('Cannot publish: Course must have at least one video lesson.');
        return;
      }
    }
    setPublished(val);
  };

  const addResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) { toast.error('Fill in resource title and URL'); return; }
    setResources([...resources, { title: newResTitle, type: newResType, url: newResUrl }]);
    setNewResTitle(''); setNewResUrl('');
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (deleteConfirm === lessonId) {
      try {
        await deleteLessonFromDB(lessonId);
        setCourseLessons(prev => prev.filter(l => l.id !== lessonId));
        toast.success('Lesson deleted');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete lesson');
      }
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

  // ── Cloudinary Upload Handlers ──────────────────────────────────────────
  const handleThumbnailUpload = async (file: File) => {
    if (!isCloudinaryConfigured()) {
      toast.error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env.local');
      return;
    }
    try {
      setThumbnailUploading(true);
      setThumbnailProgress(0);
      const result = await uploadThumbnail(file, (progress) => {
        setThumbnailProgress(progress.percent);
      });
      setCoverImage(result.url);
      toast.success(`Thumbnail uploaded! (${formatFileSize(result.bytes)})`);
    } catch (err: any) {
      toast.error(err.message || 'Thumbnail upload failed');
    } finally {
      setThumbnailUploading(false);
      setThumbnailProgress(0);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!isCloudinaryConfigured()) {
      toast.error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env.local');
      return;
    }
    try {
      setVideoUploading(true);
      setVideoProgress(0);
      const result = await uploadVideo(file, (progress) => {
        setVideoProgress(progress.percent);
      });
      setLessonContent(result.url);
      setVideoFile(file);
      toast.success(`Video uploaded! (${formatFileSize(result.bytes)})`);
    } catch (err: any) {
      toast.error(err.message || 'Video upload failed');
    } finally {
      setVideoUploading(false);
      setVideoProgress(0);
    }
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
      case 'video': return 'bg-purple-600';
      case 'document': return 'bg-purple-600';
      case 'image': return 'bg-purple-600';
      case 'quiz': return 'bg-purple-600';
      default: return 'bg-slate-500';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-6 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl h-9 px-3">
                <ArrowLeft className="w-4 h-4 mr-1" />Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-purple-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {course ? 'Edit Course' : 'Create Course'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 glass-card rounded-lg px-3 py-1.5">
                <Label htmlFor="pub-toggle" className="text-xs cursor-pointer">
                  {published ? <Badge className="bg-purple-600 text-white text-[10px]">Published</Badge> : <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                </Label>
                <Switch id="pub-toggle" checked={published} onCheckedChange={handlePublishToggle} />
              </div>
              {course && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/course/${course.id}`)} className="rounded-lg h-9 text-xs">
                  <Eye className="w-3.5 h-3.5 mr-1" />Preview
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setAddAttendeeOpen(true)} className="rounded-lg h-9 text-xs">
                <UserPlus className="w-3.5 h-3.5 mr-1" />Attendees
              </Button>
              <Button variant="outline" size="sm" onClick={() => setContactAttendeeOpen(true)} className="rounded-lg h-9 text-xs">
                <Mail className="w-3.5 h-3.5 mr-1" />Contact
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-purple-600 text-white rounded-lg h-9 shadow-lg shadow-purple-600/20 text-sm">
                {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT COLUMN — Settings & Cover (2/5) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Cover Image Upload */}
            <Card className="glass-card rounded-2xl overflow-hidden">
              <h3 className="text-sm font-semibold text-slate-700 px-5 pt-4 pb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cover Image</h3>
              {coverImage ? (
                <div className="relative h-36 group mx-5 mb-4 rounded-xl overflow-hidden">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" className="bg-white/90 rounded-lg text-xs" onClick={() => setCoverImage('')}>
                      <X className="w-3 h-3 mr-1" />Remove
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-emerald-500/90 text-white text-[10px] rounded-md">
                      <Cloud className="w-2.5 h-2.5 mr-1" />Cloudinary
                    </Badge>
                  </div>
                </div>
              ) : (
                <div
                  className={`h-32 mx-5 mb-4 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${thumbnailUploading ? 'bg-purple-50/80' : 'bg-purple-50 hover:bg-purple-100/50'}`}
                  onClick={() => !thumbnailUploading && document.getElementById('cover-image-input')?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-purple-100'); }}
                  onDragLeave={(e) => { e.currentTarget.classList.remove('bg-purple-100'); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-purple-100');
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      await handleThumbnailUpload(file);
                    } else {
                      toast.error('Please drop an image file');
                    }
                  }}
                >
                  <input
                    id="cover-image-input"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleThumbnailUpload(file);
                    }}
                    className="hidden"
                  />
                  {thumbnailUploading ? (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 text-purple-500 animate-spin" />
                      <p className="text-xs font-medium text-purple-700">Uploading...</p>
                      <div className="w-32 h-1.5 bg-purple-200 rounded-full mt-2 mx-auto overflow-hidden">
                        <motion.div className="h-full bg-purple-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${thumbnailProgress}%` }} transition={{ duration: 0.3 }} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-1 text-purple-300" />
                      <p className="text-xs font-medium text-slate-600">Click or drag to upload</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Auto-optimized via Cloudinary</p>
                      {!isCloudinaryConfigured() && (
                        <div className="mt-2">
                          <p className="text-[10px] text-amber-600 font-medium">⚠️ Not configured</p>
                          <Input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="Paste URL..." className="mt-1 max-w-[200px] mx-auto rounded-lg bg-white/80 text-xs h-7" onClick={e => e.stopPropagation()} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Course Details */}
            <Card className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Course Details</h3>
              <div className="space-y-1.5">
                <Label className="text-xs">Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course title" className="rounded-lg bg-white/50 border border-slate-200 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Website</Label>
                <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." className="rounded-lg bg-white/50 border border-slate-200 h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tags</Label>
                <div className="flex gap-1.5">
                  <Input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} placeholder="Add tag..." className="rounded-lg bg-white/50 flex-1 h-9 text-sm" />
                  <Button onClick={handleAddTag} variant="outline" size="sm" className="rounded-lg h-9 w-9 p-0"><Plus className="w-3.5 h-3.5" /></Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-0.5 rounded-md text-[10px]">
                        {tag}
                        <button onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-1 hover:text-purple-700"><X className="w-2.5 h-2.5" /></button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Description</h3>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write a compelling course description..." rows={5} className="rounded-lg bg-white/50 text-sm" />
            </Card>
          </div>

          {/* RIGHT COLUMN — Content Tabs (3/5) */}
          <div className="lg:col-span-3">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="glass-card rounded-xl p-1 mb-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="options">Options</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>

            {/* CONTENT TAB - Lessons List */}
            <TabsContent value="content">
              <Card className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Lessons ({courseLessons.length})</h2>
                  <Button onClick={() => openLessonEditor()} className="bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-600/20">
                    <Plus className="w-4 h-4 mr-2" />Add Content
                  </Button>
                </div>
                {courseLessons.length > 0 ? (
                  <div className="space-y-3">
                    {courseLessons.map((lesson, i) => (
                      <motion.div key={lesson.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group">
                        <div className="flex items-center gap-3 p-4 glass-card rounded-2xl hover:shadow-lg transition-all">
                          <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                          <div className={`w-10 h-10 rounded-xl ${getLessonTypeColor(lesson.type)} flex items-center justify-center shadow-md text-white`}>
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
                              className={`rounded-lg h-8 w-8 p-0 ${deleteConfirm === lesson.id ? 'text-purple-700 bg-purple-50' : 'text-slate-400 hover:text-purple-700'}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {deleteConfirm === lesson.id && (
                          <p className="text-xs text-purple-600 mt-1 ml-14">Click again to confirm deletion</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50/50 rounded-2xl">
                    <FileText className="w-14 h-14 mx-auto mb-3 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No lessons yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Start building your course by adding content</p>
                    <Button onClick={() => openLessonEditor()} className="bg-purple-600 text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />Add First Lesson
                    </Button>
                  </div>
                )}
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
                        {allUsers.filter(u => u.role === 'admin' || u.role === 'tutor').map(u => (
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
                  <Button onClick={() => navigate(`/admin/courses/${id}/quiz-builder`)} className="bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-600/20">
                    <Plus className="w-4 h-4 mr-2" />Add Quiz
                  </Button>
                </div>
                {courseQuizzes.length > 0 ? (
                  <div className="space-y-3">
                    {courseQuizzes.map((quiz, i) => (
                      <div key={quiz.id} className="flex items-center gap-4 p-4 glass-card rounded-2xl group hover:shadow-lg transition-all">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-md">
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
                          <Button variant="ghost" size="sm" className="rounded-lg text-purple-600 hover:text-purple-700">
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
                    <Button onClick={() => navigate(`/admin/courses/${id}/quiz-builder`)} className="bg-purple-600 text-white rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />Create Quiz
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
          </div>
        </div>
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
                      {allUsers.filter(u => u.role === 'admin' || u.role === 'tutor').map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Type-specific fields */}
              {lessonType === 'video' && (
                <div className="space-y-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                  {/* Drag & Drop Upload Area */}
                  {!videoUploading && !lessonContent.startsWith('http') ? (
                    <div
                      className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center bg-white/50 cursor-pointer hover:bg-purple-100/30 transition-colors"
                      onClick={() => document.getElementById('video-input')?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-purple-100/50');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-purple-100/50');
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-purple-100/50');
                        const file = e.dataTransfer.files?.[0];
                        if (file?.type.startsWith('video/')) {
                          await handleVideoUpload(file);
                        } else {
                          toast.error('Please drop a video file');
                        }
                      }}
                    >
                      <Video className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop video</p>
                      <p className="text-xs text-slate-400">MP4, WebM, OGG</p>
                      <input
                        id="video-input"
                        type="file"
                        accept="video/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) await handleVideoUpload(file);
                        }}
                        className="hidden"
                      />
                    </div>
                  ) : videoUploading ? (
                    <div className="border-2 border-purple-300 rounded-xl p-6 text-center bg-purple-50/80">
                      <Loader2 className="w-8 h-8 mx-auto mb-3 text-purple-600 animate-spin" />
                      <p className="text-sm font-medium text-purple-700">Compressing & uploading to Cloudinary...</p>
                      <p className="text-xs text-purple-500 mt-1">This may take a while for large videos</p>
                      <div className="w-full h-3 bg-purple-200 rounded-full mt-4 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${videoProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-sm font-bold text-purple-700 mt-2">{videoProgress}%</p>
                    </div>
                  ) : null}

                  {/* Show uploaded file info */}
                  {lessonContent.startsWith('http') && (
                    <div className="p-3 bg-white/80 rounded-xl flex items-center justify-between border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{videoFile?.name || 'Video uploaded'}</p>
                          <p className="text-xs text-emerald-600 font-medium">✓ Uploaded to Cloudinary /videos</p>
                          {videoFile && <p className="text-xs text-slate-400">{formatFileSize(videoFile.size)}</p>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVideoFile(null);
                          setLessonContent('');
                        }}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-purple-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {videoFile && !lessonContent.startsWith('http') && !videoUploading && (
                    <div className="p-3 bg-white/60 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">{videoFile.name}</p>
                          <p className="text-xs text-slate-400">{formatFileSize(videoFile.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVideoFile(null);
                          setLessonContent('');
                        }}
                        className="h-6 w-6 p-0 text-purple-500 hover:text-purple-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Duration (Total number of minutes in this lesson)</Label>
                    <Input type="number" min="1" step="1" value={lessonDuration} onChange={e => setLessonDuration(e.target.value)} placeholder="e.g. 15" className="rounded-xl bg-white/80" />
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
                <div className="space-y-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
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
                        {res.type === 'link' ? <LinkIcon className="w-4 h-4 text-purple-600" /> : <Upload className="w-4 h-4 text-emerald-500" />}
                        <div>
                          <p className="text-sm font-medium">{res.title}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[300px]">{res.url}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setResources(resources.filter((_, idx) => idx !== i))} className="h-7 w-7 p-0 text-purple-500 hover:text-purple-700">
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
            <Button onClick={saveLessonEditor} className="bg-purple-600 text-white rounded-xl">
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
              <UserPlus className="w-5 h-5 inline mr-2 text-purple-600" />Add Attendees
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
                    <button onClick={() => setAttendeeEmails(attendeeEmails.filter((_, idx) => idx !== i))} className="text-purple-500 hover:text-purple-700"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAddAttendeeOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSendInvites} className="bg-purple-600 text-white rounded-xl">
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
              <Mail className="w-5 h-5 inline mr-2 text-purple-600" />Contact Enrolled Learners
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
              <Button onClick={handleContactSend} className="bg-purple-600 text-white rounded-xl">
                <Send className="w-4 h-4 mr-2" />Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}