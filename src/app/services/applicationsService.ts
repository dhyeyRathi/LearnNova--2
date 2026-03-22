// FIXED: Data sync between tutor application submission and admin view
// This service manages application submissions using localStorage for persistence

import { TutorApplication, tutorApplications } from '../data/mockData';

const STORAGE_KEY = 'lms_tutor_applications';

// Initialize storage with mock data if empty
const initializeStorage = (): TutorApplication[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // If parse fails, return mock data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tutorApplications));
      return tutorApplications;
    }
  }
  // First time - save mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tutorApplications));
  return tutorApplications;
};

// Get all applications (loads from localStorage)
export const getApplications = (): TutorApplication[] => {
  return initializeStorage();
};

/**
 * Check if user has already applied in the past month
 * Returns the existing application if found, null otherwise
 */
export const checkDuplicateApplication = (email: string): TutorApplication | null => {
  const applications = getApplications();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Find application from same email within past 30 days
  const existingApp = applications.find(app => {
    if (app.userEmail.toLowerCase() !== email.toLowerCase()) return false;
    
    const submittedDate = new Date(app.submittedAt);
    return submittedDate >= thirtyDaysAgo;
  });

  return existingApp || null;
};

/**
 * Get rejection reason if applicant was rejected recently
 */
export const getRecentRejectionReason = (email: string): { rejectedAt: string; reason?: string } | null => {
  const applications = getApplications();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const rejectedApp = applications.find(app => {
    if (app.userEmail.toLowerCase() !== email.toLowerCase()) return false;
    if (app.status !== 'rejected') return false;
    
    const rejectedDate = app.reviewedAt ? new Date(app.reviewedAt) : null;
    return rejectedDate && rejectedDate >= thirtyDaysAgo;
  });

  return rejectedApp ? { rejectedAt: rejectedApp.reviewedAt || '', reason: 'Please reapply after 30 days' } : null;
};

// Submit new application (saves to localStorage)
export const submitApplication = (application: Omit<TutorApplication, 'id'>): TutorApplication | null => {
  // Check for duplicate applications
  const existingApp = checkDuplicateApplication(application.userEmail);
  if (existingApp) {
    console.warn('Duplicate application:', {
      existingId: existingApp.id,
      existingStatus: existingApp.status,
      submittedAt: existingApp.submittedAt
    });
    return null; // Return null to indicate duplicate
  }

  // Check if recently rejected
  const recentRejection = getRecentRejectionReason(application.userEmail);
  if (recentRejection) {
    console.warn('Recently rejected application:', recentRejection);
    return null; // Return null to indicate cannot reapply yet
  }

  const applications = getApplications();
  
  const newApplication: TutorApplication = {
    ...application,
    id: `app-${Date.now()}`, // Generate unique ID
  };
  
  applications.unshift(newApplication); // Add to beginning of array
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  
  return newApplication;
};

// Update application status (for admin approve/reject)
export const updateApplicationStatus = (
  applicationId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string
): TutorApplication | null => {
  const applications = getApplications();
  const index = applications.findIndex(app => app.id === applicationId);
  
  if (index === -1) return null;
  
  applications[index] = {
    ...applications[index],
    status,
    reviewedAt: new Date().toISOString().split('T')[0],
    reviewedBy,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  return applications[index];
};

// Clear all applications (for testing)
export const clearApplications = () => {
  localStorage.removeItem(STORAGE_KEY);
};
