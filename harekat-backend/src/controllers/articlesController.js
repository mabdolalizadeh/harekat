import { Op } from 'sequelize';
import { Articles } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\u0600-\u06FF\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export default class ArticlesController {
    /**
     * List articles with pagination, search, tag and status filtering
     */
    static async listArticles(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page, 10) || 1);
            const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
            const offset = (page - 1) * limit;

            const { search, tag, category, status } = req.query;
            const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

            const where = {};

            // Public users only see published articles
            if (!isAdmin || !status || status === 'published') {
                if (!isAdmin) {
                    where.status = 'published';
                } else if (status) {
                    where.status = status;
                }
            } else if (status && status !== 'all') {
                where.status = status;
            }

            if (category) {
                where.category = category;
            }

            if (tag) {
                where.tags = {
                    [Op.like]: `%"${tag}"%`
                };
            }

            if (search) {
                const searchPattern = `%${search.trim()}%`;
                where[Op.or] = [
                    { title: { [Op.like]: searchPattern } },
                    { excerpt: { [Op.like]: searchPattern } },
                    { content: { [Op.like]: searchPattern } }
                ];
            }

            const { count, rows } = await Articles.findAndCountAll({
                where,
                order: [
                    ['publishedAt', 'DESC'],
                    ['createdAt', 'DESC']
                ],
                limit,
                offset
            });

            return res.status(200).json({
                ok: true,
                data: {
                    articles: rows,
                    pagination: {
                        total: count,
                        page,
                        limit,
                        totalPages: Math.ceil(count / limit)
                    }
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Get a single article by slug or ID with view increment & related articles
     */
    static async getArticleBySlug(req, res) {
        try {
            const { slugOrId } = req.params;
            const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';

            const article = await Articles.findOne({
                where: {
                    [Op.or]: [
                        { slug: slugOrId },
                        { id: slugOrId }
                    ]
                }
            });

            if (!article) {
                return res.status(404).json({ ok: false, message: 'مقاله یافت نشد' });
            }

            if (!isAdmin && article.status !== 'published') {
                return res.status(404).json({ ok: false, message: 'مقاله یافت نشد' });
            }

            // Increment view counter asynchronously
            try {
                article.views = (article.views || 0) + 1;
                await article.save({ silent: true });
            } catch (err) {
                // Ignore view increment error
            }

            // Fetch related articles (same category or published)
            const related = await Articles.findAll({
                where: {
                    id: { [Op.ne]: article.id },
                    status: 'published',
                    ...(article.category ? { category: article.category } : {})
                },
                attributes: ['id', 'title', 'slug', 'excerpt', 'featuredImage', 'publishedAt', 'category', 'views'],
                order: [['publishedAt', 'DESC']],
                limit: 3
            });

            return res.status(200).json({
                ok: true,
                data: {
                    article,
                    related
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Create a new article
     */
    static async createArticle(req, res) {
        try {
            const {
                title,
                slug,
                excerpt,
                content,
                featuredImage,
                authorName,
                category,
                tags,
                seoTitle,
                seoDescription,
                ogImage,
                status,
                publishedAt
            } = req.body;

            if (!title || !content) {
                return res.status(400).json({ ok: false, message: 'عنوان و محتوای مقاله الزامی است' });
            }

            let generatedSlug = (slug || slugify(title)).trim();
            if (!generatedSlug) {
                generatedSlug = `article-${Date.now()}`;
            }

            // Ensure unique slug
            const existingSlug = await Articles.findOne({ where: { slug: generatedSlug } });
            if (existingSlug) {
                generatedSlug = `${generatedSlug}-${Math.floor(Math.random() * 1000)}`;
            }

            const article = await Articles.create({
                title,
                slug: generatedSlug,
                excerpt: excerpt || (content.replace(/<[^>]*>?/gm, '').slice(0, 200) + '...'),
                content,
                featuredImage: featuredImage || null,
                authorName: authorName || 'مدرسه حرکت',
                category: category || 'عمومی',
                tags: tags || [],
                seoTitle: seoTitle || title,
                seoDescription: seoDescription || excerpt || null,
                ogImage: ogImage || featuredImage || null,
                status: status || 'published',
                publishedAt: publishedAt || (status === 'published' ? new Date() : null)
            });

            logSecurityEvent('article_created', {
                articleId: article.id,
                slug: article.slug,
                requesterId: req.user?.id,
                ip: req.ip
            });

            return res.status(201).json({ ok: true, data: article });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Update an existing article
     */
    static async updateArticle(req, res) {
        try {
            const { id } = req.params;
            const article = await Articles.findByPk(id);

            if (!article) {
                return res.status(404).json({ ok: false, message: 'مقاله مورد نظر یافت نشد' });
            }

            const {
                title,
                slug,
                excerpt,
                content,
                featuredImage,
                authorName,
                category,
                tags,
                seoTitle,
                seoDescription,
                ogImage,
                status,
                publishedAt
            } = req.body;

            if (title !== undefined) article.title = title;
            if (excerpt !== undefined) article.excerpt = excerpt;
            if (content !== undefined) article.content = content;
            if (featuredImage !== undefined) article.featuredImage = featuredImage;
            if (authorName !== undefined) article.authorName = authorName;
            if (category !== undefined) article.category = category;
            if (tags !== undefined) article.tags = tags;
            if (seoTitle !== undefined) article.seoTitle = seoTitle;
            if (seoDescription !== undefined) article.seoDescription = seoDescription;
            if (ogImage !== undefined) article.ogImage = ogImage;
            if (status !== undefined) {
                article.status = status;
                if (status === 'published' && !article.publishedAt) {
                    article.publishedAt = new Date();
                }
            }
            if (publishedAt !== undefined) article.publishedAt = publishedAt;

            if (slug && slug !== article.slug) {
                const cleanSlug = slugify(slug);
                const existing = await Articles.findOne({
                    where: {
                        slug: cleanSlug,
                        id: { [Op.ne]: id }
                    }
                });
                if (existing) {
                    return res.status(400).json({ ok: false, message: 'این نامک (slug) قبلاً استفاده شده است' });
                }
                article.slug = cleanSlug;
            }

            await article.save();

            logSecurityEvent('article_updated', {
                articleId: article.id,
                slug: article.slug,
                requesterId: req.user?.id,
                ip: req.ip
            });

            return res.status(200).json({ ok: true, data: article });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Delete an article
     */
    static async deleteArticle(req, res) {
        try {
            const { id } = req.params;
            const article = await Articles.findByPk(id);

            if (!article) {
                return res.status(404).json({ ok: false, message: 'مقاله مورد نظر یافت نشد' });
            }

            await article.destroy();

            logSecurityEvent('article_deleted', {
                articleId: id,
                requesterId: req.user?.id,
                ip: req.ip
            });

            return res.status(200).json({ ok: true, message: 'مقاله با موفقیت حذف گردید' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
