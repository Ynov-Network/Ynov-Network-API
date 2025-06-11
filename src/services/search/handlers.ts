import type { Response } from 'express';
import type { SearchRequest } from './request-types';
import UserModel, { User } from '@/db/schemas/users';
import PostModel, { Post } from '@/db/schemas/posts';

export const performSearch = async (req: SearchRequest, res: Response) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const skip = (page - 1) * limit;
  
  const q = req.query.q || '';
  const type = req.query.type || 'all';

  try {
    const searchRegex = new RegExp(q, 'i'); // Case-insensitive regex
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

    // Search for posts by hashtag if type is 'hashtags' or 'all'
    if (type === 'hashtags' || type === 'all') {
      posts = await PostModel.find({ hashtags: q.toLowerCase() })
        .populate('author_id', 'username profile_picture_url first_name last_name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);
    }

    // Note: Pagination across different collections like this is complex.
    // For a simple 'all' search, we return separate lists. A more advanced
    // implementation might involve aggregating results.

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