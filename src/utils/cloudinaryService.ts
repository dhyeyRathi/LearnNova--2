// ─── Cloudinary Upload Service ──────────────────────────────────────────────
// Handles video compression and thumbnail/video uploads to Cloudinary
// Uses unsigned upload (no backend required)

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const THUMBNAIL_PRESET = import.meta.env.VITE_CLOUDINARY_THUMBNAIL_PRESET || 'Thumbnail';
const VIDEO_PRESET = import.meta.env.VITE_CLOUDINARY_VIDEO_PRESET || 'Videos';
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

const getMaxVideoSizeMB = () => {
  try {
    const settingsStr = localStorage.getItem('adminSettings');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings.maxFileSize) {
        return parseInt(settings.maxFileSize, 10);
      }
    }
  } catch (e) {
    // Ignore
  }
  return 50; // Default 50 MB
};

const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024; // 10 MB

export interface UploadProgress {
  percent: number;
  loaded: number;
  total: number;
}

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  thumbnailUrl?: string;
}

// ─── Upload Video ───────────────────────────────────────────────────────────
// Uploads to the "videos" folder in Cloudinary with auto-compression
export const uploadVideo = (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME) {
      reject(new Error('Cloudinary not configured. Add VITE_CLOUDINARY_CLOUD_NAME to .env.local'));
      return;
    }

    const maxMB = getMaxVideoSizeMB();
    const maxBytes = maxMB * 1024 * 1024;

    if (file.size > maxBytes) {
      reject(new Error(`Video too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${maxMB} MB.`));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', VIDEO_PRESET);
    formData.append('folder', 'Videos');


    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${UPLOAD_URL}/video/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          percent: Math.round((e.loaded / e.total) * 100),
          loaded: e.loaded,
          total: e.total,
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          format: data.format,
          width: data.width,
          height: data.height,
          duration: data.duration,
          bytes: data.bytes,
          // Auto-generated thumbnail from Cloudinary
          thumbnailUrl: data.secure_url.replace(/\.[^.]+$/, '.jpg'),
        });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || 'Video upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during video upload'));
    xhr.send(formData);
  });
};

// ─── Upload Thumbnail / Image ───────────────────────────────────────────────
// Uploads to the "thumbnails" folder in Cloudinary with auto-optimization
export const uploadThumbnail = (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME) {
      reject(new Error('Cloudinary not configured. Add VITE_CLOUDINARY_CLOUD_NAME to .env.local'));
      return;
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      reject(new Error(`Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', THUMBNAIL_PRESET);
    formData.append('folder', 'Thumbnail');


    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${UPLOAD_URL}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          percent: Math.round((e.loaded / e.total) * 100),
          loaded: e.loaded,
          total: e.total,
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          format: data.format,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
        });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || 'Image upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during image upload'));
    xhr.send(formData);
  });
};

// ─── Helpers ────────────────────────────────────────────────────────────────

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const isCloudinaryConfigured = (): boolean => {
  return !!CLOUD_NAME;
};
