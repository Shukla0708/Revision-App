import mongoose, { Document, Schema } from 'mongoose';

export interface IProblemDocument extends Document {
    title: string;
    description: string;
    solvedAt: Date;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    nextReviewDate: Date;
    numberOfTimeSolved: number;
    user: mongoose.Types.ObjectId;  // Reference to the User
    notes: mongoose.Types.ObjectId[];  // Reference to related Notes
    nextDate(): Promise<void>;
}

const ProblemSchema = new Schema<IProblemDocument>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    solvedAt: { type: Date, default: Date.now },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    nextReviewDate: { type: Date, required: true },
    numberOfTimeSolved: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
});

ProblemSchema.methods.nextDate = async function () {
    let problem = this as IProblemDocument;
    let solvedDate = problem.solvedAt;
    let x = problem.numberOfTimeSolved;
    let daysTOAdd = 0;

    switch (x) {
        case 1:
            daysTOAdd = 1;
            break;
        case 2:
            daysTOAdd = 5;
            break;
        case 3:
            daysTOAdd = 10;
            break;

        default:
            daysTOAdd = 15;
            break;
    }

    problem.nextReviewDate = new Date(solvedDate.getDate() + daysTOAdd);
}


export const Problem = mongoose.model<IProblemDocument>('Problem', ProblemSchema);
