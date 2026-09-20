import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const UserLessonProgress = sequelize.define('UserLessonProgress', {
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
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Sessions',
            key: 'id'
        }
    },
    isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    progressPercent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    lastWatchedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'sessionId']
        },
        {
            fields: ['userId', 'courseId']
        }
    ]
});

export default UserLessonProgress;
