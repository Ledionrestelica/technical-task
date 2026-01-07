export interface ApiResponse<T> {
  status: 'success' | 'error' | 'pending';
  data: T;
  message: string;
}
