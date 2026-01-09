import { Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';

//Added a small delay to stimulate real api response

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  getItem<T>(key: string): Promise<ApiResponse<T[] | null>> {
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

  setItem<T>(key: string, value: T[]): Promise<ApiResponse<T[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingData: T[] = JSON.parse(localStorage.getItem(key) ?? '[]');
        const updatedData = [...existingData, ...value];

        localStorage.setItem(key, JSON.stringify(updatedData));
        resolve({
          status: 'success',
          data: updatedData,
          message: 'Data set successfully',
        });
      }, 1500);
    });
  }

  setItemWithCodeCheck<T extends { code: string }>(
    key: string,
    value: T[]
  ): Promise<ApiResponse<T[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingData: T[] = JSON.parse(localStorage.getItem(key) ?? '[]');
        if (existingData.some((item) => item.code === value[0].code)) {
          return resolve({
            status: 'error',
            data: [],
            message: 'Item with this code already exists',
          });
        }
        const updatedData = [...existingData, ...value];
        localStorage.setItem(key, JSON.stringify(updatedData));
        resolve({
          status: 'success',
          data: updatedData,
          message: 'Data set successfully',
        });
      }, 1500);
    });
  }

  deleteItem<T extends { id: string }>(key: string, id: string): Promise<ApiResponse<T[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingData: T[] = JSON.parse(localStorage.getItem(key) ?? '[]');

        if (!existingData.some((item) => item.id === id)) {
          return resolve({
            status: 'error',
            data: [],
            message: 'Data not found',
          });
        }

        const updatedData = existingData.filter((item) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(updatedData));
        resolve({
          status: 'success',
          data: updatedData,
          message: 'Data deleted successfully',
        });
      }, 1500);
    });
  }

  updateItem<T extends { id: string }>(
    key: string,
    id: string,
    value: Partial<T>
  ): Promise<ApiResponse<T[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingData: T[] = JSON.parse(localStorage.getItem(key) ?? '[]');

        if (!existingData.some((item) => item.id === id)) {
          return resolve({
            status: 'error',
            data: [],
            message: 'Data not found',
          });
        }

        const updatedData = existingData.map((item) =>
          item.id === id ? { ...item, ...value } : item
        );

        localStorage.setItem(key, JSON.stringify(updatedData));
        resolve({
          status: 'success',
          data: updatedData,
          message: 'Data updated successfully',
        });
      }, 1500);
    });
  }

  updateItemWithCodeCheck<T extends { id: string; code: string }>(
    key: string,
    id: string,
    value: Partial<T>
  ): Promise<ApiResponse<T[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingData: T[] = JSON.parse(localStorage.getItem(key) ?? '[]');

        if (!existingData.some((item) => item.id === id)) {
          return resolve({
            status: 'error',
            data: [],
            message: 'Coverage code not found',
          });
        }

        if (value.code && existingData.some((item) => item.code === value.code && item.id !== id)) {
          return resolve({
            status: 'error',
            data: [],
            message: 'Coverage code already exists',
          });
        }

        const updatedData = existingData.map((item) =>
          item.id === id ? { ...item, ...value } : item
        );

        localStorage.setItem(key, JSON.stringify(updatedData));
        resolve({
          status: 'success',
          data: updatedData,
          message: 'Data updated successfully',
        });
      }, 1500);
    });
  }
}
