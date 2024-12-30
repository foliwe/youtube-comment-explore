import { useState } from 'react';

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  commentLength: {
    min: number;
    max: number;
  };
  minLikes: number;
  hasLinks: boolean | null;
  hasHashtags: boolean | null;
  hasMentions: boolean | null;
  isVerified: boolean | null;
  searchText: string;
  tags: string[];
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

export default function AdvancedFilters({ onFilterChange, onReset }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: '',
      end: '',
    },
    commentLength: {
      min: 0,
      max: 1000,
    },
    minLikes: 0,
    hasLinks: null,
    hasHashtags: null,
    hasMentions: null,
    isVerified: null,
    searchText: '',
    tags: [],
  });

  const [newTag, setNewTag] = useState('');

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleNestedFilterChange = (parent: keyof FilterOptions, key: string, value: any) => {
    const updatedFilters = {
      ...filters,
      [parent]: { ...filters[parent], [key]: value },
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const addTag = () => {
    if (newTag && !filters.tags.includes(newTag)) {
      const updatedTags = [...filters.tags, newTag];
      handleFilterChange('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = filters.tags.filter(tag => tag !== tagToRemove);
    handleFilterChange('tags', updatedTags);
  };

  const handleReset = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      commentLength: { min: 0, max: 1000 },
      minLikes: 0,
      hasLinks: null,
      hasHashtags: null,
      hasMentions: null,
      isVerified: null,
      searchText: '',
      tags: [],
    });
    onReset();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg flex items-center justify-between"
      >
        <span>Advanced Filters</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 border-t">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleNestedFilterChange('dateRange', 'start', e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 text-sm"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleNestedFilterChange('dateRange', 'end', e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 text-sm"
              />
            </div>
          </div>

          {/* Comment Length */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Comment Length</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.commentLength.min}
                onChange={(e) => handleNestedFilterChange('commentLength', 'min', parseInt(e.target.value))}
                placeholder="Min length"
                className="block w-full rounded-md border border-gray-300 p-2 text-sm"
              />
              <input
                type="number"
                value={filters.commentLength.max}
                onChange={(e) => handleNestedFilterChange('commentLength', 'max', parseInt(e.target.value))}
                placeholder="Max length"
                className="block w-full rounded-md border border-gray-300 p-2 text-sm"
              />
            </div>
          </div>

          {/* Minimum Likes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Minimum Likes</label>
            <input
              type="number"
              value={filters.minLikes}
              onChange={(e) => handleFilterChange('minLikes', parseInt(e.target.value))}
              className="block w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>

          {/* Boolean Filters */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'hasLinks', label: 'Has Links' },
              { key: 'hasHashtags', label: 'Has Hashtags' },
              { key: 'hasMentions', label: 'Has Mentions' },
              { key: 'isVerified', label: 'Verified User' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <select
                  value={filters[key as keyof FilterOptions]?.toString() ?? 'null'}
                  onChange={(e) => {
                    const value = e.target.value === 'null' ? null : e.target.value === 'true';
                    handleFilterChange(key as keyof FilterOptions, value);
                  }}
                  className="block w-full rounded-md border border-gray-300 p-2 text-sm"
                >
                  <option value="null">Any {label}</option>
                  <option value="true">With {label}</option>
                  <option value="false">Without {label}</option>
                </select>
              </div>
            ))}
          </div>

          {/* Text Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Search in Comments</label>
            <input
              type="text"
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              placeholder="Search text..."
              className="block w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="block flex-1 rounded-md border border-gray-300 p-2 text-sm"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
