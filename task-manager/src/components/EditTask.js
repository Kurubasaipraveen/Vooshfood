// src/components/EditTask.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditTask = () => {
  const { id } = useParams(); 
  const [task, setTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched task data:', response.data); // Log the response data

        // Check if response data has the expected structure
        if (response.data) {
          setTask(response.data);
        } else {
          console.error('No task data found');
        }
      } catch (error) {
        console.error('Error fetching task for editing:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchTask();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tasks/${id}`, task, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/dashboard'); // Redirect back to the dashboard after saving
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading) {
    return <p>Loading task data...</p>; // Show loading state
  }
  const cancle=()=>{
    navigate('/dashboard')
  }

  return (
    <div className="edit-task-container">
      <h2>Edit Task</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={task.title} // Ensure the task title is displayed
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={task.description} // Ensure the task description is displayed
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Save Changes</button>
        <button onClick={cancle} >Cancle</button>
      </form>
    </div>
  );
};

export default EditTask;
