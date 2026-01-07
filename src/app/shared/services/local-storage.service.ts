import { Injectable } from '@angular/core';
import { CoverageCode } from '../models/coverage-code.model';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  getItem(key: 'coverage_codes' | 'medical_plans'): Promise<CoverageCode[] | null> {
    return new Promise<CoverageCode[] | null>((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(localStorage.getItem(key) ?? '[]'));
      }, 1000);
    });
  }
}
