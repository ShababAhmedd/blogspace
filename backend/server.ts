import syncDatabase from "./config/syncDatabase.ts";
import app from "./app.ts";
import dotenv from "dotenv";
import { checkMailer } from "./utils/mailer.ts";
dotenv.config();

await syncDatabase();
console.log("db is connected and table is synced");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
  checkMailer();
});
