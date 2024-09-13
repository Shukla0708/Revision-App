import express from 'express' ; 
import {createProblem , deleteProblem , getAllSolvedProblems , getDailyProblems , getProblemById  } from '../controllers/problemController'   ; 


const router = express.Router() ; 

router.post('/create' , createProblem) ; 
router.delete('/delete' , deleteProblem) ; 
router.get('/allProblems' , getAllSolvedProblems) ; 
router.get('/daily' , getDailyProblems) ; 
router.get('/problemById' , getProblemById) ; 

export default router ; 