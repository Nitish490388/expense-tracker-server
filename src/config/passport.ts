import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

const prisma = new PrismaClient();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "https://karnival-kings-server.onrender.com/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      // Code to handle user authentication and retrieval
      try {
        const email = profile.emails?.[0].value;
        const name = profile.displayName;
        const profilePic = profile.photos?.[0].value;

        if (!email)
          return done(new Error("No email found in Google profile"), false);
        let player = await prisma.player.findFirst({
          where: {
            name,
            email,
          },
        });

        if (!player) {
          player = await prisma.player.create({
            data: {
              email,
              name,
              profilePic,
            },
          });
        }
        console.log(email, name, profilePic);
        done(null, player);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.player.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error, false);
  }
});
