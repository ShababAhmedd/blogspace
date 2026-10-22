import api from "@/utils/api";

const userService = {
  getProfile: () => api.get("/users/profile").then((res) => res.data.data),
  updateProfile: ({ firstName, lastName }) =>
    api.put("/users/profile/update", { firstName, lastName }).then((res) => res.data.data),
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.patch("/users/profile/image", formData).then((res) => res.data.data);
  },
  changePassword: (password) => api.patch("/users/password", { password }).then((res) => res.data),

  // admin only
  getUsers: () => api.get("/users").then((res) => res.data.data),
  getUserById: (id) => api.get(`/users/${id}`).then((res) => res.data.data),
  updateUserStatus: (id, isActive) =>
    api.patch(`/users/${id}/status`, { isActive }).then((res) => res.data.data),
};

export default userService;
