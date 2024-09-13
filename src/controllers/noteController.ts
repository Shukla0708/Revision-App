import { z } from 'zod';
import { Request, Response } from 'express';
import { IUserDocument } from '../models/user';
import { INoteDocument, Note } from '../models/note';
import { IProblemDocument, Problem } from '../models/problem';
import { Types } from 'mongoose';

export const noteSchema = z.object({
    content: z.string().min(1, { message: "content is required" }),
    problem: z.string().min(1, { message: "Problem ID is required" }),
});
export const createNote = async (req: Request, res: Response) => {


    try {
        const user = req.user as IUserDocument; // Assuming req.user contains the authenticated user

        const body = noteSchema.parse(req.body);
        const problemId = req.body.problemId;
        const problem: IProblemDocument | null = await Problem.findById(problemId);
        if (!problem) {
            return res.status(401).json({ message: "Problem not found " });
        } const newNote = new Note({
            user: user._id,
            content: req.body.content,
            problem_id: problemId
        });

        const savedNote = await newNote.save();
        const noteId = savedNote._id as Types.ObjectId;
        problem.notes.push(noteId);
        await problem.save();

        res.status(200).json({ message: 'Note create successful' });



    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }


}

export const updateNote = async (req: Request, res: Response) => {


    try {
        const body = noteSchema.parse(req.body);
        const user = req.user as IUserDocument; // Assuming req.user contains the authenticated user

        const noteId = req.body.noteId as Types.ObjectId;

        const note: INoteDocument | null = await Note.findById(noteId);

        if (!note) {
            return res.status(401).json({ message: "Note not found " });
        }

        note.content = req.body.content;
        await note.save();
        res.status(200).json({ message: 'Note update successful' });



    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }


}

