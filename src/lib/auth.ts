import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getNativeClient } from "@/db";

// BetterAuth configuration
import { openAPI, twoFactor } from "better-auth/plugins"
import { emailOTP } from "better-auth/plugins/email-otp";
import { sendMail } from "../services/email/email";
import config from "@/config/config";

export const auth = betterAuth({
  database: mongodbAdapter(await getNativeClient()),
  appName: "YNetwork",
  baseURL: config.betterAuth.url,
  basePath: "/api/better-auth",
  trustedOrigins: [config.server.corsOrigins || "http://localhost:5173"],
  user: {
    modelName: "users",
    fields: {
      name: "username",
      email: "university_email",
      emailVerified: "email_verified",
      image: "profile_picture_url",
    },
    additionalFields: {
      firstName: { fieldName: "first_name", type: "string", input: true, required: true, returned: true },
      lastName: { fieldName: "last_name", type: "string", input: true, required: true, returned: true },
      country: { fieldName: "country", type: "string", input: true, required: false, returned: true },
      city: { fieldName: "city", type: "string", input: true, required: false, returned: true },
      bio: { fieldName: "bio", type: "string", input: true, required: false, returned: true },
      phoneNumber: { fieldName: "phone_number", type: "string", input: true, required: false, returned: true },
      dateJoined: { fieldName: "date_joined", type: "date", input: true, required: false, defaultValue: new Date() },
      lastLogin: { fieldName: "last_login", type: "date", input: true, required: false },
      privacySettings: { fieldName: "privacy_settings", type: "string[]", input: true, required: false },
      role: { fieldName: "role", type: "string", defaultValue: "student", input: true, required: false, returned: true },
      followerCount: { fieldName: "follower_count", type: "number", input: true, required: false, defaultValue: 0 },
      followingCount: { fieldName: "following_count", type: "number", input: true, required: false, defaultValue: 0 },
      postCount: { fieldName: "post_count", type: "number", input: true, required: false, defaultValue: 0 },
      accountPrivacy: { fieldName: "account_privacy", type: "string", defaultValue: "public", required: false, input: true, returned: true },
      twoFactorEnabled: { fieldName: "two_factor_enabled", type: "boolean", defaultValue: false, input: true, required: false },
    },
    deleteUser: {
      enabled: true
    },
    changeEmail: {
      enabled: true,
    },
  },
  account: {
    modelName: "accounts",
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      scope: "scope",
      idToken: "id_token",
    },
    accountLinking: {
      enabled: true,
    }
  },
  session: {
    modelName: "sessions",
    fields: {
      userId: "user_id",
      token: "token",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
    },
    expiresIn: 1209600, // 14 days (instead of 7)
    updateAge: 43200, // 12 hours (instead of 1 day)
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 1800 // 30 minutes (instead of 5)
    }
  },
  verification: {
    modelName: "verifications",
    fields: {
      identifier: "identifier",
      value: "value",
      expiresAt: "expires_at",
    },
  },

  // Email configuration
  emailVerification: {
    expiresIn: 60 * 60,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(config.betterAuth.url)
      console.log(url)
      await sendMail({
        to: user.email, // Changed from user.email
        subject: "Verify Your YNetwork Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to YNetwork!</h2>
            <p>Hello ${user.name || 'there'},</p> <!-- Changed from user.name, added fallback -->
            <p>Please verify your school email address to complete your registration.</p>
            <p><a href="${url}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>This verification is required to ensure only school members can access the platform.</p>
            <hr>
            <p><small>YNetwork - Your School's Social Platform</small></p>
          </div>
        `,
      });
    },
  },
  emailAndPassword: {
    minPasswordLength: 8,
    maxPasswordLength: 64,
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email, // Changed from user.email
        subject: "Reset Your YNetwork Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hello ${user.name || 'there'},</p> <!-- Changed from user.name, added fallback -->
            <p>You requested to reset your password for your YNetwork account.</p>
            <p><a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p><small>YNetwork - Your School's Social Platform</small></p>
          </div>
        `,
      });
    }
  },
  // Social OAuth providers
  socialProviders: {
    microsoft: {
      clientId: config.providers.microsoft.clientId,
      clientSecret: config.providers.microsoft.clientSecret,
      tenantId: config.providers.microsoft.tenantId || "common",
      redirectURI: `${config.betterAuth.url}/api/better-auth/callback/microsoft`,
      // Restrict to your school's tenant if possible
    },
    github: {
      clientId: config.providers.github.clientId,
      clientSecret: config.providers.github.clientSecret,
    },
    google: {
      prompt: "select_account", 
      clientId: config.providers.google.clientId,
      clientSecret: config.providers.google.clientSecret,
    },
  },

  // Advanced security options
  advanced: {
    ipAddress: {
      ipAddressHeaders: [
        "cf-connecting-ip",      // Cloudflare
        "x-real-ip",             // Nginx
        "x-forwarded-for",       // Load balancers
        "x-client-ip"            // Other proxies
      ],
      disableIpTracking: false // Keep enabled for security
    },
    cookies: {
      session_token: {
        name: "ynetwork_session",
        attributes: {
          httpOnly: true,
          secure: false,
          sameSite: "lax", // Better for social features
          maxAge: 1209600, // 14 days (matches session config)
        }
      }
    },
    defaultCookieAttributes: {
      secure: false, // Set to true in production
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1209600, // 14 days
    },
    cookiePrefix: "ynetwork",
  },

  // Plugins configuration
  plugins: [
    openAPI(),
    // Two-Factor Authentication
    twoFactor({
      issuer: "YNetwork",
      skipVerificationOnEnable: true,
      totpOptions: {
        digits: 6,
        period: 30,
      },
    }),

    // Email OTP for additional verification
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) { // email here is the input to the function, not from user object
        const subject = type === "sign-in"
          ? "YNetwork Sign-in Code"
          : "YNetwork Verification Code";

        await sendMail({
          to: email, // This email is passed directly, likely user.university_email
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your Verification Code</h2>
              <p>Your YNetwork verification code is:</p>
              <h1 style="background-color: #f8f9fa; padding: 20px; text-align: center; letter-spacing: 5px; font-family: monospace;">${otp}</h1>
              <p>This code will expire in 10 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          `,
        });
      },
      expiresIn: 60 * 10, // 10 minutes
    }),
  ],

  // CORS and security headers
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    storage: "database", // Use database for rate limiting
  },
});