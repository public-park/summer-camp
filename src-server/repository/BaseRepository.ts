export interface BaseRepository<T> {
  getById: (id: string) => Promise<T | undefined>;
  getAll: (offset: number, limit: number) => Promise<Array<T>>;
  create: (...args: any) => Promise<T>;
  update: (entity: T) => Promise<T>;
  delete: (entity: T) => Promise<void>;
}
