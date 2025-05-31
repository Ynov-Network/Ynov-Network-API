import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { Response } from 'express';
import UserModel from '@/db/schemas/users';
import FollowModel from '@/db/schemas/follows';
import type {
  UserByIdRequest,
  UserByUsernameRequest,
  UpdateUserProfileRequest,
  FollowUnfollowRequest,
  GetFollowsListRequest,
  SearchUsersRequest,
} from './request-types';
import mongoose from 'mongoose';

// models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// Helper to select public user fields
const publicUserFields = 'username profile_picture_url bio follower_count following_count post_count date_joined _id';

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getUserProfileById = async (req: UserByIdRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.userId).select(publicUserFields);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserProfileByUsername = async (req: UserByUsernameRequest, res: Response) => {
  try {
    const user = await UserModel.findOne({ username: req.params.username }).select(publicUserFields);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: "You can't follow/unfollow yourself" });
    }

    if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      // Send notification to the user
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ error: "Please provide both current password and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    // password should be null in response
    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    // 1,2,3,4,5,6,
    const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req: UpdateUserProfileRequest, res: Response) => {
  const authenticatedUserId = req.user?.id; // Assuming auth middleware adds user.id
  if (!authenticatedUserId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Users can only update their own profile.
  // If admin functionality is needed to update any user, req.params.userId would be used.
  // For this example, we assume user updates their own profile.

  try {
    const user = await UserModel.findById(authenticatedUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { username, bio, profile_picture_url } = req.body;

    if (username && username !== user.username) {
      const existingUser = await UserModel.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already taken' });
      }
      user.username = username;
    }
    if (bio !== undefined) user.bio = bio;
    if (profile_picture_url !== undefined) user.profile_picture_url = profile_picture_url;

    await user.save();
    return res.status(200).json({ message: 'Profile updated successfully', user: user.toJSON() });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const followUser = async (req: FollowUnfollowRequest, res: Response) => {
  const followerId = req.user?.id;
  const { userIdToFollowOrUnfollow: followingId } = req.params;

  if (!followerId) return res.status(401).json({ message: 'Unauthorized' });
  if (followerId === followingId) return res.status(400).json({ message: 'Cannot follow yourself' });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingFollow = await FollowModel.findOne({ follower_id: followerId, following_id: followingId }).session(session);
    if (existingFollow) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'Already following this user' });
    }

    const follower = await UserModel.findById(followerId).session(session);
    const following = await UserModel.findById(followingId).session(session);

    if (!follower || !following) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'User not found' });
    }

    await FollowModel.create([{ follower_id: followerId, following_id: followingId }], { session });

    follower.following_count += 1;
    following.follower_count += 1;

    await follower.save({ session });
    await following.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: `Successfully followed ${following.username}` });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error following user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const unfollowUser = async (req: FollowUnfollowRequest, res: Response) => {
  const followerId = req.user?.id;
  const { userIdToFollowOrUnfollow: followingId } = req.params;

  if (!followerId) return res.status(401).json({ message: 'Unauthorized' });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const followDoc = await FollowModel.findOneAndDelete({ follower_id: followerId, following_id: followingId }).session(session);

    if (!followDoc) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Not following this user' });
    }

    const follower = await UserModel.findById(followerId).session(session);
    const following = await UserModel.findById(followingId).session(session);

    if (follower) {
      follower.following_count = Math.max(0, follower.following_count - 1);
      await follower.save({ session });
    }
    if (following) {
      following.follower_count = Math.max(0, following.follower_count - 1);
      await following.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: `Successfully unfollowed user` });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error unfollowing user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserFollowers = async (req: GetFollowsListRequest, res: Response) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);
  const skip = (page - 1) * limit;

  try {
    const userExists = await UserModel.findById(userId);
    if (!userExists) return res.status(404).json({ message: 'User not found' });

    const followersRelations = await FollowModel.find({ following_id: userId })
      .populate('follower_id', publicUserFields)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const followers = followersRelations.map(relation => relation.follower_id);
    const totalFollowers = await FollowModel.countDocuments({ following_id: userId });

    return res.status(200).json({
      data: followers,
      page,
      limit,
      totalPages: Math.ceil(totalFollowers / limit),
      totalFollowers,
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserFollowing = async (req: GetFollowsListRequest, res: Response) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);
  const skip = (page - 1) * limit;

  try {
    const userExists = await UserModel.findById(userId);
    if (!userExists) return res.status(404).json({ message: 'User not found' });

    const followingRelations = await FollowModel.find({ follower_id: userId })
      .populate('following_id', publicUserFields)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 });

    const following = followingRelations.map(relation => relation.following_id);
    const totalFollowing = await FollowModel.countDocuments({ follower_id: userId });

    return res.status(200).json({
      data: following,
      page,
      limit,
      totalPages: Math.ceil(totalFollowing / limit),
      totalFollowing,
    });
  } catch (error) {
    console.error('Error fetching following list:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchUsers = async (req: SearchUsersRequest, res: Response) => {
  const { q, page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    // Basic search by username. Can be extended to search by other fields or use text indexes.
    const users = await UserModel.find({
      username: { $regex: q, $options: 'i' } // Case-insensitive regex search
    })
      .select(publicUserFields)
      .skip(skip)
      .limit(Number(limit));

    const totalUsers = await UserModel.countDocuments({
      username: { $regex: q, $options: 'i' }
    });

    return res.status(200).json({
      data: users,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalUsers / Number(limit)),
      totalUsers,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
