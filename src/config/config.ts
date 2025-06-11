import env from "@/lib/env";

const config = {
  env: env.NODE_ENV,
  server: {
    port: env.SERVER_PORT,
    host: env.NODE_ENV === "production" ? undefined : env.SERVER_HOST,
    corsOrigins: env.CORS_ORIGINS,
  },
  database: {
    url: env.MONGO_URI, 
  },
  betterAuth: {
    secret: env.BETTER_AUTH_SECRET,
    url: env.BETTER_AUTH_URL,
  },
  mailing: {
    email: env.MAILING_EMAIL,
    password: env.MAILING_PASSWORD,
  },
  jwt: { 
    secret: env.JWT_SECRET,
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  providers: {
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      tenantId: env.MICROSOFT_TENANT_ID,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  }
};

export default config;