import { DataTypes } from 'sequelize';
import { sequelize } from './database.config.js';
import { v4 as uuidv4 } from 'uuid';

const Articles = sequelize.define('Articles', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    featuredImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    authorName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'آکادمی حرکت'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'مهارت‌آموزی'
    },
    tags: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('tags');
            if (!raw) return [];
            try {
                return JSON.parse(raw);
            } catch {
                return raw.split(',').map(t => t.trim()).filter(Boolean);
            }
        },
        set(val) {
            if (Array.isArray(val)) {
                this.setDataValue('tags', JSON.stringify(val));
            } else if (typeof val === 'string') {
                try {
                    const parsed = JSON.parse(val);
                    this.setDataValue('tags', JSON.stringify(parsed));
                } catch {
                    const arr = val.split(',').map(t => t.trim()).filter(Boolean);
                    this.setDataValue('tags', JSON.stringify(arr));
                }
            } else {
                this.setDataValue('tags', '[]');
            }
        }
    },
    seoTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    seoDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    ogImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'published' // 'draft' | 'published'
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'articles',
    timestamps: true
});

export default Articles;
