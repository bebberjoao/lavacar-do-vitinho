import { useCallback, useEffect, useState } from "react";
import type { Entity, Repository } from "@/services/localCollection";

export function useRepository<T extends Entity>(repo: Repository<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await repo.list();
    setItems(data);
    setLoading(false);
  }, [repo]);

  useEffect(() => {
    void refresh();
    return repo.subscribe(() => void refresh());
  }, [repo, refresh]);

  const create = useCallback(
    async (data: Omit<T, "id">) => {
      const item = await repo.create(data);
      return item;
    },
    [repo],
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<T, "id">>) => repo.update(id, patch),
    [repo],
  );

  const remove = useCallback((id: string) => repo.remove(id), [repo]);

  return { items, loading, create, update, remove, refresh };
}
