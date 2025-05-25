            const express = require('express');
            const router = express.Router();
            const { registerUser, loginUser,getUserById,updateUser,deleteUser } = require('./user.controller');
            const verifyToken = require('./middleware/jwtMiddleware'); 
            const allowRoles = require('./middleware/roleMiddleware'); // Adjust path as needed


            // @route   POST /api/users/register
            router.post('/register', registerUser);

            // @route   POST /api/users/login
            router.post('/login', loginUser);

            const User = require('./user.model'); // Adjust based on your setup

            router.get('/me', verifyToken, async (req, res) => {
                try {
                const userId = req.user.userId; // Get the user ID from the JWT token
                console.log('Decoded userId from token:', userId); // Add this line to verify the userId
                
                // Use Sequelize's findByPk to fetch the user by primary key (id)
                const user = await User.findByPk(userId);
                
                if (!user) {
                    console.log('No user found for ID:', userId); // Log if the user is not found
                    return res.status(404).json({ message: 'User not found' });
                }
            
                res.status(200).json({ results: user });
                } catch (error) {
                console.error('Error fetching user info:', error);
                res.status(500).json({ message: 'Internal server error' });
                }
            });
            
            // @route   GET /api/users
        router.get('/', verifyToken, allowRoles('admin'), async (req, res) => {
        try {
            const users = await User.findAll(); // Get all users
            res.status(200).json({ results: users });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch users' });
        }
    });

            router.get('/:id',verifyToken, getUserById);

            router.put('/:id', verifyToken, allowRoles('admin'), (req, res) => {
                console.log('Authorization Header:', req.headers['authorization']);
                updateUser(req, res);
            });

            router.delete('/:id', verifyToken, allowRoles('admin'), deleteUser);

            module.exports = router;
