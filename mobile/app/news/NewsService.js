const API_URL = 'http://192.168.0.38:5002/api/news';

export default {
  async getAll() {
    const response = await fetch(API_URL);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load news');
    }
    return await response.json();
  },

  async create(newsItem) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsItem)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create news');
    }
    return await response.json();
  },

  async update(id, newsItem) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsItem)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update news');
    }
    return await response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete news');
    }
    return true;
  }
};