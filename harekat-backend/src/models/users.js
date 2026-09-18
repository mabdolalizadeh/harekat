import { DataTypes, DATE } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";
import crypto from 'crypto';

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
}

const Users = sequelize.define('Users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    nationalId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    jobTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    education: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    updatedAt: true,
    createdAt: true,
    hooks: {
        beforeCreate: (user) => {
            user.otp = generateOTP();
            user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        },
        beforeUpdate: (user) => {
            if (user.changed('phoneNumber')) {
                user.otp = generateOTP();
                user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
            }
        }
    }
});

export default Users;