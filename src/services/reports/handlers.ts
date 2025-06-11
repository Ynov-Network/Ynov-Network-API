import type { Response } from 'express';
import type { CreateReportRequest } from './request-types';
import ReportModel from '@/db/schemas/reports';
import PostModel from '@/db/schemas/posts';
import CommentModel from '@/db/schemas/comments';
import UserModel from '@/db/schemas/users';

export const createReport = async (req: CreateReportRequest, res: Response) => {
  const reporterId = req.auth.user?.id;
  if (!reporterId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { reported_entity_id, reported_entity_type, reason } = req.body;

  try {
    // Verify the entity being reported actually exists
    let entityExists = false;
    switch (reported_entity_type) {
      case 'Post':
        entityExists = !!await PostModel.findById(reported_entity_id).select('_id');
        break;
      case 'Comment':
        entityExists = !!await CommentModel.findById(reported_entity_id).select('_id');
        break;
      case 'User':
        entityExists = !!await UserModel.findById(reported_entity_id).select('_id');
        break;
    }
    if (!entityExists) {
      res.status(404).json({ message: `${reported_entity_type} not found.` });
      return;
    }

    // Prevent reporting oneself
    if (reported_entity_type === 'User' && reported_entity_id === reporterId) {
      res.status(400).json({ message: 'You cannot report yourself.' });
      return;
    }

    // Optional: Check if the user has already reported this exact entity to prevent spam
    const existingReport = await ReportModel.findOne({
      reporter_id: reporterId,
      reported_entity_id: reported_entity_id,
    });

    if (existingReport) {
      res.status(409).json({ message: 'You have already reported this content.' });
      return;
    }

    const newReport = new ReportModel({
      reporter_id: reporterId,
      reported_entity_id,
      reported_entity_type,
      reason,
      status: 'pending', // Default status
    });

    await newReport.save();

    res.status(201).json({ message: 'Report submitted successfully. Our moderation team will review it.' });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Internal server error while creating report.' });
  }
}; 