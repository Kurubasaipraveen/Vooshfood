import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css'; 
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const sortTasksByStatus = (tasks) => {
    return tasks.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return -1;
      if (a.status !== 'completed' && b.status === 'completed') return 1;
      return 0; 
    });
  };

  return (
    <div className="dashboard-container">
      <h2>Your Tasks</h2>
      <button onClick={addtask}>Add Task</button>
      {loading ? ( 
        <p>Loading tasks...</p>
      ) : (
        <div className="task-cards">
          {sortTasksByStatus(tasks).map(task => ( 
            <div className="task-card" key={task.id}> 
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Created at: {new Date(task.createdAt).toLocaleString()}</p>
              <div className='button-container'>
                <button className="delete-button" onClick={() => handleDelete(task.id)}>Delete</button>
                <button className="edit-button" onClick={() => handleEdit(task.id)}>Edit</button>
                <button className="details-button" onClick={() => handleViewDetails(task.id)}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
