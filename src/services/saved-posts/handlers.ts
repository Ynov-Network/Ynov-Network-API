import type { Response } from 'express';
import type { SavePostRequest, GetSavedPostsRequest } from './request-types';
import SavedPostModel from '@/db/schemas/saved_posts';
import PostModel from '@/db/schemas/posts';
import LikeModel from '@/db/schemas/likes';

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
    is_saved: true, // All posts here are saved
  }));
};

export const toggleSavePost = async (req: SavePostRequest, res: Response) => {
  const userId = req.auth?.user?.id;
  const { postId } = req.params;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found.' });
      return;
    }

    const existingSavedPost = await SavedPostModel.findOne({ user_id: userId, post_id: postId });

    if (existingSavedPost) {
      // Post is already saved, so unsave it
      await SavedPostModel.findByIdAndDelete(existingSavedPost._id);
      res.status(200).json({ message: 'Post unsaved successfully.', saved: false });
      return;
    } else {
      // Post is not saved, so save it
      const newSavedPost = new SavedPostModel({ user_id: userId, post_id: postId });
      await newSavedPost.save();
      res.status(201).json({ message: 'Post saved successfully.', saved: true });
      return;
    }
  } catch (error) {
    console.error('Error toggling save post:', error);
    res.status(500).json({ message: 'Internal server error while toggling save post.' });
  }
};

export const getSavedPosts = async (req: GetSavedPostsRequest, res: Response) => {
  const userId = req.auth?.user?.id;
  const page = Number.parseInt(req.query.page || '1', 10);
  const limit = Number.parseInt(req.query.limit || '10', 10);
  const searchQuery = req.query.q || '';

  const skip = (page - 1) * limit;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // 1. Find all post IDs that the user has saved.
    const savedPostEntries = await SavedPostModel.find({ user_id: userId }).select('post_id');
    const savedPostIds = savedPostEntries.map(sp => sp.post_id);

    if (savedPostIds.length === 0) {
      return res.status(200).json({
        message: 'No saved posts found.',
        posts: [],
        page: 1,
        limit,
        totalPages: 0,
        totalCount: 0,
      });
    }

    // 2. Build the query for the Post model.
    const query: any = {
      _id: { $in: savedPostIds }
    };

    if (searchQuery) {
      query.$or = [
        { content: { $regex: searchQuery, $options: 'i' } },
        // If you want to search by author username as well:
        // { 'author_id.username': { $regex: searchQuery, $options: 'i' } } 
        // This requires an aggregation pipeline to search on populated fields,
        // for simplicity, we'll stick to content for now.
      ];
    }

    // 3. Find the posts that match the query.
    const posts = await PostModel.find(query)
      .populate('author_id', 'username profile_picture_url first_name last_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await PostModel.countDocuments(query);

    const enrichedPosts = await enrichPostsWithUserContext(posts, userId);

    res.status(200).json({
      message: 'Saved posts fetched successfully',
      posts: enrichedPosts,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalCount: totalCount,
    });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({ message: 'Internal server error while fetching saved posts.' });
  }
}; 