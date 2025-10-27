const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const createDriver = async (driverData, token) => {
  const response = await fetch(`${API_URL}/api/drivers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(driverData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create driver');
  }

  return response.json();
};

export const getDrivers = async (token) => {
  const response = await fetch(`${API_URL}/api/drivers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch drivers');
  }

  return response.json();
};

export const getDriverById = async (id, token) => {
  const response = await fetch(`${API_URL}/api/drivers/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch driver');
  }

  return response.json();
};

export const updateDriver = async (id, driverData, token) => {
  const response = await fetch(`${API_URL}/api/drivers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(driverData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update driver');
  }

  return response.json();
};

export const deleteDriver = async (id, token) => {
  const response = await fetch(`${API_URL}/api/drivers/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete driver');
  }

  return response.json();
};
