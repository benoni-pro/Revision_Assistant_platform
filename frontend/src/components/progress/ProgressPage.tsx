import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProgressService, ProgressData } from '../../services/progressService';

export const ProgressPage: React.FC = () => {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await ProgressService.get();
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Progress</h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-sm text-gray-600">Total Study Time</p>
          <p className="text-2xl font-semibold">{data?.totalStudyTime ?? 0} min</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-2xl font-semibold">{data?.streak?.current ?? 0} days</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-600">Longest Streak</p>
          <p className="text-2xl font-semibold">{data?.streak?.longest ?? 0} days</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressPage;

