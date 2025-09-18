import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import StudyGroupService, { StudyGroupListItem, CreateStudyGroupDto } from '../../services/studyGroupService';

export const StudyGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<StudyGroupListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [form, setForm] = useState<CreateStudyGroupDto>({ name: '', subject: '', level: 'beginner' });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const data = await StudyGroupService.list();
        setGroups(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const newGroup = await StudyGroupService.create(form);
      setGroups((prev) => [newGroup as any, ...prev]);
      setShowForm(false);
      setForm({ name: '', subject: '', level: 'beginner' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create group');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Study Groups</h1>
        <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm((v) => !v)}>
          New Group
        </Button>
      </div>

      {showForm && (
        <div className="card p-6">
          <form onSubmit={createGroup} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Name</label>
              <input className="form-input" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Subject</label>
              <input className="form-input" name="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Level</label>
              <select className="form-select" name="level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as any })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit">Create</Button>
            </div>
            {error && <div className="md:col-span-4 alert alert-danger">{error}</div>}
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center">Loading...</div>
        ) : groups.length === 0 ? (
          <div className="col-span-full text-center text-gray-600">No groups yet.</div>
        ) : (
          groups.map((g) => (
            <motion.div key={g._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{g.name}</h3>
                  <p className="text-sm text-gray-600">{g.subject} • {g.level}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600"><UserGroupIcon className="h-5 w-5" /> {g.memberCount ?? 0}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyGroupsPage;

