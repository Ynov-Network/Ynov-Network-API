import type { Response } from 'express';
import type {
  GetNotificationsRequest,
  MarkAllNotificationsAsReadRequest,
  MarkNotificationAsReadRequest
} from './request-types';
import NotificationModel from '@/db/schemas/notifications';
import { io, getReceiverSocketId } from '@/lib/socket';

export interface NotificationPayload {
  actor_id?: string;
  type: string;
  content?: string;
  target_entity_id?: string;
  target_entity_type?: 'Post' | 'Comment' | 'User' | 'Like' | string;
  target_entity_ref?: string;
}

/**
 * Creates and sends a real-time notification.
 * @param recipientId - The user ID of the person who should receive the notification.
 * @param payload - The content of the notification.
 */
export const createNotification = async (recipientId: string, payload: NotificationPayload) => {
  try {
    const notification = new NotificationModel({
      recipient_id: recipientId,
      ...payload
    });
    await notification.save();

    // Populate actor details for the real-time event
    const populatedNotification = await notification.populate('actor_id', 'username first_name last_name profile_picture_url');

    const receiverSocketId = getReceiverSocketId(recipientId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newNotification', populatedNotification);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const getNotifications = async (req: GetNotificationsRequest, res: Response) => {
  const userId = req.auth.user?.id;
  const page = Number.parseInt(req.query.page || '1', 10);
  const limit = Number.parseInt(req.query.limit || '10', 10);
  const filter = req.query.filter || "all";

  const skip = (page - 1) * limit;

  try {
    const query: { recipient_id: string; is_read?: boolean } = { recipient_id: userId };
    if (filter === 'unread') {
      query.is_read = false;
    }

    const notifications = await NotificationModel.find(query)
      .populate('actor_id', 'username first_name last_name profile_picture_url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await NotificationModel.countDocuments(query);

    res.status(200).json({
      message: 'Notifications fetched successfully',
      notifications,
      page,
      limit,
      totalPages: Math.ceil(totalNotifications / limit),
      totalCount: totalNotifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const markAsRead = async (req: MarkNotificationAsReadRequest, res: Response) => {
  const userId = req.auth.user?.id;
  const { notificationId } = req.params;

  try {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipient_id: userId },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: "Notification not found or you don't have permission." });
      return;
    }

    res.status(200).json({ message: 'Notification marked as read.', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const markAllAsRead = async (req: MarkAllNotificationsAsReadRequest, res: Response) => {
  const userId = req.auth.user?.id;

  try {
    await NotificationModel.updateMany(
      { recipient_id: userId, is_read: false },
      { is_read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteNotification = async (req: MarkNotificationAsReadRequest, res: Response) => {
  const userId = req.auth.user?.id;
  const { notificationId } = req.params;

  try {
    const result = await NotificationModel.deleteOne({ _id: notificationId, recipient_id: userId });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Notification not found or you don't have permission to delete it." });
      return;
    }

    res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error while deleting notification.' });
  }
} 