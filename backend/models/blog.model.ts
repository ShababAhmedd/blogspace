import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.ts";
import User from "./user.model.ts";

class Blog extends Model<InferAttributes<Blog>, InferCreationAttributes<Blog>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare blogTitle: string;
  declare blog: string;
  declare category: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    blogTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blog: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "blogs",
    timestamps: true,
  },
);

User.hasMany(Blog, { foreignKey: "userId", onDelete: "CASCADE" });
Blog.belongsTo(User, { foreignKey: "userId", as: "author" });

export default Blog;
