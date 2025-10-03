import mongoose from 'mongoose';
import Course from '../models/course.model.js';
import ExamResult from '../models/examResult.model.js';
import { getCairoNow } from '../utils/timezone.js';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mrsaed');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Migration function
const migrateExamResults = async () => {
    try {
        console.log('🔄 Starting exam results migration...');
        
        const courses = await Course.find({}).populate('instructor');
        let totalMigrated = 0;
        
        for (const course of courses) {
            console.log(`\n📚 Processing course: ${course.title}`);
            
            // Process direct lessons
            for (const lesson of course.directLessons) {
                // Process training attempts
                for (const training of lesson.trainings) {
                    for (const attempt of training.userAttempts) {
                        try {
                            // Check if result already exists
                            const existingResult = await ExamResult.findOne({
                                user: attempt.userId,
                                course: course._id,
                                lessonId: lesson._id.toString(),
                                examType: 'training'
                            });
                            
                            if (!existingResult) {
                                const examResult = new ExamResult({
                                    user: attempt.userId,
                                    course: course._id,
                                    lessonId: lesson._id.toString(),
                                    lessonTitle: lesson.title,
                                    unitId: null,
                                    unitTitle: null,
                                    examType: 'training',
                                    score: attempt.score,
                                    totalQuestions: attempt.totalQuestions,
                                    correctAnswers: attempt.score,
                                    wrongAnswers: attempt.totalQuestions - attempt.score,
                                    timeTaken: 0, // Not available in old attempts
                                    timeLimit: training.timeLimit || 30,
                                    passingScore: 50,
                                    passed: (attempt.score / attempt.totalQuestions) >= 0.5,
                                    answers: attempt.answers.map(answer => ({
                                        questionIndex: answer.questionIndex,
                                        selectedAnswer: answer.selectedAnswer,
                                        correctAnswer: training.questions[answer.questionIndex]?.correctAnswer || 0,
                                        isCorrect: answer.isCorrect
                                    })),
                                    completedAt: attempt.takenAt || getCairoNow()
                                });
                                
                                await examResult.save();
                                totalMigrated++;
                                console.log(`  ✅ Migrated training attempt for user ${attempt.userId}`);
                            }
                        } catch (error) {
                            console.error(`  ❌ Error migrating training attempt:`, error.message);
                        }
                    }
                }
                
                // Process exam attempts
                for (const exam of lesson.exams) {
                    for (const attempt of exam.userAttempts) {
                        try {
                            // Check if result already exists
                            const existingResult = await ExamResult.findOne({
                                user: attempt.userId,
                                course: course._id,
                                lessonId: lesson._id.toString(),
                                examType: 'final'
                            });
                            
                            if (!existingResult) {
                                const examResult = new ExamResult({
                                    user: attempt.userId,
                                    course: course._id,
                                    lessonId: lesson._id.toString(),
                                    lessonTitle: lesson.title,
                                    unitId: null,
                                    unitTitle: null,
                                    examType: 'final',
                                    score: attempt.score,
                                    totalQuestions: attempt.totalQuestions,
                                    correctAnswers: attempt.score,
                                    wrongAnswers: attempt.totalQuestions - attempt.score,
                                    timeTaken: 0, // Not available in old attempts
                                    timeLimit: exam.timeLimit || 30,
                                    passingScore: 50,
                                    passed: (attempt.score / attempt.totalQuestions) >= 0.5,
                                    answers: attempt.answers.map(answer => ({
                                        questionIndex: answer.questionIndex,
                                        selectedAnswer: answer.selectedAnswer,
                                        correctAnswer: exam.questions[answer.questionIndex]?.correctAnswer || 0,
                                        isCorrect: answer.isCorrect
                                    })),
                                    completedAt: attempt.takenAt || getCairoNow()
                                });
                                
                                await examResult.save();
                                totalMigrated++;
                                console.log(`  ✅ Migrated final exam attempt for user ${attempt.userId}`);
                            }
                        } catch (error) {
                            console.error(`  ❌ Error migrating final exam attempt:`, error.message);
                        }
                    }
                }
            }
            
            // Process units and their lessons
            for (const unit of course.units) {
                console.log(`  📁 Processing unit: ${unit.title}`);
                
                for (const lesson of unit.lessons) {
                    // Process training attempts
                    for (const training of lesson.trainings) {
                        for (const attempt of training.userAttempts) {
                            try {
                                // Check if result already exists
                                const existingResult = await ExamResult.findOne({
                                    user: attempt.userId,
                                    course: course._id,
                                    lessonId: lesson._id.toString(),
                                    examType: 'training'
                                });
                                
                                if (!existingResult) {
                                    const examResult = new ExamResult({
                                        user: attempt.userId,
                                        course: course._id,
                                        lessonId: lesson._id.toString(),
                                        lessonTitle: lesson.title,
                                        unitId: unit._id.toString(),
                                        unitTitle: unit.title,
                                        examType: 'training',
                                        score: attempt.score,
                                        totalQuestions: attempt.totalQuestions,
                                        correctAnswers: attempt.score,
                                        wrongAnswers: attempt.totalQuestions - attempt.score,
                                        timeTaken: 0, // Not available in old attempts
                                        timeLimit: training.timeLimit || 30,
                                        passingScore: 50,
                                        passed: (attempt.score / attempt.totalQuestions) >= 0.5,
                                        answers: attempt.answers.map(answer => ({
                                            questionIndex: answer.questionIndex,
                                            selectedAnswer: answer.selectedAnswer,
                                            correctAnswer: training.questions[answer.questionIndex]?.correctAnswer || 0,
                                            isCorrect: answer.isCorrect
                                        })),
                                        completedAt: attempt.takenAt || getCairoNow()
                                    });
                                    
                                    await examResult.save();
                                    totalMigrated++;
                                    console.log(`    ✅ Migrated training attempt for user ${attempt.userId}`);
                                }
                            } catch (error) {
                                console.error(`    ❌ Error migrating training attempt:`, error.message);
                            }
                        }
                    }
                    
                    // Process exam attempts
                    for (const exam of lesson.exams) {
                        for (const attempt of exam.userAttempts) {
                            try {
                                // Check if result already exists
                                const existingResult = await ExamResult.findOne({
                                    user: attempt.userId,
                                    course: course._id,
                                    lessonId: lesson._id.toString(),
                                    examType: 'final'
                                });
                                
                                if (!existingResult) {
                                    const examResult = new ExamResult({
                                        user: attempt.userId,
                                        course: course._id,
                                        lessonId: lesson._id.toString(),
                                        lessonTitle: lesson.title,
                                        unitId: unit._id.toString(),
                                        unitTitle: unit.title,
                                        examType: 'final',
                                        score: attempt.score,
                                        totalQuestions: attempt.totalQuestions,
                                        correctAnswers: attempt.score,
                                        wrongAnswers: attempt.totalQuestions - attempt.score,
                                        timeTaken: 0, // Not available in old attempts
                                        timeLimit: exam.timeLimit || 30,
                                        passingScore: 50,
                                        passed: (attempt.score / attempt.totalQuestions) >= 0.5,
                                        answers: attempt.answers.map(answer => ({
                                            questionIndex: answer.questionIndex,
                                            selectedAnswer: answer.selectedAnswer,
                                            correctAnswer: exam.questions[answer.questionIndex]?.correctAnswer || 0,
                                            isCorrect: answer.isCorrect
                                        })),
                                        completedAt: attempt.takenAt || getCairoNow()
                                    });
                                    
                                    await examResult.save();
                                    totalMigrated++;
                                    console.log(`    ✅ Migrated final exam attempt for user ${attempt.userId}`);
                                }
                            } catch (error) {
                                console.error(`    ❌ Error migrating final exam attempt:`, error.message);
                            }
                        }
                    }
                }
            }
        }
        
        console.log(`\n🎉 Migration completed! Total results migrated: ${totalMigrated}`);
        
    } catch (error) {
        console.error('❌ Migration error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run migration
connectDB().then(() => {
    migrateExamResults();
});
