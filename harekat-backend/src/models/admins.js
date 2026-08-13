import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from "uuid";

const Admins = sequelize.define('Admins', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    createdAt: true,
    updatedAt: true,

    hooks: {
        beforeCreate: async (user) => {
            user.password = await bcrypt.hash(user.password, 12);
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        }
    }
});

export default Admins;