import { DataTypes } from 'sequelize';
import { sequelize } from './database.config.js';

const TeacherCategories = sequelize.define('TeacherCategories', {
    teacherId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: { model: 'Teachers', key: 'id' }
    },
    categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Categories', key: 'id' }
    }
}, {
    timestamps: true,
    indexes: [{ unique: true, fields: ['teacherId', 'categoryId'] }]
});

export default TeacherCategories;
