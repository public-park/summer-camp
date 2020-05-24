export interface ExceptionResponse {
  name: string;
  url: string;
  description?: string | undefined;
}

export abstract class ApplicationException extends Error {
  name: string;
  status: number;
  description: string | undefined;

  constructor(name: string, status: number, description?: string) {
    super();

    this.name = name
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      .replace(/\_exception/, '')
      .substr(1);
    this.status = status;
    this.description = description;
  }

  toResponse() {
    const payload: ExceptionResponse = {
      name: this.name,
      url: 'http://not-implemented.yet',
    };

    if (this.description) {
      payload.description = this.description;
    }

    return payload;
  }
}
