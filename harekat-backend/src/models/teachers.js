import { DataTypes, DATE } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Teachers = sequelize.define('Teachers', {
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
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resume: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        }
    }
}, {
    createdAt: true,
    updatedAt: true
});

export default Teachers;