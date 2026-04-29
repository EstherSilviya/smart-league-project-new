import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createNewsPost, updateNewsPost, createStudent, getStudentBySlug } from '../../firebase/firestore';
import { uploadNewsImage } from '../../firebase/storageService';
import { sendEmail } from '../../utils/emailService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// A simple utility to create slug from name
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const AdminNewsEditor = ({ onBack }) => {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const editPostId = location.state?.editPostId;
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastSlug, setLastSlug] = useState('');
  const [lastPostId, setLastPostId] = useState('');
  const [form, setForm] = useState({
    headline: '',
    category: 'Academic Excellence',
    location: '',
    students: [{ name: '', courseYear: '', rollNo: '' }],
    description: '',
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  // Autocomplete state
  const [availableStudents, setAvailableStudents] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null); // stores index
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const { getStudents } = await import('../../firebase/firestore');
      const allStudents = await getStudents();
      const filtered = userProfile?.institution ? allStudents.filter(s => s.institution === userProfile.institution) : allStudents;
      setAvailableStudents(filtered);
    };
    if (userProfile) fetchStudents();

    // Fetch edit post data if editPostId is provided
    if (editPostId) {
      const fetchEditPost = async () => {
        const docSnap = await getDoc(doc(db, 'news', editPostId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm({
            headline: data.title || '',
            category: data.category || 'Academic Excellence',
            location: data.location || '',
            students: data.studentsData && data.studentsData.length > 0 ? data.studentsData : [{ name: '', courseYear: '', rollNo: '' }],
            description: data.description || '',
          });
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
          }
        }
      };
      fetchEditPost();
    }
    
    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userProfile]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (draftStatus) => {
    setSaving(true);
    setUploadProgress(0);
    try {
      let finalStatus = draftStatus;
      if (draftStatus !== 'draft') {
          // Force pending for editors, let admins publish immediately if desired
          finalStatus = (userProfile?.role === 'administrator') ? 'published' : 'pending';
      }

      const postSlug = generateSlug(form.headline || 'untitled') + '-' + Math.random().toString(36).substring(7);
      
      // 1. Process all students
      const processedStudents = [];
      for (const student of form.students) {
        if (!student.name) continue;
        const slug = generateSlug(student.name);
        processedStudents.push({ ...student, slug });

        const existingStudent = await getStudentBySlug(slug);
        if (!existingStudent) {
          await createStudent({
            name: student.name,
            courseYear: student.courseYear,
            rollNo: student.rollNo,
            slug: slug,
            institution: userProfile?.institution || 'Unknown',
            bio: `${student.name} is a distinguished student in the ${student.courseYear} program.`,
            supporters: 12,
            profileCompleted: false,
            createdAt: new Date(),
            imageUrl: ''
          });
        }
      }
      
      const firstStudentSlug = processedStudents.length > 0 ? processedStudents[0].slug : '';
      setLastSlug(firstStudentSlug);

      // 2. Create or Update news post
      const newsData = {
        title: form.headline,
        postSlug: postSlug,
        description: form.description,
        category: form.category,
        location: form.location,
        studentsData: processedStudents, // array of student objects
        studentSlugs: processedStudents.map(s => s.slug), // array of slugs for easy querying
        status: finalStatus, 
        authorName: userProfile?.displayName || 'Editor',
        authorId: currentUser.uid,
        authorRole: userProfile?.role || 'editor',
        institution: userProfile?.institution || 'Unknown',
        updatedAt: new Date()
      };

      let currentPostId = editPostId;

      if (editPostId) {
        await updateDoc(doc(db, 'news', editPostId), newsData);
        setLastPostId(editPostId);
      } else {
        newsData.createdAt = new Date();
        newsData.imageUrl = '';
        const ref = await createNewsPost(newsData);
        currentPostId = ref.id;
        setLastPostId(currentPostId);
      }
      
      if (imageFile) {
        try {
          const url = await uploadNewsImage(currentPostId, imageFile, (prog) => {
            setUploadProgress(prog);
          });
          // Save imageUrl to news post
          await updateNewsPost(currentPostId, { imageUrl: url });

          // ALWAYS save imageUrl to ALL student profiles in Firestore
          for (const s of processedStudents) {
            const studentData = await getStudentBySlug(s.slug);
            if (studentData && studentData.id) {
              await updateDoc(doc(db, 'students', studentData.id), { imageUrl: url });
              console.log('Student profile image updated for:', s.name);
            }
          }
        } catch (imgErr) {
          console.error("Image upload failed:", imgErr);
        }
      }

      setShowSuccess(true);
      setSaving(false);

      // 3. Send notification (Non-blocking)
      try {
        const recipientEmail = userProfile?.email || currentUser.email;
        if (recipientEmail) {
          sendEmail({
            to: recipientEmail,
            subject: `Submission Received: ${form.headline}`,
            html: `
              <div style="font-family: sans-serif; color: #1a1c1e;">
                <h2 style="color: #002045;">Content Received</h2>
                <p>Hello <strong>${userProfile?.displayName || 'Editor'}</strong>,</p>
                <p>Your post <strong>${form.headline}</strong> has been uploaded and is waiting for review.</p>
                <p>To ensure the students' portfolios are complete, please finish their profile details in the Admin Portal.</p>
                <div style="margin: 20px 0;">
                  <a href="${window.location.origin}/admin" style="background: #002045; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Go to Admin Portal</a>
                </div>
              </div>
            `
          }).catch(e => console.error("Email deferred error:", e));
        }
      } catch (e) { console.error("Email logic error:", e); }
      
      return; // Exit early to avoid the double setSaving at the bottom
    } catch (err) {
      console.error(err);
      alert('Failed to save content: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 md:p-12 animate-fade-in">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={onBack} className="material-symbols-outlined text-outline hover:text-primary transition-colors">arrow_back</button>
            <span className="bg-tertiary-container text-on-tertiary-container text-[10px] font-bold tracking-widest px-2 py-1 rounded uppercase">Editor Portal</span>
          </div>
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-primary">Publish News</h1>
          <p className="text-on-surface-variant font-body max-w-lg leading-relaxed">
            Craft prestigious updates for the Smart League community. Ensure all achievement details are accurate before publishing.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Section */}
        <div className="lg:col-span-8 space-y-12">
          {/* Form Group: Identity */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline text-xl font-bold text-primary">Core Information</h3>
              <span className="text-xs font-label uppercase tracking-widest text-outline">Step 1 of 3</span>
            </div>
            
            <div className="space-y-8">
              <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Headline</label>
                <input 
                  type="text" 
                  value={form.headline}
                  onChange={update('headline')}
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-2xl font-headline font-bold text-primary placeholder:text-outline-variant/50 transition-all py-3 px-0" 
                  placeholder="e.g. StarLeague Mathematics Olympiad 2024 Winners" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-outline">Achievement Category</label>
                  <select 
                    value={form.category}
                    onChange={update('category')}
                    className="w-full bg-surface-container border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 rounded-lg py-3 px-4 font-body"
                  >
                    <option>Academic Excellence</option>
                    <option>Sports</option>
                    <option>Research</option>
                    <option>Tech</option>
                    <option>Arts</option>
                    <option>Service</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-outline">Location</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">location_on</span>
                    <input 
                      type="text" 
                      value={form.location}
                      onChange={update('location')}
                      className="w-full bg-surface-container border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 rounded-lg py-3 pl-10 pr-4 font-body" 
                      placeholder="e.g. National Stadium" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Form Group: Student */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline text-xl font-bold text-primary">Student Identifiers</h3>
              <button 
                type="button" 
                onClick={() => setForm(prev => ({ ...prev, students: [...prev.students, { name: '', courseYear: '', rollNo: '' }] }))} 
                className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest hover:bg-primary/20 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span> Add Student
              </button>
            </div>
            
            <div className="space-y-4">
              {form.students.map((student, idx) => (
                <div key={idx} className="relative bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/20">
                  {form.students.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setForm(prev => ({ ...prev, students: prev.students.filter((_, i) => i !== idx) }))} 
                      className="absolute top-2 right-2 text-on-surface-variant hover:text-error hover:bg-error/10 p-1.5 rounded-full transition-colors flex items-center justify-center"
                      title="Remove Student"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 relative" ref={activeDropdown === idx ? dropdownRef : null}>
                      <label className="block text-xs font-bold uppercase tracking-widest text-outline">Student Name</label>
                      <input 
                        type="text" 
                        value={student.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newStudents = [...form.students];
                          newStudents[idx] = { ...newStudents[idx], name: val };
                          
                          const normalize = str => (str || '').trim().toLowerCase().replace(/\s+/g, ' ');
                          const searchVal = normalize(val);
                          const exactMatch = availableStudents.find(s => normalize(s.name) === searchVal);
                          if (exactMatch) {
                            newStudents[idx].courseYear = exactMatch.courseYear || '';
                            newStudents[idx].rollNo = exactMatch.rollNo || '';
                          }
                          
                          setForm(prev => ({ ...prev, students: newStudents }));
                          setActiveDropdown(idx);
                        }}
                        onFocus={() => setActiveDropdown(idx)}
                        className="w-full bg-surface-container border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 rounded-lg py-3 px-4 font-body" 
                        placeholder="Evelyn Harper" 
                        autoComplete="off"
                      />
                      {activeDropdown === idx && student.name.length > 1 && (() => {
                        const normalize = str => (str || '').trim().toLowerCase().replace(/\s+/g, ' ');
                        const searchVal = normalize(student.name);
                        
                        const matches = availableStudents.filter(s => normalize(s.name).includes(searchVal));
                        const exactMatch = matches.some(s => normalize(s.name) === searchVal);
                        
                        return (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-outline-variant/20 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                            {matches.map((s) => (
                              <div 
                                key={s.id} 
                                className="px-4 py-3 hover:bg-surface-container-low cursor-pointer border-b border-outline-variant/10 flex flex-col"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevent input blur
                                  const newStudents = [...form.students];
                                  newStudents[idx] = { ...newStudents[idx], name: s.name, courseYear: s.courseYear || '', rollNo: s.rollNo || '' };
                                  setForm(prev => ({ ...prev, students: newStudents }));
                                  setActiveDropdown(null);
                                }}
                              >
                                <span className="font-bold text-sm text-primary">{s.name}</span>
                                <span className="text-[10px] text-on-surface-variant font-medium">{s.courseYear} • {s.rollNo}</span>
                              </div>
                            ))}
                            {!exactMatch && (
                              <div 
                                className="px-4 py-3 bg-secondary-container/10 hover:bg-secondary-container/30 cursor-pointer text-secondary flex items-center gap-2"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setActiveDropdown(null);
                                }}
                              >
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                <span className="font-bold text-sm">Add "{student.name}" as new student</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-outline">Course Year</label>
                      <input 
                        type="text" 
                        value={student.courseYear}
                        onChange={(e) => {
                          const newStudents = [...form.students];
                          newStudents[idx].courseYear = e.target.value;
                          setForm(prev => ({ ...prev, students: newStudents }));
                        }}
                        className="w-full bg-surface-container border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 rounded-lg py-3 px-4 font-body" 
                        placeholder="MCA 1st Year" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-widest text-outline">Roll No</label>
                      <input 
                        type="text" 
                        value={student.rollNo}
                        onChange={(e) => {
                          const newStudents = [...form.students];
                          newStudents[idx].rollNo = e.target.value;
                          setForm(prev => ({ ...prev, students: newStudents }));
                        }}
                        className="w-full bg-surface-container border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 rounded-lg py-3 px-4 font-body" 
                        placeholder="SL-2024-8892" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Form Group: Content */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline text-xl font-bold text-primary">The Narrative</h3>
              <span className="text-xs font-label uppercase tracking-widest text-outline">Step 2 of 3</span>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-outline">Description</label>
              <textarea 
                value={form.description}
                onChange={update('description')}
                className="w-full bg-surface-container border-0 border-b border-outline-variant/30 focus:border-primary focus:ring-0 rounded-lg py-4 px-4 font-body leading-relaxed" 
                placeholder="Describe the achievement in detail..." 
                rows="6"
              ></textarea>
            </div>
          </section>

          {/* Form Group: Assets */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline text-xl font-bold text-primary">Media Assets</h3>
              <span className="text-xs font-label uppercase tracking-widest text-outline">Step 3 of 3</span>
            </div>
            
            <label className="relative group cursor-pointer border-2 border-dashed border-outline-variant/50 rounded-2xl p-6 md:p-12 transition-all hover:bg-surface-container-low flex flex-col items-center justify-center space-y-4">
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              
              {imagePreview ? (
                <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-outline-variant shadow-lg">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-sm">Change Image</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                  </div>
                  <div className="text-center px-4">
                    <h4 className="font-headline font-bold text-primary">Select Achievement Image</h4>
                    <p className="text-sm text-on-surface-variant">Recommended: 16:9 ratio (JPG/PNG)</p>
                  </div>
                  <div className="bg-primary-fixed text-on-primary-fixed px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all">Browse Files</div>
                </>
              )}
            </label>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-primary uppercase tracking-widest">
                  <span>Uploading Asset...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {imagePreview && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="aspect-square bg-surface-container-high rounded-xl overflow-hidden relative group">
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    onClick={(e) => { e.preventDefault(); setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Action Bar */}
          <div className="pt-12 border-t border-outline-variant/20 flex flex-col md:flex-row gap-4 justify-between">
            <button 
              onClick={() => handleSave('draft')} 
              disabled={saving}
              className="px-8 py-3 rounded-full font-bold text-primary border border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <div className="flex flex-col md:flex-row gap-4">
              <button onClick={onBack} className="px-8 py-3 rounded-full font-bold text-on-surface-variant hover:text-primary transition-all">Cancel</button>
              <button 
                onClick={() => handleSave()} 
                disabled={saving || !form.headline || !form.students[0].name}
                className="bg-primary text-on-primary px-12 py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 min-w-[200px]"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Saving...'}
                  </div>
                ) : 'Publish Content'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-4 space-y-8 hidden lg:block">
           <div className="sticky top-24">
             <div className="mb-4 flex items-center justify-between">
               <h4 className="font-headline font-bold text-primary">Live Preview</h4>
             </div>
             {/* Simple mobile frame preview */}
             <div className="w-full aspect-[9/18.5] bg-[#000] rounded-[3rem] p-3 shadow-2xl relative overflow-hidden ring-4 ring-outline-variant/20">
               <div className="bg-white w-full h-full rounded-[2.5rem] overflow-hidden relative flex flex-col">
                 <div className="pt-8 px-6 pb-4 bg-primary text-white">
                   <div className="bg-secondary px-2 py-0.5 rounded-sm inline-block mb-2">
                     <span className="text-[8px] font-bold uppercase">{form.category || 'Category'}</span>
                   </div>
                   <h5 className="font-headline font-bold text-lg leading-tight">{form.headline || 'Headline Preview'}</h5>
                 </div>
                 {imagePreview && (
                   <div className="h-48 relative">
                     <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                   </div>
                 )}
                 <div className="p-6 flex-1 overflow-y-auto space-y-4">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center">
                       <span className="material-symbols-outlined text-xs text-on-tertiary-container">person</span>
                     </div>
                     <div>
                       <p className="text-[10px] text-on-surface-variant font-bold leading-none">HONOREE</p>
                       <p className="text-xs font-bold text-primary">
                         {form.students.length > 1 ? `${form.students[0].name} & ${form.students.length - 1} more` : (form.students[0].name || 'Student Name')}
                       </p>
                       {form.students[0].courseYear && <p className="text-[10px] text-slate-500">{form.students[0].courseYear}</p>}
                     </div>
                   </div>
                   <p className="text-[10px] leading-relaxed text-on-surface-variant">{form.description || 'Description preview...'}</p>
                 </div>
               </div>
             </div>
           </div>
        </div>

      </div>
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={onBack}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl text-center space-y-6 animate-scale-in border border-primary/10">
            <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-primary">Uploaded!</h2>
              <p className="text-on-surface-variant font-medium mt-2">Waiting for Admin Approval.</p>
              <p className="text-[11px] text-outline mt-1 font-bold uppercase tracking-widest italic opacity-60">Story: {form.headline}</p>
            </div>
            
            <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 text-left border border-outline-variant/10">
              <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm">badge</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Action Recommended</p>
                <p className="text-xs font-bold text-primary leading-tight">Complete {form.studentName}'s profile details for a full portfolio experience.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={() => {
                  // This is tricky because we need to tell AdminPortal to switch to edit student
                  // But we are in a subview. We'll use a hack or better: call a prop if we have it.
                  // For now, let's just go back, and the user can click edit from the list.
                  // Actually, let's just use onBack and the user will see the directory.
                  onBack();
                }}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Go to Student Directory
              </button>
              <button onClick={onBack} className="w-full text-outline font-bold py-2 hover:text-primary transition-colors">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
