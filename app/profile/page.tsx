'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, UserRound } from 'lucide-react';
import { getCurrentUser, getUserFromToken, isAuthenticated, logout } from '@/lib/authenticate';

interface ProfileUser {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      const tokenUser = getUserFromToken();
      if (tokenUser && typeof tokenUser.name === 'string' && typeof tokenUser.email === 'string') {
        setUser({
          name: tokenUser.name,
          email: tokenUser.email,
        });
      }

      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          logout();
          router.push('/login');
          return;
        }

        setUser({
          name: currentUser.name,
          email: currentUser.email,
        });
      } catch (err) {
        console.error('loadProfile failed', err);
        setError('Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#dbeafe_35%,_#f8fafc_75%)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Account
          </p>
          <h1 className="text-4xl font-bold text-slate-900">Profile</h1>
          <p className="mt-2 text-slate-600">View your account details here.</p>

          {loading ? (
            <div className="mt-8 rounded-3xl bg-slate-50 p-6 text-slate-500">Loading profile...</div>
          ) : error ? (
            <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
              {error}
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-3 flex items-center gap-3 text-slate-500">
                  <UserRound size={18} />
                  <span className="text-sm font-semibold uppercase tracking-[0.15em]">Name</span>
                </div>
                <p className="text-2xl font-semibold text-slate-900">{user?.name ?? 'Unknown user'}</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-3 flex items-center gap-3 text-slate-500">
                  <Mail size={18} />
                  <span className="text-sm font-semibold uppercase tracking-[0.15em]">Email</span>
                </div>
                <p className="text-2xl font-semibold text-slate-900 break-all">
                  {user?.email ?? 'No email available'}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
