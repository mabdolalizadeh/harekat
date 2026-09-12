import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const SiteContent = sequelize.define('SiteContent', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    linkUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    linkText: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    updatedAt: true,
    createdAt: true
});

export default SiteContent;
