import { config } from "dotenv";
import { expand } from "dotenv-expand";

import { z } from "zod/v4";

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    SERVER_HOST: z.string().default("localhost"),
    SERVER_PORT: z.coerce.number().default(3000),
    CORS_ORIGINS: z.string().default("http://localhost:5173"),
    MONGO_URI: z.string().default("mongodb://localhost:27017/ynetwork"), // Renamed from DB_URL and updated default
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    MAILING_EMAIL: z.email(),
    MAILING_PASSWORD: z.string(),
    JWT_SECRET: z.string(), // Added
    CLOUDINARY_CLOUD_NAME: z.string().default(""), // Added
    CLOUDINARY_API_KEY: z.string().default(""), // Added
    CLOUDINARY_API_SECRET: z.string().default(""), // Added
    MICROSOFT_CLIENT_ID: z.string().default(""),
    MICROSOFT_CLIENT_SECRET: z.string().default(""),
    MICROSOFT_TENANT_ID: z.string().default(""),
    GOOGLE_CLIENT_ID: z.string().default(""),
    GOOGLE_CLIENT_SECRET: z.string().default(""),
    GITHUB_CLIENT_ID: z.string().default(""),
    GITHUB_CLIENT_SECRET: z.string().default(""),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

expand(config());

try {
    EnvSchema.parse(process.env);
} catch (error) {
    if (error instanceof z.ZodError) {
        let message = "Missing required values in env: \n";
        message += Object.keys(z.flattenError(error).fieldErrors).join("\n");
        const e = new Error(message);
        e.stack = "";
        throw e;
    } else {
        console.error(error);
    }
}

export default EnvSchema.parse(process.env);