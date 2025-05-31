// src/db/schemas/index.ts
export { default as User, type IUser } from './users';
export { default as Media, type IMedia } from './media';
export { default as Post, type IPost, type IMediaItem, type IAuthorInfo } from './posts'; // Added IAuthorInfo
export { default as Comment, type IComment } from './comments';
export { default as Like, type ILike } from './likes';
export { default as Follow, type IFollow } from './follows';
export { default as Conversation, type IConversation } from './conversations';
export { default as ConversationParticipant, type IConversationParticipant } from './conversation_participants';
export { default as Message, type IMessage } from './messages';
export { default as Notification, type INotification } from './notifications';
export { default as Hashtag, type IHashtag } from './hashtags';
export { default as Report, type IReport } from './reports';

// Better-Auth schemas
export { default as Account, type IAccount } from './accounts';
export { default as Session, type ISession } from './sessions';
export { default as Verification, type IVerification } from './verifications';
export { default as TwoFactor, type ITwoFactor } from './two_factors';
export { default as RateLimit, type IRateLimit } from './rate_limits';