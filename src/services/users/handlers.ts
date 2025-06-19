import type { Response } from 'express';
import type {
  GetUserProfileRequest,
  UpdateUserRequest,
  UpdateProfilePictureRequest,
  UpdatePrivacySettingsRequest,
  DeleteUserRequest,
  GetSuggestedUsersRequest,
  UpdateNotificationSettingsRequest
} from './request-types';
import User from '@/db/schemas/users';
import cloudinary from '@/lib/cloudinary';
import Follow from '@/db/schemas/follows';
import FollowModel from '@/db/schemas/follows';
import UserModel from '@/db/schemas/users';
import PostModel from '@/db/schemas/posts';
import CommentModel from '@/db/schemas/comments';
import LikeModel from '@/db/schemas/likes';
import SavedPostModel from '@/db/schemas/saved_posts';
import NotificationModel from '@/db/schemas/notifications';

// Helper to select public fields
const publicUserFields = 'first_name last_name username profile_picture_url bio country city follower_count following_count post_count date_joined account_privacy';

export const getUserProfile = async (req: GetUserProfileRequest, res: Response) => {
  try {
    const { userId: username } = req.params;

    const user = await UserModel.findOne({ username }).lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const requesterId = req.auth?.user?.id;

    let isFollowing = false;
    if (requesterId && requesterId !== user._id.toString()) {
      const follow = await FollowModel.findOne({ follower_id: requesterId, following_id: user._id });
      isFollowing = !!follow;
    }

    if (user.account_privacy === 'private' && user._id.toString() !== requesterId) {
      const isFollower = await Follow.findOne({ follower_id: requesterId, following_id: user._id });
      if (!isFollower) {
        res.status(403).json({ error: 'This account is private.' });
        return;
      }
    }
    // Add logic here to check privacy settings if fetching another user's profile
    res.status(200).json({ ...user, is_following: isFollowing });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getMyProfile = async (req: GetUserProfileRequest, res: Response) => {
  try {
    const userId = req.auth?.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }
    const user = await User.findById(userId).select('+university_email').lean();
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getMyProfile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getSuggestedUsers = async (req: GetSuggestedUsersRequest, res: Response) => {
  try {
    const userId = req.auth.user.id;
    const limit = Number.parseInt(req.query.limit as string || '5', 10);

    // Find users the current user is already following
    const following = await FollowModel.find({ follower_id: userId }).select('following_id');
    const followingIds = following.map(f => f.following_id);

    // Find users who are not the current user and not being followed by the current user
    const suggestedUsers = await UserModel.find({
      _id: { $nin: [...followingIds, userId] },
      account_privacy: 'public', // Suggest only public users
    })
      .sort({ follower_count: -1 }) // Suggest most popular users
      .limit(limit)
      .select('first_name last_name username profile_picture_url bio follower_count');

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    res.status(500).json({ message: 'Internal server error while fetching suggested users.' });
  }
};

export const updateUserProfile = async (req: UpdateUserRequest, res: Response) => {
  if (!req.auth?.user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  try {
    const { id: userId } = req.auth.user;
    const updateData = req.body;

    if (updateData.username) {
      const existingUser = await UserModel.findOne({ username: updateData.username, _id: { $ne: userId } });
      if (existingUser) {
        res.status(409).json({ message: 'Username is already taken.' });
        return;
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).select(publicUserFields).lean();

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateProfilePicture = async (req: UpdateProfilePictureRequest, res: Response) => {
  if (!req.auth?.user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  try {
    const userId = req.auth.user.id;
    const imageBase64 = req.body.image;

    if (!imageBase64) {
      res.status(400).json({ message: "Image data not provided." });
      return;
    }

    const user = await UserModel.findById(userId).select('profile_picture_url');
    if (user?.profile_picture_url) {
      // Extract public_id from Cloudinary URL to delete it
      const publicIdWithFolder = user.profile_picture_url.split('/').slice(-2).join('/').split('.')[0];
      if (publicIdWithFolder) {
        await cloudinary.uploader.destroy(publicIdWithFolder);
      }
    }

    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "profile_pictures",
      public_id: `${userId}_${Date.now()}`,
    });

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profile_picture_url: uploadResponse.secure_url },
      { new: true }
    ).select(publicUserFields).lean();

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Profile picture updated successfully.',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error in updateProfilePicture:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updatePrivacySettings = async (req: UpdatePrivacySettingsRequest, res: Response) => {
  if (!req.auth?.user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  try {
    const { id: userId } = req.auth.user;
    const privacySettings = req.body;

    if (Object.keys(privacySettings).length === 0) {
      res.status(400).json({ message: "No privacy settings provided." });
      return;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: privacySettings },
      { new: true }
    ).select(publicUserFields).lean();

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Privacy settings updated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error in updatePrivacySettings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateNotificationSettings = async (req: UpdateNotificationSettingsRequest, res: Response) => {
  if (!req.auth?.user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  try {
    const { id: userId } = req.auth.user;
    const notificationSettings = req.body;

    if (Object.keys(notificationSettings).length === 0) {
      res.status(400).json({ message: "No notification settings provided." });
      return;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { notification_settings: notificationSettings } },
      { new: true }
    ).select(publicUserFields).lean();

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Notification settings updated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error in updateNotificationSettings:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteUser = async (req: DeleteUserRequest, res: Response) => {
  if (!req.auth?.user) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  try {
    const { id: userId } = req.auth.user;

    // NOTE: This implementation does not verify the user's password, as that
    // functionality was handled by an external authentication service.
    // The frontend should handle any confirmation steps.

    // 1. Delete the user document
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // 2. Perform cascade deletions. This is a destructive operation.
    // In a larger system, this would be better handled by a background job.
    await PostModel.deleteMany({ author_id: userId });
    await CommentModel.deleteMany({ author_id: userId });
    await LikeModel.deleteMany({ user_id: userId });
    await FollowModel.deleteMany({ $or: [{ follower_id: userId }, { following_id: userId }] });
    await SavedPostModel.deleteMany({ user_id: userId });
    await NotificationModel.deleteMany({ $or: [{ recipient_id: userId }, { actor_id: userId }] });

    // Note: This does not revoke JWTs or sign the user out.
    // The client application is responsible for clearing local session/token
    // and redirecting the user.

    res.status(200).json({ message: 'User account and all associated data have been deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export const getLikedPostsByUser = async (req: GetUserProfileRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const likedPosts = await LikeModel.find({ user_id: userId }).select('post_id').populate({
      path: 'post_id',
      model: 'Post',
      populate: {
        path: 'author_id',
        model: 'User',
        select: 'first_name last_name username profile_picture_url'
      }
    }).lean();

    const posts = likedPosts.map(like => like.post_id).filter(Boolean);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}