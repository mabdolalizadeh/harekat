import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const CourseAccess = sequelize.define('CourseAccess', {
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
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    sourceType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'direct',
        validate: { isIn: [['direct', 'package', 'subscription', 'admin']] }
    },
    sourceId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: { isIn: [['active', 'expired', 'revoked']] }
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['courseId'] },
        { fields: ['userId', 'courseId'] },
        { fields: ['status', 'expiresAt'] }
    ]
});

export default CourseAccess;
