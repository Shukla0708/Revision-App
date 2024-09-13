import mongoose, { Document, Schema } from 'mongoose';

export interface INoteDocument extends Document {
    content: string;
    user: mongoose.Types.ObjectId;  // Reference to the User
    problem_id: mongoose.Types.ObjectId;  // Reference to the Problem
}

const NoteSchema = new Schema<INoteDocument>({
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problem_id: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
} , {timestamps : true});

export const Note = mongoose.model<INoteDocument>('Note', NoteSchema);
