// src/pages/admin/AdminNews.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getNewsPosts, createNewsPost, updateNewsPost, deleteNewsPost, getNewsPostById } from '../../firebase/firestore';
import { uploadNewsImage } from '../../firebase/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar, AdminTopBar } from '../../components/Layout';

// ─── NEWS LIST ────────────────────────────────────────────────────────────────
export const AdminNewsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const loadPosts = () => getNewsPosts({}).then(data => { 
    setPosts(data.map(p => ({ ...p, imageUrl: p.imageUrl || p.imageURL }))); 
    setLoading(false); 
  });

  useEffect(() => { loadPosts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await deleteNewsPost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminTopBar />
      <main className="lg:pl-64 pt-16">
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-primary">Newsroom</h1>
              <p className="text-on-surface-variant text-sm">{posts.length} total posts</p>
            </div>
            <button onClick={() => navigate('/admin/news/new')}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all w-fit">
              <span className="material-symbols-outlined text-sm">add</span>
              New Post
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {['all', 'published', 'draft'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filter === f ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-surface-container'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-surface-container-low rounded-2xl animate-pulse" />)
            ) : filtered.length === 0 ? (
              <div className="bg-surface-container-low rounded-3xl p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-outline mb-3">article</span>
                <p className="text-on-surface-variant">No posts yet.</p>
                <button onClick={() => navigate('/admin/news/new')}
                  className="mt-4 bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90">
                  Create First Post
                </button>
              </div>
            ) : filtered.map(post => (
              <div key={post.id} className="bg-surface-container-low rounded-2xl p-6 flex items-center gap-4 group hover:bg-surface-container transition-all">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt={post.title} className="w-20 h-16 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${post.status === 'published' ? 'bg-secondary-container text-on-secondary-fixed-variant' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                      {post.status}
                    </span>
                    {post.category && <span className="text-[10px] font-bold text-on-tertiary-container bg-tertiary-container/10 px-2 py-0.5 rounded uppercase">{post.category}</span>}
                  </div>
                  <h3 className="font-bold text-on-surface line-clamp-1">{post.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{post.summary || post.description}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => navigate(`/admin/news/edit/${post.id}`)}
                    className="p-2 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg bg-surface-container-high hover:bg-error-container hover:text-error transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── NEWS EDITOR ──────────────────────────────────────────────────────────────
export const AdminNewsEditor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const isEditing = !!postId;

  const [form, setForm] = useState({
    title: '', summary: '', content: '', category: 'General', status: 'draft', tags: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      getNewsPostById(postId).then(post => {
        if (post) {
          setForm({
            title: post.title || '',
            summary: post.summary || '',
            content: post.content || '',
            category: post.category || 'General',
            status: post.status || 'draft',
            tags: (post.tags || []).join(', '),
          });
          if (post.imageURL) setImagePreview(post.imageURL);
        }
        setLoading(false);
      });
    }
  }, [postId, isEditing]);

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (status) => {
    setSaving(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const data = {
        ...form,
        tags,
        status,
        authorName: userProfile?.displayName || 'Admin',
        authorId: currentUser.uid,
      };

      let docId = postId;
      if (isEditing) {
        await updateNewsPost(postId, data);
      } else {
        const ref = await createNewsPost(data);
        docId = ref.id;
      }

      if (imageFile) {
        const url = await uploadNewsImage(docId, imageFile, setUploadProgress);
        if (isEditing) await updateNewsPost(docId, { imageURL: url });
        else await updateNewsPost(docId, { imageURL: url });
      }

      navigate('/admin/news');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-pulse text-outline">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <AdminTopBar />
      <main className="lg:pl-64 pt-16">
        <div className="max-w-4xl mx-auto p-6 lg:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant text-sm mb-2 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
              </button>
              <h1 className="text-3xl font-extrabold tracking-tighter text-primary">{isEditing ? 'Edit Post' : 'New Post'}</h1>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleSave('draft')} disabled={saving}
                className="px-5 py-2.5 bg-surface-container-highest text-on-surface rounded-full text-sm font-bold hover:bg-surface-container transition-all disabled:opacity-50">
                Save Draft
              </button>
              <button onClick={() => handleSave('published')} disabled={saving || !form.title.trim()}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                {saving ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> : null}
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Cover Image */}
            <label className={`flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 rounded-3xl cursor-pointer hover:bg-surface-container-low transition-all overflow-hidden ${imagePreview ? 'h-64' : 'h-48'}`}>
              {imagePreview ? (
                <img src={imagePreview} alt="cover" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <span className="material-symbols-outlined text-4xl text-outline">add_photo_alternate</span>
                  <p className="text-sm text-on-surface-variant font-medium">Add cover image</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden -mt-4">
                <div className="bg-primary h-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            {/* Title */}
            <input type="text" value={form.title} onChange={update('title')} placeholder="Post title..."
              className="bg-transparent border-none outline-none text-3xl font-extrabold text-primary font-headline placeholder:text-outline/40 tracking-tight" />

            {/* Summary */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Summary</label>
              <input type="text" value={form.summary} onChange={update('summary')} placeholder="Brief description shown in feeds..."
                className="bg-surface-container-low rounded-xl h-12 px-4 text-sm outline-none focus:ring-2 ring-primary/30" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Content</label>
              <textarea value={form.content} onChange={update('content')} placeholder="Write your article content here..."
                className="bg-surface-container-low rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-primary/30 resize-none h-64 font-body leading-relaxed" />
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Category</label>
                <select value={form.category} onChange={update('category')}
                  className="bg-surface-container-low rounded-xl h-12 px-4 text-sm outline-none border-none">
                  {['General', 'Athletics', 'Academic', 'Arts', 'Science', 'Social Impact', 'Technology', 'Announcement'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tags (comma separated)</label>
                <input type="text" value={form.tags} onChange={update('tags')} placeholder="achievement, sports, award..."
                  className="bg-surface-container-low rounded-xl h-12 px-4 text-sm outline-none focus:ring-2 ring-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
