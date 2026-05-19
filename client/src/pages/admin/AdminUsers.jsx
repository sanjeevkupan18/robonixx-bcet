import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import {
  ShieldCheck,
  UserCircle2,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  MonitorSmartphone,
  LogOut,
  Clock3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

const formatDateTime = (value) => {
  if (!value) return 'No previous login recorded';

  try {
    return format(new Date(value), 'MMM d, yyyy • h:mm a');
  } catch {
    return 'No previous login recorded';
  }
};

const SecurityPoint = ({ icon: Icon, text }) => (
  <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <p className="text-sm text-slate-300">{text}</p>
  </div>
);

export default function AdminUsers() {
  const { user, logoutAll } = useAuth();
  const navigate = useNavigate();
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirm password must match');
      return;
    }

    setSavingPassword(true);
    try {
      const { data } = await authAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(data.message || 'Password updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    setSigningOutAll(true);
    try {
      await logoutAll();
      toast.success('Signed out from all devices');
      navigate('/admin/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sign out from all devices');
    } finally {
      setSigningOutAll(false);
    }
  };

  return (
    <>
      <Helmet><title>Security — Robonixx Admin</title></Helmet>

      <AdminLayout title="Security">
        <div className="mb-6">
          <h2 className="font-display font-bold text-lg text-white">Single Admin Security</h2>
          <p className="mt-1 text-xs text-slate-500">
            This panel now uses one primary admin account with support for multiple active login sessions.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">Single Admin Mode Is Active</h3>
              <p className="mt-1 text-sm text-slate-300">
                Multiple admin accounts are disabled. The same admin account can stay signed in on multiple devices until you revoke all sessions.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="glass rounded-2xl border border-white/5 p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">Primary Admin Account</h3>
                  <p className="text-xs text-slate-500">Current account details and access status</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="mb-1 text-xs font-mono uppercase tracking-wide text-slate-500">Name</p>
                  <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="mb-1 text-xs font-mono uppercase tracking-wide text-slate-500">Role</p>
                  <p className="text-sm font-medium capitalize text-white">{user?.role || 'admin'}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 md:col-span-2">
                  <p className="mb-1 text-xs font-mono uppercase tracking-wide text-slate-500">Email</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="break-all">{user?.email || 'Not available'}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 md:col-span-2">
                  <p className="mb-1 text-xs font-mono uppercase tracking-wide text-slate-500">Last Login</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Clock3 className="h-4 w-4 text-slate-500" />
                    <span>{formatDateTime(user?.lastLogin)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl border border-white/5 p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">Change Password</h3>
                  <p className="text-xs text-slate-500">Update the single admin credentials securely</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-mono text-slate-400">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-mono text-slate-400">New Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="input-field pl-10"
                        placeholder="Minimum 6 characters"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-mono text-slate-400">Confirm Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={showPasswords ? 'text' : 'password'}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="input-field pl-10 pr-10"
                        placeholder="Re-enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                        aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-2">
                  <p className="text-xs text-slate-500">Use a strong password before sharing this account across trusted devices.</p>
                  <button type="submit" disabled={savingPassword} className="btn-primary justify-center disabled:opacity-60">
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-2xl border border-white/5 p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300">
                  <MonitorSmartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">Session Control</h3>
                  <p className="text-xs text-slate-500">Manage access across laptops, phones, and shared devices</p>
                </div>
              </div>

              <div className="space-y-3">
                <SecurityPoint icon={ShieldCheck} text="Only one admin account can access the panel, but it can stay logged in on multiple devices at the same time." />
                <SecurityPoint icon={MonitorSmartphone} text="Use the button below when you need to revoke every active admin session after a shared login or device change." />
                <SecurityPoint icon={LogOut} text="Your current device will also be signed out immediately when you revoke all sessions." />
              </div>

              <div className="mt-5 rounded-xl border border-rose-400/15 bg-rose-400/5 p-4">
                <p className="text-sm text-slate-300">
                  Sign out from all devices invalidates every active admin token. Anyone using the admin panel will need to log in again.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogoutAll}
                disabled={signingOutAll}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-300 transition-all hover:bg-rose-400/15 disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {signingOutAll ? 'Signing Out Everywhere...' : 'Sign Out From All Devices'}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
