import React, { useState, useEffect } from 'react';

const ContractCrud = () => {
  const [contracts, setContracts] = useState([]);
  const [formData, setFormData] = useState({
    clientName: '',
    startDate: '',
    endDate: '',
    contractValue: '',
    deliveryManager: '',
    attachment: null
  });
  const [editing, setEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contracts');
      const data = await response.json();
      setContracts(data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate' && formData.endDate && value > formData.endDate) {
      // If start date is after end date, clear end date
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
        endDate: ''
      }));
    } else if (name === 'endDate' && formData.startDate && value < formData.startDate) {
      // Don't update if end date is before start date
      return;
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'attachment' && formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else if (key !== 'attachment') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editing) {
        const response = await fetch(`http://localhost:5000/api/contracts/${currentId}`, {
          method: 'PUT',
          body: formDataToSend,
        });
        if (response.ok) {
          const updatedContract = await response.json();
          setContracts(contracts.map(contract => 
            contract._id === currentId ? updatedContract : contract
          ));
          setEditing(false);
          setCurrentId(null);
        }
      } else {
        const response = await fetch('http://localhost:5000/api/contracts', {
          method: 'POST',
          body: formDataToSend,
        });
        if (response.ok) {
          const savedContract = await response.json();
          setContracts([...contracts, savedContract]);
        }
      }
      setFormData({
        clientName: '',
        startDate: '',
        endDate: '',
        contractValue: '',
        deliveryManager: '',
        attachment: null
      });
      fetchContracts(); // Refresh the dashboard
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  const handleEdit = (contract) => {
    setEditing(true);
    setCurrentId(contract._id);
    setFormData({
      clientName: contract.clientName,
      startDate: contract.startDate.split('T')[0],
      endDate: contract.endDate.split('T')[0],
      contractValue: contract.contractValue,
      deliveryManager: contract.deliveryManager,
      attachment: null
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contracts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setContracts(contracts.filter(contract => contract._id !== id));
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      attachment: e.target.files[0]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Contract Management System</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              min={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contract Value</label>
            <input
              type="number"
              name="contractValue"
              value={formData.contractValue}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery Manager</label>
            <input
              type="text"
              name="deliveryManager"
              value={formData.deliveryManager}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Attachment</label>
            <div className="flex items-center">
              <label className="w-full cursor-pointer bg-white border rounded p-2 text-gray-500 hover:bg-gray-50">
                <span className={formData.attachment ? "text-black" : ""}>
                  {formData.attachment ? formData.attachment.name : "Choose file..."}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {editing ? 'Update Contract' : 'Add Contract'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setCurrentId(null);
                setFormData({
                  clientName: '',
                  startDate: '',
                  endDate: '',
                  contractValue: '',
                  deliveryManager: '',
                  attachment: null
                });
              }}
              className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attachment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contracts.map(contract => (
              <tr key={contract._id}>
                <td className="px-6 py-4 whitespace-nowrap">{contract.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(contract.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(contract.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">${contract.contractValue}</td>
                <td className="px-6 py-4 whitespace-nowrap">{contract.deliveryManager}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {contract.attachment && (
                    <a 
                      href={`http://localhost:5000${contract.attachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View File
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(contract)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(contract._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractCrud;
