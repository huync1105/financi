import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  type HttpContext,
  type HttpResponse,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';

export interface HttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean | string[]>;
  context?: HttpContext;
  // observe?: any;
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
}

/**
 * Base HTTP service exposing get, post, put, delete for other services to extend.
 * Subclasses should set or pass a base URL and optionally override request options.
 */
@Injectable({ providedIn: 'root' })
export abstract class BaseHttpService {
  protected readonly http = inject(HttpClient);

  /** Base URL for all requests (e.g. 'https://api.example.com' or '/api'). Subclasses set this. */
  private readonly baseUrl: string = environment.baseUrl;

  get<T>(path: string, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.get<T>(url, options as object) as Observable<T>;
  }

  post<T>(path: string, body?: unknown, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.post<T>(url, body ?? null, options as object) as Observable<T>;
  }

  put<T>(path: string, body?: unknown, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.put<T>(url, body ?? null, options as object) as Observable<T>;
  }

  delete<T>(path: string, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(path);
    return this.http.delete<T>(url, options as object) as Observable<T>;
  }

  /** Override to customize URL building (e.g. add trailing slash or query params). */
  protected buildUrl(path: string): string {
    const base = this.baseUrl.replace(/\/$/, '');
    const segment = path.startsWith('/') ? path : `/${path}`;
    return `${base}${segment}`;
  }
}
