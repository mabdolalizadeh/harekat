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
        type: DataTypes.ENUM('paid', 'pending', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
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