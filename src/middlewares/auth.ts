import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { IUserDocument } from "../models/user";

export interface AuthenticatedRequest extends Request {
    user?: IUserDocument; // Add the user to the request interface
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction
) => {
    const token =
        req.cookies.accessToken || req.headers.authorization?.split(" ")[1]; // JWT from cookie or Authorization header

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
        };

        // Find the user by decoded ID
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Attach the user to the request object
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};
