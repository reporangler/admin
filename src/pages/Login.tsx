import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';
import { LogoMark } from '../components/Brand';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1A1A1A] px-4">
      {/* Brand glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(600px circle at 20% 0%, rgba(255,107,53,0.12), transparent 55%), radial-gradient(500px circle at 85% 100%, rgba(0,212,170,0.10), transparent 55%)',
        }}
      />

      <div className="rr-card relative w-full max-w-sm p-8 shadow-2xl">
        <div className="mb-7 flex flex-col items-center text-center">
          <LogoMark size={52} />
          <h1 className="mt-4 font-mono text-2xl font-bold tracking-tight text-white">
            RepoRangler
          </h1>
          <p className="mt-1 text-sm text-[#a0a0a0]">Package Registry Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="rr-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="rr-input"
            />
          </div>

          <div>
            <label className="rr-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rr-input"
            />
          </div>

          {error && <div className="rr-alert-error">{error}</div>}

          <button type="submit" disabled={loading} className="rr-btn rr-btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
