import { DataTypes } from 'sequelize';
import { sequelize } from './database.config.js';
import { v4 as uuidv4 } from 'uuid';

const Banners = sequelize.define('Banners', {
    id: { type: DataTypes.UUID, defaultValue: () => uuidv4(), primaryKey: true },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    tabletImageUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    mobileImageUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    linkUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    duration: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { updatedAt: true, createdAt: true });

export default Banners;
