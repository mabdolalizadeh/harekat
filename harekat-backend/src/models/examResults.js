import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const ExamResults = sequelize.define('ExamResults', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    examId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Exams',
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
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: { isIn: [['pending', 'completed', 'passed', 'failed']] }
    },
    published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['examId'] },
        { fields: ['courseId'] },
        { fields: ['userId'] },
        { fields: ['userId', 'courseId'] }
    ]
});

export default ExamResults;
