const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite', // Database file location
});

// Define User model
const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define Task model with default values
const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'New Task', // Default title
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: 'No description provided', // Default description
  },
  status: {
    type: DataTypes.ENUM('todo', 'in-progress', 'done'),
    defaultValue: 'todo', // Default status
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
  },
});

// Sync models with the database
sequelize.sync()
  .then(() => console.log('Database connected and models synced'))
  .catch(err => console.error('Database connection error:', err));

// Token Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).send('Access Denied: No token provided');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user; // Store the user in the request object
    next();
  });
};

// User Registration
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send('All fields are required');
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ firstName, lastName, email, password: hashedPassword });

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).send('Validation error: ' + error.errors.map(e => e.message).join(', '));
    }
    res.status(500).send('Error registering user: ' + error.message);
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error logging in: ' + error.message);
  }
});

// Create a Task (Protected)
app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, description, status } = req.body;

  // Use defaults if title and description are not provided
  const newTask = {
    title: title || 'New Task',
    description: description || 'No description provided',
    status: status || 'todo',
    userId: req.user.id, // Get the userId from the token
  };

  try {
    const task = await Task.create(newTask);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).send('Error creating task: ' + error.message);
  }
});

// Get All Tasks (Protected)
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    res.json(tasks);
  } catch (error) {
    res.status(500).send('Error fetching tasks: ' + error.message);
  }
});

// Update a Task (Protected)
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const [updated] = await Task.update({ title, description, status }, { where: { id, userId: req.user.id } });
    if (!updated) {
      return res.status(404).send('Task not found or unauthorized');
    }
    const updatedTask = await Task.findByPk(id);
    res.json(updatedTask);
  } catch (error) {
    res.status(400).send('Error updating task: ' + error.message);
  }
});

// Delete a Task (Protected)
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Task.destroy({ where: { id, userId: req.user.id } });
    if (!deleted) {
      return res.status(404).send('Task not found or unauthorized');
    }
    res.status(204).send('Task deleted');
  } catch (error) {
    res.status(400).send('Error deleting task: ' + error.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
