export interface BaseResponse<T> {
  data: T,
  statusCode: number;
  status: string;
  message: string;
}
