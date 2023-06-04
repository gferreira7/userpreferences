import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService {
  private cache: { [key: string]: any } = {};

  get<T>(key: string): T | undefined {
    const value = this.cache[key];
    if (value !== undefined) {
      return value as T;
    }
    return undefined;
  }

  set<T>(key: string, value: T): void {
    this.cache[key] = value;
  }

  has(key: string): boolean {
    return this.cache.hasOwnProperty(key);
  }

  delete(key: string): void {
    delete this.cache[key];
  }
}
