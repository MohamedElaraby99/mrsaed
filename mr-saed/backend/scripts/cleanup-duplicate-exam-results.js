import mongoose from 'mongoose';
import ExamResult from '../models/examResult.model.js';

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

// Cleanup function
const cleanupDuplicateExamResults = async () => {
    try {
        console.log('🔄 Starting cleanup of duplicate exam results...');
        
        // Find all exam results
        const allResults = await ExamResult.find({}).sort({ createdAt: 1 });
        console.log(`📊 Found ${allResults.length} total exam results`);
        
        // Group by user, course, lessonId, and examType
        const groupedResults = {};
        const duplicates = [];
        
        allResults.forEach(result => {
            const key = `${result.user}_${result.course}_${result.lessonId}_${result.examType}`;
            
            if (!groupedResults[key]) {
                groupedResults[key] = [];
            }
            groupedResults[key].push(result);
        });
        
        // Find groups with duplicates
        Object.keys(groupedResults).forEach(key => {
            const group = groupedResults[key];
            if (group.length > 1) {
                duplicates.push(...group);
                console.log(`🔍 Found ${group.length} duplicates for key: ${key}`);
            }
        });
        
        console.log(`📊 Found ${duplicates.length} duplicate entries`);
        
        if (duplicates.length > 0) {
            // For each group, keep the most recent one and delete the rest
            Object.keys(groupedResults).forEach(key => {
                const group = groupedResults[key];
                if (group.length > 1) {
                    // Sort by createdAt (newest first)
                    group.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    
                    // Keep the first (newest) one, delete the rest
                    const toKeep = group[0];
                    const toDelete = group.slice(1);
                    
                    console.log(`✅ Keeping result ${toKeep._id} (created: ${toKeep.createdAt})`);
                    
                    toDelete.forEach(result => {
                        console.log(`🗑️ Deleting duplicate result ${result._id} (created: ${result.createdAt})`);
                    });
                    
                    // Delete the duplicates
                    const idsToDelete = toDelete.map(r => r._id);
                    if (idsToDelete.length > 0) {
                        await ExamResult.deleteMany({ _id: { $in: idsToDelete } });
                        console.log(`✅ Deleted ${idsToDelete.length} duplicate entries for key: ${key}`);
                    }
                }
            });
        }
        
        console.log('🎉 Cleanup completed successfully!');
        
    } catch (error) {
        console.error('❌ Cleanup error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run cleanup
connectDB().then(() => {
    cleanupDuplicateExamResults();
});
