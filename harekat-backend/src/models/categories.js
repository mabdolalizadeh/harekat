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
    },
    slug: {
        // NOTE: uniqueness enforced in app code + via unique index (see seedCmsData);
        // kept non-unique here because SQLite cannot ADD a UNIQUE column via ALTER.
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

export default Categories;