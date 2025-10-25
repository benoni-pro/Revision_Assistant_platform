import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, UserGroupIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import StudyGroupService, { StudyGroupListItem, CreateStudyGroupDto } from '../../services/studyGroupService';

export const StudyGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<StudyGroupListItem[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<StudyGroupListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [form, setForm] = useState<CreateStudyGroupDto>({ name: '', subject: '', level: 'beginner' });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchTerm, levelFilter, groups]);

  const loadGroups = async () => {
    try {
      const data = await StudyGroupService.list();
      setGroups(data);
      setFilteredGroups(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let filtered = groups;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        g => g.name.toLowerCase().includes(term) || g.subject.toLowerCase().includes(term)
      );
    }

    if (levelFilter) {
      filtered = filtered.filter(g => g.level === levelFilter);
    }

    setFilteredGroups(filtered);
  };

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600 mt-1">Connect and learn with your peers</p>
        </div>
        <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowForm((v) => !v)}>
          New Group
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Create New Study Group</h3>
          <form onSubmit={createGroup} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
                name="name" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
                name="subject" 
                value={form.subject} 
                onChange={(e) => setForm({ ...form, subject: e.target.value })} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
                name="level" 
                value={form.level} 
                onChange={(e) => setForm({ ...form, level: e.target.value as any })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Create</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
            {error && <div className="md:col-span-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">{error}</div>}
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups found</h3>
            <p className="text-gray-600">{searchTerm || levelFilter ? 'Try adjusting your filters' : 'Create your first study group!'}</p>
          </div>
        ) : (
          filteredGroups.map((g) => (
            <motion.div 
              key={g._id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{g.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{g.subject}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <UserGroupIcon className="h-5 w-5 mr-1" /> 
                    <span className="text-sm">{g.memberCount ?? 0} members</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                    {g.level}
                  </span>
                </div>
                <Button size="sm">Join</Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyGroupsPage;

