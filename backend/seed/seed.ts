import bcrypt from "bcrypt";
import dotenv from "dotenv";
import sequelize from "../config/db.ts";
import syncDatabase from "../config/syncDatabase.ts";
import User from "../models/user.model.ts";
import Blog from "../models/blog.model.ts";
import { seedBlogs, seedUsers } from "./data.ts";
dotenv.config();

// adds the demo users and blogs; safe to run again, existing rows are left alone
await syncDatabase();

const userIds: Record<string, number> = {};
for (const { key, password, ...data } of seedUsers) {
  let user = await User.findOne({ where: { email: data.email } });
  if (!user) {
    user = await User.create({ ...data, password: await bcrypt.hash(password, 10) });
    console.log(`created user ${data.email}`);
  }
  userIds[key] = user.id;
}

let created = 0;
for (const { author, daysAgo, ...data } of seedBlogs) {
  const userId = userIds[author]!;
  const existing = await Blog.findOne({ where: { blogTitle: data.blogTitle, userId } });
  if (existing) continue;

  const blog = await Blog.create({ ...data, userId });
  // Sequelize always stamps createdAt with "now", so backdate it directly
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  await sequelize.query("UPDATE blogs SET createdAt = ?, updatedAt = ? WHERE id = ?", {
    replacements: [date, date, blog.id],
  });
  created++;
}

console.log(`seeded ${created} new blogs (${seedBlogs.length - created} already existed)`);
await sequelize.close();
