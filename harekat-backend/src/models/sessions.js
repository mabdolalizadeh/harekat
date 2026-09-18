import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Sessions = sequelize.define('Sessions', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    sessionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    sessionLink: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    videoLink: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    googleDriveLink: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    groupLink: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    porslineLink: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    isFinal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['courseId'] },
        { fields: ['courseId', 'sessionNumber'] }
    ]
});

export default Sessions;
