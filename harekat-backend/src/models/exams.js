import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Exams = sequelize.define('Exams', {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    examUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    minPassingScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 70
    },
    maxScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'published',
        validate: { isIn: [['draft', 'published', 'archived']] }
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['courseId'] }
    ]
});

export default Exams;
