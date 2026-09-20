import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Coupon = sequelize.define('Coupon', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    discountType: {
        type: DataTypes.ENUM('percent', 'fixed'),
        allowNull: false,
        defaultValue: 'percent'
    },
    discountValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    targetType: {
        type: DataTypes.ENUM('all', 'course', 'users'),
        allowNull: false,
        defaultValue: 'all'
    },
    targetCourseId: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
    },
    targetUserIds: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    usageCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    minimumOrderAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: null
    }
}, {
    updatedAt: true,
    createdAt: true
});

export default Coupon;
