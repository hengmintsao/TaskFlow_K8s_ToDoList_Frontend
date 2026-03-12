'use client';

import { Archive, Calendar, CheckCircle2, ListTodo, Plus, Tag } from 'lucide-react';

export type SidebarView = 'all' | 'open' | 'today' | 'done' | 'archived';

interface SidebarProps {
  activeView: SidebarView;
  counts: Record<SidebarView, number>;
  tags: string[];
  activeTag: string | null;
  tagSearch: string;
  onViewChange: (view: SidebarView) => void;
  onTagSelect: (tag: string | null) => void;
  onTagSearchChange: (value: string) => void;
  onCreateTask: () => void;
}

const menuItems: Array<{
  id: SidebarView;
  label: string;
  icon: typeof ListTodo;
}> = [
  { id: 'all', label: 'All Tasks', icon: ListTodo },
  { id: 'open', label: 'Open', icon: ListTodo },
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'done', label: 'Done', icon: CheckCircle2 },
  { id: 'archived', label: 'Archived', icon: Archive },
];

export default function Sidebar({
  activeView,
  counts,
  tags,
  activeTag,
  tagSearch,
  onViewChange,
  onTagSelect,
  onTagSearchChange,
  onCreateTask,
}: SidebarProps) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-[#0f172a] text-slate-100 lg:flex lg:flex-col">
      <div className="flex-1 px-5 py-6">
        <button
          onClick={onCreateTask}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-400"
        >
          <Plus size={18} />
          Create Task
        </button>

        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Menu
          </p>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {counts[item.id]}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tags</p>
            {(activeTag || tagSearch) && (
              <button
                onClick={() => {
                  onTagSelect(null);
                  onTagSearchChange('');
                }}
                className="text-xs font-medium text-slate-400 transition hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <input
            type="text"
            value={tagSearch}
            onChange={(event) => onTagSearchChange(event.target.value)}
            placeholder="Search tags"
            className="mb-3 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          />

          <div className="space-y-2">
            {tags.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
                {tagSearch
                  ? 'No tags matched your search.'
                  : 'Create a task with tags and it will appear here.'}
              </div>
            ) : (
              tags.map((tag) => {
                const isActive = activeTag === tag;

                return (
                  <button
                    key={tag}
                    onClick={() => onTagSelect(isActive ? null : tag)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Tag size={16} />
                    <span className="font-medium">#{tag}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
