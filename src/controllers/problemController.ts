import { z } from 'zod';
import { Request, Response } from 'express';
import { IUserDocument } from '../models/user';
import { Problem, IProblemDocument } from '../models/problem';

export const problemSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    solvedAt: z.date().optional(), // Default will be Date.now in Mongoose schema
    difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
        errorMap: () => ({ message: "Difficulty must be 'Easy', 'Medium', or 'Hard'" }),
    }),
    nextReviewDate: z.date({ required_error: "Next review date is required" }),
    numberOfTimeSolved: z.number().min(0).optional(),
    notes: z.array(z.string()).optional(), // Array of Note ObjectIds (as strings)
});
export const createProblem = async (req: Request, res: Response) => {


    try {
        const user = req.user as IUserDocument; // Assuming req.user contains the authenticated user  
        const newProblem = new Problem({
            user: user._id,
            title: req.body.title,
            description: req.body.description,
            solvedAt: req.body.solvedAt,
            difficulty: req.body.difficulty,
            numberOfTimeSolved: req.body.numberOfTimeSolved
        });

        newProblem.nextDate();

        const savedProblem = await newProblem.save();
        res.status(201).json(savedProblem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }


}

export const getAllSolvedProblems = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const allProblems = await Problem.find({ user: user });

        res.status(201).json(allProblems);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }
}

export const getDailyProblems = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const allProblems: IProblemDocument[] = await Problem.find({ nextReviewDate: new Date() });

        res.status(201).json(allProblems);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }
}

export const getProblemById = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const problemId : string = req.body.id ; 
        const problem : IProblemDocument | null  = await Problem.findById(problemId);
        if(!problem){
            return res.status(401).json({ message: "Problem not found " });
        }

        res.status(201).json(problem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }
}

export const deleteProblem = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUserDocument;
        const problemId : string = req.body.id ; 
        const problem : IProblemDocument | null  = await Problem.findByIdAndDelete(problemId);
        if(!problem){
            return res.status(401).json({ message: "Problem not found " });
        }

        res.status(201).json({ message: "Problem successfully deleted" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }
}