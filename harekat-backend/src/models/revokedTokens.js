import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const RevokedTokens = sequelize.define('RevokedTokens', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    revokedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'logout'
    }
}, {
    tableName: 'RevokedTokens',
    timestamps: true
});

export default RevokedTokens;
