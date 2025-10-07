export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: string | null; // ISO yyyy-mm-dd
}

export interface TaskQuery {
  status?: TaskStatus | 'all';
  sort?: 'asc' | 'desc';
  sortField?: string;
  page?: number;
  limit?: number;
  take?: number;
  search?: string;
  title?: string;
  dueDate?: string;
}

export function useTasksApi() {
  const pending = ref(false);
  const backendDown = ref(false);

  const {
    public: { apiBase },
  } = useRuntimeConfig();
  const BASE = `${apiBase}/tasks`;

  let ctrl: AbortController | null = null;
  let lastKey = '';

  function stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map(stableStringify).join(',')}]`;
    }

    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();

    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
  }

  function makeKey(url: string, body?: unknown): string {
    return JSON.stringify([url, stableStringify(body)] as const);
  }

  async function list(params: TaskQuery = {}): Promise<{ tasks: Task[]; total: number }> {
    const uiPage = params.page ?? 0;
    const perPage = (params.limit ?? params.take ?? 10) | 0;

    const query: Record<string, string | number> = {
      page: uiPage + 1,
      limit: perPage,
      take: perPage,
    };

    if (params.status && params.status !== 'all') {
      query.status = params.status;
    }

    if (params.sort) {
      query.sort = params.sort;
    }

    if (params.sortField) {
      query.sortField = params.sortField;
    }

    if (params.page) {
      query.page = params.page;
    }

    if (params.limit) {
      query.limit = params.limit;
    }

    if (params.search) {
      query.search = params.search;
    }

    if (params.title) {
      query.title = params.title;
    }

    if (params.dueDate) {
      query.dueDate = params.dueDate;
    }

    const url = BASE;
    const key = makeKey(url, query);

    if (pending.value && key === lastKey) {
      // If the same request is already pending, just return an empty result
      // to prevent duplicate requests
      return { tasks: [], total: 0 };
    }

    if (ctrl) {
      ctrl.abort();
    }

    ctrl = new AbortController();

    lastKey = key;
    pending.value = true;

    try {
      return $fetch<{ tasks: Task[]; total: number }>(url, {
        query,
        signal: ctrl.signal,
      });
    } catch {
      backendDown.value = true;

      return { tasks: [], total: 0 };
    } finally {
      pending.value = false;
      ctrl = null;
    }
  }

  async function create(payload: Omit<Task, 'id'>): Promise<Task> {
    return $fetch<Task>(BASE, { method: 'POST', body: payload });
  }

  async function update(id: number, payload: Partial<Omit<Task, 'id'>>): Promise<Task> {
    return $fetch<Task>(`${BASE}/${id}`, { method: 'PUT', body: payload });
  }

  async function remove(id: number): Promise<void> {
    return $fetch<void>(`${BASE}/${id}`, { method: 'DELETE' });
  }

  return { pending, backendDown, list, create, update, remove };
}
