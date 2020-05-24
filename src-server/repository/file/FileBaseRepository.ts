import { promises as fsWithPromise } from 'fs';
import * as fs from 'fs';
import * as path from 'path';

export abstract class FileBaseRepository<T> {
  file: string;

  constructor(fileName: string) {
    this.file = path.join(process.cwd(), fileName);
  }

  protected load(): Array<any> {
    const data = JSON.parse(fs.readFileSync(this.file, 'utf8'));

    if (!(data instanceof Array)) {
      throw Error('loaded data is not an array');
    }

    return data;
  }

  protected async persist(entities: Array<any>): Promise<void> {
    return fsWithPromise.writeFile(this.file, JSON.stringify(entities, null, 3), 'utf-8');
  }

  async empty(): Promise<void> {
    return fsWithPromise.writeFile(this.file, JSON.stringify([], null, 3), 'utf-8');
  }
}
