import { IMAGE_MAX_SIZE, IMAGE_TYPES, PASSWORD_MIN_LENGTH } from "./constants";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(email.trim())) return "Please enter a valid email address.";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required.";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  return "";
};

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return "";
};

export const validateRequired = (value, label) => (value?.trim() ? "" : `${label} is required.`);

export const validateBlog = ({ blogTitle, category, blog }) => {
  const errors = {};
  if (!blogTitle.trim()) errors.blogTitle = "Blog title is required.";
  else if (blogTitle.trim().length < 5) errors.blogTitle = "Title must be at least 5 characters.";
  else if (blogTitle.trim().length > 150) errors.blogTitle = "Title must be 150 characters or fewer.";
  if (!category) errors.category = "Please choose a category.";
  if (!blog.trim()) errors.blog = "Blog content is required.";
  else if (blog.trim().length < 20) errors.blog = "Content must be at least 20 characters.";
  return errors;
};

export const validateImage = (file) => {
  if (!file) return "Please choose an image.";
  if (!IMAGE_TYPES.includes(file.type)) return "Only JPG, PNG, WEBP or GIF images are allowed.";
  if (file.size > IMAGE_MAX_SIZE) return "Image must be smaller than 2MB.";
  return "";
};

export const hasErrors = (errors) => Object.values(errors).some(Boolean);
