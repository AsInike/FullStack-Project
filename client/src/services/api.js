const API_BASE = 'http://localhost:5001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function for authenticated requests
const authenticatedApiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Test server connection
export const testConnection = async () => {
  try {
    const response = await fetch('http://localhost:5001/');
    const data = await response.json();
    console.log('Server connection test:', data);
    return true;
  } catch (error) {
    console.error('Server connection failed:', error);
    return false;
  }
};

// Auth API functions
export const authAPI = {
  register: async (name, email, password) => {
    try {
      console.log('Making API call to register:', { name, email }); 
      
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data); 
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Registration failed`);
      }
      
      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('API register error:', error);
      
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the server is running.');
      }
      
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server.');
      }
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Cart API functions
export const cartAPI = {
  addItem: async (userId, productId, qty = 1) => {
    try {
      const response = await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, qty })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add item to cart');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  getItems: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/cart/${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cart items');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  updateItem: async (cartItemId, qty) => {
    try {
      const response = await fetch(`${API_BASE}/cart/item/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update cart item');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  removeItem: async (cartItemId) => {
    try {
      const response = await fetch(`${API_BASE}/cart/item/${cartItemId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove cart item');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  clearCart: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/cart/clear/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear cart');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Orders API functions (FIXED - proper syntax and structure)
export const ordersAPI = {
  create: (orderData) => authenticatedApiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  getByUser: (userId) => authenticatedApiCall(`/orders/user/${userId}`),
  
  getById: (orderId) => authenticatedApiCall(`/orders/${orderId}`),
  
  updateStatus: (orderId, status) => authenticatedApiCall(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  
  updatePaymentStatus: (orderId, paymentStatus) => authenticatedApiCall(`/orders/${orderId}/payment-status`, {
    method: 'PUT',
    body: JSON.stringify({ paymentStatus }),
  }),
  
  getPendingPayments: () => authenticatedApiCall('/orders/pending-payments'),
  
  // Alternative method for compatibility (FIXED - moved inside ordersAPI object)
  getHistory: async (userId) => {
    try {
      const response = await authenticatedApiCall(`/orders/user/${userId}`);
      return response; // authenticatedApiCall already returns parsed JSON
    } catch (error) {
      throw error;
    }
  }
};

// Contact API functions
export const contactAPI = {
  send: async (name, email, message) => {
    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      return data;
    } catch (error) {
      console.error('Contact API error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server.');
      }
      
      throw error;
    }
  },
  
  // Alternative method using apiCall
  submit: (contactData) => apiCall('/contact', {
    method: 'POST',
    body: JSON.stringify(contactData),
  })
};

// Products API functions
export const productsAPI = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },

  getFeatured: async () => {
    try {
      const response = await fetch(`${API_BASE}/products/featured`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE}/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }
};