/**
 * Camada de dados (repositório) isolada da UI.
 * Hoje persiste em LocalStorage; no futuro basta reimplementar estes métodos
 * apontando para uma API sem alterar hooks/componentes.
 */

export interface Entity {
  id: string;
}

export interface Repository<T extends Entity> {
  list(): Promise<T[]>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, patch: Partial<Omit<T, "id">>): Promise<T | undefined>;
  remove(id: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}

export const newId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const canStore = () => typeof window !== "undefined" && !!window.localStorage;

export function createLocalRepository<T extends Entity>(
  key: string,
  seed: () => T[],
): Repository<T> {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  const read = (): T[] => {
    if (!canStore()) return [];
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      const seeded = seed();
      window.localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  };

  const write = (items: T[]) => {
    if (canStore()) window.localStorage.setItem(key, JSON.stringify(items));
    notify();
  };

  return {
    async list() {
      return read();
    },
    async create(data) {
      const item = { ...(data as object), id: newId() } as T;
      write([item, ...read()]);
      return item;
    },
    async update(id, patch) {
      const items = read();
      const next = items.map((item) => (item.id === id ? { ...item, ...patch } : item));
      write(next);
      return next.find((item) => item.id === id);
    },
    async remove(id) {
      write(read().filter((item) => item.id !== id));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
