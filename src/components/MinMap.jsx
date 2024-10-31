import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow from 'react-flow-renderer';

const MindMap = () => {
  const [file, setFile] = useState(null);
  const [mindMapData, setMindMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    
    const formData = new FormData();
    formData.append('pdf', file);

    // Retrieve token from local storage (or wherever you store it)
    const token = localStorage.getItem('token'); // Adjust this according to your storage method

    try {
      const response = await fetch('https://backend-summifyai.onrender.com/api/pdf_mindmap/', {
        method: 'POST',
        // Only add Authorization header if token exists
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const data = await response.json();
      setMindMapData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Upload PDF for Mind Map Generation</h1>
      <form onSubmit={handleUpload} className="mb-4">
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-2" />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </form>

      {mindMapData && (
        <div className="w-full h-full">
          <h2 className="text-xl font-bold mb-2">Mind Map:</h2>
          <ReactFlow
            elements={mindMapData.nodes.map((node) => ({
              id: node.id,
              data: { label: node.text },
              position: { x: Math.random() * 100, y: Math.random() * 100 }, // Random position
            }))}
            style={{ height: '500px' }}
          />
        </div>
      )}
    </div>
  );
};

export default MindMap;
