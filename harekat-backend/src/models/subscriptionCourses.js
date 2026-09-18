import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const SubscriptionCourses = sequelize.define('SubscriptionCourses', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    subscriptionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Subscriptions',
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
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['subscriptionId'] },
        { fields: ['courseId'] },
        { fields: ['subscriptionId', 'courseId'], unique: true }
    ]
});

export default SubscriptionCourses;
