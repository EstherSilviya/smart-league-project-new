// src/firebase/storageService.js
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file with progress tracking
 * @param {File} file - The file to upload
 * @param {string} path - Storage path e.g. 'avatars/uid.jpg'
 * @param {function} onProgress - Called with 0-100 progress
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = (file, path, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

export const uploadAvatar = (uid, file, onProgress) =>
  uploadFile(file, `avatars/${uid}/${Date.now()}_${file.name}`, onProgress);

export const uploadAchievementImage = (achievementId, file, onProgress) =>
  uploadFile(file, `achievements/${achievementId}/${Date.now()}_${file.name}`, onProgress);

export const uploadNewsImage = (newsId, file, onProgress) =>
  uploadFile(file, `news/${newsId}/${Date.now()}_${file.name}`, onProgress);

export const deleteFile = async (url) => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (e) {
    console.warn('Could not delete file:', e);
  }
};
