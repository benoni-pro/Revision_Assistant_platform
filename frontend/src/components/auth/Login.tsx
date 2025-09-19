import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoginData } from '../../types';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => /\S+@\S+\.\S+/.test(formData.email) && formData.password.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'rememberMe') {
      if (checked && formData.email) localStorage.setItem('savedEmail', formData.email);
      else localStorage.removeItem('savedEmail');
    }
    if (name === 'email' && formData.rememberMe) {
      if (value) localStorage.setItem('savedEmail', value);
      else localStorage.removeItem('savedEmail');
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (authError) clearError();
  };

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const caps = (e.getModifierState && e.getModifierState('CapsLock')) || false;
    setIsCapsLockOn(caps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fix the highlighted errors'); return; }
    setIsLoading(true);
    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Login failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h1 className="text-4xl font-bold text-gradient mb-2">Revision Assistant</h1>
            <p className="text-gray-600">AI-Powered Learning Platform</p>
          </motion.div>
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-6 text-2xl font-semibold text-gray-900">Welcome back</motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-gray-600 mt-2">Sign in to your account to continue learning</motion.p>
        </div>

        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} onSubmit={handleSubmit} className="space-y-6">
          {authError && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            </motion.div>
          )}

          <Input label="Email address" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="Enter your email" leftIcon={<EnvelopeIcon />} required />

          <div>
            <Input label="Password" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} onKeyUp={handleKeyEvent} onKeyDown={handleKeyEvent} error={errors.password} placeholder="Enter your password" leftIcon={<LockClosedIcon />} rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none">{showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>} required />
            {isCapsLockOn && (<p className="mt-1 text-xs text-orange-600">Caps Lock is on</p>)}
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center">
              <input id="rememberMe" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <span className="ml-2 block text-sm text-gray-700">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500 hover:underline">Forgot password?</Link>
          </div>

          <Button type="submit" loading={isLoading} className="w-full" size="lg" disabled={!isFormValid() || isLoading}>Sign in</Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Don't have an account?</span></div>
          </div>

          <Link to="/register" className="w-full flex justify-center py-3 px-4 border border-primary-300 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors duration-200">Create new account</Link>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;
