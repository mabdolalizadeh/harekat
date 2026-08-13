import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";

const Categories = sequelize.define('Categories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export default Categories;