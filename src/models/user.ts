import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const JWT_SECRET: string = process.env.JWT_SECRET || ' ';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || ' ';
export interface IUserDocument extends Document {
    googleId?: string;
    email: string;
    name: string;
    password?: string;
    tokens: { accessToken: string; refreshToken: string };
    hashPassword?(): Promise<void>;
    generateAuthToken(): Promise<{ accessToken: string; refreshToken: string }>;
    problems: mongoose.Types.ObjectId[];  // References to Problem objects
    notes: mongoose.Types.ObjectId[];  // References to Note objects
}

const UserSchema = new Schema<IUserDocument>({
    googleId: { type: String },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String },
    tokens: {
        accessToken: { type: String },
        refreshToken: { type: String },
    },
    problems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
});

UserSchema.pre('save', async function (next) {
    const user = this as IUserDocument;
    if (user.isModified('password') && user.password) {
        await user.hashPassword?.();
    }
    next();
});

// Method to hash password
UserSchema.methods.hashPassword = async function () {
    const user = this as IUserDocument;
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password!, salt);
};

// Method to generate access and refresh tokens
UserSchema.methods.generateAuthToken = async function () {
    const user = this as IUserDocument;
    const accessToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ _id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    user.tokens = { accessToken, refreshToken };
    return { accessToken, refreshToken };
};


export const User = mongoose.model<IUserDocument>('User', UserSchema);
