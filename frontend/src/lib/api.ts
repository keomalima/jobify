import axios, { AxiosError } from "axios";

const httpCall = axios.create({
  baseURL: "/api",
});

httpCall.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      //TODO clear auth session once implemented
    }

    return Promise.reject(error);
  },
);

export default httpCall;
