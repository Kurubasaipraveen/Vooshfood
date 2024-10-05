import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const ViewDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token is missing. Please log in.');
        }

        console.log('Fetching task with ID:', id); 
        console.log('Token:', token);

        const response = await axios.get(`http://localhost:5000/api/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Fetched task response:', response.data); 
        setTask(response.data);
      } catch (error) {
        console.error('Error fetching task details:', error.response ? error.response.data : error.message);
        setError(error.response ? error.response.data : error.message); // Set error
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <p>Loading task details...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!task) {
    return <p>Task not found.</p>; 
  }

  return (
    <div className="view-details-container">
      <h2>Task Details</h2>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>Created at: {new Date(task.createdAt).toLocaleString()}</p>
      <button onClick={handleBack}>Back to Dashboard</button>
    </div>
  );
};

export default ViewDetails;
