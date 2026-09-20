import { DataTypes, DATE } from "sequelize";
import { sequelize } from "./database.config.js";
import { v4 as uuidv4 } from "uuid";

const Courses = sequelize.define('Courses', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false
    },
    salePrice: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    level: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['', 'پایه', 'مقدماتی', 'متوسط', 'پیشرفته', 'مبتدی', 'همه سطوح', 'جامع']] }
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false
    },
    typeOfAttendence: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['آنلاین', 'آفلاین', 'حضوری', 'ترکیبی']] }
    },
    kind: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'regular',
        validate: { isIn: [['regular', 'capsule', 'skill']] }
    },
    statusOfRegistration: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['open', 'closed', 'soon', 'completed', 'در حال ثبت‌نام', 'به اتمام رسیده', 'به زودی', 'تکمیل ظرفیت']] }
    },
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    longDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    teacherId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Teachers',
            key: 'id'
        }
    }
}, {
    updatedAt: true,
    createdAt: true
});

export default Courses;
