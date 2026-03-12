'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, loginUser } from '@/lib/authenticate';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await registerUser(name, email, password);
      // auto-login after register
      await loginUser(email, password);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';

      if (message.includes('Email already registered')) {
        setError('This email is already registered');
      } else if (message.includes('Registration failed')) {
        setError('Registration failed. Please check your input and try again.');
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Register</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <label className="block mb-2 text-gray-700 dark:text-gray-300">
          Name
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <label className="block mb-2 text-gray-700 dark:text-gray-300">
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <label className="block mb-4 text-gray-700 dark:text-gray-300">
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full mt-1 px-3 py-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Register
        </button>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Already have an account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </form>
    </div>
  );
}
