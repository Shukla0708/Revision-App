import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { z } from 'zod';
import { Request, Response } from 'express';
import { User } from '../models/user';

const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || ' ';


const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})
const registerSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(6)

})

export const Register = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = registerSchema.parse(req.body);

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already registered' });

        const newUser = new User({ email, password, name });
        const tokens = await newUser.generateAuthToken();
        await newUser.save();


        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ message: 'Register successful' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }
}
export const Login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        //finding the user from db 
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        // comparing passwords 

        const isMatch: Boolean = await bcrypt.compare(password, user.password!);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const tokens = await user.generateAuthToken();

        // Set tokens as HTTP-only cookies
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ message: 'Login successful' });


    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }

}


export const RefreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    try {
        // Verify the refresh token
        const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        // Find the user associated with the refresh token
        const user = await User.findById(decoded._id);
        if (!user) return res.status(401).json({ message: 'User not found' });


        // Generate new tokens
        const tokens = await user.generateAuthToken();

        // Set the new tokens as cookies
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
}

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth callback
export const googleAuthCallback = (req: Request, res: Response) => {
    // If user authentication was successful, generate JWT tokens
    const user = req.user as any; // The user object returned from Passport

    user.generateAuthToken().then((tokens: any) => {
        // Set tokens as cookies
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.redirect('/'); // Redirect the user to the home page or dashboard
    });
};

export const Logout = (req: Request, res: Response) => {
    try {
        // Clear the JWT tokens from the cookies
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });

        // Send a success message
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during logout' });
    }
};