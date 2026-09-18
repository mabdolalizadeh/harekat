import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const UserSubscriptions = sequelize.define('UserSubscriptions', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    subscriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Subscriptions',
            key: 'id'
        }
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: { isIn: [['active', 'expired', 'cancelled']] }
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['subscriptionId'] },
        { fields: ['status', 'expiresAt'] }
    ]
});

export default UserSubscriptions;
