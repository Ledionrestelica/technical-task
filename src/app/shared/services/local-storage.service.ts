import { Injectable } from '@angular/core';
import { CoverageCode } from '../models/coverage-code.model';
import { ApiResponse } from '../models/api-response.model';

//Added a small delay to stimulate real api response

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  getItem(key: 'coverage_codes' | 'medical_plans'): Promise<ApiResponse<CoverageCode[] | null>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem(key) ?? '[]');
        resolve({
          status: 'success',
          data: data,
          message: 'Data fetched successfully',
        });
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

  deleteItem(key: 'coverage_codes', id: string): Promise<ApiResponse<CoverageCode[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingData = JSON.parse(localStorage.getItem(key) ?? '[]');

        if (!existingData.some((item: CoverageCode) => item.id === id)) {
          return resolve({
            status: 'error',
            data: [],
            message: 'Data not found',
          });
        }

        const updatedData = existingData.filter((item: CoverageCode) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(updatedData));
        resolve({
          status: 'success',
          data: updatedData,
          message: 'Data deleted successfully',
        });
      }, 1500);
    });
  }
}
