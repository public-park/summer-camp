import { promises as fsWithPromise } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import { log } from '../../logger';

export abstract class FileBaseRepository<T> {
  file: string;

  constructor(fileName: string) {
    this.file = path.join(process.cwd(), fileName);
  }

  protected load(): Array<unknown> {
    try {
      const data = JSON.parse(fs.readFileSync(this.file, 'utf8'));

      if (!(data instanceof Array)) {
        throw Error('loaded data is not an array');
      }

      return data;
    } catch (error) {
      log.error(error);

      return [];
    }
  }

  protected async persist(entities: Array<object>): Promise<void> {
    return fsWithPromise.writeFile(this.file, JSON.stringify(entities, null, 3), 'utf-8');
  }

  async empty(): Promise<void> {
    return fsWithPromise.writeFile(this.file, JSON.stringify([], null, 3), 'utf-8');
  }
}
