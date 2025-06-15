import { z } from 'zod/v4';

export const userIdParamsSchema = z.object({
  userId: z.string().min(1, "User ID cannot be empty."), // Assuming IDs are strings (like UUIDs from your models)
});

export const updateUserSchema = z.strictObject({
  first_name: z.string().min(3, "Must be at least 3 characters").max(50).optional(),
  last_name: z.string().min(3, "Must be at least 3 characters").max(50).optional(),
  username: z.string().min(3, "Must be at least 3 characters").max(20).optional(),
  bio: z.string().max(160).optional().nullable(),
  country: z.string().max(50).optional().nullable(),
  city: z.string().max(50).optional().nullable(),
});

export const updatePrivacySettingsSchema = z.strictObject({
  account_privacy: z.enum(['public', 'private', 'followers_only']).optional(),
});


export const updateProfilePictureSchema = z.object({
  image: z.string().startsWith('data:image/', { message: "Must be a valid base64 image string" }),
});

export const deleteUserSchema = z.object({
  password: z.string().min(8, "Must be at least 8 characters"),
});

export const getSuggestedUsersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(10),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type UpdateUserRequestBody = z.infer<typeof updateUserSchema>;
export type UpdatePrivacySettingsRequestBody = z.infer<typeof updatePrivacySettingsSchema>;
export type UpdateProfilePictureRequestBody = z.infer<typeof updateProfilePictureSchema>;
export type DeleteUserRequestBody = z.infer<typeof deleteUserSchema>;
export type GetSuggestedUsersQuery = z.infer<typeof getSuggestedUsersQuerySchema>;