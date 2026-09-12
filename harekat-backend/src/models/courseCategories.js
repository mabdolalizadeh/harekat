import { DataTypes } from 'sequelize';
import { sequelize } from './database.config.js';

// A course can belong to many categories and a category can contain many
// courses. The uniqueness constraint must be on the pair, not on either
// foreign key individually.
const CourseCategories = sequelize.define('CourseCategories', {
    courseId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: 'Courses', key: 'id' }
    },
    categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Categories', key: 'id' }
    }
}, {
    timestamps: true,
    indexes: [{ unique: true, fields: ['courseId', 'categoryId'] }]
});

export default CourseCategories;
