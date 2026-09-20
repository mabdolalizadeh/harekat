import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

export const Quizzes = sequelize.define('Quizzes', {
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
    sessionId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Sessions',
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
    timeLimitMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 15
    },
    passingScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60
    },
    maxScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    questions: {
        type: DataTypes.TEXT, // JSON array: [{ id, question, options: string[], correctAnswerIndex: number, score: number }]
        allowNull: true,
        defaultValue: '[]'
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
        { fields: ['courseId'] },
        { fields: ['courseId', 'status'] }
    ]
});

export const QuizAttempts = sequelize.define('QuizAttempts', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    quizId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Quizzes',
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
    answers: {
        type: DataTypes.TEXT, // JSON object or array: { [questionId]: selectedOptionIndex }
        allowNull: true,
        defaultValue: '{}'
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    passed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'completed',
        validate: { isIn: [['in_progress', 'completed']] }
    },
    attemptNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['quizId'] },
        { fields: ['courseId'] },
        { fields: ['userId'] },
        { fields: ['quizId', 'userId'] }
    ]
});

export default { Quizzes, QuizAttempts };
