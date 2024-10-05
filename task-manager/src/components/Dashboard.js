import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css'; 
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const addtask = () => {
    navigate('/add');
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id)); 
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`); 
  };

  const handleViewDetails = (id) => {
    navigate(`/details/${id}`); 
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Retrieved Token:', token); 
        const response = await axios.get('http://localhost:5000/api/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Your Tasks</h2>
      <button onClick={addtask}>Add Task</button>
      <ul>
        {tasks.map(task => (
          <li key={task.id}> 
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <span>Status: {task.status}</span>
            <div className='button-container'>
              <button onClick={() => handleDelete(task.id)}>Delete</button>
              <button onClick={() => handleEdit(task.id)}>Edit</button>
              <button onClick={() => handleViewDetails(task.id)}>View Details</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
