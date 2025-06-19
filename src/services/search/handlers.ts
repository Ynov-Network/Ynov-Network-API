import type { Response } from 'express';
import type { SearchRequest } from './request-types';
import UserModel, { type User } from '@/db/schemas/users';
import PostModel, { type Post } from '@/db/schemas/posts';
import HashtagModel from '@/db/schemas/hashtags';

function escapeRegex(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export const performSearch = async (req: SearchRequest, res: Response) => {
  const page = Number.parseInt(req.query.page || '1', 10);
  const limit = Number.parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const q = req.query.q || '';
  const type = req.query.type || 'all';

  try {
    const searchRegex = new RegExp(escapeRegex(q), 'i');
    let users: User[] = [];
    let posts: Post[] = [];

    // Search for users if type is 'users' or 'all'
    if (type === 'users' || type === 'all') {
      users = await UserModel.find({
        $or: [
          { username: searchRegex },
          { first_name: searchRegex },
          { last_name: searchRegex }
        ]
      }).select('first_name last_name username profile_picture_url bio follower_count')
        .limit(limit)
        .skip(skip);
    }

    // Search for posts by content or hashtag
    if (type === 'hashtags' || type === 'all') {
      const postOrConditions: any[] = [];

      if (type === 'all') {
        postOrConditions.push({ content: searchRegex });
      }

      const hashtagTerm = q.startsWith('#') ? q.substring(1) : q;
      const hashtag = await HashtagModel.findOne({ tag_name: hashtagTerm.toLowerCase() });

      if (hashtag) {
        postOrConditions.push({ hashtags: hashtag._id });
      }

      if (postOrConditions.length > 0) {
        posts = await PostModel.find({ $or: postOrConditions })
          .populate('author_id', 'username profile_picture_url first_name last_name')
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip);
      }
    }

    res.status(200).json({
      message: 'Search results fetched successfully',
      results: {
        users,
        posts,
      },
      query: { q, page, limit, type }
    });

  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ message: 'Internal server error while searching.' });
  }
}; 