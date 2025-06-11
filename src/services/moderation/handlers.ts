import type { Response } from 'express';
import type { GetReportsRequest, UpdateReportRequest } from './request-types';
import ReportModel from '@/db/schemas/reports';

export const getReports = async (req: GetReportsRequest, res: Response) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const status = req.query.status || 'pending'; // Default to 'pending' if no status is provided
  const skip = (page - 1) * limit;

  try {
    const query: { status?: string } = {};
    if (status) {
      query.status = status;
    }

    const reports = await ReportModel.find(query)
      .populate('reporter_id', 'username email')
      .populate('reported_entity_ref') // This will populate the actual reported document
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReports = await ReportModel.countDocuments(query);

    res.status(200).json({
      message: 'Reports fetched successfully',
      reports,
      page,
      limit,
      totalPages: Math.ceil(totalReports / limit),
      totalCount: totalReports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal server error while fetching reports.' });
  }
};

export const updateReportStatus = async (req: UpdateReportRequest, res: Response) => {
  const adminId = req.auth.user.id;
  const { reportId } = req.params;
  const { status, admin_notes } = req.body;

  try {
    const report = await ReportModel.findById(reportId);

    if (!report) {
      res.status(404).json({ message: 'Report not found.' });
      return;
    }

    if (report.status !== 'pending') {
      res.status(400).json({ message: `This report has already been resolved with status: ${report.status}` });
      return;
    }

    report.status = status;
    report.resolved_by = adminId;
    report.resolved_timestamp = new Date();
    if (admin_notes) {
      report.admin_notes = admin_notes;
    }

    // TODO: Implement the actual enforcement action based on the status.
    // e.g., if status is 'resolved_action_taken', delete the post/comment or ban the user.
    // This requires more complex logic and should be handled carefully in a separate function.

    await report.save();

    res.status(200).json({ message: 'Report status updated successfully.', report });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Internal server error while updating report status.' });
  }
}; 