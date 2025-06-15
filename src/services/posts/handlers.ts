import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import type {
	CreatePostRequest,
	UpdatePostRequest,
	DeletePostRequest,
	GetPostRequest,
	GetPostsByUserRequest
} from './request-types';
import PostModel from '@/db/schemas/posts';
import UserModel, { User } from '@/db/schemas/users';
import HashtagModel from '@/db/schemas/hashtags';
import LikeModel from '@/db/schemas/likes';
import CommentModel from '@/db/schemas/comments';
import FollowModel from '@/db/schemas/follows';
import SavedPostModel from '@/db/schemas/saved_posts';

// Helper function to find/create hashtags and return their IDs
async function upsertHashtags(tagNames: string[]): Promise<Types.ObjectId[]> {
	if (!tagNames || tagNames.length === 0) {
		return [];
	}

	const uniqueTagNames = [...new Set(tagNames.map(tag => tag.toLowerCase().trim()).filter(Boolean))];

	const operations = uniqueTagNames.map(tagName => ({
		updateOne: {
			filter: { tag_name: tagName },
			update: { $setOnInsert: { tag_name: tagName } },
			upsert: true,
		}
	}));

	if (operations.length > 0) {
		await HashtagModel.bulkWrite(operations);
	}

	const hashtags = await HashtagModel.find({ tag_name: { $in: uniqueTagNames } }).select('_id');
	return hashtags.map(h => h._id);
}

// Helper function to update hashtag counts
async function updateHashtagCounts(added: Types.ObjectId[], removed: Types.ObjectId[]) {
	if (added.length > 0) {
		await HashtagModel.updateMany({ _id: { $in: added } }, { $inc: { post_count: 1 } });
	}
	if (removed.length > 0) {
		await HashtagModel.updateMany({ _id: { $in: removed } }, { $inc: { post_count: -1 } });
	}
}

const enrichPostsWithUserContext = async (posts: any[], userId?: string) => {
	const populatedPosts = await PostModel.populate(posts, [
		{ path: 'author_id', select: 'username profile_picture_url first_name last_name' },
		{ path: 'media_items.media_id' },
		{ path: 'hashtags', select: 'tag_name' }
	]);

	const finalPosts = populatedPosts.map(p => ({
		...p,
		hashtags: p.hashtags.map((h: any) => h.tag_name)
	}));

	if (!userId) {
		return finalPosts.map(post => ({
			...post,
			is_liked: false,
			is_saved: false,
		}));
	}

	const postIds = finalPosts.map(p => p._id);
	const likedPosts = await LikeModel.find({ user_id: userId, post_id: { $in: postIds } }).select('post_id').lean();
	const savedPosts = await SavedPostModel.find({ user_id: userId, post_id: { $in: postIds } }).select('post_id').lean();

	const likedPostIds = new Set(likedPosts.map(lp => lp.post_id.toString()));
	const savedPostIds = new Set(savedPosts.map(sp => sp.post_id.toString()));

	return finalPosts.map(post => ({
		...post,
		is_liked: likedPostIds.has(post._id.toString()),
		is_saved: savedPostIds.has(post._id.toString()),
	}));
};

export const createPost = async (req: CreatePostRequest, res: Response) => {
	try {
		const { content, visibility, media_items, hashtags } = req.body;
		const { id: userId } = req.auth.user;

		if (!content && (!media_items || media_items.length === 0)) {
			res.status(400).json({ message: 'Post must have content or media.' });
			return;
		}

		const hashtagIds = await upsertHashtags(hashtags || []);

		const newPost = new PostModel({
			author_id: userId,
			content,
			visibility,
			media_items: media_items || [],
			hashtags: hashtagIds,
		});

		await newPost.save();
		await UserModel.findByIdAndUpdate(userId, { $inc: { post_count: 1 } });

		await updateHashtagCounts(hashtagIds, []);

		// To return the post with author details, populate it:
		const populatedPost = await PostModel.findById(newPost._id)
			.populate('author_id', 'username profile_picture_url first_name last_name'); // Select specific fields

		res.status(201).json({ message: 'Post created successfully', post: populatedPost });
	} catch (error) {
		console.error('Error creating post:', error);
		res.status(500).json({ message: 'Internal server error while creating post.' });
	}
};

export const getPostById = async (req: GetPostRequest, res: Response) => {
	try {
		const { postId } = req.params;
		const post = await PostModel.findById(postId)
			.populate<{ author_id: User }>('author_id', 'username profile_picture_url first_name last_name account_privacy');

		if (!post) {
			res.status(404).json({ message: "Post not found" });
			return;
		}

		const currentUserId = req.auth?.user?.id;
		const author = post.author_id;

		if (!author) {
			res.status(404).json({ message: "Post author not found." });
			return;
		}

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

		const enrichedPost = await enrichPostsWithUserContext([post], currentUserId);

		res.status(200).json(enrichedPost[0]);
	} catch (error) {
		console.error('Error fetching post:', error);
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

		const oldHashtagIds = post.hashtags.map(id => new Types.ObjectId(id));

		if (updateData.content !== undefined) post.content = updateData.content;
		if (updateData.visibility) post.visibility = updateData.visibility;
		if (updateData.media_items) post.media_items = updateData.media_items as any;

		let newHashtagIds: Types.ObjectId[] = oldHashtagIds;
		if (updateData.hashtags) {
			newHashtagIds = await upsertHashtags(updateData.hashtags);
			post.hashtags = newHashtagIds as any;
		}

		if (!post.content && (!post.media_items || post.media_items.length === 0)) {
			res.status(400).json({ message: 'Post must have content or media after update.' });
			return;
		}

		await post.save();

		const addedIds = newHashtagIds.filter(id => !oldHashtagIds.some(oldId => oldId.equals(id)));
		const removedIds = oldHashtagIds.filter(id => !newHashtagIds.some(newId => newId.equals(id)));
		await updateHashtagCounts(addedIds, removedIds);

		// Populate author details for the response
		const populatedPost = await PostModel.findById(post._id)
			.populate('author_id', 'username profile_picture_url first_name last_name');

		res.status(200).json({ message: 'Post updated successfully', post: populatedPost });
	} catch (error) {
		console.error('Error updating post:', error);
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
			await updateHashtagCounts([], deletedPost.hashtags);
		}

		await LikeModel.deleteMany({ post_id: postId });
		await CommentModel.deleteMany({ post_id: postId });

		res.status(200).json({ message: 'Post deleted successfully.' });
	} catch (error) {
		console.error('Error deleting post:', error);
		res.status(500).json({ message: 'Internal server error while deleting post.' });
	}
};

export const getPostsByUser = async (req: GetPostsByUserRequest, res: Response) => {
	try {
		const { userId } = req.params;
		const page = Number.parseInt(req.query?.page || '1', 10);
		const limit = Number.parseInt(req.query?.limit || '10', 10);
		const skip = (page - 1) * limit;

		const posts = await PostModel.find({ author_id: userId })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean();

		const totalPosts = await PostModel.countDocuments({ author_id: userId });

		const currentUserId = req.auth?.user?.id;
		const enrichedPosts = await enrichPostsWithUserContext(posts, currentUserId);

		res.status(200).json({
			posts: enrichedPosts,
			page,
			limit,
			totalPages: Math.ceil(totalPosts / limit),
			totalCount: totalPosts,
		});
	} catch (error) {
		console.error('Error fetching post:', error);
		res.status(500).json({ message: 'Internal server error while fetching user posts.' });
	}
};