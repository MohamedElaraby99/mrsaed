import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mrsaed');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

const createSuperAdmin = async () => {
  try {
    await connectToDb();
    
    // Super admin data
    const superAdminData = {
      fullName: 'Super Administrator',
      phoneNumber: '01234567890',
      password: '123456789',
      role: 'SUPER_ADMIN',
      adminPermissions: [
        'CREATE_ADMIN',
        'DELETE_ADMIN', 
        'MANAGE_USERS',
        'MANAGE_COURSES',
        'MANAGE_PAYMENTS',
        'VIEW_ANALYTICS'
      ],
      isActive: true
    };
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (existingSuperAdmin) {
      console.log('⚠️ Super admin already exists:', existingSuperAdmin.phoneNumber || existingSuperAdmin.email);
      console.log('👑 Role:', existingSuperAdmin.role);
      console.log('🔄 Updating credentials...');
      
      // Update existing super admin with new credentials
      existingSuperAdmin.phoneNumber = superAdminData.phoneNumber;
      existingSuperAdmin.email = undefined; // Remove email if it exists
      existingSuperAdmin.password = superAdminData.password;
      await existingSuperAdmin.save();
      
      console.log('✅ Super admin credentials updated successfully!');
      console.log('📱 New Phone Number:', existingSuperAdmin.phoneNumber);
      console.log('🔐 New Password:', superAdminData.password);
      console.log('👑 Role:', existingSuperAdmin.role);
      console.log('🔑 Permissions:', existingSuperAdmin.adminPermissions);
      console.log('\n💡 You can now login with these credentials');
      console.log('🌐 Go to: http://localhost:5173/login');
      
      process.exit(0);
    }

    const superAdmin = new User(superAdminData);
    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log('📱 Phone Number:', superAdmin.phoneNumber);
    console.log('🔐 Password:', superAdminData.password);
    console.log('👑 Role:', superAdmin.role);
    console.log('🔑 Permissions:', superAdmin.adminPermissions);
    console.log('\n💡 You can now login with these credentials');
    console.log('🌐 Go to: http://localhost:5173/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
