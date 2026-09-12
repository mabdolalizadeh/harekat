import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Orders = sequelize.define('Orders', {
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
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
    },
    totalAmount: {
        type: DataTypes.STRING,
        allowNull: false
    },
    discountAmount: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '0'
    },
    finalAmount: {
        type: DataTypes.STRING,
        allowNull: false
    },
    couponCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Payments',
            key: 'id'
        }
    }
}, {
    updatedAt: true,
    createdAt: true
});

const OrderItems = sequelize.define('OrderItems', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Orders',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    productType: {
        type: DataTypes.ENUM('course', 'subscription'),
        allowNull: false,
        defaultValue: 'course'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productImage: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    updatedAt: true,
    createdAt: true
});

Orders.hasMany(OrderItems, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItems.belongsTo(Orders, { foreignKey: 'orderId', as: 'order' });

export { Orders, OrderItems };