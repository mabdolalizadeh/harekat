import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

export const Notifications = sequelize.define('Notifications', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Admins',
            key: 'id'
        }
    },
    senderRole: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'superadmin'
    },
    senderName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    recipientType: {
        type: DataTypes.ENUM('all', 'user', 'course'),
        allowNull: false,
        defaultValue: 'all'
    },
    targetId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'general'
    }
}, {
    timestamps: true
});

export const UserNotificationRead = sequelize.define('UserNotificationRead', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    notificationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Notifications',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['notificationId', 'userId']
        }
    ]
});
