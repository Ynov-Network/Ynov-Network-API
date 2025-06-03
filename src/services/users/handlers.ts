import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../../db/schemas/users'; // Adjusted path
import type {
  GetUserProfileRequest,
  UpdateUserProfileRequest,
  UserActionRequest,
  AuthenticatedRequest,
  SearchUsersRequest,
} from './request-types';
import {
  objectIdStringSchema,
  searchUsersQuerySchema,
} from './validations';

const SALT_ROUNDS = 10;

export async function getCurrentUserProfileHandler(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const user = await User.findById(req.user._id).select('-password_hash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in getCurrentUserProfileHandler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUserProfileByIdHandler(req: GetUserProfileRequest, res: Response) {
  try {
    const validationResult = objectIdStringSchema.safeParse(req.params.userId);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid user ID format', errors: validationResult.error.format() });
    }
    const userId = validationResult.data;

    const user = await User.findById(userId).select('-password_hash -university_email'); // Example: hide email for public profiles
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserProfileByIdHandler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateUserProfileHandler(req: UpdateUserProfileRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const validationResult = updateUserProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Validation failed', errors: validationResult.error.format() });
    }
    const updates = validationResult.data;

    // Prevent updating certain fields directly if needed, e.g., email, role
    // delete updates.university_email;
    // delete updates.role;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select('-password_hash');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error in updateUserProfileHandler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function searchUsersHandler(req: SearchUsersRequest, res: Response) {
  try {
    const validationResult = searchUsersQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid query parameters', errors: validationResult.error.format() });
    }
    const { username, page, limit } = validationResult.data;

    const query: any = {};
    if (username) {
      query.username = { $regex: username, $options: 'i' }; // Case-insensitive search
    }

    const users = await User.find(query)
      .select('-password_hash -university_email') // Exclude sensitive info
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ username: 1 }); // Sort by username

    const totalUsers = await User.countDocuments(query);

    return res.status(200).json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    console.error('Error in searchUsersHandler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Simplified follow/unfollow: only updates counts.
// A full implementation would involve a separate 'Follows' collection or arrays in user docs.
export async function followUserHandler(req: UserActionRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const validationResult = objectIdStringSchema.safeParse(req.params.targetUserId);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid target user ID format' });
    }
    const targetUserId = validationResult.data;
    const currentUserId = req.user._id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // In a real system, you'd check if already following, perhaps in a separate Follows collection.
    // For this example, we'll just increment counts. This might lead to incorrect counts if called multiple times.
    // A robust solution needs a Follows collection to track the actual relationship.

    const currentUser = await User.findByIdAndUpdate(currentUserId, { $inc: { following_count: 1 } }, { new: true });
    const targetUser = await User.findByIdAndUpdate(targetUserId, { $inc: { follower_count: 1 } }, { new: true });

    if (!currentUser || !targetUser) {
      // Rollback if one update failed (simplified, transactions would be better)
      if (currentUser) await User.findByIdAndUpdate(currentUserId, { $inc: { following_count: -1 } });
      if (targetUser) await User.findByIdAndUpdate(targetUserId, { $inc: { follower_count: -1 } });
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: `Successfully followed ${targetUser.username}` });
  } catch (error) {
    console.error('Error in followUserHandler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function unfollowUserHandler(req: UserActionRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const validationResult = objectIdStringSchema.safeParse(req.params.targetUserId);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid target user ID format' });
    }
    const targetUserId = validationResult.data;
    const currentUserId = req.user._id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    // Similar to follow, a robust solution needs a Follows collection.
    // Decrement counts, ensuring they don't go below zero.
    const currentUser = await User.findOneAndUpdate(
      { _id: currentUserId, following_count: { $gt: 0 } },
      { $inc: { following_count: -1 } },
      { new: true }
    );
    const targetUser = await User.findOneAndUpdate(
      { _id: targetUserId, follower_count: { $gt: 0 } },
      { $inc: { follower_count: -1 } },
      { new: true }
    );

    // If counts were already 0, findOneAndUpdate returns null if condition (e.g. following_count: { $gt: 0 }) is not met.
    // Or, if the user simply wasn't found.
    // A more robust check would be to see if a follow relationship existed before decrementing.

    if (!currentUser || !targetUser) {
      // This logic might be too simple if one user exists and the other doesn't, or if counts were already 0.
      // For simplicity, we assume if either update didn't effectively run (e.g. count was 0 or user not found),
      // it's an issue or the action wasn't applicable.
      // A real system would check the existence of a follow record.
      return res.status(404).json({ message: 'User not found or not currently following/followed' });
    }

    return res.status(200).json({ message: `Successfully unfollowed ${targetUser.username}` });
  } catch (error) {
    console.error('Error in unfollowUserHandler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
