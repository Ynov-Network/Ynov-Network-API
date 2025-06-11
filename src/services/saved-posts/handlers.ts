import type { Response } from 'express';
import type { SavePostRequest, GetSavedPostsRequest } from './request-types';
import SavedPostModel from '@/db/schemas/saved_posts';
import PostModel from '@/db/schemas/posts';

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
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  
  const skip = (page - 1) * limit;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const savedPosts = await SavedPostModel.find({ user_id: userId })
      .populate({
        path: 'post_id',
        populate: {
          path: 'author_id',
          select: 'username profile_picture_url'
        }
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const totalSavedPosts = await SavedPostModel.countDocuments({ user_id: userId });

    res.status(200).json({
      message: 'Saved posts fetched successfully',
      posts: savedPosts.map(sp => sp.post_id),
      page,
      limit,
      totalPages: Math.ceil(totalSavedPosts / limit),
      totalCount: totalSavedPosts,
    });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({ message: 'Internal server error while fetching saved posts.' });
  }
}; 