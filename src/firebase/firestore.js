// src/firebase/firestore.js
// All Firestore database operations

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, setDoc, onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// ─── USERS ────────────────────────────────────────────────────────────────────
export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
};

export const getAllUsers = async (role = null) => {
  let q = role
    ? query(collection(db, 'users'), where('role', '==', role))
    : query(collection(db, 'users'));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => {
    const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime());
    const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime());
    return tB - tA;
  });
};

export const getStudents = () => getAllUsers('student');
export const getTeachers = () => getAllUsers('teacher');

export const createStudent = async (data) => {
  return await addDoc(collection(db, 'students'), {
    ...data,
    profileCompleted: false,
    createdAt: serverTimestamp(),
  });
};

export const getStudentBySlug = async (slug) => {
  const q = query(collection(db, 'students'), where('slug', '==', slug));
  const snap = await getDocs(q);
  return !snap.empty ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
};

export const updateStudent = async (id, data) => {
  await updateDoc(doc(db, 'students', id), { 
    ...data, 
    profileCompleted: true,
    updatedAt: serverTimestamp() 
  });
};

// ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────
export const createAchievement = async (data) => {
  return await addDoc(collection(db, 'achievements'), {
    ...data,
    likes: 0,
    comments: 0,
    createdAt: serverTimestamp(),
  });
};

export const getAchievements = async (filters = {}) => {
  let constraints = [];
  if (filters.studentId) constraints.push(where('studentId', '==', filters.studentId));
  if (filters.category) constraints.push(where('category', '==', filters.category));
  if (filters.limit) constraints.push(limit(filters.limit));
  const snap = await getDocs(query(collection(db, 'achievements'), ...constraints));
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => {
    const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime());
    const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime());
    return tB - tA;
  });
};

export const getAchievementById = async (id) => {
  const snap = await getDoc(doc(db, 'achievements', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateAchievement = async (id, data) => {
  await updateDoc(doc(db, 'achievements', id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteAchievement = async (id) => {
  await deleteDoc(doc(db, 'achievements', id));
};

export const assignAchievement = async (studentId, achievementData, assignedBy) => {
  return await addDoc(collection(db, 'achievements'), {
    ...achievementData,
    studentId,
    assignedBy,
    assignedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    status: 'published',
  });
};

// ─── NEWS / POSTS ─────────────────────────────────────────────────────────────
export const createNewsPost = async (data) => {
  return await addDoc(collection(db, 'news'), {
    ...data,
    imageUrl: data.imageUrl || '',
    views: 0,
    likes: 0,
    status: data.status || 'draft',
    createdAt: serverTimestamp(),
  });
};

export const getNewsPosts = async (filters = {}) => {
  let constraints = [];
  if (filters.status) constraints.push(where('status', '==', filters.status));
  if (filters.authorId) constraints.push(where('authorId', '==', filters.authorId));
  if (filters.studentSlug) constraints.push(where('studentSlug', '==', filters.studentSlug));
  if (filters.institution) constraints.push(where('institution', '==', filters.institution));
  if (filters.limit) constraints.push(limit(filters.limit));
  const snap = await getDocs(query(collection(db, 'news'), ...constraints));
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => {
    const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime());
    const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime());
    return tB - tA;
  });
};

export const getNewsPostById = async (id) => {
  const snap = await getDoc(doc(db, 'news', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getNewsPostBySlug = async (slug) => {
  const q = query(collection(db, 'news'), where('postSlug', '==', slug));
  const snap = await getDocs(q);
  return !snap.empty ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
};

export const updateNewsPost = async (id, data) => {
  await updateDoc(doc(db, 'news', id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteNewsPost = async (id) => {
  await deleteDoc(doc(db, 'news', id));
};

// ─── ACHIEVEMENT CRITERIA ─────────────────────────────────────────────────────
export const saveCriteria = async (id, data) => {
  if (id) {
    await updateDoc(doc(db, 'achievementCriteria', id), { ...data, updatedAt: serverTimestamp() });
    return id;
  } else {
    const ref = await addDoc(collection(db, 'achievementCriteria'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }
};

export const getCriteriaList = async () => {
  const snap = await getDocs(query(collection(db, 'achievementCriteria'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── REAL-TIME LISTENERS ──────────────────────────────────────────────────────
export const listenToAchievements = (callback, filters = {}) => {
  let constraints = [limit(20)];
  if (filters.studentId) constraints.push(where('studentId', '==', filters.studentId));
  return onSnapshot(query(collection(db, 'achievements'), ...constraints), (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data.sort((a, b) => {
      const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime());
      const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime());
      return tB - tA;
    }));
  });
};

export const listenToNewsFeed = (callback, institution = null) => {
  let constraints = [where('status', '==', 'published'), limit(20)];
  if (institution) constraints.push(where('institution', '==', institution));
  const q = query(collection(db, 'news'), ...constraints);
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data.sort((a, b) => {
      const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime());
      const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime());
      return tB - tA;
    }));
  });
};

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
export const getAdminStats = async (institution = null) => {
  const constraints = institution ? [where('institution', '==', institution)] : [];
  const [students, news, achievements] = await Promise.all([
    getDocs(query(collection(db, 'students'), ...constraints)),
    getDocs(query(collection(db, 'news'), ...constraints)),
    getDocs(query(collection(db, 'achievements'), ...constraints)),
  ]);
  return {
    totalStudents: students.size,
    totalNews: news.size,
    totalAchievements: achievements.size,
  };
};
