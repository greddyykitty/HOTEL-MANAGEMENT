import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { adminService, hotelService } from '../services/api';
import {
  Hotel, Bed, BookOpen, Users, BarChart3, LogOut,
  Plus, Pencil, Trash2, Loader2, AlertCircle, CheckCircle,
  X, Star, MapPin, TrendingUp, Upload, Image as ImageIcon
} from 'lucide-react';

// ── Image Upload Component ─────────────────────────────────────────────────────
const ImageUpload = ({ label, currentUrl, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const [error, setError] = useState('');
  const inputRef = useRef();

  useEffect(() => { setPreview(currentUrl || ''); }, [currentUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview instantly
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to backend
    setUploading(true);
    setError('');
    try {
      const res = await adminService.uploadImage(file);
      onUpload(res.data.imageUrl);
    } catch (err) {
      setError('Upload failed. Using local preview only.');
      // Still pass local blob URL as fallback
      onUpload(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed border-slate-200 hover:border-[#FF7B7B] rounded-xl overflow-hidden cursor-pointer transition-colors bg-slate-50 group"
        style={{ height: preview ? '120px' : '80px' }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex items-center gap-1.5 text-white text-xs font-bold">
                <Upload size={14} /> Change Image
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1.5 text-slate-400 group-hover:text-[#FF7B7B] transition-colors">
            {uploading
              ? <Loader2 size={20} className="animate-spin" />
              : <><ImageIcon size={20} /><span className="text-xs font-medium">Click to upload image</span></>
            }
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-[#FF7B7B]" />
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color = '#FF7B7B', sub }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
        <span style={{ color }}>{icon}</span>
      </div>
    </div>
    <p className="text-2xl font-extrabold text-slate-800">{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full
    ${status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
    {status}
  </span>
);

const RoleBadge = ({ role }) => (
  <span className={`inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full
    ${role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
    {role}
  </span>
);

const FormInput = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-500 mb-1">{label}{required && ' *'}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B]" />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [tab, setTab] = useState('stats');
  const [alert, setAlert] = useState(null);

  // Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Hotels
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotelForm, setHotelForm] = useState({ name: '', location: '', description: '', rating: '', imageUrl: '', amenities: '' });
  const [editingHotel, setEditingHotel] = useState(null);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [savingHotel, setSavingHotel] = useState(false);

  // Rooms
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomForm, setRoomForm] = useState({ hotelId: '', roomType: '', price: '', capacity: '', availableRooms: '', description: '', imageUrl: '' });
  const [editingRoom, setEditingRoom] = useState(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [filterHotelId, setFilterHotelId] = useState('');
  const [roomFormError, setRoomFormError] = useState('');

  // Bookings
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (tab === 'stats') fetchStats();
    if (tab === 'hotels') fetchHotels();
    if (tab === 'rooms') fetchRoomsAndHotels();
    if (tab === 'bookings') fetchBookings();
    if (tab === 'users') fetchUsers();
  }, [tab]);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try { const r = await adminService.getStats(); setStats(r.data); }
    catch { showAlert('error', 'Failed to load stats.'); }
    finally { setLoadingStats(false); }
  };

  const fetchHotels = async () => {
    setLoadingHotels(true);
    try { const r = await hotelService.getHotels(); setHotels(r.data); }
    catch { showAlert('error', 'Failed to load hotels.'); }
    finally { setLoadingHotels(false); }
  };

  const fetchRoomsAndHotels = async () => {
    setLoadingRooms(true);
    try {
      const hotelsRes = await hotelService.getHotels();
      setHotels(hotelsRes.data);
      const roomArrays = await Promise.all(hotelsRes.data.map(h => hotelService.getRooms(h.id)));
      setRooms(roomArrays.flatMap(r => r.data));
    } catch { showAlert('error', 'Failed to load rooms.'); }
    finally { setLoadingRooms(false); }
  };

  // ── Hotel CRUD ─────────────────────────────────────────────────────────────
  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    if (!hotelForm.amenities || hotelForm.amenities.trim() === '') {
      showAlert('error', 'Please select at least one amenity.');
      return;
    }
    setSavingHotel(true);
    const data = {
      name: hotelForm.name,
      location: hotelForm.location,
      description: hotelForm.description || null,
      rating: hotelForm.rating ? parseFloat(hotelForm.rating) : null,
      imageUrl: hotelForm.imageUrl || null,
      amenities: hotelForm.amenities || null,
    };
    try {
      if (editingHotel) {
        await adminService.updateHotel(editingHotel.id, data);
        showAlert('success', 'Hotel updated successfully.');
      } else {
        await adminService.createHotel(data);
        showAlert('success', 'Hotel created successfully.');
      }
      setShowHotelForm(false);
      setEditingHotel(null);
      resetHotelForm();
      fetchHotels();
    } catch (err) {
      const msg = err.response?.data?.name || err.response?.data || 'Failed to save hotel.';
      showAlert('error', typeof msg === 'string' ? msg : 'Failed to save hotel.');
    } finally { setSavingHotel(false); }
  };

  const resetHotelForm = () =>
    setHotelForm({ name: '', location: '', description: '', rating: '', imageUrl: '', amenities: '' });

  const handleEditHotel = (h) => {
    setEditingHotel(h);
    setHotelForm({ name: h.name, location: h.location, description: h.description || '', rating: h.rating || '', imageUrl: h.imageUrl || '', amenities: h.amenities || '' });
    setShowHotelForm(true);
  };

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Delete this hotel? All its rooms will also be removed.')) return;
    try { await adminService.deleteHotel(id); showAlert('success', 'Hotel deleted.'); fetchHotels(); }
    catch { showAlert('error', 'Failed to delete hotel (it may have existing rooms/bookings).'); }
  };

  // ── Room CRUD ──────────────────────────────────────────────────────────────
  const validateRoomForm = () => {
    if (!roomForm.hotelId) return 'Please select a hotel.';
    if (!roomForm.roomType.trim()) return 'Room type is required.';
    if (!roomForm.price || isNaN(parseFloat(roomForm.price)) || parseFloat(roomForm.price) <= 0)
      return 'Enter a valid price per night.';
    if (!roomForm.capacity || isNaN(parseInt(roomForm.capacity)) || parseInt(roomForm.capacity) <= 0)
      return 'Enter a valid capacity.';
    if (!roomForm.availableRooms || isNaN(parseInt(roomForm.availableRooms)) || parseInt(roomForm.availableRooms) < 0)
      return 'Enter a valid number of available rooms.';
    return null;
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setRoomFormError('');

    const validationError = validateRoomForm();
    if (validationError) { setRoomFormError(validationError); return; }

    setSavingRoom(true);
    const data = {
      hotelId: parseInt(roomForm.hotelId),
      roomType: roomForm.roomType.trim(),
      price: parseFloat(roomForm.price),
      capacity: parseInt(roomForm.capacity),
      availableRooms: parseInt(roomForm.availableRooms),
      description: roomForm.description || null,
      imageUrl: roomForm.imageUrl || null,
    };

    try {
      if (editingRoom) {
        await adminService.updateRoom(editingRoom.id, data);
        showAlert('success', 'Room updated successfully.');
      } else {
        await adminService.createRoom(data);
        showAlert('success', 'Room added successfully.');
      }
      setShowRoomForm(false);
      setEditingRoom(null);
      resetRoomForm();
      fetchRoomsAndHotels();
    } catch (err) {
      console.error('Room Save Error:', err.response?.data);
      const dataObj = err.response?.data;
      let msg = 'Failed to save room.';
      if (typeof dataObj === 'object' && dataObj !== null) {
          msg = Object.values(dataObj).join(' | ');
      } else if (typeof dataObj === 'string') {
          msg = dataObj;
      }
      setRoomFormError(msg);
    } finally { setSavingRoom(false); }
  };

  const resetRoomForm = () =>
    setRoomForm({ hotelId: '', roomType: '', price: '', capacity: '', availableRooms: '', description: '', imageUrl: '' });

  const handleEditRoom = (r) => {
    setEditingRoom(r);
    setRoomFormError('');
    setRoomForm({
      hotelId: r.hotelId?.toString() || '',
      roomType: r.roomType || '',
      price: r.price?.toString() || '',
      capacity: r.capacity?.toString() || '',
      availableRooms: r.availableRooms?.toString() || '',
      description: r.description || '',
      imageUrl: r.imageUrl || '',
    });
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try { await adminService.deleteRoom(id); showAlert('success', 'Room deleted.'); fetchRoomsAndHotels(); }
    catch { showAlert('error', 'Failed to delete room (it may have existing bookings).'); }
  };

  // ── Bookings ───────────────────────────────────────────────────────────────
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try { const r = await adminService.getAllBookings(); setBookings(r.data); }
    catch { showAlert('error', 'Failed to load bookings.'); }
    finally { setLoadingBookings(false); }
  };

  // ── Users ──────────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try { const r = await adminService.getAllUsers(); setUsers(r.data); }
    catch { showAlert('error', 'Failed to load users.'); }
    finally { setLoadingUsers(false); }
  };

  const handleUpdateRole = async (id, newRole) => {
    try { await adminService.updateUserRole(id, newRole); showAlert('success', 'Role updated.'); fetchUsers(); }
    catch { showAlert('error', 'Failed to update role.'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their bookings?')) return;
    try { await adminService.deleteUser(id); showAlert('success', 'User deleted.'); fetchUsers(); }
    catch { showAlert('error', 'Failed to delete user.'); }
  };

  const filteredRooms = filterHotelId ? rooms.filter(r => String(r.hotelId) === String(filterHotelId)) : rooms;

  const TABS = [
    { id: 'stats', icon: <BarChart3 size={14} />, label: 'Stats' },
    { id: 'hotels', icon: <Hotel size={14} />, label: 'Hotels' },
    { id: 'rooms', icon: <Bed size={14} />, label: 'Rooms' },
    { id: 'bookings', icon: <BookOpen size={14} />, label: 'Bookings' },
    { id: 'users', icon: <Users size={14} />, label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-[#fff0f0]">
      {/* ── Header ── */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel size={22} className="text-[#FF7B7B]" />
            <span className="font-extrabold text-slate-800 text-lg">Admin Panel</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors
                  ${tab === t.id ? 'bg-[#FF7B7B] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium hidden sm:block">{user?.name || user?.email}</span>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#FF7B7B] text-sm font-medium transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
        <div className="md:hidden flex border-t border-slate-100 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 min-w-fit py-2 px-2 text-xs font-semibold whitespace-nowrap transition-colors
                ${tab === t.id ? 'border-b-2 border-[#FF7B7B] text-[#FF7B7B]' : 'text-slate-400'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Alert Toast ── */}
      {alert && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
          ${alert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {alert.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ══ TAB: Stats ══ */}
        {tab === 'stats' && (
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-5">Dashboard Overview</h2>
            {loadingStats ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[#FF7B7B]" /></div>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={<Users size={18} />} label="Total Users" value={stats.totalUsers} color="#6366f1" />
                <StatCard icon={<Hotel size={18} />} label="Total Hotels" value={stats.totalHotels} color="#0ea5e9" />
                <StatCard icon={<BookOpen size={18} />} label="Total Bookings" value={stats.totalBookings} color="#FF7B7B" />
                <StatCard icon={<CheckCircle size={18} />} label="Confirmed" value={stats.confirmedBookings} color="#22c55e" />
                <StatCard icon={<X size={18} />} label="Cancelled" value={stats.cancelledBookings} color="#ef4444" />
                <StatCard icon={<TrendingUp size={18} />} label="Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} color="#f59e0b" />
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No stats available.</p>
            )}
          </div>
        )}

        {/* ══ TAB: Hotels ══ */}
        {tab === 'hotels' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-800">Manage Hotels</h2>
              <button onClick={() => { setEditingHotel(null); resetHotelForm(); setShowHotelForm(true); }}
                className="flex items-center gap-2 bg-[#FF7B7B] hover:bg-[#ff6565] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                <Plus size={16} /> Add Hotel
              </button>
            </div>

            {showHotelForm && (
              <form onSubmit={handleHotelSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h3>
                  <button type="button" onClick={() => setShowHotelForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput label="Hotel Name" value={hotelForm.name} onChange={e => setHotelForm(p => ({ ...p, name: e.target.value }))} placeholder="The Grand Palace" required />
                  <FormInput label="Location" value={hotelForm.location} onChange={e => setHotelForm(p => ({ ...p, location: e.target.value }))} placeholder="Mumbai, India" required />
                  <FormInput label="Rating (1–5)" type="number" value={hotelForm.rating} onChange={e => setHotelForm(p => ({ ...p, rating: e.target.value }))} placeholder="4.5" />
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-2">Amenities (Required) *</label>
                    <div className="flex flex-wrap gap-3">
                      {['Breakfast included', 'Lunch included', 'WiFi', 'Cab facilities', 'Parking'].map(amentiy => {
                        const currentList = hotelForm.amenities ? hotelForm.amenities.split(',').map(a => a.trim()) : [];
                        const isChecked = currentList.includes(amentiy);
                        return (
                          <label key={amentiy} className="flex items-center gap-1.5 text-sm cursor-pointer text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#FF7B7B]">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => {
                                const newList = isChecked 
                                  ? currentList.filter(a => a !== amentiy)
                                  : [...currentList, amentiy];
                                setHotelForm(p => ({ ...p, amenities: newList.join(', ') }));
                              }}
                              className="accent-[#FF7B7B]"
                            />
                            {amentiy}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Description</label>
                    <textarea value={hotelForm.description} onChange={e => setHotelForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Hotel description..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B] resize-none h-16" />
                  </div>
                  {/* ── Image Upload ── */}
                  <div className="sm:col-span-2">
                    <ImageUpload
                      label="Hotel Image"
                      currentUrl={hotelForm.imageUrl}
                      onUpload={(url) => setHotelForm(p => ({ ...p, imageUrl: url }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" disabled={savingHotel}
                    className="flex items-center gap-2 bg-[#FF7B7B] hover:bg-[#ff6565] text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60">
                    {savingHotel && <Loader2 size={14} className="animate-spin" />}
                    {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                  </button>
                  <button type="button" onClick={() => setShowHotelForm(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-2 rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loadingHotels ? (
              <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-[#FF7B7B]" /></div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white rounded-2xl">
                <Hotel size={36} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No hotels yet. Add your first hotel above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {hotels.map(h => (
                  <div key={h.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="h-36 bg-slate-100 overflow-hidden">
                      {h.imageUrl ? (
                        <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={32} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800">{h.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin size={11} className="text-[#FF7B7B]" /> {h.location}
                      </div>
                      {h.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-slate-600 font-medium">{h.rating}</span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleEditHotel(h)}
                          className="flex-1 flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-1.5 rounded-lg transition-colors">
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => handleDeleteHotel(h.id)}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold py-1.5 rounded-lg transition-colors">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: Rooms ══ */}
        {tab === 'rooms' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-slate-800">Manage Rooms</h2>
                <select value={filterHotelId} onChange={e => setFilterHotelId(e.target.value)}
                  className="text-sm px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#FF7B7B]">
                  <option value="">All Hotels</option>
                  {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
              <button onClick={() => { setEditingRoom(null); resetRoomForm(); setRoomFormError(''); setShowRoomForm(true); }}
                className="flex items-center gap-2 bg-[#FF7B7B] hover:bg-[#ff6565] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                <Plus size={16} /> Add Room
              </button>
            </div>

            {showRoomForm && (
              <form onSubmit={handleRoomSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
                  <button type="button" onClick={() => setShowRoomForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                </div>

                {roomFormError && (
                  <div className="mb-3 bg-red-50 text-red-500 p-3 rounded-xl flex items-center gap-2 text-sm">
                    <AlertCircle size={14} /> {roomFormError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Hotel dropdown — required, shown first */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Hotel *</label>
                    <select value={roomForm.hotelId}
                      onChange={e => setRoomForm(p => ({ ...p, hotelId: e.target.value }))}
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:border-[#FF7B7B] ${!roomForm.hotelId ? 'border-red-200 text-slate-400' : 'border-slate-200 text-slate-800'}`}>
                      <option value="">— Select a Hotel —</option>
                      {hotels.map(h => <option key={h.id} value={h.id}>{h.name} ({h.location})</option>)}
                    </select>
                  </div>

                  <FormInput label="Room Type" value={roomForm.roomType}
                    onChange={e => setRoomForm(p => ({ ...p, roomType: e.target.value }))}
                    placeholder="Standard / Deluxe / Suite" required />
                  <FormInput label="Price per Night (₹)" type="number" value={roomForm.price}
                    onChange={e => setRoomForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="3500" required />
                  <FormInput label="Max Capacity (guests)" type="number" value={roomForm.capacity}
                    onChange={e => setRoomForm(p => ({ ...p, capacity: e.target.value }))}
                    placeholder="2" required />
                  <FormInput label="Available Rooms (count)" type="number" value={roomForm.availableRooms}
                    onChange={e => setRoomForm(p => ({ ...p, availableRooms: e.target.value }))}
                    placeholder="5" required />
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Description</label>
                    <textarea value={roomForm.description}
                      onChange={e => setRoomForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Room description..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B] resize-none h-14" />
                  </div>

                  {/* ── Image Upload ── */}
                  <div className="sm:col-span-2">
                    <ImageUpload
                      label="Room Image"
                      currentUrl={roomForm.imageUrl}
                      onUpload={(url) => setRoomForm(p => ({ ...p, imageUrl: url }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button type="submit" disabled={savingRoom}
                    className="flex items-center gap-2 bg-[#FF7B7B] hover:bg-[#ff6565] text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60">
                    {savingRoom && <Loader2 size={14} className="animate-spin" />}
                    {editingRoom ? 'Update Room' : 'Add Room'}
                  </button>
                  <button type="button" onClick={() => setShowRoomForm(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-2 rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loadingRooms ? (
              <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-[#FF7B7B]" /></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Image', 'Hotel', 'Room Type', 'Price/Night', 'Capacity', 'Available', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredRooms.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-slate-400">
                        {hotels.length === 0 ? 'Add a hotel first, then add rooms.' : 'No rooms found. Add a room above.'}
                      </td></tr>
                    ) : filteredRooms.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                            {r.imageUrl
                              ? <img src={r.imageUrl} alt={r.roomType} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                              : <ImageIcon size={16} className="text-slate-300" />
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 text-xs">{r.hotelName}</td>
                        <td className="px-4 py-3 text-slate-600">{r.roomType}</td>
                        <td className="px-4 py-3 font-semibold text-[#FF7B7B]">₹{r.price?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-600">{r.capacity}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-xs ${r.availableRooms > 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {r.availableRooms}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditRoom(r)}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDeleteRoom(r.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-400 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: Bookings ══ */}
        {tab === 'bookings' && (
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-5">All Bookings</h2>
            {loadingBookings ? (
              <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-[#FF7B7B]" /></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Ref', 'Customer', 'Hotel / Room', 'Check-in', 'Check-out', 'Total', 'Status'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bookings.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-slate-400">No bookings yet.</td></tr>
                    ) : bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{b.bookingRef}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700">{b.customerName}</p>
                          <p className="text-xs text-slate-400">{b.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700">{b.hotelName}</p>
                          <p className="text-xs text-slate-400">{b.roomType}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{b.checkIn}</td>
                        <td className="px-4 py-3 text-slate-600">{b.checkOut}</td>
                        <td className="px-4 py-3 font-semibold text-[#FF7B7B]">₹{b.totalPrice?.toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: Users ══ */}
        {tab === 'users' && (
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-5">All Users</h2>
            {loadingUsers ? (
              <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-[#FF7B7B]" /></div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-slate-400">No users found.</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700">{u.name}</td>
                        <td className="px-4 py-3 text-slate-500">{u.email}</td>
                        <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select value={u.role} onChange={e => handleUpdateRole(u.id, e.target.value)}
                              className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:border-[#FF7B7B]">
                              <option value="CUSTOMER">CUSTOMER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <button onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-400 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
