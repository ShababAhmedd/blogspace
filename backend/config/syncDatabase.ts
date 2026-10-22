import { DataTypes } from "sequelize";
import sequelize from "./db.ts";
import "../models/user.model.ts";
import "../models/blog.model.ts";

const syncDatabase = async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  // sync() doesn't add columns to an existing table, so add any new ones here
  const queryInterface = sequelize.getQueryInterface();
  const userColumns = await queryInterface.describeTable("users");
  const newUserColumns = {
    profileImage: { type: DataTypes.STRING, allowNull: true },
    resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
    resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
  };
  for (const [name, definition] of Object.entries(newUserColumns)) {
    if (!userColumns[name]) {
      await queryInterface.addColumn("users", name, definition);
    }
  }
};

export default syncDatabase;
