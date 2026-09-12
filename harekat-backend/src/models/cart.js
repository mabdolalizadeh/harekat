import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    sessionId: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    updatedAt: true,
    createdAt: true
});

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    cartId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Carts',
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
    }
}, {
    updatedAt: true,
    createdAt: true
});

Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

export { Cart, CartItem };