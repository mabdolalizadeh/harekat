import { DataTypes, DATE } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Courses = sequelize.define('Courses', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    level: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false
    },
    typeOfAttendence: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statusOfRegistration: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    updatedAt: true,
    createdAt: true
});

export default Courses;