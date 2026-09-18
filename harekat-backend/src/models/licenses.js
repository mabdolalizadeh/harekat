import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Licenses = sequelize.define('Licenses', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    licenseNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    examResultId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'ExamResults',
            key: 'id'
        }
    },
    issueDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'available',
        validate: { isIn: [['available', 'revoked']] }
    },
    certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['courseId'] },
        { fields: ['licenseNumber'], unique: true }
    ]
});

export default Licenses;
