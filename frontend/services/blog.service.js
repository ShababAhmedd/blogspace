import api from "@/utils/api";

const blogService = {
  // only non-empty filters are sent, e.g. /blogs?title=playwright&category=Testing
  getBlogs: ({ title, category } = {}) => {
    const params = {};
    if (title?.trim()) params.title = title.trim();
    if (category) params.category = category;
    return api.get("/blogs", { params }).then((res) => res.data.data);
  },
  getBlogById: (id) => api.get(`/blogs/${id}`).then((res) => res.data.data),
  createBlog: ({ blogTitle, blog, category }) =>
    api.post("/blogs/create", { blogTitle, blog, category }).then((res) => res.data.data),
  updateBlog: (id, { blogTitle, blog, category }) =>
    api.put(`/blogs/update/${id}`, { blogTitle, blog, category }).then((res) => res.data.data),
  deleteBlog: (id) => api.delete(`/blogs/delete/${id}`).then((res) => res.data),
};

export default blogService;
