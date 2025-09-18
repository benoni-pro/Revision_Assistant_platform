import React, { useEffect, useState } from 'react';
import aiService from '../../services/aiService';

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try { setData(await aiService.teacherOverview()); } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    })();
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Teacher Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><div className="text-sm text-gray-600">Classes</div><div className="text-xl font-semibold">{data.classes}</div></div>
        <div className="card p-4"><div className="text-sm text-gray-600">Students</div><div className="text-xl font-semibold">{data.students}</div></div>
        <div className="card p-4"><div className="text-sm text-gray-600">Avg Writing Score</div><div className="text-xl font-semibold">{data.avgWritingScore}%</div></div>
        <div className="card p-4"><div className="text-sm text-gray-600">At Risk</div><div className="text-xl font-semibold">{data.atRisk}</div></div>
      </div>
      <div className="card p-6">
        <h3 className="font-medium mb-2">Common Issues</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          {(data.commonIssues || []).map((x: string, i: number) => (<li key={i}>{x}</li>))}
        </ul>
      </div>
    </div>
  );
};

export default TeacherDashboard;

