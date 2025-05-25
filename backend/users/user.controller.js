const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const  User  = require('./user.model'); // or wherever you export your User model
require('dotenv').config();

// Register (Signup)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

       // ✅ Set refresh token in HttpOnly cookie
       res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true, // Use true in production (HTTPS)
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
  
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
//getUserById
const getUserById = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Find user by ID
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      res.status(200).json({ user });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
  //updateUser
  const updateUser = async (req, res) => {
    try {
      // Log the incoming request data
      console.log('Update request received for user:', req.params.id);
      console.log('Request body:', req.body);
  
      const { name, email, password, role } = req.body;
      const userId = req.params.id;
  
      // Log userId to verify the correct user is being targeted
      console.log('User ID:', userId);
  
      // Find user by ID
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Log the found user for debugging
      console.log('Found user:', user);
  
      // Update user details
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (password) {
        // Hash password if provided
        user.password = await bcrypt.hash(password, 10);
      }
  
      // Save updated user
      await user.save();
  
      // Log the updated user data
      console.log('Updated user:', user);
  
      res.status(200).json({ message: 'User updated successfully', user });
    } catch (err) {
      console.log('Error occurred:', err);  // Log error details for debugging
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
  //deleteUser
  const deleteUser = async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Find user by ID
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // Delete user    
      await user.destroy();
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser
};
