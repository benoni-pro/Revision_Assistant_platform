import React, { useEffect, useState } from 'react';
import rubricService, { Rubric } from '../../services/rubricService';
import { Button } from '../ui/Button';

const blankRubric: Rubric = {
  title: '',
  genre: 'argumentative',
  subject: '',
  standards: [],
  criteria: [{ name: 'Thesis', description: 'Clear central claim', levels: [
    { label: 'Beginning', description: 'Unclear', score: 1 },
    { label: 'Developing', description: 'Some clarity', score: 2 },
    { label: 'Proficient', description: 'Clear', score: 3 },
    { label: 'Advanced', description: 'Insightful', score: 4 },
  ] }]
};

export const RubricsPage: React.FC = () => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [form, setForm] = useState<Rubric>(blankRubric);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setRubrics(await rubricService.list());
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await rubricService.create(form);
      setForm(blankRubric);
      await load();
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rubrics</h1>
      <div className="card p-6">
        <h3 className="font-medium mb-2">Create Rubric</h3>
        <form onSubmit={submit} className="grid md:grid-cols-4 gap-3">
          <input className="form-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="form-select" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value as any })}>
            <option value="argumentative">Argumentative</option>
            <option value="narrative">Narrative</option>
            <option value="informative">Informative</option>
            <option value="other">Other</option>
          </select>
          <input className="form-input" placeholder="Subject (optional)" value={(form.subject || '')} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Button type="submit" loading={loading}>Save</Button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rubrics.map((r) => (
          <div key={r._id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="text-sm text-gray-600">{r.genre} {r.subject ? `• ${r.subject}` : ''}</div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-700">{r.criteria.length} criteria</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RubricsPage;

