import type { Response } from 'express';
import type { GetUserProfileRequest, UpdateUserRequest, UpdateProfilePictureRequest, UpdatePrivacySettingsRequest, DeleteUserRequest } from './request-types';
import User from '@/db/schemas/users';
import cloudinary from '@/lib/cloudinary';
import { APIError } from 'better-auth/api';
import { auth } from '@/lib/auth';
import { setCookieToHeader } from 'better-auth/cookies';
import Follow from '@/db/schemas/follows';

// Helper to select public fields
const publicUserFields = 'first_name last_name username profile_picture_url bio country city follower_count following_count post_count date_joined';

export const getUserProfile = async (req: GetUserProfileRequest, res: Response) => {
  try {
    const userIdToFetch = req.params.userId || req.auth?.user?.id;
    if (!userIdToFetch) {
      res.status(400).json({ error: 'User ID not provided and not logged in.' });
      return;
    }

    const user = await User.findById(userIdToFetch).select(publicUserFields);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const requesterId = req.auth?.user?.id;
    if (user.account_privacy === 'private' && user.id.toString() !== requesterId) {
      const isFollower = await Follow.findOne({ follower_id: requesterId, following_id: user.id });
      if (!isFollower) {
        res.status(403).json({ error: 'This account is private.' });
        return;
      }
    }
    // Add logic here to check privacy settings if fetching another user's profile
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    if (error instanceof APIError) {
      res.status(error.statusCode).json(error);
      return;
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getMyProfile = async (req: GetUserProfileRequest, res: Response) => {
  if (!req.auth?.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  req.params.userId = req.auth.user.id; // Set userId to the authenticated user's ID
  return getUserProfile(req, res); // Reuse the main getUserProfile logic
};

export const updateUserProfile = async (req: UpdateUserRequest, res: Response) => {
  try {
    const { first_name, last_name, username, bio, country, city } = req.body;

    const response = await auth.api.updateUser({
      body: {
        firstName: first_name,
        lastName: last_name,
        name: username,
        bio,
        country,
        city
      },
      asResponse: true,
    });

    setCookieToHeader(response.headers);
    res.status(response.status).json(response.body);

  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    if (error instanceof APIError) {
      res.status(error.statusCode).json(error.body);
      return;
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const updateProfilePicture = async (req: UpdateProfilePictureRequest, res: Response) => {
  if (!req.auth?.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  try {
    const userId = req.auth.user.id;
    const imageBase64 = req.body.image;

    if (!imageBase64) {
      res.status(400).json({ error: "Image data not provided." });
      return;
    }

    const user = await User.findById(userId).select('profile_picture_url');
    if (user?.profile_picture_url) {
      const publicIdWithFolder = user.profile_picture_url.split('/').slice(-2).join('/').split('.')[0];
      if (publicIdWithFolder) {
        await cloudinary.uploader.destroy(publicIdWithFolder);
      }
    }

    const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
      folder: "profile_pictures",
      public_id: `${userId}_${Date.now()}`,
    });

    const response = await auth.api.updateUser({
      body: { image: uploadResponse.secure_url },
      asResponse: true,
    });

    setCookieToHeader(response.headers);
    if (response.body && typeof response.body === 'object' && 'user' in response.body) {
      res.status(response.status).json({
        message: 'Profile picture updated successfully.',
        user: response.body.user
      });
      return;
    }

    res.status(response.status).json(response.body);

  } catch (error) {
    console.error('Error in updateProfilePicture:', error);
    if (error instanceof APIError) {
      res.status(error.statusCode).json(error.body);
      return;
    }
  }
};

export const updatePrivacySettings = async (req: UpdatePrivacySettingsRequest, res: Response) => {
  try {
    const { account_privacy } = req.body;

    if (!account_privacy) {
      res.status(400).json({ message: "No privacy settings provided." });
      return;
    }

    const response = await auth.api.updateUser({
      body: { accountPrivacy: account_privacy },
      asResponse: true,
    });

    setCookieToHeader(response.headers);
    res.status(response.status).json(response.body);
  } catch (error) {
    console.error('Error in updatePrivacySettings:', error);
    if (error instanceof APIError) {
      res.status(error.statusCode).json(error.body);
      return;
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const deleteUser = async (req: DeleteUserRequest, res: Response) => {
  try {
    const response = await auth.api.deleteUser({
      body: {
        password: req.body.password,
      },
      asResponse: true,
    });

    setCookieToHeader(response.headers);
    res.status(response.status).json(response.body);
  } catch (error) {
    console.error('Error in deleteUser:', error);
    if (error instanceof APIError) {
      res.status(error.statusCode).json(error.body);
      return;
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
}