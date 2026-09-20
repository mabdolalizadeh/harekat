import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

export const Assignments = sequelize.define('Assignments', {
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
    deadline: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    maxScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    },
    attachmentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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

export const AssignmentSubmissions = sequelize.define('AssignmentSubmissions', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    assignmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Assignments',
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
    submissionText: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    attachmentUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'submitted',
        validate: { isIn: [['submitted', 'graded', 'returned']] }
    },
    gradedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Admins',
            key: 'id'
        }
    },
    gradedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['assignmentId'] },
        { fields: ['courseId'] },
        { fields: ['userId'] },
        { fields: ['assignmentId', 'userId'] }
    ]
});

export default { Assignments, AssignmentSubmissions };
