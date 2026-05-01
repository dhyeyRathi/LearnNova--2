import { supabase } from '../../utils/supabase/client';
import type { TutorApplication } from '../data/types';

export const getApplications = async (): Promise<TutorApplication[]> => {
  const { data, error } = await supabase.from('tutor_applications').select('*');
  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
  return data.map(app => ({
    id: app.id,
    userId: app.user_id,
    userName: app.user_name,
    userEmail: app.user_email,
    userAvatar: app.user_avatar,
    status: app.status,
    message: app.message,
    submittedAt: app.created_at,
    reviewedAt: app.reviewed_at,
    reviewedBy: app.reviewed_by
  }));
};

export const checkDuplicateApplication = async (email: string): Promise<boolean> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data, error } = await supabase
    .from('tutor_applications')
    .select('id')
    .ilike('user_email', email)
    .gte('created_at', thirtyDaysAgo.toISOString());
    
  if (error) return false;
  return data && data.length > 0;
};

export const submitApplication = async (application: Omit<TutorApplication, 'id'>): Promise<boolean> => {
  const { error } = await supabase.from('tutor_applications').insert([{
    user_id: application.userId,
    user_name: application.userName,
    user_email: application.userEmail,
    user_avatar: application.userAvatar,
    message: application.message,
    status: 'pending'
  }]);
  
  return !error;
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('tutor_applications')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', applicationId);
    
  return !error;
};

