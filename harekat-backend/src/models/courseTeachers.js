import { DataTypes } from 'sequelize';
import { sequelize } from './database.config.js';

const CourseTeachers = sequelize.define('CourseTeachers', {
    courseId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: 'Courses', key: 'id' }
    },
    teacherId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: 'Teachers', key: 'id' }
    }
}, {
    timestamps: true,
    indexes: [{ unique: true, fields: ['courseId', 'teacherId'] }]
});

export default CourseTeachers;
