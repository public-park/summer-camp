export interface PhoneError extends Error {
  code: number;
  message: string;
}
