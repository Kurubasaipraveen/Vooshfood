import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddTask.css'; 
import { useNavigate } from 'react-router-dom';

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId'); 
    const predefinedId = 1; // Predefined ID for demonstration purposes

    try {
      const response = await axios.post('http://localhost:5000/api/tasks', {
        id: predefinedId, // Add the predefined ID to the request
        title,
        description,
        status,
        userId: userId ? Number(userId) : 1 
      });
      console.log('Task created:', response.data);
      setTitle('');
      setDescription('');
      setStatus('todo');
      setSuccessMessage('Task created successfully!'); 
      setErrorMessage(''); 
      setTimeout(() => {
        setSuccessMessage(''); 
      }, 3000);
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Error creating task:', error);
      setErrorMessage('Error creating task. Please try again.'); 
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Create Task</h2> 
        <input 
          type="text" 
          placeholder="Task Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Task Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <button type="submit">Create Task</button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>} 
      {errorMessage && <p className="error-message">{errorMessage}</p>} 
    </div>
  );
};

export default TaskForm;
