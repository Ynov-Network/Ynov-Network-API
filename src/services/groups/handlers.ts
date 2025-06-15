import type { Response } from 'express';
import GroupModel from '@/db/schemas/groups';
import ConversationModel from '@/db/schemas/conversations';
import MessageModel from '@/db/schemas/messages';
import type {
  CreateGroupRequest,
  DeleteGroupRequest,
  GetGroupByIdRequest,
  GetGroupsRequest,
  JoinOrLeaveGroupRequest,
  UpdateGroupRequest
} from './request-types';
import { Types } from 'mongoose';
import FollowModel from '@/db/schemas/follows';
import { createNotification } from '../notifications/handlers';
import UserModel from '@/db/schemas/users';

export const createGroup = async (req: CreateGroupRequest, res: Response) => {
  const { id: creatorId } = req.auth.user;
  const { name } = req.body;

  try {
    const newConversation = await ConversationModel.create({
      type: 'group',
      participants: [creatorId],
      group_name: name,
      group_admin: creatorId,
    });

    const newGroup = await GroupModel.create({
      ...req.body,
      creator_id: creatorId,
      members: [creatorId],
      conversation_id: newConversation._id,
    });

    await newGroup.save();

    res.status(201).json({ message: 'Group created successfully', group: newGroup });

    // Notify followers
    (async () => {
      try {
        const followers = await FollowModel.find({ following_id: creatorId, status: 'accepted' });
        const notificationPromises = followers.map(follow => {
          if (follow.follower_id.toString() !== creatorId) {
            return createNotification(follow.follower_id.toString(), {
              actor_id: creatorId,
              type: 'new_group',
              content: newGroup.name,
              target_entity_id: newGroup._id.toString(),
              target_entity_type: 'Group',
            });
          }
          return null;
        }).filter(Boolean);

        await Promise.all(notificationPromises);
      } catch (err) {
        console.error("Error sending new group notifications:", err);
      }
    })();
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Internal server error while creating group.' });
  }
};

export const getAllGroups = async (req: GetGroupsRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page || '1', 10);
    const limit = Number.parseInt(req.query.limit || '10', 10);
    const topic = req.query.topic || "";
    const searchQuery = req.query.q || "";
    const currentUserId = req.auth.user.id;

    const skip = (page - 1) * limit;

    const query: any = {};
    if (topic) {
      query.topic = topic;
    }

    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const groups = await GroupModel.find(query)
      .populate('creator_id', 'username profile_picture_url first_name last_name')
      .populate('members', 'username first_name last_name profile_picture_url')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await GroupModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const enrichedGroups = groups.map(group => {
      const isAdmin = group.creator_id._id.toString() === currentUserId;
      const isMember = group.members.some(member => member._id.toString() === currentUserId);
      return { ...group, is_admin: isAdmin, is_member: isMember };
    });

    res.status(200).json({ groups: enrichedGroups, page, limit, totalPages, totalCount });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Internal server error while fetching groups.' });
  }
};

export const getGroupById = async (req: GetGroupByIdRequest, res: Response) => {
  try {
    const group = await GroupModel.findById(req.params.groupId)
      .populate('creator_id', 'username profile_picture_url first_name last_name')
      .populate('members', 'username first_name last_name profile_picture_url')
      .lean();

    if (!group) {
      res.status(404).json({ message: 'Group not found.' });
      return;
    }

    const currentUserId = req.auth.user.id;
    const isAdmin = group.creator_id._id.toString() === currentUserId;
    const isMember = group.members.some(member => member._id.toString() === currentUserId);

    res.status(200).json({ ...group, is_admin: isAdmin, is_member: isMember });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Internal server error while fetching group.' });
  }
};

export const updateGroup = async (req: UpdateGroupRequest, res: Response) => {
  const { id: userId } = req.auth.user;
  try {
    const group = await GroupModel.findById(req.params.groupId);
    if (!group) {
      res.status(404).json({ message: 'Group not found.' });
      return;
    }
    if (group.creator_id.toString() !== userId) {
      res.status(403).json({ message: 'Forbidden: You can only update your own groups.' });
      return;
    }

    const updatedGroup = await GroupModel.findByIdAndUpdate(
      req.params.groupId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Internal server error while updating group.' });
  }
};

export const deleteGroup = async (req: DeleteGroupRequest, res: Response) => {
  const { id: userId } = req.auth.user;
  try {
    const group = await GroupModel.findById(req.params.groupId);
    if (!group) {
      res.status(404).json({ message: 'Group not found.' });
      return;
    }
    if (group.creator_id.toString() !== userId) {
      res.status(403).json({ message: 'Forbidden: You can only delete your own groups.' });
      return;
    }

    // Transaction to ensure atomicity
    await MessageModel.deleteMany({ conversation_id: group.conversation_id });
    await ConversationModel.findByIdAndDelete(group.conversation_id);
    await GroupModel.findByIdAndDelete(req.params.groupId);

    res.status(200).json({ message: 'Group and associated conversation deleted successfully.' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Internal server error while deleting group.' });
  }
};

export const joinGroup = async (req: JoinOrLeaveGroupRequest, res: Response) => {
  const { id: userId } = req.auth.user;
  try {
    const group = await GroupModel.findByIdAndUpdate(
      req.params.groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );

    if (!group) {
      res.status(404).json({ message: 'Group not found.' });
      return;
    }

    await ConversationModel.findByIdAndUpdate(group.conversation_id, {
      $addToSet: { participants: userId },
    });

    res.status(200).json({ message: 'Successfully joined group.', group });

    // Notify existing members
    (async () => {
      try {
        const user = await UserModel.findById(userId).select('first_name last_name');
        if (!user) return;

        const membersBeforeJoin = [...group.members];
        group.members.push(new Types.ObjectId(userId));
        await group.save();

        const notificationPromises = membersBeforeJoin.map(memberId => {
          return createNotification(memberId.toString(), {
            actor_id: userId,
            type: 'group_join',
            content: group.name,
            target_entity_id: req.params.groupId,
            target_entity_type: 'Group',
          });
        });
        await Promise.all(notificationPromises);
      } catch (err) {
        console.error("Error sending group join notification:", err);
      }
    })();
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Internal server error while joining group.' });
  }
};

export const leaveGroup = async (req: JoinOrLeaveGroupRequest, res: Response) => {
  const { id: userId } = req.auth.user;
  try {
    const group = await GroupModel.findById(req.params.groupId);
    if (!group) {
      res.status(404).json({ message: 'Group not found.' });
      return;
    }
    if (group.creator_id.toString() === userId) {
      res.status(400).json({ message: 'Group creator cannot leave the group. You can delete it instead.' });
      return;
    }

    const updatedGroup = await GroupModel.findByIdAndUpdate(
      req.params.groupId,
      { $pull: { members: userId } },
      { new: true }
    );

    await ConversationModel.findByIdAndUpdate(group.conversation_id, {
      $pull: { participants: userId },
    });

    res.status(200).json({ message: 'Successfully left group.', group: updatedGroup });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Internal server error while leaving group.' });
  }
}; 