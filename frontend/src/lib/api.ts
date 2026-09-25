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
      // TODO log user out
    }

    return Promise.reject(error);
  },
);

export default httpCall;
