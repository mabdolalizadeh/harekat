import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const PackageCourses = sequelize.define('PackageCourses', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    packageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Courses',
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
        { fields: ['packageId'] },
        { fields: ['courseId'] },
        { fields: ['packageId', 'courseId'], unique: true }
    ]
});

export default PackageCourses;
