import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

/**
 * Notification Service (Stub for MVP)
 *
 * This service logs notifications to the database but does not actually send push notifications.
 * In production, this would integrate with Firebase Cloud Messaging or similar service.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log a notification that would be sent (for MVP, just stores in DB)
   */
  async logNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
  ) {
    return this.prisma.notificationLog.create({
      data: {
        userId,
        type,
        title,
        body,
        sent: false, // In production, would be true after successful push
      },
    });
  }

  /**
   * Send a reminder notification (stub)
   */
  async sendReminder(userId: string, message: string) {
    console.log(`[STUB] Would send reminder to user ${userId}: ${message}`);

    return this.logNotification(userId, 'REMINDER', 'Reminder', message);
  }

  /**
   * Send a quest completion notification (stub)
   */
  async sendQuestComplete(userId: string, questTitle: string) {
    console.log(`[STUB] Would send quest complete notification to user ${userId}`);

    return this.logNotification(
      userId,
      'QUEST_COMPLETE',
      'Quest Complete! 🎉',
      `You completed "${questTitle}"! Tap to claim your reward.`,
    );
  }

  /**
   * Send a streak milestone notification (stub)
   */
  async sendStreakMilestone(userId: string, area: string, days: number) {
    console.log(`[STUB] Would send streak milestone notification to user ${userId}`);

    return this.logNotification(
      userId,
      'STREAK_MILESTONE',
      `${days} Day Streak! 🔥`,
      `You've been consistent with ${area} for ${days} days!`,
    );
  }

  /**
   * Get notification logs for a user
   */
  async getNotificationLogs(userId: string, limit: number = 50) {
    return this.prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Mark a notification as sent (for when we have real push notifications)
   */
  async markAsSent(notificationId: string) {
    return this.prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        sent: true,
        sentAt: new Date(),
      },
    });
  }
}

