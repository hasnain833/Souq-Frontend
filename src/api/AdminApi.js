import axios from "axios";
import { getAdminToken, clearAdminToken } from "../utils/AdminTokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const adminAxios = axios.create({
  baseURL,
});

adminAxios.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearAdminToken();
      // Optional: redirect to admin login
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export async function adminLogin(email, password) {
  const { data } = await adminAxios.post("/api/admin/auth/login", {
    email,
    password,
  });
  return data?.data;
}

export async function getAdminOrders() {
  const { data } = await adminAxios.get("/api/admin/orders");
  return data?.data || data;
}

export async function getAdminRatings() {
  const { data } = await adminAxios.get("/api/admin/ratings");
  return data?.data || data;
}
