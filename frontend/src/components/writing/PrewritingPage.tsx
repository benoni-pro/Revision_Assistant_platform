import React, { useState } from 'react';
import aiService from '../../services/aiService';
import rubricService, { Rubric } from '../../services/rubricService';
import { Button } from '../ui/Button';

export const PrewritingPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState<any>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateOutline = async () => {
    setLoading(true);
    try {
      const data = await aiService.outline(topic);
      setOutline(data);
    } finally { setLoading(false); }
  };

  const loadPrompts = async (genre: string) => {
    const data = await aiService.prompts(genre);
    setPrompts(data.prompts || []);
    setRubrics(await rubricService.list(genre));
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-3">Prewriting Tools</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">Topic</label>
            <input className="form-input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter your topic" />
          </div>
          <div className="flex items-end">
            <Button onClick={generateOutline} loading={loading}>Generate Outline</Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-medium mb-2">Genre-Specific Prompts</h3>
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" onClick={() => loadPrompts('argumentative')}>Argumentative</Button>
            <Button variant="outline" size="sm" onClick={() => loadPrompts('narrative')}>Narrative</Button>
            <Button variant="outline" size="sm" onClick={() => loadPrompts('informative')}>Informative</Button>
          </div>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {prompts.map((p, i) => (<li key={i}>{p}</li>))}
          </ul>
          <div className="mt-3">
            <label className="form-label">Select Rubric</label>
            <select className="form-select" value={selectedRubricId} onChange={(e) => setSelectedRubricId(e.target.value)}>
              <option value="">None</option>
              {rubrics.map((r) => (<option key={r._id} value={r._id}>{r.title}</option>))}
            </select>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-medium mb-2">Outline</h3>
          {!outline ? (
            <p className="text-sm text-gray-600">No outline yet. Enter a topic and click Generate.</p>
          ) : (
            <div>
              <p className="font-medium mb-1">Thesis: {outline.thesis}</p>
              <div className="space-y-2">
                {(outline.sections || []).map((s: any, i: number) => (
                  <div key={i}>
                    <div className="text-sm font-semibold">{s.heading}</div>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {(s.bullets || []).map((b: string, bi: number) => (<li key={bi}>{b}</li>))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrewritingPage;

