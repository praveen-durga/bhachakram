import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';

export interface Place {
  name: string;
  admin1: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

@Injectable({
  providedIn: 'root',
})
export class AtlasSearchService implements OnDestroy {
  private worker!: Worker;

  /** Indicates whether the SQLite database has finished loading into WebAssembly memory */
  public isReady$ = new BehaviorSubject<boolean>(false);

  /** Stream for database loading errors, if any */
  public error$ = new BehaviorSubject<string | null>(null);

  private searchResults$ = new Subject<Place[]>();

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (typeof Worker !== 'undefined') {
      // Angular 21 / Vite modern Web Worker instantiation
      this.worker = new Worker(new URL('../../workers/atlas-db.worker', import.meta.url), { type: 'module' });

      this.worker.onmessage = ({ data }: MessageEvent) => {
        switch (data.type) {
          case 'READY':
            this.isReady$.next(true);
            this.error$.next(null);
            break;

          case 'RESULTS':
            this.searchResults$.next(data.results || []);
            break;

          case 'ERROR':
            console.error('Atlas DB Worker Error:', data.error);
            this.error$.next(data.error);
            this.isReady$.next(false);
            break;

          default:
            console.warn('Unhandled worker message:', data);
        }
      };

      // Trigger database download and SQLite WASM initialization inside worker
      this.worker.postMessage({ type: 'INIT' });
    } else {
      const errMsg = 'Web Workers are not supported in this browser environment.';
      console.error(errMsg);
      this.error$.next(errMsg);
    }
  }

  /**
   * Search for cities/villages by prefix match (e.g., "Madu" -> "Madurai", "Maduravoyal")
   * @param query Minimum 2 characters search input
   */
  search(query: string): Observable<Place[]> {
    const trimmedQuery = query ? query.trim() : '';

    if (!this.isReady$.value || trimmedQuery.length < 2) {
      return of([]);
    }

    this.worker.postMessage({
      type: 'SEARCH',
      query: trimmedQuery,
    });

    return this.searchResults$.asObservable();
  }

  ngOnDestroy(): void {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
