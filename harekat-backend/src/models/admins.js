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
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'superadmin',
        validate: { isIn: [['superadmin', 'ta']] }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: { isIn: [['active', 'inactive']] }
    },
    permissions: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    publicKey: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    keyFingerprint: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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