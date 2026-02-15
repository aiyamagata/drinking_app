import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'signin' | 'signup';

export default function Login() {
  const { signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithPassword(email, password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          {mode === 'signin' ? 'ログイン' : '新規登録'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="6文字以上"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold hover:from-blue-600 hover:to-pink-600 disabled:opacity-50 transition-all"
          >
            {submitting ? '処理中...' : mode === 'signin' ? 'ログイン' : '登録'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setMessage(null);
          }}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          {mode === 'signin' ? '新規登録はこちら' : 'ログインはこちら'}
        </button>
      </div>
    </div>
  );
}
