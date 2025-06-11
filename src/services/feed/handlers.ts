import type { Response } from 'express';
import type { GetFeedRequest } from './request-types';
import PostModel from '@/db/schemas/posts';
import FollowModel from '@/db/schemas/follows';

/**
 * Generates a personalized feed for the logged-in user.
 * Fetches posts from users they follow.
 */
export const getUserFeed = async (req: GetFeedRequest, res: Response) => {
  const userId = req.auth?.user?.id;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const skip = (page - 1) * limit;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // 1. Find all users the current user is following
    const following = await FollowModel.find({ follower_id: userId }).select('following_id');
    const followingIds = following.map(f => f.following_id);
    followingIds.push(userId); // Include user's own posts in their feed

    // 2. Find posts from those users, respecting visibility
    const feedPosts = await PostModel.find({
      author_id: { $in: followingIds },
      visibility: { $in: ['public', 'followers_only'] }
    })
      .populate('author_id', 'username profile_picture_url first_name last_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await PostModel.countDocuments({
      author_id: { $in: followingIds },
      visibility: { $in: ['public', 'followers_only'] }
    });

    res.status(200).json({
      message: 'Feed fetched successfully',
      posts: feedPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      totalCount: totalPosts,
    });

  } catch (error) {
    console.error('Error fetching user feed:', error);
    res.status(500).json({ message: 'Internal server error while fetching feed.' });
  }
};

/**
 * Generates a public feed of the latest public posts.
 * Used for discovery or for users who are not logged in.
 */
export const getPublicFeed = async (req: GetFeedRequest, res: Response) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  
  const skip = (page - 1) * limit;

  try {
    const publicPosts = await PostModel.find({ visibility: 'public' })
      .populate('author_id', 'username profile_picture_url first_name last_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPublicPosts = await PostModel.countDocuments({ visibility: 'public' });

    res.status(200).json({
      message: 'Public feed fetched successfully',
      posts: publicPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPublicPosts / limit),
      totalCount: totalPublicPosts,
    });

  } catch (error) {
    console.error('Error fetching public feed:', error);
    res.status(500).json({ message: 'Internal server error while fetching public feed.' });
  }
}; 