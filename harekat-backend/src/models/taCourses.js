import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const TACourses = sequelize.define('TACourses', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    adminId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Admins',
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
        { fields: ['adminId'] },
        { fields: ['courseId'] },
        { fields: ['adminId', 'courseId'], unique: true }
    ]
});

export default TACourses;
