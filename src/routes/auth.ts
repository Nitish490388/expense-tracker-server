import passport from 'passport';
import jwt from "jsonwebtoken";
import express, {Router, Request, Response} from "express";

const router: Router = express.Router();

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth',  session: false  }),
    (req: Request, res: Response) => {
      // Successful authentication
      const user = req.user as any;
      const secret = process.env.JWT_SECRET || "";
      const token = jwt.sign( { id: user.id, email: user.email }, secret, {
        expiresIn: "3d",
      });

      res.cookie('token', token, {
        // httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        // sameSite: 'lax', // or 'none' if cross-origin and HTTPS
        maxAge: 24 * 60 * 60 * 1000 * 3,
      });
      
      res.redirect("http://localhost:5173/cashflow")
    }
  );

  router.get('/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).send('Logout failed');
      }
      res.redirect('/');
    });
  });  

export default router;