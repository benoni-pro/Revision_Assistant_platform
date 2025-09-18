import React, { useState } from 'react';
import aiService from '../../services/aiService';
import { Button } from '../ui/Button';

export const DraftPage: React.FC = () => {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getFeedback = async () => {
    setLoading(true);
    try {
      const data = await aiService.feedback(text);
      setFeedback(data);
    } finally { setLoading(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-3">Draft</h2>
        <textarea className="form-textarea h-80" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your draft here..." />
        <div className="mt-3 flex justify-end">
          <Button onClick={getFeedback} loading={loading}>Get Instant Feedback</Button>
        </div>
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-3">Feedback</h2>
        {!feedback ? (
          <p className="text-sm text-gray-600">No feedback yet. Click the button to analyze your draft.</p>
        ) : (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Sentence-level</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {(feedback.sentenceFeedback || []).map((f: string, i: number) => (<li key={i}>{f}</li>))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Holistic</h4>
              <p className="text-sm text-gray-700">{feedback.holisticFeedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftPage;

