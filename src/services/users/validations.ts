import { z } from 'zod/v4';

export const updateUserSchema = z.object({
  first_name: z.string().min(3, "Must be at least 3 characters").max(50).optional(),
  last_name: z.string().min(3, "Must be at least 3 characters").max(50).optional(),
  username: z.string().min(3, "Must be at least 3 characters").max(20).optional(),
  bio: z.string().max(160).optional().nullable(),
  country: z.string().max(50).optional().nullable(),
  city: z.string().max(50).optional().nullable(),
}).strict();

export const updatePrivacySettingsSchema = z.object({
  account_privacy: z.enum(['public', 'private', 'followers_only']).optional(),
}).strict();


export const updateProfilePictureSchema = z.object({
  image: z.string().startsWith('data:image/', { message: "Must be a valid base64 image string" }),
});

export const deleteUserSchema = z.object({
  password: z.string().min(8, "Must be at least 8 characters"),
});

export type UpdateUserRequestBody = z.infer<typeof updateUserSchema>;
export type UpdatePrivacySettingsRequestBody = z.infer<typeof updatePrivacySettingsSchema>;
export type UpdateProfilePictureRequestBody = z.infer<typeof updateProfilePictureSchema>;
export type DeleteUserRequestBody = z.infer<typeof deleteUserSchema>;