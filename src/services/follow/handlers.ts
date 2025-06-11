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
    const userToFollow = await UserModel.findById(followingId).select('account_privacy');
    if (!userToFollow) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const existingFollow = await FollowModel.findOne({ follower_id: followerId, following_id: followingId });

    if (existingFollow) {
      res.status(400).json({ message: existingFollow.status === 'pending' ? 'A follow request is already pending.' : 'You are already following this user.' });
      return;
    }

    // Handle private profiles and follow requests
    if (userToFollow.account_privacy === 'private') {
      const newFollowRequest = new FollowModel({
        follower_id: followerId,
        following_id: followingId,
        status: 'pending',
      });
      await newFollowRequest.save();

      // Notify the user about the follow request
      await createNotification(followingId, {
        actor_id: followerId,
        type: 'new_follow_request',
        target_entity_type: 'User',
        target_entity_id: followerId,
      });

      res.status(202).json({ message: 'Follow request sent and is pending approval.' });
      return;
    }

    const newFollow = new FollowModel({ follower_id: followerId, following_id: followingId, status: 'accepted' });
    await newFollow.save();

    // Use Promise.all for concurrent updates
    await Promise.all([
      UserModel.findByIdAndUpdate(followerId, { $inc: { following_count: 1 } }),
      UserModel.findByIdAndUpdate(followingId, { $inc: { follower_count: 1 } })
    ]);

    // Create a notification for the user who was followed.
    createNotification(followingId, {
      actor_id: followerId,
      type: 'new_follower',
      target_entity_type: 'User',
      target_entity_id: followerId,
    });

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

export const getFollowRequests = async (req: GetFollowsRequest, res: Response) => {
  const userId = req.auth?.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const requests = await FollowModel.find({ following_id: userId, status: 'pending' })
      .populate('follower_id', 'username first_name last_name profile_picture_url');

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching follow requests:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const manageFollowRequest = async (req: FollowRequest, res: Response) => {
  const myId = req.auth?.user?.id;
  const { userId: requesterId } = req.params; // The ID of the user who sent the request
  const { action } = req.body as { action: 'accept' | 'reject' };

  if (!myId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (action !== 'accept' && action !== 'reject') {
    res.status(400).json({ message: 'Invalid action. Must be "accept" or "reject".' });
    return;
  }

  try {
    const followRequest = await FollowModel.findOne({ follower_id: requesterId, following_id: myId, status: 'pending' });

    if (!followRequest) {
      res.status(404).json({ message: 'Follow request not found.' });
      return;
    }

    if (action === 'reject') {
      await followRequest.deleteOne();
      res.status(200).json({ message: 'Follow request rejected.' });
      return;
    }

    if (action === 'accept') {
      followRequest.status = 'accepted';
      await followRequest.save();

      await Promise.all([
        UserModel.findByIdAndUpdate(requesterId, { $inc: { following_count: 1 } }),
        UserModel.findByIdAndUpdate(myId, { $inc: { follower_count: 1 } })
      ]);

      await createNotification(requesterId, {
        actor_id: myId,
        type: 'follow_request_accepted',
        target_entity_type: 'User',
        target_entity_id: myId,
      });

      res.status(200).json({ message: 'Follow request accepted.' });
      return;
    }
  } catch (error) {
    console.error('Error managing follow request:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}; 