import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Tickets = sequelize.define('Tickets', {
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
        allowNull: true,
        defaultValue: null,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'general'
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'open',
        validate: { isIn: [['open', 'in_progress', 'answered', 'closed']] }
    },
    priority: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'medium',
        validate: { isIn: [['low', 'medium', 'high']] }
    },
    assignedToId: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null,
        references: {
            model: 'Admins',
            key: 'id'
        }
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['courseId'] },
        { fields: ['status'] },
        { fields: ['assignedToId'] }
    ]
});

const TicketMessages = sequelize.define('TicketMessages', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Tickets',
            key: 'id'
        }
    },
    senderType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['user', 'admin', 'ta']] }
    },
    senderId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    senderName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    attachments: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['ticketId'] }
    ]
});

Tickets.hasMany(TicketMessages, { foreignKey: 'ticketId', as: 'messages', onDelete: 'CASCADE' });
TicketMessages.belongsTo(Tickets, { foreignKey: 'ticketId', as: 'ticket' });

export { Tickets, TicketMessages };
