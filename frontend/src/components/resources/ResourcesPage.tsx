import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  LinkIcon,
  AcademicCapIcon,
  StarIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import ResourceService, { ResourceListItem, CreateResourceDto } from '../../services/resourceService';

const resourceTypes = [
  { value: '', label: 'All Types' },
  { value: 'book', label: 'Books' },
  { value: 'video', label: 'Videos' },
  { value: 'article', label: 'Articles' },
  { value: 'document', label: 'Documents' },
  { value: 'link', label: 'Links' },
  { value: 'course', label: 'Courses' },
  { value: 'tutorial', label: 'Tutorials' }
];

const levels = ['beginner', 'intermediate', 'advanced', 'all'];

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    level: '',
    subject: '',
    sort: '-createdAt'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResources();
  }, [searchTerm, filters, page]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await ResourceService.list({
        search: searchTerm,
        ...filters,
        page,
        limit: 12
      });
      setResources(data.docs);
      setTotalPages(data.pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const ResourceCard: React.FC<{ resource: ResourceListItem }> = ({ resource }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
    >
      {resource.thumbnailUrl ? (
        <div className="h-48 overflow-hidden bg-gray-100">
          <img src={resource.thumbnailUrl} alt={resource.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <BookOpenIcon className="h-16 w-16 text-gray-400" />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{resource.title}</h3>
          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
            {resource.type}
          </span>
        </div>
        
        {resource.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{resource.description}</p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="font-medium">{resource.subject}</span>
          <span className="capitalize">{resource.level}</span>
        </div>
        
        {resource.author && <p className="text-sm text-gray-500 mb-3">By {resource.author}</p>}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
              <span>{resource.averageRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{resource.views}</span>
            </div>
            <div className="flex items-center">
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              <span>{resource.downloads}</span>
            </div>
          </div>
          <Button size="sm">View</Button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600 mt-1">Browse study materials and learning resources</p>
        </div>
        <Button leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
          Add Resource
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline" leftIcon={<FunnelIcon className="h-4 w-4" />} onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>
        </form>

        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {resourceTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <select value={filters.level} onChange={(e) => handleFilterChange('level', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="">All Levels</option>
                {levels.map(level => <option key={level} value={level} className="capitalize">{level}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input type="text" value={filters.subject} onChange={(e) => handleFilterChange('subject', e.target.value)} placeholder="e.g., Mathematics" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="-averageRating">Highest Rated</option>
                <option value="-views">Most Viewed</option>
                <option value="-downloads">Most Downloaded</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-lg h-96 animate-pulse" />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => <ResourceCard key={resource._id} resource={resource} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResourcesPage;
