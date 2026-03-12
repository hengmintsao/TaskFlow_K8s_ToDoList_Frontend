'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { getToken, isAuthenticated } from '@/lib/authenticate';
import { buildApiUrl, readErrorMessage } from '@/lib/api';
import Sidebar, { SidebarView } from '@/components/Sidebar';

type TodoStatus = 'open' | 'done' | 'archived';
type TodoSortBy = 'created_at' | 'updated_at' | 'due_at' | 'priority' | 'title';
type TodoOrder = 'asc' | 'desc';

interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  position: number;
  due_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string | null;
}

interface TodoFormState {
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
  dueAt: string;
  tags: string;
  status: TodoStatus;
}

const emptyForm: TodoFormState = {
  title: '',
  description: '',
  priority: 3,
  dueAt: '',
  tags: '',
  status: 'open',
};

export default function Home() {
  const router = useRouter();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState<SidebarView>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [minPriority, setMinPriority] = useState('');
  const [dueFrom, setDueFrom] = useState('');
  const [dueTo, setDueTo] = useState('');
  const [sortBy, setSortBy] = useState<TodoSortBy>('created_at');
  const [order, setOrder] = useState<TodoOrder>('desc');
  const [showForm, setShowForm] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [form, setForm] = useState<TodoFormState>(emptyForm);

  const isDueToday = (value: string | null) => {
    if (!value) return false;

    const date = new Date(value);
    const now = new Date();

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };

  const normalizedTagSearch = tagSearch.trim().toLowerCase();

  const todosForSidebar = activeTag
    ? todos.filter((todo) =>
        (todo.tags ?? []).some((tag) => tag.toLowerCase() === activeTag.toLowerCase())
      )
    : todos;

  const sidebarCounts = {
    all: todosForSidebar.length,
    open: todosForSidebar.filter((todo) => todo.status === 'open').length,
    today: todosForSidebar.filter((todo) => isDueToday(todo.due_at)).length,
    done: todosForSidebar.filter((todo) => todo.status === 'done').length,
    archived: todosForSidebar.filter((todo) => todo.status === 'archived').length,
  };

  const availableTags = Array.from(
    new Set(todos.flatMap((todo) => todo.tags ?? []).filter(Boolean))
  )
    .sort((a, b) => a.localeCompare(b))
    .filter((tag) => tag.toLowerCase().includes(normalizedTagSearch));

  const visibleTodos = todos.filter((todo) => {
    const normalizedTodoTags = (todo.tags ?? []).map((tag) => tag.toLowerCase());

    if (activeTag && !normalizedTodoTags.includes(activeTag.toLowerCase())) {
      return false;
    }

    if (normalizedTagSearch && !normalizedTodoTags.some((tag) => tag.includes(normalizedTagSearch))) {
      return false;
    }

    switch (activeView) {
      case 'open':
        return todo.status === 'open';
      case 'today':
        return isDueToday(todo.due_at);
      case 'done':
        return todo.status === 'done';
      case 'archived':
        return todo.status === 'archived';
      default:
        return true;
    }
  });

  const updateForm = <K extends keyof TodoFormState>(key: K, value: TodoFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTodoId(null);
    setShowForm(false);
  };

  const normalizeTags = (value: string) =>
    value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

  const toDateTimeLocal = (value: string | null) => {
    if (!value) return '';

    const date = new Date(value);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  };

  const buildHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set('q', search.trim());
      if (dueFrom) params.set('due_from', new Date(dueFrom).toISOString());
      if (dueTo) params.set('due_to', new Date(dueTo).toISOString());
      if (minPriority) params.set('priority', minPriority);
      params.set('sort_by', sortBy);
      params.set('order', order);

      const query = params.toString();
      const response = await fetch(buildApiUrl(`/api/v1/todos${query ? `?${query}` : ''}`), {
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Unable to load todos.'));
      }

      const data = await response.json();
      setTodos(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error('fetchTodos failed', err);
      setError(err instanceof Error ? err.message : 'Unable to load todos.');
    } finally {
      setLoading(false);
    }
  }, [dueFrom, dueTo, minPriority, order, search, sortBy]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    void fetchTodos();
  }, [fetchTodos, router]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingTodoId(null);
    setShowForm(true);
  };

  const openEditForm = (todo: Todo) => {
    setForm({
      title: todo.title,
      description: todo.description ?? '',
      priority: todo.priority,
      dueAt: toDateTimeLocal(todo.due_at),
      tags: (todo.tags ?? []).join(', '),
      status: todo.status,
    });
    setEditingTodoId(todo.id);
    setShowForm(true);
  };

  const saveTodo = async () => {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        due_at: form.dueAt ? new Date(form.dueAt).toISOString() : null,
        tags: normalizeTags(form.tags),
        ...(editingTodoId ? { status: form.status } : {}),
      };

      const response = await fetch(
        editingTodoId ? buildApiUrl(`/api/v1/todos/${editingTodoId}`) : buildApiUrl('/api/v1/todos'),
        {
          method: editingTodoId ? 'PATCH' : 'POST',
          headers: buildHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            editingTodoId ? 'Unable to update todo.' : 'Unable to create todo.'
          )
        );
      }

      resetForm();
      await fetchTodos();
    } catch (err) {
      console.error('saveTodo failed', err);
      setError(err instanceof Error ? err.message : 'Unable to save todo.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateTodoStatus = async (id: string, status: TodoStatus) => {
    try {
      const response = await fetch(buildApiUrl(`/api/v1/todos/${id}`), {
        method: 'PATCH',
        headers: buildHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Unable to update status.'));
      }

      await fetchTodos();
    } catch (err) {
      console.error('updateTodoStatus failed', err);
      setError(err instanceof Error ? err.message : 'Unable to update status.');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/v1/todos/${id}`), {
        method: 'DELETE',
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Unable to delete todo.'));
      }

      if (editingTodoId === id) {
        resetForm();
      }

      await fetchTodos();
    } catch (err) {
      console.error('deleteTodo failed', err);
      setError(err instanceof Error ? err.message : 'Unable to delete todo.');
    }
  };

  const getPriorityColor = (priority: number) => {
    const colors = {
      1: 'bg-slate-200 text-slate-700',
      2: 'bg-sky-100 text-sky-700',
      3: 'bg-amber-100 text-amber-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-rose-100 text-rose-800',
    };

    return colors[priority as keyof typeof colors];
  };

  const getPriorityLabel = (priority: number) => {
    const labels = {
      1: 'Low',
      2: 'Medium',
      3: 'Normal',
      4: 'High',
      5: 'Urgent',
    };

    return labels[priority as keyof typeof labels];
  };

  const isOverdue = (value: string | null) => {
    if (!value) return false;
    return new Date(value).getTime() < Date.now();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eff6ff,_#dbeafe_35%,_#f8fafc_75%)] text-slate-900">
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar
          activeView={activeView}
          counts={sidebarCounts}
          tags={availableTags}
          activeTag={activeTag}
          tagSearch={tagSearch}
          onViewChange={setActiveView}
          onTagSelect={setActiveTag}
          onTagSearchChange={setTagSearch}
          onCreateTask={openCreateForm}
        />

        <main className="w-full px-4 py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(37,99,235,0.12)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Task dashboard
              </p>
              <h1 className="text-4xl font-bold">Todo List</h1>
              <p className="mt-2 text-slate-600">
                {sidebarCounts.all} total, {sidebarCounts.open} open, {sidebarCounts.done} done,{' '}
                {sidebarCounts.archived} archived
              </p>
            </div>

            <button
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
              <Plus size={18} />
              New Task
            </button>
          </div>
        </section>

        <section className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
              <Search size={16} />
              Search
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title or description"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-500"
            />
          </label>

          <label className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="mb-2 block text-sm font-medium text-slate-600">Tag Search</span>
            <input
              type="text"
              value={tagSearch}
              onChange={(event) => setTagSearch(event.target.value)}
              placeholder="Find tag by keyword"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-500"
            />
          </label>

          <label className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="mb-2 block text-sm font-medium text-slate-600">Minimum Priority</span>
            <select
              value={minPriority}
              onChange={(event) => setMinPriority(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-500"
            >
              <option value="">Any priority</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">Normal</option>
              <option value="4">High</option>
              <option value="5">Urgent</option>
            </select>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-medium text-slate-600">Sort</div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as TodoSortBy)}
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-500"
              >
                <option value="created_at">Created</option>
                <option value="updated_at">Updated</option>
                <option value="due_at">Due date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
              <select
                value={order}
                onChange={(event) => setOrder(event.target.value as TodoOrder)}
                className="rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-500"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-3 md:grid-cols-2">
          <label className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="mb-2 block text-sm font-medium text-slate-600">Due From</span>
            <input
              type="datetime-local"
              value={dueFrom}
              onChange={(event) => setDueFrom(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-500"
            />
          </label>

          <label className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="mb-2 block text-sm font-medium text-slate-600">Due To</span>
            <input
              type="datetime-local"
              value={dueTo}
              onChange={(event) => setDueTo(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-blue-500"
            />
          </label>
        </section>

        <section className="mb-6 flex flex-wrap gap-2 lg:hidden">
          {(['all', 'open', 'today', 'done', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setActiveView(status)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === status
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-slate-600 shadow-sm hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1)} (
              {sidebarCounts[status]})
            </button>
          ))}
        </section>

        {showForm && (
          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingTodoId ? 'Edit Task' : 'Create Task'}
              </h2>
              <button
                onClick={resetForm}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4">
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="Task title"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              />

              <textarea
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                placeholder="Task description"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label>
                  <span className="mb-2 block text-sm font-medium text-slate-600">Priority</span>
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      updateForm('priority', Number(event.target.value) as TodoFormState['priority'])
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Normal</option>
                    <option value={4}>High</option>
                    <option value={5}>Urgent</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-medium text-slate-600">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => updateForm('status', event.target.value as TodoStatus)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    disabled={!editingTodoId}
                  >
                    <option value="open">Open</option>
                    <option value="done">Done</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-medium text-slate-600">Due Date</span>
                  <input
                    type="datetime-local"
                    value={form.dueAt}
                    onChange={(event) => updateForm('dueAt', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-medium text-slate-600">Tags</span>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(event) => updateForm('tags', event.target.value)}
                    placeholder="frontend, release"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveTodo}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editingTodoId ? <Pencil size={18} /> : <Plus size={18} />}
                  {submitting ? 'Saving...' : editingTodoId ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        {error && (
          <section className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </section>
        )}

        {(activeTag || normalizedTagSearch) && (
          <section className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            <span>
              {activeTag ? (
                <>
                  Filtering by tag <strong>#{activeTag}</strong>
                </>
              ) : (
                <>
                  Searching tags with <strong>{tagSearch}</strong>
                </>
              )}
            </span>
            <button
              onClick={() => {
                setActiveTag(null);
                setTagSearch('');
              }}
              className="rounded-full bg-white px-3 py-1 font-semibold text-sky-700 transition hover:bg-sky-100"
            >
              Clear
            </button>
          </section>
        )}

        <section className="space-y-4">
          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
              Loading todos...
            </div>
          ) : visibleTodos.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
              No todos matched this sidebar view.
            </div>
          ) : (
            visibleTodos.map((todo) => (
              <article
                key={todo.id}
                className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${
                  todo.status === 'done' ? 'opacity-80' : ''
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(todo.priority)}`}>
                        {getPriorityLabel(todo.priority)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                        {todo.status}
                      </span>
                      {todo.due_at && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            isOverdue(todo.due_at) && todo.status !== 'done'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Calendar size={12} />
                          {new Date(todo.due_at).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <h2
                      className={`text-xl font-semibold ${
                        todo.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'
                      }`}
                    >
                      {todo.title}
                    </h2>

                    {todo.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">{todo.description}</p>
                    )}

                    {!!todo.tags?.length && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {todo.tags.map((tag) => (
                          <span
                            key={`${todo.id}-${tag}`}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 lg:w-56">
                    <select
                      value={todo.status}
                      onChange={(event) => updateTodoStatus(todo.id, event.target.value as TodoStatus)}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium outline-none transition focus:border-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="done">Done</option>
                      <option value="archived">Archived</option>
                    </select>

                    <button
                      onClick={() => openEditForm(todo)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => updateTodoStatus(todo.id, todo.status === 'done' ? 'open' : 'done')}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200"
                    >
                      <Check size={16} />
                      {todo.status === 'done' ? 'Mark Open' : 'Mark Done'}
                    </button>

                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-200"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
          </div>
        </main>
      </div>
    </div>
  );
}
