import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@sabo/shared-auth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const { signIn } = useAuth();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
   await signIn(email, password);
  } catch (err) {
   setError(err instanceof Error ? err.message : 'Login failed');
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
   <div className="max-w-md w-full">
    <div className="bg-neutral-800 p-8 rounded-xl border border-gray-700 shadow-2xl">
     {/* Header */}
     <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-var(--color-background) mb-2">Welcome Back</h1>
      <p className="text-gray-400">Sign in to your SABO Arena account</p>
     </div>

     {/* Error Message */}
     {error && (
      <div className="bg-error-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-6">
       {error}
      </div>
     )}

     {/* Login Form */}
     <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
       <label htmlFor="email" className="block text-body-small-medium text-gray-300 mb-2">
        Email Address
       </label>
       <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
         type="email"
         id="email"
         required
         value={email}
         onChange={(e) => setEmail(e.target.value)}
         className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-var(--color-background) placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         placeholder="Enter your email"
        />
       </div>
      </div>

      {/* Password Field */}
      <div>
       <label htmlFor="password" className="block text-body-small-medium text-gray-300 mb-2">
        Password
       </label>
       <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
         type={showPassword ? 'text' : 'password'}
         id="password"
         required
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         className="w-full pl-12 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-var(--color-background) placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         placeholder="Enter your password"
        />
        <Button
         type="button"
         onClick={() => setShowPassword(!showPassword)}
         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
        >
         {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
       </div>
      </div>

      {/* Submit Button */}
      <Button
       type="submit"
       disabled={loading}
       className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-var(--color-background) py-3 rounded-lg font-semibold transition-colors"
      >
       {loading ? 'Signing in...' : 'Sign In'}
      </Button>
     </form>

     {/* Links */}
     <div className="mt-6 text-center space-y-2">
      <Link
       to="/auth/forgot-password"
       className="text-blue-400 hover:text-blue-300 text-body-small"
      >
       Forgot your password?
      </Link>
      <div className="text-gray-400 text-body-small">
       Don't have an account?{' '}
       <Link to="/auth/register" className="text-blue-400 hover:text-blue-300">
        Sign up
       </Link>
      </div>
     </div>
    </div>

    {/* Back to Home */}
    <div className="text-center mt-6">
     <Link to="/" className="text-gray-400 hover:text-gray-300 text-body-small">
      ← Back to Home
     </Link>
    </div>
   </div>
  </div>
 );
};

export default LoginPage;
