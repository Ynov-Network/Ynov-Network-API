import type { Response } from 'express';
import EventModel from '@/db/schemas/events';
import type {
  CreateEventRequest,
  DeleteEventRequest,
  GetEventByIdRequest,
  GetEventsRequest,
  JoinOrLeaveEventRequest,
  UpdateEventRequest
} from './request-types';
import FollowModel from '@/db/schemas/follows';
import { createNotification } from '../notifications/handlers';

export const createEvent = async (req: CreateEventRequest, res: Response) => {
  const creatorId = req.auth.user.id;
  const eventData = req.body;

  try {
    const newEvent = new EventModel({
      ...eventData,
      creator_id: creatorId,
      participants: [creatorId],
    });

    await newEvent.save();

    res.status(201).json({ message: 'Event created successfully', event: newEvent });

    // Notify followers in the background
    (async () => {
      try {
        const followers = await FollowModel.find({ following_id: creatorId, status: 'accepted' });
        const notificationPromises = followers.map(follow => {
          if (follow.follower_id.toString() !== creatorId) {
            return createNotification(follow.follower_id.toString(), {
              actor_id: creatorId,
              type: 'new_event',
              content: newEvent.title,
              target_entity_id: newEvent._id.toString(),
              target_entity_type: 'Event',
            });
          }
          return null;
        }).filter(Boolean);

        await Promise.all(notificationPromises);
      } catch (err) {
        console.error("Error sending new event notifications:", err);
      }
    })();

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getAllEvents = async (req: GetEventsRequest, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page || '1', 10);
    const limit = Number.parseInt(req.query.limit || '10', 10);
    const event_type = req.query.event_type || "";
    const sortBy = req.query.sortBy || "start_date";
    const searchQuery = req.query.q || "";

    const skip = (page - 1) * limit;

    const query: any = {};
    if (event_type) {
      query.event_type = event_type;
    }

    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const sortOptions: any = {};
    if (sortBy === 'createdAt') {
      sortOptions.createdAt = -1;
    } else {
      sortOptions.start_date = 1; // Default sort by upcoming
      query.end_date = { $gte: new Date() }; // Only show events that have not ended yet
    }

    const events = await EventModel.find(query)
      .populate('creator_id', 'username first_name last_name profile_picture_url')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalCount = await EventModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ events, page, limit, totalPages, totalCount });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Internal server error while fetching events.' });
  }
};

export const getEventById = async (req: GetEventByIdRequest, res: Response) => {
  try {
    const event = await EventModel.findById(req.params.eventId)
      .populate('creator_id', 'username profile_picture_url first_name last_name')
      .populate('participants', 'username profile_picture_url first_name last_name profile_picture_url');

    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Internal server error while fetching event.' });
  }
};

export const updateEvent = async (req: UpdateEventRequest, res: Response) => {
  const { id: userId } = req.auth.user;
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }
    if (event.creator_id.toString() !== userId) {
      res.status(403).json({ message: 'Forbidden: You can only update your own events.' });
      return;
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(
      req.params.eventId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Internal server error while updating event.' });
  }
};

export const deleteEvent = async (req: DeleteEventRequest, res: Response) => {
  const { id: userId } = req.auth.user;
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }
    if (event.creator_id.toString() !== userId) {
      res.status(403).json({ message: 'Forbidden: You can only delete your own events.' });
      return;
    }

    await EventModel.findByIdAndDelete(req.params.eventId);
    res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Internal server error while deleting event.' });
  }
};

export const joinEvent = async (req: JoinOrLeaveEventRequest, res: Response) => {
  const { id: userId } = req.auth.user;
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }

    if (event.participant_limit && event.participants.length >= event.participant_limit) {
      res.status(400).json({ message: 'Event has reached its participant limit.' });
      return;
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(
      req.params.eventId,
      { $addToSet: { participants: userId } },
      { new: true }
    );
    res.status(200).json({ message: 'Successfully joined event.', event: updatedEvent });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ message: 'Internal server error while joining event.' });
  }
};

export const leaveEvent = async (req: JoinOrLeaveEventRequest, res: Response) => {
  const { id: userId } = req.auth.user;
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found.' });
      return;
    }

    // Prevent the creator from leaving their own event
    if (event.creator_id.toString() === userId) {
      res.status(400).json({ message: 'Event creator cannot leave the event. You can delete it instead.' });
      return;
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(
      req.params.eventId,
      { $pull: { participants: userId } },
      { new: true }
    );
    res.status(200).json({ message: 'Successfully left event.', event: updatedEvent });
  } catch (error) {
    console.error('Error leaving event:', error);
    res.status(500).json({ message: 'Internal server error while leaving event.' });
  }
}; 