import type { Response } from 'express';
import type { FollowRequest, GetFollowsRequest } from './request-types';
import FollowModel from '@/db/schemas/follows';
import UserModel from '@/db/schemas/users';
import { createNotification } from '../notifications/handlers';

export const followUser = async (req: FollowRequest, res: Response) => {
  const followerId = req.auth?.user?.id;
  const { userId: followingId } = req.params;

  if (!followerId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (followerId === followingId) {
    res.status(400).json({ message: 'You cannot follow yourself.' });
    return;
  }

  try {
    const existingFollow = await FollowModel.findOne({ follower_id: followerId, following_id: followingId });

    if (existingFollow) {
      res.status(400).json({ message: 'You are already following this user.' });
      return;
    }

    // TODO: Handle private profiles and follow requests later. For now, auto-approve.

    const newFollow = new FollowModel({ follower_id: followerId, following_id: followingId });
    await newFollow.save();

    // Use Promise.all for concurrent updates
    await Promise.all([
      UserModel.findByIdAndUpdate(followerId, { $inc: { following_count: 1 } }),
      UserModel.findByIdAndUpdate(followingId, { $inc: { follower_count: 1 } })
    ]);

    // Create a notification for the user who was followed.
    if (followerId) {
      createNotification(followingId, {
        actor_id: followerId,
        type: 'new_follower',
        target_entity_type: 'User',
        target_entity_id: followerId,
      });
    }

    res.status(200).json({ message: 'Successfully followed user.' });

  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error while following user.' });
  }
};

export const unfollowUser = async (req: FollowRequest, res: Response) => {
  const followerId = req.auth?.user?.id;
  const { userId: followingId } = req.params;

  if (!followerId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const followToDelete = await FollowModel.findOneAndDelete({ follower_id: followerId, following_id: followingId });

    if (!followToDelete) {
      res.status(400).json({ message: 'You are not following this user.' });
      return;
    }

    // Use Promise.all for concurrent updates
    await Promise.all([
      UserModel.findByIdAndUpdate(followerId, { $inc: { following_count: -1 } }),
      UserModel.findByIdAndUpdate(followingId, { $inc: { follower_count: -1 } })
    ]);

    res.status(200).json({ message: 'Successfully unfollowed user.' });

  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal server error while unfollowing user.' });
  }
};

export const getFollowers = async (req: GetFollowsRequest, res: Response) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const skip = (page - 1) * limit;

  try {
    const followers = await FollowModel.find({ following_id: userId })
      .populate('follower_id', 'username first_name last_name profile_picture_url')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const totalFollowers = await FollowModel.countDocuments({ following_id: userId });

    res.status(200).json({
      message: 'Followers fetched successfully',
      followers: followers.map(f => f.follower_id),
      page,
      limit,
      totalPages: Math.ceil(totalFollowers / limit),
      totalCount: totalFollowers,
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ message: 'Internal server error while fetching followers.' });
  }
};

export const getFollowing = async (req: GetFollowsRequest, res: Response) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  
  const skip = (page - 1) * limit;

  try {
    const following = await FollowModel.find({ follower_id: userId })
      .populate('following_id', 'username first_name last_name profile_picture_url')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const totalFollowing = await FollowModel.countDocuments({ follower_id: userId });

    res.status(200).json({
      message: 'Following list fetched successfully',
      following: following.map(f => f.following_id),
      page,
      limit,
      totalPages: Math.ceil(totalFollowing / limit),
      totalCount: totalFollowing,
    });
  } catch (error) {
    console.error('Error fetching following list:', error);
    res.status(500).json({ message: 'Internal server error while fetching following list.' });
  }
}; 