import { notificationService } from "../services/notification.service.js";

export const notificationController = {

  async getMyNotifications(req, res) {
    try {

      const userId = req.user.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await notificationService.getUserNotifications(
        userId,
        page,
        limit
      );

      res.json({
        success: true,
        ...result
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message
      });

    }
  },

  async markAsRead(req, res) {

    try {

      const userId = req.user.id;
      const { id } = req.params;

      const notification =
        await notificationService.markAsRead(id, userId);

      res.json({
        success: true,
        data: notification
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message
      });

    }
  },

  async markAllAsRead(req, res) {

    try {

      const userId = req.user.id;

      await notificationService.markAllAsRead(userId);

      res.json({
        success: true
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }
};