'use client';

import { ListTodo, Tag, Calendar, Archive, Settings, Plus } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function Sidebar({ activeView = 'all', onViewChange }: SidebarProps) {
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const menuItems = [
    { id: 'all', label: 'All Tasks', icon: ListTodo },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'archived', label: 'Archived', icon: Archive },
  ];

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      // TODO: Connect to backend
      setNewCategory('');
      setShowCreateCategory(false);
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto hidden md:flex flex-col">
      {/* Main Menu */}
      <div className="flex-1 py-6 px-4">
        <h2 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
          Menu
        </h2>
        <nav className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange?.(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Categories Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Categories
          </h2>
          <button
            onClick={() => setShowCreateCategory(!showCreateCategory)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Add Category Form */}
        {showCreateCategory && (
          <div className="mb-4 space-y-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category name..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button
              onClick={handleAddCategory}
              className="w-full px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-1">
          {['Work', 'Personal', 'Shopping'].map(category => (
            <button
              key={category}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 px-4">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <Settings size={18} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
