'use client';

import { useState } from 'react';
import { Trash2, Plus, Check, X, Flag, Calendar } from 'lucide-react';

type TodoStatus = 'open' | 'done' | 'archived';

interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  due_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeFilter, setActiveFilter] = useState<TodoStatus>('open');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [showForm, setShowForm] = useState(false);

  const addTodo = () => {
    if (title.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title,
        description: description || null,
        status: 'open',
        priority,
        due_at: dueDate || null,
        tags: tags.split(',').filter(t => t.trim()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTodos([...todos, newTodo]);
      setTitle('');
      setDescription('');
      setPriority(3);
      setDueDate('');
      setTags('');
      setShowForm(false);
    }
  };

  const updateTodoStatus = (id: string, status: TodoStatus) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, status, updated_at: new Date().toISOString() } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => todo.status === activeFilter);
  const stats = {
    open: todos.filter(t => t.status === 'open').length,
    done: todos.filter(t => t.status === 'done').length,
    archived: todos.filter(t => t.status === 'archived').length,
  };

  const getPriorityColor = (priority: number) => {
    const colors = {
      1: 'bg-gray-200 text-gray-800',
      2: 'bg-blue-200 text-blue-800',
      3: 'bg-yellow-200 text-yellow-800',
      4: 'bg-orange-200 text-orange-800',
      5: 'bg-red-200 text-red-800',
    };
    return colors[priority as keyof typeof colors];
  };

  const getPriorityLabel = (priority: number) => {
    const labels = { 1: 'Low', 2: 'Medium', 3: 'Normal', 4: 'High', 5: 'Urgent' };
    return labels[priority as keyof typeof labels];
  };

  const getStatusColor = (status: TodoStatus) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <main className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            TaskFlow
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {stats.open} open • {stats.done} done • {stats.archived} archived
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 border-b border-gray-300 dark:border-gray-600">
          {(['open', 'done', 'archived'] as const).map(status => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`pb-3 px-4 font-semibold transition-colors relative ${
                activeFilter === status
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {activeFilter === status && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>

        {/* Add Todo Form */}
        {!showForm ? (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-3 hover:shadow-xl transition-shadow"
            >
              <Plus size={24} className="text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Add a new task...</span>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={2}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value) as any)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Normal</option>
                    <option value={4}>High</option>
                    <option value={5}>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma separated)..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={addTodo}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={18} />
                  Add Task
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No {activeFilter} tasks yet!
              </p>
            </div>
          ) : (
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-4 ${
                  todo.status === 'done' ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Button */}
                  <button
                    onClick={() => {
                      const nextStatus: Record<TodoStatus, TodoStatus> = {
                        open: 'done',
                        done: 'archived',
                        archived: 'open',
                      };
                      updateTodoStatus(todo.id, nextStatus[todo.status]);
                    }}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.status === 'done'
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                    }`}
                  >
                    {todo.status === 'done' && <Check size={16} className="text-white" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <h3
                      className={`font-semibold mb-1 ${
                        todo.status === 'done'
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {todo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Priority Badge */}
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>
                        {getPriorityLabel(todo.priority)}
                      </span>

                      {/* Due Date */}
                      {todo.due_at && (
                        <span
                          className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                            isOverdue(todo.due_at)
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}
                        >
                          <Calendar size={12} />
                          {new Date(todo.due_at).toLocaleDateString()}
                        </span>
                      )}

                      {/* Tags */}
                      {todo.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
  //           Deploy Now
  //         </a>
  //         <a
  //           className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
  //           href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           Documentation
  //         </a>
  //       </div>
  //     </main>
  //   </div>
  // );
}
