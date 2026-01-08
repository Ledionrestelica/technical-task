import { Injectable } from '@angular/core';
import { CoverageCode } from '../models/coverage-code.model';
import { ApiResponse } from '../models/api-response.model';

//Added a small delay to stimulate real api response

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

  setItem(key: 'coverage_codes', value: CoverageCode[]): Promise<ApiResponse<CoverageCode[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingData = JSON.parse(localStorage.getItem(key) ?? '[]');
        if (existingData.some((item: CoverageCode) => item.code === value[0].code)) {
          return resolve({
            status: 'error',
            data: [],
            message: 'Coverage code already exists',
          });
        } else {
          const updatedData = [...existingData, ...value];

          localStorage.setItem(key, JSON.stringify(updatedData));
          resolve({
            status: 'success',
            data: updatedData,
            message: 'Data set successfully',
          });
        }
      }, 1500);
    });
  }
}
