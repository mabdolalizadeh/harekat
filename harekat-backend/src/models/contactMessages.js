import { DataTypes } from 'sequelize';
import { sequelize } from './database.config.js';
import { v4 as uuidv4 } from 'uuid';

const ContactMessages = sequelize.define('ContactMessages', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'contact_messages',
    timestamps: true
});

export default ContactMessages;
export { ContactMessages };
