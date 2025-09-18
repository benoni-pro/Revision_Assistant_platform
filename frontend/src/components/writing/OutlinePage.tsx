import React, { useState } from 'react';
import { Button } from '../ui/Button';

export const OutlinePage: React.FC = () => {
  const [sections, setSections] = useState<{ heading: string; bullets: string[] }[]>([
    { heading: 'Introduction', bullets: [] }
  ]);

  const addSection = () => setSections((s) => [...s, { heading: 'New Section', bullets: [] }]);
  const addBullet = (i: number) => setSections((s) => s.map((sec, idx) => idx === i ? { ...sec, bullets: [...sec.bullets, ''] } : sec));
  const update = (i: number, field: 'heading' | 'bullet', bi: number, value: string) => {
    setSections((s) => s.map((sec, idx) => {
      if (idx !== i) return sec;
      if (field === 'heading') return { ...sec, heading: value };
      const bullets = [...sec.bullets];
      bullets[bi] = value;
      return { ...sec, bullets };
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Outline Builder</h2>
        <Button onClick={addSection}>Add Section</Button>
      </div>
      <div className="space-y-4">
        {sections.map((sec, i) => (
          <div key={i} className="card p-4">
            <input className="form-input mb-2" value={sec.heading} onChange={(e) => update(i, 'heading', 0, e.target.value)} />
            <div className="space-y-2">
              {sec.bullets.map((b, bi) => (
                <input key={bi} className="form-input" value={b} onChange={(e) => update(i, 'bullet', bi, e.target.value)} placeholder={`Point ${bi + 1}`} />
              ))}
            </div>
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={() => addBullet(i)}>Add Bullet</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutlinePage;

