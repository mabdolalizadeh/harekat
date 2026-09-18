import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Subscriptions = sequelize.define('Subscriptions', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salePrice: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
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
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    buttonLink: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    buttonText: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    durationMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    durationDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
    },
    badgeLabel: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    badgeIconSvg: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    }
}, {
    updatedAt: true,
    createdAt: true
});

export default Subscriptions;