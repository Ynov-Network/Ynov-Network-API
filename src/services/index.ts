import { Router } from "express";

// All services
import { authApp } from "./auth"
import { commentsApp } from "./comments";
import { postsApp } from "./posts";
import { likeApp } from "./like";
import { usersApp } from "./users";
import { savedPostsApp } from "./saved-posts";
import { messagesApp } from "./messages";
import { notificationsApp } from "./notifications";
import { feedApp } from "./feed";
import { searchApp } from "./search";
import { uploadApp } from "./upload";
import { reportsApp } from "./reports";
import { moderationApp } from "./moderation";
import { hashtagsApp } from "./hashtags";

const apiRouter = Router();

apiRouter.use("/auth", authApp);
apiRouter.use('/posts', postsApp);
apiRouter.use(commentsApp);
apiRouter.use('/likes', likeApp);
apiRouter.use('/users', usersApp);
apiRouter.use(savedPostsApp);
apiRouter.use('/conversations', messagesApp);
apiRouter.use('/notifications', notificationsApp);
apiRouter.use('/feed', feedApp);
apiRouter.use('/search', searchApp);
apiRouter.use('/upload', uploadApp);
apiRouter.use('/reports', reportsApp);
apiRouter.use('/moderation', moderationApp);
apiRouter.use('/hashtags', hashtagsApp);

export default apiRouter; 