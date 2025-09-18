import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

// Placeholder minimal flow for taking a quiz by id (UI scaffold)
export const TakeQuizPage: React.FC = () => {
  const { id } = useParams();
  const [started] = useState(true);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quiz {id}</h1>
      {!started ? (
        <div className="card p-6">Ready to start.</div>
      ) : (
        <div className="card p-6">Quiz player coming soon.</div>
      )}
    </div>
  );
};

export default TakeQuizPage;

