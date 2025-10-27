const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://pbv:pbv123@cluster0.hvmai7a.mongodb.net/campus-hire?retryWrites=true&w=majority');

        // Get the admin user
        const admin = await User.findOne({ email: 'admin@example.com' });
        if (!admin) {
            console.log('Admin user not found');
            return;
        }

        console.log('Admin user found:');
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('Is Approved:', admin.isApproved);
        console.log('Password Hash:', admin.password);

        // Test password comparison
        const testPassword = 'admin123';
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        console.log('Password matches:', isMatch);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error checking admin user:', error);
        process.exit(1);
    }
}

// Run the script
checkAdmin();