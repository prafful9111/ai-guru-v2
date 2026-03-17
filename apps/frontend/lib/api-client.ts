import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

class ApiClient {
    private instance: AxiosInstance;

    constructor(baseURL: string = "") {
        this.instance = axios.create({
            baseURL: baseURL || process.env.NEXT_PUBLIC_API_URL || "",
            headers: {
                "Content-Type": "application/json",
            },
            // You can add default timeout or other configs here
        });

        // Validating response interceptors or other global handling here
        this.instance.interceptors.response.use(
            (response) => {
                return response.data;
            },
            (error: AxiosError) => {
                // Handle global errors here if needed
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    const apiError = new ApiError(
                        (error.response.data as any)?.message ||
                        (error.response.data as any)?.error ||
                        error.message,
                        error.response.status,
                        error.response.data
                    );
                    return Promise.reject(apiError);

                } else if (error.request) {
                    // The request was made but no response was received
                    return Promise.reject(new ApiError("No response received form server", 0, error.request));
                } else {
                    // Something happened in setting up the request that triggered an Error
                    return Promise.reject(new ApiError(error.message, 0));
                }
            }
        );
    }

    // HTTP Methods using Axios
    async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.get<T, T>(endpoint, config);
    }

    async post<T>(
        endpoint: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        return this.instance.post<T, T>(endpoint, data, config);
    }

    async put<T>(
        endpoint: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        return this.instance.put<T, T>(endpoint, data, config);
    }

    async patch<T>(
        endpoint: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<T> {
        return this.instance.patch<T, T>(endpoint, data, config);
    }

    async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.delete<T, T>(endpoint, config);
    }

    // Set auth token
    setAuthToken(token: string) {
        this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Clear auth token
    clearAuthToken() {
        delete this.instance.defaults.headers.common["Authorization"];
    }
}

// Custom Error Class
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = "ApiError";
    }
}

// Export singleton instance
export const apiClient = new ApiClient();