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

// Submit new application (saves to localStorage)
export const submitApplication = (application: Omit<TutorApplication, 'id'>): TutorApplication => {
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
