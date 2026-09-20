import { Op } from 'sequelize';
import { Notifications, UserNotificationRead, Admins, Courses, CourseAccess, TACourses, Users } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class NotificationsController {
    /**
     * Admin/TA: Send a notification
     */
    static async createNotification(req, res) {
        const adminId = req.user?.id;
        const role = req.user?.role;
        const { title, body, recipientType = 'all', targetId = null, courseId = null, type = 'general' } = req.body;

        if (!title || !body) {
            return res.status(400).json({ ok: false, message: 'عنوان و متن پیام الزامی است' });
        }

        if (!['all', 'user', 'course'].includes(recipientType)) {
            return res.status(400).json({ ok: false, message: 'نوع گیرنده نامعتبر است (all, user, course مجاز است)' });
        }

        try {
            const admin = await Admins.findByPk(adminId);
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'حساب مدیریتی یافت نشد' });
            }

            let effectiveCourseId = courseId || (recipientType === 'course' ? targetId : null);

            // TA Access Boundary Validation
            if (role === 'ta') {
                if (recipientType === 'all') {
                    return res.status(403).json({
                        ok: false,
                        message: 'دستیاران آموزشی فقط مجاز به ارسال پیام به دوره‌های اختصاص‌یافته یا دانشجویان دوره‌های خود می‌باشند'
                    });
                }

                const taAssignments = await TACourses.findAll({ where: { adminId } });
                const assignedCourseIds = taAssignments.map((a) => a.courseId);

                if (recipientType === 'course') {
                    if (!targetId || !assignedCourseIds.includes(targetId)) {
                        return res.status(403).json({
                            ok: false,
                            message: 'شما دسترسی ارسال پیام به این دوره را ندارید'
                        });
                    }
                    effectiveCourseId = targetId;
                } else if (recipientType === 'user') {
                    if (!targetId) {
                        return res.status(400).json({ ok: false, message: 'شناسه کاربر الزامی است' });
                    }
                    // Check if student is enrolled in any of TA's assigned courses
                    const hasAccess = await CourseAccess.findOne({
                        where: {
                            userId: targetId,
                            courseId: { [Op.in]: assignedCourseIds },
                            status: 'active'
                        }
                    });
                    if (!hasAccess) {
                        return res.status(403).json({
                            ok: false,
                            message: 'این دانشجو در دوره‌های تخصیص‌یافته به شما ثبت‌نام نکرده است'
                        });
                    }
                }
            }

            const senderName = admin.name || admin.username || (role === 'ta' ? 'استادیار' : 'مدیریت حرکت');

            const notification = await Notifications.create({
                title,
                body,
                senderId: admin.id,
                senderRole: role,
                senderName,
                courseId: effectiveCourseId,
                recipientType,
                targetId: recipientType === 'all' ? null : targetId,
                type
            });

            logSecurityEvent('notification_sent', {
                notificationId: notification.id,
                senderId: admin.id,
                recipientType,
                targetId
            });

            return res.status(201).json({
                ok: true,
                message: 'پیام با موفقیت ارسال شد',
                data: notification
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: List sent notifications
     */
    static async getSentNotifications(req, res) {
        const adminId = req.user?.id;
        const role = req.user?.role;

        try {
            const whereClause = (role === 'superadmin' || role === 'admin') ? {} : { senderId: adminId };

            const list = await Notifications.findAll({
                where: whereClause,
                include: [
                    { model: Admins, as: 'sender', attributes: ['id', 'username', 'name', 'role'] },
                    { model: Courses, as: 'course', attributes: ['id', 'name'] }
                ],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({ ok: true, data: list });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Delete a sent notification
     */
    static async deleteNotification(req, res) {
        const { id } = req.params;
        const adminId = req.user?.id;
        const role = req.user?.role;

        try {
            const notif = await Notifications.findByPk(id);
            if (!notif) {
                return res.status(404).json({ ok: false, message: 'اعلان یافت نشد' });
            }

            if (role === 'ta' && notif.senderId !== adminId) {
                return res.status(403).json({ ok: false, message: 'شما فقط مجاز به حذف اعلان‌های ارسالی خود هستید' });
            }

            await notif.destroy();
            return res.status(200).json({ ok: true, message: 'اعلان با موفقیت حذف گردید' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Get my notifications (General broadcasts + Course notifications + Direct messages)
     */
    static async getMyNotifications(req, res) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            // Find all courses user is currently enrolled in
            const enrollments = await CourseAccess.findAll({
                where: { userId, status: 'active' },
                attributes: ['courseId']
            });
            const enrolledCourseIds = enrollments.map((e) => e.courseId);

            // Fetch eligible notifications
            const notifications = await Notifications.findAll({
                where: {
                    [Op.or]: [
                        { recipientType: 'all' },
                        { recipientType: 'user', targetId: userId },
                        { recipientType: 'course', targetId: { [Op.in]: enrolledCourseIds } }
                    ]
                },
                include: [
                    { model: Courses, as: 'course', attributes: ['id', 'name'] },
                    { model: Admins, as: 'sender', attributes: ['id', 'username', 'name', 'role'] },
                    {
                        model: UserNotificationRead,
                        as: 'reads',
                        where: { userId },
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const formatted = notifications.map((n) => {
                const isRead = Array.isArray(n.reads) && n.reads.length > 0;
                let senderLabel = 'مدیریت حرکت';

                if (n.senderRole === 'ta') {
                    const courseName = n.course?.name;
                    senderLabel = courseName ? `استادیار (${courseName})` : 'استادیار دوره';
                } else if (n.sender?.name) {
                    senderLabel = n.sender.name;
                }

                return {
                    id: n.id,
                    title: n.title,
                    description: n.body,
                    body: n.body,
                    type: n.type,
                    senderLabel,
                    senderRole: n.senderRole,
                    courseName: n.course?.name || null,
                    isRead,
                    createdAt: n.createdAt,
                    date: n.createdAt
                };
            });

            return res.status(200).json({ ok: true, data: formatted });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Mark notification as read
     */
    static async markAsRead(req, res) {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            await UserNotificationRead.findOrCreate({
                where: { notificationId: id, userId },
                defaults: { notificationId: id, userId, isRead: true, readAt: new Date() }
            });
            return res.status(200).json({ ok: true, message: 'اعلان خوانده شد' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Mark all notifications as read
     */
    static async markAllAsRead(req, res) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const enrollments = await CourseAccess.findAll({
                where: { userId, status: 'active' },
                attributes: ['courseId']
            });
            const enrolledCourseIds = enrollments.map((e) => e.courseId);

            const allEligible = await Notifications.findAll({
                where: {
                    [Op.or]: [
                        { recipientType: 'all' },
                        { recipientType: 'user', targetId: userId },
                        { recipientType: 'course', targetId: { [Op.in]: enrolledCourseIds } }
                    ]
                },
                attributes: ['id']
            });

            for (const notif of allEligible) {
                await UserNotificationRead.findOrCreate({
                    where: { notificationId: notif.id, userId },
                    defaults: { notificationId: notif.id, userId, isRead: true, readAt: new Date() }
                });
            }

            return res.status(200).json({ ok: true, message: 'تمام اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
