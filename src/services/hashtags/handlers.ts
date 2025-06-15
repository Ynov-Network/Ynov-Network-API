import type { Response } from 'express';
import type { GetHashtagsRequest, GetPostsByHashtagRequest } from './request-types';
import HashtagModel from '@/db/schemas/hashtags';
import PostModel from '@/db/schemas/posts';

export const getHashtags = async (req: GetHashtagsRequest, res: Response) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const sortBy = req.query.sortBy || 'popular';

  const skip = (page - 1) * limit;

  try {
    const sortOption = sortBy === 'popular' ? { post_count: -1 } : { createdAt: -1 };

    const hashtags = await HashtagModel.find()
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalHashtags = await HashtagModel.countDocuments();

    res.status(200).json({
      message: 'Hashtags fetched successfully',
      hashtags,
      page,
      limit,
      totalPages: Math.ceil(totalHashtags / limit),
      totalCount: totalHashtags,
    });
  } catch (error) {
    console.error('Error fetching hashtags:', error);
    res.status(500).json({ message: 'Internal server error while fetching hashtags.' });
  }
};

export const getPostsByHashtag = async (req: GetPostsByHashtagRequest, res: Response) => {
  const { tagName } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const skip = (page - 1) * limit;

  try {
    const posts = await PostModel.find({ hashtags: tagName.toLowerCase() })
      .populate('author_id', 'username profile_picture_url first_name last_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await PostModel.countDocuments({ hashtags: tagName.toLowerCase() });

    res.status(200).json({
      message: `Posts for #${tagName} fetched successfully`,
      posts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      totalCount: totalPosts,
    });
  } catch (error) {
    console.error(`Error fetching posts for hashtag #${tagName}:`, error);
    res.status(500).json({ message: 'Internal server error while fetching posts.' });
  }
}; 