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

/**
 * Bulk import drivers using the optimized backend endpoint
 * This replaces the old sequential approach with a single API call
 * Maximum 100 drivers per import
 */
export const bulkImportDrivers = async (driversData, token) => {
  console.log(`🚀 Starting bulk import of ${driversData.length} drivers via /bulk-import endpoint`);

  // Validate batch size on client side
  if (driversData.length > 100) {
    throw new Error('Cannot import more than 100 drivers at once');
  }

  // Transform data to match backend schema
  const drivers = driversData.map(driver => ({
    firstName: driver.firstName,
    lastName: driver.lastName,
    email: driver.email,
    phone: driver.phone,
    location: driver.location,
    employeeId: driver.employeeId,
    documentOption: "skip",
  }));

  const response = await fetch(`${API_URL}/api/drivers/bulk-import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ drivers }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to import drivers');
  }

  const result = await response.json();
  console.log(`✅ Bulk import complete. Successful: ${result.results.successful.length}, Failed: ${result.results.failed.length}`);

  return result.results;
};

/**
 * DEPRECATED: Old sequential bulk create function
 * Use bulkImportDrivers instead for better performance
 * Keeping for backward compatibility
 */
export const bulkCreateDrivers = async (driversData, token) => {
  console.warn('⚠️ bulkCreateDrivers is deprecated. Use bulkImportDrivers instead.');

  const results = {
    successful: [],
    failed: [],
    limitReached: false,
  };

  console.log(`🚀 Starting bulk upload of ${driversData.length} drivers`);

  for (let i = 0; i < driversData.length; i++) {
    const driverData = driversData[i];

    try {
      const payload = {
        firstName: driverData.firstName,
        lastName: driverData.lastName,
        email: driverData.email,
        phone: driverData.phone,
        location: driverData.location,
        employeeId: driverData.employeeId,
        documentOption: "skip",
      };

      console.log(`📤 Uploading driver ${i + 1}/${driversData.length}: ${payload.firstName} ${payload.lastName}`);
      const result = await createDriver(payload, token);

      console.log(`✅ Driver ${i + 1} created successfully:`, result.driver.id);
      results.successful.push({
        ...payload,
        id: result.driver.id,
      });
    } catch (error) {
      console.error(`❌ Driver ${i + 1} failed:`, error.message);

      // Check if it's a limit error
      if (error.message.includes('Driver limit reached') || error.message.includes('limit')) {
        results.limitReached = true;
        results.failed.push({
          ...driverData,
          error: error.message,
          reason: 'LIMIT_REACHED',
        });

        // Add remaining drivers to failed list
        for (let j = i + 1; j < driversData.length; j++) {
          results.failed.push({
            ...driversData[j],
            error: 'Driver limit reached - not attempted',
            reason: 'LIMIT_REACHED',
          });
        }

        console.log(`🛑 Driver limit reached. Stopping upload. Successful: ${results.successful.length}, Failed: ${results.failed.length}`);
        break;
      }

      results.failed.push({
        ...driverData,
        error: error.message,
        reason: 'ERROR',
      });
    }
  }

  console.log(`✅ Bulk upload complete. Successful: ${results.successful.length}, Failed: ${results.failed.length}`);
  return results;
};
