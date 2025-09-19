import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, EnvelopeIcon, LockClosedIcon, AcademicCapIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RegisterData } from '../../types';
import AuthService from '../../services/authService';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    academicLevel: 'undergraduate',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const passwordValidation = useMemo(() => AuthService.validatePasswordStrength(formData.password || ''), [formData.password]);
  const passwordChecklist = [
    { label: 'At least 8 characters', valid: (formData.password || '').length >= 8 },
    { label: 'Lowercase letter', valid: /[a-z]/.test(formData.password || '') },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(formData.password || '') },
    { label: 'Number', valid: /\d/.test(formData.password || '') },
    { label: 'Special character (@$!%*?&)', valid: /[@$!%*?&]/.test(formData.password || '') },
  ];

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName || formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName || formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const { isValid, errors: pwdErrors } = AuthService.validatePasswordStrength(formData.password);
      if (!isValid) {
        newErrors.password = pwdErrors[0] || 'Password does not meet requirements';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    const emailOk = /\S+@\S+\.\S+/.test(formData.email);
    const pwd = formData.password;
    const pwdOk = !!pwd && AuthService.validatePasswordStrength(pwd).isValid;
    const namesOk = formData.firstName.trim().length >= 2 && formData.lastName.trim().length >= 2;
    const confirmOk = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
    return emailOk && pwdOk && namesOk && confirmOk;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the highlighted errors');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        academicLevel: formData.academicLevel,
      } as RegisterData;

      await register(payload);
      toast.success('Account created successfully');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gradient">Create your account</h1>
          <p className="text-gray-600 mt-2">Join Revision Assistant to supercharge your learning</p>
          <div className="mt-4 inline-flex items-center rounded-lg border border-gray-200 overflow-hidden">
            <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Sign in</Link>
            <span className="px-4 py-2 text-sm bg-primary-600 text-white">Sign up</span>
          </div>
        </div>

        {/* Backend error message */}
        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" aria-live="polite">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Jane"
              leftIcon={<UserIcon />}
              error={errors.firstName}
              required
            />
            <Input
              label="Last name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              leftIcon={<UserIcon />}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            leftIcon={<EnvelopeIcon />}
            error={errors.email}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              leftIcon={<LockClosedIcon />}
              error={errors.password}
              required
            />
            <Input
              label="Confirm password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              leftIcon={<LockClosedIcon />}
              error={errors.confirmPassword}
              required
            />
          </div>

          {/* Live password checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {passwordChecklist.map((rule) => (
              <div key={rule.label} className={`flex items-center ${rule.valid ? 'text-green-600' : 'text-gray-500'}`}>
                {rule.valid ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : <XCircleIcon className="h-4 w-4 mr-1" />}
                <span>{rule.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="form-label">Academic level</label>
              <select
                name="academicLevel"
                value={formData.academicLevel}
                onChange={handleChange}
                className="form-select"
              >
                <option value="high_school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="professional">Professional</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <Button type="submit" loading={isLoading} className="w-full" leftIcon={<AcademicCapIcon className="h-4 w-4" />} disabled={!isFormValid() || isLoading}>
            Create account
          </Button>

          <p className="text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;

