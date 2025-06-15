import type { Response } from 'express';
import type { ToggleLikeRequest, GetLikesForPostRequest } from './request-types';
import LikeModel from '@/db/schemas/likes';
import PostModel from '@/db/schemas/posts';
import { createNotification } from '../notifications/handlers';

export const toggleLike = async (req: ToggleLikeRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { id: userId } = req.auth?.user;

    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found.' });
      return;
    }

    const existingLike = await LikeModel.findOne({ post_id: postId, user_id: userId });

    if (existingLike) {
      await LikeModel.deleteOne({ _id: existingLike._id });
      await PostModel.findByIdAndUpdate(postId, { $inc: { like_count: -1 } });
      res.status(200).json({ message: 'Post unliked successfully.', liked: false, postId });
      return;
    }

    const newLike = new LikeModel({
      post_id: postId,
      user_id: userId,
    });
    await newLike.save();
    await PostModel.findByIdAndUpdate(postId, { $inc: { like_count: 1 } });

    if (userId !== post.author_id.toString()) {
      await createNotification(post.author_id.toString(), {
        actor_id: userId,
        type: 'like',
        content: 'liked your post.',
        target_entity_id: post._id.toString(),
        target_entity_type: 'Post',
        target_entity_ref: post.content,
      });
    }

    res.status(200).json({ message: 'Post liked successfully.', liked: true, postId });
  } catch (error) {
    console.error('Error toggling like:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error while toggling like.' });
  }
};

export const getLikesForPost = async (req: GetLikesForPostRequest, res: Response) => {
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

    const likes = await LikeModel.find({ post_id: postId })
      .populate('user_id', 'username first_name last_name profile_picture_url') // Populate user details
      .sort({ createdAt: -1 }) // Assuming 'timestamps: true' in Like schema, sort by creation of like
      .skip(skip)
      .limit(limit);

    const totalLikes = await LikeModel.countDocuments({ post_id: postId });

    res.status(200).json({
      message: 'Likes fetched successfully',
      likes: likes.map(like => like.user_id), // Return user details, not the full like object
      page,
      limit,
      totalPages: Math.ceil(totalLikes / limit),
      totalCount: totalLikes,
    });

  } catch (error) {
    console.error('Error fetching likes for post:', error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error while fetching likes.' });
  }
};