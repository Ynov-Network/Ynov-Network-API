import type { Response } from 'express';
import type {
	CreatePostRequest,
	UpdatePostRequest,
	DeletePostRequest,
	GetPostRequest
} from './request-types';
import PostModel from '@/db/schemas/posts';
import UserModel from '@/db/schemas/users';
import HashtagModel from '@/db/schemas/hashtags';
import LikeModel from '@/db/schemas/likes';
import CommentModel from '@/db/schemas/comments';
import FollowModel from '@/db/schemas/follows';

// Helper function to manage hashtag counts (remains the same)
async function manageHashtags(newHashtags: string[], oldHashtags: string[] = []) {
	const lowerNew = newHashtags.map(tag => tag.toLowerCase().trim());
	const lowerOld = oldHashtags.map(tag => tag.toLowerCase().trim());
	const added = lowerNew.filter(tag => !lowerOld.includes(tag));
	const removed = lowerOld.filter(tag => !lowerNew.includes(tag));
	for (const tagName of added) {
		if (!tagName) continue;
		await HashtagModel.findOneAndUpdate(
			{ tag_name: tagName },
			{ $inc: { post_count: 1 }, $setOnInsert: { tag_name: tagName } },
			{ upsert: true, new: true }
		);
	}
	for (const tagName of removed) {
		if (!tagName) continue;
		await HashtagModel.findOneAndUpdate(
			{ tag_name: tagName },
			{ $inc: { post_count: -1 } },
			{ new: true }
		);
	}
}

export const createPost = async (req: CreatePostRequest, res: Response) => {
	if (!req.auth.user) {
		res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
		return;
	}

	try {
		const { content, visibility, media_items, hashtags } = req.body;
		const { id: userId } = req.auth.user; // We only need the ID to set author_id

		if (!content && (!media_items || media_items.length === 0)) {
			res.status(400).json({ message: 'Post must have content or media.' });
			return;
		}

		const newPost = new PostModel({
			author_id: userId, // Set the author reference
			// author_info is no longer part of the model
			content,
			visibility,
			media_items: media_items || [],
			hashtags: hashtags ? hashtags.map(h => h.toLowerCase().trim()).filter(Boolean) : [],
		});

		await newPost.save();
		await UserModel.findByIdAndUpdate(userId, { $inc: { post_count: 1 } });

		if (hashtags && hashtags.length > 0) {
			await manageHashtags(newPost.hashtags as string[]);
		}

		// To return the post with author details, populate it:
		const populatedPost = await PostModel.findById(newPost._id)
			.populate('author_id', 'username profile_picture_url first_name last_name'); // Select specific fields

		res.status(201).json({ message: 'Post created successfully', post: populatedPost });
	} catch (error) {
		console.error('Error creating post:', error);
		if (error instanceof Error && error.name === 'ValidationError') {
			res.status(400).json({ message: 'Validation Error', errors: (error as import('mongoose').Error.ValidationError).errors });
			return;
		}
		res.status(500).json({ message: 'Internal server error while creating post.' });
	}
};

export const getPostById = async (req: GetPostRequest, res: Response) => {
	try {
		const { postId } = req.params;
		const post = await PostModel.findById(postId)
			.populate('author_id', 'username profile_picture_url first_name last_name account_privacy');

		if (!post) {
			res.status(404).json({ message: "Post not found" });
			return;
		}

		const currentUserId = req.auth?.user?.id;
		const author = post.author_id as any;

		if (author._id.toString() !== currentUserId) {
			// Rule 1: If the author's account is private, only followers can see it.
			// Return 404 to hide the post's existence from non-followers.
			if (author.account_privacy === 'private') {
				const isFollower = await FollowModel.findOne({ follower_id: currentUserId, following_id: author._id });
				if (!isFollower) {
					res.status(404).json({ message: "Post not found" });
					return;
				}
			}

			// Rule 2: If the post itself is private, only the author can see it.
			if (post.visibility === 'private') {
				res.status(404).json({ message: "Post not found" });
				return;
			}

			// Rule 3: If the post is for followers only, check the relationship.
			if (post.visibility === 'followers_only') {
				const isFollower = await FollowModel.findOne({ follower_id: currentUserId, following_id: author._id });
				if (!isFollower) {
					res.status(403).json({ message: "This post is only visible to followers." });
					return;
				}
			}
		}

		res.status(200).json(post);
	} catch (error) {
		console.error('Error fetching post:', error);
		if (error instanceof Error && (error as any).kind === 'ObjectId') {
			res.status(400).json({ message: "Invalid Post ID format." });
			return;
		}
		res.status(500).json({ message: 'Internal server error while fetching post.' });
	}
};

export const updatePost = async (req: UpdatePostRequest, res: Response) => {
	if (!req.auth.user) {
		res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
		return;
	}

	try {
		const { postId } = req.params;
		const updateData = req.body;
		const { id: userId } = req.auth.user;

		const post = await PostModel.findById(postId);

		if (!post) {
			res.status(404).json({ message: 'Post not found.' });
			return;
		}

		if (post.author_id.toString() !== userId) {
			res.status(403).json({ message: 'Forbidden: You can only edit your own posts.' });
			return;
		}

		const oldHashtags = post.hashtags ? [...post.hashtags as string[]] : [];

		if (updateData.content !== undefined) post.content = updateData.content;
		if (updateData.visibility) post.visibility = updateData.visibility;
		if (updateData.media_items) post.media_items = updateData.media_items as any;
		if (updateData.hashtags) post.hashtags = updateData.hashtags.map(h => h.toLowerCase().trim()).filter(Boolean) as any;

		// author_info is no longer updated here as it's removed from the model

		if (!post.content && (!post.media_items || post.media_items.length === 0)) {
			res.status(400).json({ message: 'Post must have content or media after update.' });
			return;
		}

		await post.save();

		if (updateData.hashtags) {
			await manageHashtags(post.hashtags as string[], oldHashtags);
		}

		// Populate author details for the response
		const populatedPost = await PostModel.findById(post._id)
			.populate('author_id', 'username profile_picture_url first_name last_name');

		res.status(200).json({ message: 'Post updated successfully', post: populatedPost });
	} catch (error) {
		console.error('Error updating post:', error);
		if (error instanceof Error && error.name === 'ValidationError') {
			res.status(400).json({ message: 'Validation Error', errors: (error as import('mongoose').Error.ValidationError).errors });
			return;
		}
		res.status(500).json({ message: 'Internal server error while updating post.' });
	}
};

export const deletePost = async (req: DeletePostRequest, res: Response) => {
	if (!req.auth.user) {
		res.status(401).json({ message: 'Unauthorized: User not authenticated.' });
		return;
	}

	try {
		const { postId } = req.params;
		const { id: userId } = req.auth.user;

		const post = await PostModel.findById(postId);

		if (!post) {
			res.status(404).json({ message: 'Post not found.' });
			return;
		}

		if (post.author_id.toString() !== userId) {
			res.status(403).json({ message: 'Forbidden: You can only delete your own posts.' });
			return;
		}

		const deletedPost = await PostModel.findByIdAndDelete(postId);
		if (!deletedPost) {
			res.status(404).json({ message: 'Post not found or already deleted.' });
			return;
		}

		await UserModel.findByIdAndUpdate(userId, { $inc: { post_count: -1 } });

		if (deletedPost.hashtags && deletedPost.hashtags.length > 0) {
			await manageHashtags([], deletedPost.hashtags as string[]);
		}

		await LikeModel.deleteMany({ post_id: postId });
		await CommentModel.deleteMany({ post_id: postId });

		res.status(200).json({ message: 'Post deleted successfully.' });
	} catch (error) {
		console.error('Error deleting post:', error);
		res.status(500).json({ message: 'Internal server error while deleting post.' });
	}
};