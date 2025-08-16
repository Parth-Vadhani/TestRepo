const mongoose = require('mongoose');
const express = require('express');
const request = require('supertest');
const authRoutes = require('./routes/auth');

// Mock app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

async function testAdminLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://pbv:pbv123@cluster0.hvmai7a.mongodb.net/campus-hire?retryWrites=true&w=majority');
        console.log('Connected to MongoDB');

        // Test the login endpoint
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin123'
            });

        console.log('\n=== LOGIN TEST RESULTS ===');
        console.log('Status Code:', response.status);
        console.log('Response Body:', JSON.stringify(response.body, null, 2));

        if (response.status === 200) {
            console.log('\n✅ ADMIN LOGIN SUCCESSFUL!');
            console.log('Token received:', response.body.token ? 'Yes' : 'No');
            console.log('User data:', response.body.user);
        } else {
            console.log('\n❌ ADMIN LOGIN FAILED!');
            console.log('Error:', response.body.message);
        }

        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
        
    } catch (error) {
        console.error('Test error:', error);
        process.exit(1);
    }
}

// Run the test
testAdminLogin();