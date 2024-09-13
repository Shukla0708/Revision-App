import express, { Request, Response } from "express";
import * as  database from './config/database';
import * as dotenv from "dotenv";
import authRoutes from './routes/authRoutes'
import problemRoutes from './routes/problemRoutes'
import noteRoutes from './routes/noteRoutes'



const app = express();
const port: string = process.env.PORT || '3000';
dotenv.config();

// connecting to database 
database.connect();

// routes 
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('api/problem', problemRoutes) ; 
app.use('api/note', noteRoutes)



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
