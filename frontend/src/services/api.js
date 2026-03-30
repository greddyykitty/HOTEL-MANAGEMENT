import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

// ── JWT Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers['Authorization'] = 'Bearer ' + token;
        return config;
    },
    (error) => Promise.reject(error)
);

// ── 401 Response Interceptor ──────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

// ── Auth Service: POST /api/auth/register | POST /api/auth/login ──────────────
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

// ── Hotel Service (Public): GET /api/hotels, /api/hotels/{id}, /api/hotels/{id}/rooms
export const hotelService = {
    getHotels: (location, minRating, minPrice, maxPrice, amenity) =>
        api.get('/hotels', { params: { location, minRating, minPrice, maxPrice, amenity } }),
    getHotelById: (id) => api.get(`/hotels/${id}`),
    getRooms: (hotelId, availableOnly = false) =>
        api.get(`/hotels/${hotelId}/rooms`, { params: { availableOnly } }),
};

// ── Booking Service (Auth required): POST /api/bookings | GET /api/bookings/my
export const bookingService = {
    createBooking: (data) => api.post('/bookings', data),
    getMyBookings: () => api.get('/bookings/my'),
    cancelBooking: (id) => api.delete(`/bookings/${id}`),
};

// ── Admin Service (Admin only) ────────────────────────────────────────────────
export const adminService = {
    // Stats
    getStats: () => api.get('/admin/stats'),

    // Image upload: POST /api/admin/upload (multipart)
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/admin/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Hotels: POST /api/admin/hotels | PUT /api/admin/hotels/{id} | DELETE /api/admin/hotels/{id}
    createHotel: (data) => api.post('/admin/hotels', data),
    updateHotel: (id, data) => api.put(`/admin/hotels/${id}`, data),
    deleteHotel: (id) => api.delete(`/admin/hotels/${id}`),

    // Rooms: POST /api/admin/rooms | PUT /api/admin/rooms/{id} | DELETE /api/admin/rooms/{id}
    createRoom: (data) => api.post('/admin/rooms', data),
    updateRoom: (id, data) => api.put(`/admin/rooms/${id}`, data),
    deleteRoom: (id) => api.delete(`/admin/rooms/${id}`),

    // Bookings: GET /api/admin/bookings
    getAllBookings: () => api.get('/admin/bookings'),

    // Users
    getAllUsers: () => api.get('/admin/users'),
    updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
