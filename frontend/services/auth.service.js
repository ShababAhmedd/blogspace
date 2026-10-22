import api from "@/utils/api";

const authService = {
  register: (data) => api.post("/auth/register", data).then((res) => res.data),
  login: (data) => api.post("/auth/login", data).then((res) => res.data.data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }).then((res) => res.data),
  resetPassword: (token, password) =>
    api.patch(`/auth/reset-password/${encodeURIComponent(token)}`, { password }).then((res) => res.data),
};

export default authService;
