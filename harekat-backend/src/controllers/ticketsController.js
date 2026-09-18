import { Tickets, TicketMessages, Courses, Users, Admins, TACourses } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class TicketsController {
    /**
     * Student: List my tickets
     */
    static async getMyTickets(req, res) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const tickets = await Tickets.findAll({
                where: { userId },
                include: [
                    { model: Courses, as: 'course', attributes: ['id', 'name'] },
                    { model: TicketMessages, as: 'messages' }
                ],
                order: [['updatedAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: tickets });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Create a new ticket
     */
    static async createTicket(req, res) {
        const userId = req.user?.id;
        const { subject, courseId, category, priority, message } = req.body;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });
        if (!subject?.trim() || !message?.trim()) {
            return res.status(400).json({ ok: false, message: 'موضوع و متن پیام الزامی است' });
        }

        try {
            const user = await Users.findByPk(userId);

            const ticket = await Tickets.create({
                userId,
                courseId: courseId || null,
                subject: subject.trim(),
                category: category || 'general',
                priority: priority || 'medium',
                status: 'open'
            });

            await TicketMessages.create({
                ticketId: ticket.id,
                senderType: 'user',
                senderId: userId,
                senderName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : 'کاربر',
                message: message.trim()
            });

            const created = await Tickets.findByPk(ticket.id, {
                include: [
                    { model: Courses, as: 'course', attributes: ['id', 'name'] },
                    { model: TicketMessages, as: 'messages' }
                ]
            });

            logSecurityEvent('ticket_created', { ticketId: ticket.id, userId });
            return res.status(201).json({ ok: true, data: created });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Get single ticket with messages (Student owner or Admin/TA)
     */
    static async getTicketById(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        const role = req.user?.role;

        try {
            const ticket = await Tickets.findByPk(id, {
                include: [
                    { model: Courses, as: 'course', attributes: ['id', 'name'] },
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: TicketMessages, as: 'messages' }
                ],
                order: [[{ model: TicketMessages, as: 'messages' }, 'createdAt', 'ASC']]
            });

            if (!ticket) return res.status(404).json({ ok: false, message: 'تیکت یافت نشد' });

            // Authorization:
            // If student: must own ticket
            if (role !== 'admin' && role !== 'superadmin' && role !== 'ta') {
                if (ticket.userId !== userId) return res.status(403).json({ ok: false, message: 'forbidden' });
            }

            // If TA: check if ticket's course is assigned to TA (or unassigned general)
            if (role === 'ta' && ticket.courseId) {
                const isAssigned = await TACourses.findOne({
                    where: { adminId: userId, courseId: ticket.courseId }
                });
                if (!isAssigned) {
                    return res.status(403).json({ ok: false, message: 'دسترسی به این تیکت برای شما مجاز نیست' });
                }
            }

            return res.status(200).json({ ok: true, data: ticket });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Add reply message to ticket
     */
    static async addMessage(req, res) {
        const { id } = req.params;
        const { message, attachments } = req.body;
        const userId = req.user?.id;
        const role = req.user?.role;

        if (!message?.trim()) {
            return res.status(400).json({ ok: false, message: 'متن پاسخ الزامی است' });
        }

        try {
            const ticket = await Tickets.findByPk(id);
            if (!ticket) return res.status(404).json({ ok: false, message: 'تیکت یافت نشد' });

            let senderType = 'user';
            let senderName = 'کاربر';

            if (role === 'admin' || role === 'superadmin') {
                senderType = 'admin';
                senderName = 'پشتیبان سیستم';
                ticket.status = 'answered';
            } else if (role === 'ta') {
                senderType = 'ta';
                senderName = 'دستیار آموزشی';
                ticket.status = 'answered';
            } else {
                if (ticket.userId !== userId) return res.status(403).json({ ok: false, message: 'forbidden' });
                const user = await Users.findByPk(userId);
                senderName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phoneNumber : 'کاربر';
                ticket.status = 'in_progress';
            }

            await ticket.save();

            const newMsg = await TicketMessages.create({
                ticketId: ticket.id,
                senderType,
                senderId: userId,
                senderName,
                message: message.trim(),
                attachments: attachments ? JSON.stringify(attachments) : null
            });

            return res.status(201).json({ ok: true, data: newMsg });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: List all tickets (TAs restricted to assigned courses)
     */
    static async listTicketsAdmin(req, res) {
        const role = req.user?.role;
        const adminId = req.user?.id;

        try {
            let whereClause = {};

            // If TA, restrict to tickets belonging to their assigned courses
            if (role === 'ta') {
                const assigned = await TACourses.findAll({ where: { adminId } });
                const courseIds = assigned.map((a) => a.courseId);
                whereClause = { courseId: courseIds };
            }

            const tickets = await Tickets.findAll({
                where: whereClause,
                include: [
                    { model: Courses, as: 'course', attributes: ['id', 'name'] },
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: TicketMessages, as: 'messages' }
                ],
                order: [['updatedAt', 'DESC']]
            });

            return res.status(200).json({ ok: true, data: tickets });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Update ticket status / assign to TA
     */
    static async updateTicketStatus(req, res) {
        const { id } = req.params;
        const { status, priority, assignedToId } = req.body;
        try {
            const ticket = await Tickets.findByPk(id);
            if (!ticket) return res.status(404).json({ ok: false, message: 'تیکت یافت نشد' });

            if (status !== undefined) ticket.status = status;
            if (priority !== undefined) ticket.priority = priority;
            if (assignedToId !== undefined) ticket.assignedToId = assignedToId;
            await ticket.save();

            return res.status(200).json({ ok: true, data: ticket });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
