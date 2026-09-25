import axios, { AxiosError } from "axios";

const httpCall = axios.create({
  baseURL: "/api",
});

httpCall.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.setAuthorization(`Bearer ${token}`);
  }

  return config;
});

httpCall.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // TODO(practice-6): For protected requests, clear user-specific Query cache
      // and redirect to login. Keep invalid-credential errors in the login form.
      // Verify that user A's companies/offers never appear after user B logs in.
    }

    return Promise.reject(error);
  },
);

export default httpCall;
