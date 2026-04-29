import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export const ForcePasswordReset = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords don't match.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setLoading(true);
    try {
      // 1. Update Auth Password
      await updatePassword(currentUser, password);
      
      // 2. Clear reset flag in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        requiresPasswordReset: false
      });

      // 3. Logout and Redirect to login for verification
      const savedEmail = userProfile?.email || '';
      await logout();
      navigate(`/login?resetSuccess=true&email=${encodeURIComponent(savedEmail)}`);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to update password: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-outline-variant/10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl">lock_reset</span>
          </div>
          <h2 className="text-2xl font-black text-primary tracking-tight font-headline">Secure Your Account</h2>
          <p className="text-on-surface-variant text-sm mt-2">
            You are using a temporary password. Please set a new, secure password to continue.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container rounded-xl text-error text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">New Password</label>
            <div className="flex items-center bg-surface-container-low rounded-xl h-12 px-4 gap-3 focus-within:ring-2 ring-primary/30 transition-all">
              <span className="material-symbols-outlined text-outline text-sm">lock</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-on-surface text-sm"
                placeholder="Minimum 8 characters"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Confirm New Password</label>
            <div className="flex items-center bg-surface-container-low rounded-xl h-12 px-4 gap-3 focus-within:ring-2 ring-primary/30 transition-all">
              <span className="material-symbols-outlined text-outline text-sm">verified_user</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-on-surface text-sm"
                placeholder="Repeat new password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-on-primary rounded-xl font-bold text-sm tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : 'Update Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};
