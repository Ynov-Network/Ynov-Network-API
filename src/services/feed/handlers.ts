import type { Response } from 'express';
import type { GetFeedRequest } from './request-types';
import PostModel from '@/db/schemas/posts';
import FollowModel from '@/db/schemas/follows';
import LikeModel from '@/db/schemas/likes';
import SavedPostModel from '@/db/schemas/saved_posts';

const enrichPostsWithUserContext = async (posts: any[], userId?: string) => {
  const populatedPosts = await PostModel.populate(posts, [
    { path: 'author_id', select: 'username profile_picture_url first_name last_name' },
    { path: 'media_items.media_id' },
    { path: 'hashtags', select: 'tag_name' }
  ]);

  const finalPosts = populatedPosts.map(p => ({
    ...p,
    hashtags: p.hashtags.map((h: any) => h.tag_name)
  }));

  if (!userId) {
    return finalPosts.map(post => ({
      ...post,
      is_liked: false,
      is_saved: false,
    }));
  }

  const postIds = finalPosts.map(p => p._id);
  const likedPosts = await LikeModel.find({ user_id: userId, post_id: { $in: postIds } }).select('post_id').lean();
  const savedPosts = await SavedPostModel.find({ user_id: userId, post_id: { $in: postIds } }).select('post_id').lean();

  const likedPostIds = new Set(likedPosts.map(lp => lp.post_id.toString()));
  const savedPostIds = new Set(savedPosts.map(sp => sp.post_id.toString()));

  return finalPosts.map(post => ({
    ...post,
    is_liked: likedPostIds.has(post._id.toString()),
    is_saved: savedPostIds.has(post._id.toString()),
  }));
};

/**
 * Generates a personalized feed for the logged-in user.
 * Fetches posts from users they follow.
 */
export const getUserFeed = async (req: GetFeedRequest, res: Response) => {
  const userId = req.auth?.user?.id;
  const page = Number.parseInt(req.query.page || '1', 10);
  const limit = Number.parseInt(req.query.limit || '10', 10);

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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await PostModel.countDocuments({
      author_id: { $in: followingIds },
      visibility: { $in: ['public', 'followers_only'] }
    });

    const enrichedPosts = await enrichPostsWithUserContext(feedPosts, userId);

    console.log({
      message: 'Feed fetched successfully',
      posts: enrichedPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      totalCount: totalPosts,
    })

    res.status(200).json({
      message: 'Feed fetched successfully',
      posts: enrichedPosts,
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
  const page = Number.parseInt(req.query.page || '1', 10);
  const limit = Number.parseInt(req.query.limit || '10', 10);
  const feedType = req.query.feedType || "For You";

  const skip = (page - 1) * limit;
  const userId = req.auth.user?.id;

  try {
    const query = { visibility: 'public' };
    let sort: any = { createdAt: -1 }; // Default sort for "For You"

    if (feedType === 'trending') {
      // More sophisticated trending would involve a scoring algorithm based on likes, comments, time, etc.
      // For simplicity, we sort by like and comment counts.
      sort = { like_count: -1, comment_count: -1, createdAt: -1 };
    }

    const posts = await PostModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author_id',
        select: 'username first_name last_name profile_picture_url'
      })
      .lean();

    const totalPosts = await PostModel.countDocuments(query);
    const enrichedPosts = await enrichPostsWithUserContext(posts, userId);

    res.status(200).json({
      message: 'Public feed fetched successfully',
      posts: enrichedPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      totalCount: totalPosts,
    });
  } catch (error) {
    console.error('Error fetching public feed:', error);
    res.status(500).json({ message: 'Internal server error while fetching public feed.' });
  }
}; 