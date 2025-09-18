import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('Verifying your email...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }
    (async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
      } catch (e) {
        setStatus('error');
        setMessage(e instanceof Error ? e.message : 'Verification failed.');
      }
    })();
  }, [location.search, verifyEmail, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        {status === 'success' ? (
          <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto" />
        ) : status === 'error' ? (
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto" />
        ) : (
          <div className="spinner spinner-lg mx-auto" />
        )}
        <h1 className="text-2xl font-semibold mt-4">Email Verification</h1>
        <p className="text-gray-600 mt-2">{message}</p>

        <div className="mt-6">
          <Link to="/login">
            <Button variant="outline">Go to Sign in</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;

