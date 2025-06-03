import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getNativeClient } from "@/db";

// BetterAuth configuration
import { twoFactor } from "better-auth/plugins"
import { emailOTP } from "better-auth/plugins/email-otp";
import { admin } from "better-auth/plugins/admin";
import { sendMail } from "../services/email/email";
import config from "@/config/config";

export const auth = betterAuth({
  database: mongodbAdapter(await getNativeClient()),
  appName: "ynetwork",
  user: {
    modelName: "users",
    fields: {
      name: "username",
      email: "university_email",
      emailVerified: "email_verified",
      image: "profile_picture_url",
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
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update daily
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  verification: {
    modelName: "verifications",
    fields: {
      identifier: "identifier",
      value: "value",
      expiresAt: "expires_at",
    }
  },

  // Email configuration
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
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
      redirectURI: `${process.env.BASE_URL}/api/auth/callback/microsoft`,
      // Restrict to your school's tenant if possible
    },
    github: {
      clientId: config.providers.github.clientId,
      clientSecret: config.providers.github.clientSecret,
      redirectURI: `${process.env.BASE_URL}/api/auth/callback/github`,
    },
  },

  // Advanced security options
  advanced: {

    ipAddress: {
      ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
      disableIpTracking: false
    },
    useSecureCookies: true,
    disableCSRFCheck: false,
    crossSubDomainCookies: {
      enabled: false,
    },
    cookies: {
      session_token: {
        name: "custom_session_token",
        attributes: {
          httpOnly: true,
          secure: true
        }
      }
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: true
    },
    cookiePrefix: "ynetwork",
    database: {
      generateId: () => {
        return crypto.randomUUID();
      },
    }
  },

  // Plugins configuration
  plugins: [
    // Two-Factor Authentication
    twoFactor({
      issuer: "YNetwork",
      totpOptions: {
        digits: 6,
        period: 30,
      }
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

    // Admin functionality for school administrators
    admin({
      defaultRole: "student",
      adminRoles: ["admin", "superadmin"],
      isAdmin: async (user: { role: string; }) => { // This user object comes from better-auth
        return user.role === "admin"; // Assumes better-auth user object has 'role'
      },
    }),
  ],

  // CORS and security headers
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
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