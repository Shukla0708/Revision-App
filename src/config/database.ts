import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const MONGODB_URL: string = process.env.MONGODB_URL || ' ';

export const connect = () => {
    mongoose
        .connect(MONGODB_URL)
        .then(()=>console.log(`DB Connection Success`))
        .catch((err) => {
            console.log(`DB Connection Failed` );
            console.log(err.message);
            process.exit(1);
        });
};