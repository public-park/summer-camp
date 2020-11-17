export interface BaseRepository<T> {
  getById: (id: string) => Promise<T | undefined>;
  save: (entity: T) => Promise<T>;
  remove: (entity: T) => Promise<void>;
}
