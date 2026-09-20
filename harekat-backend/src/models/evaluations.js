import { DataTypes } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

export const CourseEvaluations = sequelize.define('CourseEvaluations', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    isEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'فرم نظرسنجی و ارزیابی کیفیت تدریس استاد'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'لطفاً با پاسخ دقیق به سوالات زیر، ما را در ارتقای کیفیت آموزش یاری فرمایید. تکمیل این فرم برای ادامه دوره الزامی است.'
    },
    triggerSessionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 4
    },
    questions: {
        type: DataTypes.TEXT, // JSON array: [{ id, question, type: 'rating'|'text', min: 1, max: 5 }]
        allowNull: true,
        defaultValue: JSON.stringify([
            { id: 'q1', text: 'تسلط استاد بر مفاهیم و سرفصل‌های دوره', type: 'rating', min: 1, max: 5 },
            { id: 'q2', text: 'کیفیت بیان، شیوه تدریس و انتقال مطالب', type: 'rating', min: 1, max: 5 },
            { id: 'q3', text: 'پاسخگویی به سوالات و کیفیت پشتیبانی دوره', type: 'rating', min: 1, max: 5 },
            { id: 'q4', text: 'کیفیت ویدیوها و فایل‌های کمک‌آموزشی', type: 'rating', min: 1, max: 5 },
            { id: 'q5', text: 'پیشنهادات یا انتقادات تکمیلی شما برای این دوره', type: 'text' }
        ])
    }
}, {
    updatedAt: true,
    createdAt: true,
    indexes: [
        { fields: ['courseId'] }
    ]
});

export const CourseEvaluationResponses = sequelize.define('CourseEvaluationResponses', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    evaluationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'CourseEvaluations',
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
    ratings: {
        type: DataTypes.TEXT, // JSON object: { [questionId]: number|string }
        allowNull: false,
        defaultValue: '{}'
    },
    feedbackText: {
        type: DataTypes.TEXT,
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
        { fields: ['evaluationId'] },
        { fields: ['courseId'] },
        { fields: ['userId'] },
        { fields: ['courseId', 'userId'] }
    ]
});

export default { CourseEvaluations, CourseEvaluationResponses };
