import { ContactMessages } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class ContactMessagesController {
    /**
     * Public: Submit a new contact message
     */
    static async createMessage(req, res) {
        const { name, email, phoneNumber, subject, message } = req.body;

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return res.status(400).json({
                ok: false,
                message: 'نام، ایمیل و متن پیام الزامی هستند'
            });
        }

        // Basic email syntax validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                ok: false,
                message: 'فرمت آدرس ایمیل معتبر نیست'
            });
        }

        try {
            const contactMessage = await ContactMessages.create({
                name: name.trim().slice(0, 100),
                email: email.trim().toLowerCase().slice(0, 150),
                phoneNumber: phoneNumber ? String(phoneNumber).trim().slice(0, 30) : null,
                subject: subject ? subject.trim().slice(0, 200) : null,
                message: message.trim(),
                isRead: false,
                ip: req.ip
            });

            logSecurityEvent('contact_message_received', {
                messageId: contactMessage.id,
                email: contactMessage.email,
                ip: req.ip
            });

            return res.status(201).json({
                ok: true,
                message: 'پیام شما با موفقیت ثبت شد و به زودی با شما تماس خواهیم گرفت',
                data: { id: contactMessage.id }
            });
        } catch (err) {
            console.error('Failed to save contact message:', err);
            return res.status(500).json({
                ok: false,
                message: 'خطایی در ثبت پیام رخ داد. لطفاً دوباره تلاش کنید.'
            });
        }
    }

    /**
     * Admin: List all contact messages
     */
    static async listMessages(req, res) {
        try {
            const { isRead } = req.query;
            const whereClause = {};
            if (isRead !== undefined) {
                whereClause.isRead = isRead === 'true' || isRead === true;
            }

            const messages = await ContactMessages.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });

            const unreadCount = await ContactMessages.count({ where: { isRead: false } });

            return res.status(200).json({
                ok: true,
                data: messages,
                meta: { unreadCount }
            });
        } catch (err) {
            console.error('Failed to list contact messages:', err);
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Toggle or mark contact message as read/unread
     */
    static async markAsRead(req, res) {
        const { id } = req.params;
        const { isRead = true } = req.body;

        try {
            const msg = await ContactMessages.findByPk(id);
            if (!msg) {
                return res.status(404).json({ ok: false, message: 'پیام مورد نظر یافت نشد' });
            }

            msg.isRead = Boolean(isRead);
            await msg.save();

            return res.status(200).json({
                ok: true,
                message: 'وضعیت پیام با موفقیت به‌روزرسانی شد',
                data: msg
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Delete contact message
     */
    static async deleteMessage(req, res) {
        const { id } = req.params;

        try {
            const msg = await ContactMessages.findByPk(id);
            if (!msg) {
                return res.status(404).json({ ok: false, message: 'پیام مورد نظر یافت نشد' });
            }

            await msg.destroy();
            return res.status(200).json({
                ok: true,
                message: 'پیام با موفقیت حذف شد'
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
