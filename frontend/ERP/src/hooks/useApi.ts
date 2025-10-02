import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL, getAuthHeaders } from '../config/api';
import { ApiResponse } from '../types/api';

const apiClient = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const apiResponse = await response.json();

    if (!response.ok) {
      throw new Error(apiResponse.message || 'API request failed');
    }

    // Return the full response including data and pagination
    // Backend returns { success: true, data: [...], pagination: {...} }
    return apiResponse;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const useApiQuery = <T = any>(
  key: string | string[],
  endpoint: string,
  options: RequestInit = {},
  queryOptions: any = {}
) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => apiClient<T>(endpoint, options),
    ...queryOptions,
  });
};

export const useApiMutation = <TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: any = {}
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      if (options.invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: options.invalidateQueries });
      }
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};

export { apiClient };