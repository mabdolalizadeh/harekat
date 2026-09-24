import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Payments = sequelize.define("Payments", {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: { isIn: [['pending', 'paid', 'failed', 'cancelled', 'refunded']] }
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    gateway: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'mock'
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    trackId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    cardNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    failureReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    callbackData: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    createdAt: true,
    updatedAt: true
});

export default Payments;