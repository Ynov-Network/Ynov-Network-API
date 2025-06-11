import type { Response } from 'express';
import type {
  CreateCommentRequest,
  GetCommentsByPostRequest,
  UpdateCommentRequest,
  DeleteCommentRequest
} from './request-types';
import CommentModel from '@/db/schemas/comments';
import PostModel from '@/db/schemas/posts';
import { createNotification } from '../notifications/handlers';

export const createComment = async (req: CreateCommentRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const { id: authorId } = req.auth.user;

    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found.' });
      return;
    }

    const newComment = new CommentModel({
      post_id: postId,
      author_id: authorId,
      content,
    });

    await newComment.save();

    await PostModel.findByIdAndUpdate(postId, { $inc: { comment_count: 1 } });

    if (authorId !== post.author_id.toString()) {
      await createNotification(post.author_id.toString(), {
        actor_id: authorId,
        type: 'new_comment',
        target_entity_type: 'Post',
        target_entity_id: postId,
        content: newComment.content.substring(0, 50),
      });
    }

    res.status(201).json({ message: 'Comment created successfully', comment: newComment });
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        res.status(400).json({ message: 'Validation Error', errors: (error as any).errors });
        return;
      }
      if ((error as any).kind === 'ObjectId' && (error as any).path === '_id') {
        res.status(400).json({ message: "Invalid Post ID format." });
        return;
      }
    }
    res.status(500).json({ message: 'Internal server error while creating comment.' });
  }
};

export const getCommentsByPost = async (req: GetCommentsByPostRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    const postExists = await PostModel.findById(postId).select('_id');
    if (!postExists) {
      res.status(404).json({ message: "Post not found." });
      return;
    }

    const skip = (page - 1) * limit;

    const comments = await CommentModel.find({ post_id: postId })
      .populate('author_id', 'username profile_picture_url first_name last_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await CommentModel.countDocuments({ post_id: postId });

    res.status(200).json({
      message: 'Comments fetched successfully',
      comments,
      page,
      limit,
      totalPages: Math.ceil(totalComments / limit),
      totalCount: totalComments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    if (error instanceof Error && (error as any).kind === 'ObjectId') {
      res.status(400).json({ message: "Invalid Post ID format." });
      return;
    }
    res.status(500).json({ message: 'Internal server error while fetching comments.' });
  }
};

export const updateComment = async (req: UpdateCommentRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const { id: userId } = req.auth.user;

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found.' });
      return;
    }

    if (comment.author_id.toString() !== userId) {
      res.status(403).json({ message: 'Forbidden: You can only edit your own comments.' });
      return;
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({ message: 'Comment updated successfully', comment });
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        res.status(400).json({ message: 'Validation Error', errors: (error as any).errors });
        return;
      }
      if ((error as any).kind === 'ObjectId') {
        res.status(400).json({ message: "Invalid Comment ID format." });
        return;
      }
    }
    res.status(500).json({ message: 'Internal server error while updating comment.' });
  }
};

export const deleteComment = async (req: DeleteCommentRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const { id: userId } = req.auth.user;

    const comment = await CommentModel.findById(commentId);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found.' });
      return;
    }

    const post = await PostModel.findById(comment.post_id).select('author_id');

    if (!post) {
      res.status(404).json({ message: "Associated post not found. Cannot delete comment." });
      return;
    }

    if (comment.author_id.toString() !== userId && post.author_id.toString() !== userId) {
      res.status(403).json({ message: 'Forbidden: You do not have permission to delete this comment.' });
      return;
    }

    await CommentModel.deleteOne({ _id: commentId });
    await PostModel.findByIdAndUpdate(comment.post_id, { $inc: { comment_count: -1 } });

    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error instanceof Error && (error as any).kind === 'ObjectId') {
      res.status(400).json({ message: "Invalid Comment ID or Post ID format." });
      return;
    }
    res.status(500).json({ message: 'Internal server error while deleting comment.' });
  }
};