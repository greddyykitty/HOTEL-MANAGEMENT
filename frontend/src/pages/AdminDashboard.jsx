import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { adminService, hotelService } from '../services/api';
import {
  Hotel, Bed, BookOpen, Users, BarChart3, LogOut,
  Plus, Pencil, Trash2, Loader2, AlertCircle, CheckCircle,
  X, Star, MapPin, TrendingUp, Upload, Image as ImageIcon,
  ChevronRight, Calendar
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

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setError('');
    try {
      const res = await adminService.uploadImage(file);
      onUpload(res.data.imageUrl);
    } catch (err) {
      setError('Upload failed. Using local preview...');
      onUpload(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed border-white/5 hover:border-[#FF4D6D] rounded-3xl overflow-hidden cursor-pointer transition-all bg-white/5 group h-32 flex items-center justify-center"
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Upload size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-[#FF4D6D] transition-colors">
            <ImageIcon size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Upload Media</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#FF4D6D]" />
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  );
};

// ── KPI Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color = '#FF4D6D', trend }) => (
  <div className="bg-[#0f172a] rounded-[32px] p-8 border border-white/5 shadow-2xl flex flex-col justify-between h-full">
    <div className="flex items-start justify-between">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: color + '15' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      {trend && (
        <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
          {trend}
        </span>
      )}
    </div>
    <div className="mt-8">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest
    ${status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
    {status}
  </span>
);

const RoleBadge = ({ role }) => (
  <span className={`inline-flex text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest
    ${role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
    {role}
  </span>
);

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={10}
        className={i <= Math.round(rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} />
    ))}
  </div>
);

const FormInput = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div className="mb-4">
    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">{label}{required && ' *'}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full px-5 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-[#FF4D6D] transition-all" />
  </div>
);

const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
      <BarChart3 size={48} className="opacity-10" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">No Protocol data</span>
    </div>
  );
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex items-end justify-between h-48 gap-4 mt-6">
      {data.map((item, idx) => {
        const heightPercent = (item.value / maxValue) * 100;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
            {/* Tooltip */}
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-white text-black text-[9px] font-black px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap z-50">
              ₹{item.value.toLocaleString()}
            </div>
            {/* Bar Container */}
            <div className="w-full bg-white/5 rounded-t-2xl overflow-hidden relative group-hover:bg-white/10 transition-colors" style={{ height: `${heightPercent}%`, minHeight: '8px' }}>
              <div 
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#FF4D6D] to-[#ff7b92] transition-all duration-1000 ease-out"
                style={{ height: '100%' }}
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {/* Label */}
            <span className="text-[8px] font-black text-slate-500 mt-4 uppercase tracking-[0.1em] w-full text-center truncate group-hover:text-white transition-colors italic">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [tab, setTab] = useState('stats');
  const [alert, setAlert] = useState(null);
  const [revenueView, setRevenueView] = useState('month'); // 'month' or 'year'

  // States
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
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

  // Bookings / Users
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
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

  const handleHotelSubmit = async (e) => {
    e.preventDefault();
    if (!hotelForm.amenities) { showAlert('error', 'Amenities required'); return; }
    setSavingHotel(true);
    try {
      const data = { ...hotelForm, rating: parseFloat(hotelForm.rating) };
      if (editingHotel) await adminService.updateHotel(editingHotel.id, data);
      else await adminService.createHotel(data);
      showAlert('success', 'Hotel saved');
      setShowHotelForm(false);
      setEditingHotel(null);
      resetHotelForm();
      fetchHotels();
    } catch (err) { showAlert('error', 'Save failed'); }
    finally { setSavingHotel(false); }
  };

  const resetHotelForm = () => setHotelForm({ name: '', location: '', description: '', rating: '', imageUrl: '', amenities: '' });

  const handleDeleteHotel = async (id) => {
    if (!window.confirm('Delete hotel?')) return;
    try { await adminService.deleteHotel(id); showAlert('success', 'Hotel deleted'); fetchHotels(); }
    catch { showAlert('error', 'Delete failed'); }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setSavingRoom(true);
    try {
      const data = { ...roomForm, hotelId: parseInt(roomForm.hotelId), price: parseFloat(roomForm.price), capacity: parseInt(roomForm.capacity), availableRooms: parseInt(roomForm.availableRooms) };
      if (editingRoom) await adminService.updateRoom(editingRoom.id, data);
      else await adminService.createRoom(data);
      showAlert('success', 'Room saved');
      setShowRoomForm(false);
      setEditingRoom(null);
      resetRoomForm();
      fetchRoomsAndHotels();
    } catch (err) { setRoomFormError('Save failed'); }
    finally { setSavingRoom(false); }
  };

  const resetRoomForm = () => setRoomForm({ hotelId: '', roomType: '', price: '', capacity: '', availableRooms: '', description: '', imageUrl: '' });

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try { const r = await adminService.getAllBookings(); setBookings(r.data); }
    catch { showAlert('error', 'Failed loading bookings'); }
    finally { setLoadingBookings(false); }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try { const r = await adminService.getAllUsers(); setUsers(r.data); }
    catch { showAlert('error', 'Failed loading users'); }
    finally { setLoadingUsers(false); }
  };

  const handleUpdateRole = async (id, newRole) => {
    try { await adminService.updateUserRole(id, newRole); showAlert('success', 'Role updated'); fetchUsers(); }
    catch { showAlert('error', 'Role update failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Revoke Protocol? All data for this user will be removed.')) return;
    try { await adminService.deleteUser(id); showAlert('success', 'User Revoked'); fetchUsers(); }
    catch { showAlert('error', 'Revocation failed'); }
  };

  const filteredRooms = filterHotelId ? rooms.filter(r => String(r.hotelId) === String(filterHotelId)) : rooms;

  const NAV_ITEMS = [
    { id: 'stats', icon: <BarChart3 size={18} />, label: 'Dashboard' },
    { id: 'hotels', icon: <Hotel size={18} />, label: 'Properties' },
    { id: 'rooms', icon: <Bed size={18} />, label: 'Inventory' },
    { id: 'bookings', icon: <BookOpen size={18} />, label: 'Bookings' },
    { id: 'users', icon: <Users size={18} />, label: 'Users' },
  ];

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden">
      {/* ── Vertical Sidebar ── */}
      <aside className="w-72 bg-[#0a0b1e] border-r border-white/5 flex flex-col pt-10 pb-6 shadow-2xl relative z-40">
        <div className="px-10 mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF4D6D] rounded-xl flex items-center justify-center transform -rotate-6">
            <Hotel size={22} className="text-white" />
          </div>
          <span className="font-black text-white text-2xl tracking-tighter uppercase italic">LuxeStay</span>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm tracking-wide
                ${tab === item.id 
                  ? 'bg-[#FF4D6D] text-white shadow-xl shadow-[#FF4D6D]/20 -translate-y-0.5' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <span className={tab === item.id ? 'animate-pulse' : ''}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-6 pt-6 border-t border-white/5 mt-auto">
          <div className="bg-white/5 rounded-[24px] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF4D6D] to-purple-600 border-2 border-white/10" />
              <div>
                <p className="text-[11px] font-black text-white truncate w-24 uppercase tracking-tighter">{user?.name || 'Admin User'}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-[#FF4D6D] transition-colors p-2">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 overflow-y-auto px-12 py-12 relative">
        <div className="max-w-7xl mx-auto">
          
          {alert && (
            <div className={`fixed top-12 right-12 z-50 flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl text-sm font-black uppercase tracking-widest
              ${alert.type === 'success' ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
              {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {alert.msg}
            </div>
          )}

          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-[#FF4D6D] text-[10px] font-black uppercase tracking-[0.4em] mb-3">System Overview</p>
              <h2 className="text-5xl font-black text-white tracking-tighter">Live Insights</h2>
            </div>
            <div className="text-slate-500 font-bold text-sm tracking-widest uppercase">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {/* ══ TAB: Stats ══ */}
          {tab === 'stats' && (
            <div className="animate-in fade-in duration-700">
              {loadingStats ? (
                <div className="flex justify-center py-32"><Loader2 size={48} className="animate-spin text-[#FF4D6D] opacity-40" /></div>
              ) : stats ? (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <StatCard icon={<Users size={24} />} label="System Users" value={stats.totalUsers} color="#6366f1" trend="+12%" />
                  <StatCard icon={<Hotel size={24} />} label="Total Properties" value={stats.totalHotels} color="#0ea5e9" trend="High Yield" />
                  <StatCard icon={<BookOpen size={24} />} label="Active Stays" value={stats.totalBookings} color="#FF4D6D" trend="Increasing" />
                  <StatCard icon={<TrendingUp size={24} />} label="Net Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} color="#f59e0b" trend="Record High" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                   <div className="lg:col-span-2 bg-[#0f172a] rounded-[40px] p-10 border border-white/5 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-8 relative z-10">
                         <h3 className="text-lg font-black text-white uppercase tracking-widest italic opacity-40">Revenue Velocity</h3>
                         <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                            <button 
                              onClick={() => setRevenueView('month')}
                              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                                ${revenueView === 'month' ? 'bg-[#FF4D6D] text-white shadow-lg shadow-[#FF4D6D]/20' : 'text-slate-500 hover:text-white'}`}>
                              Month
                            </button>
                            <button 
                              onClick={() => setRevenueView('year')}
                              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                                ${revenueView === 'year' ? 'bg-[#FF4D6D] text-white shadow-lg shadow-[#FF4D6D]/20' : 'text-slate-500 hover:text-white'}`}>
                              Year
                            </button>
                         </div>
                      </div>
                      <div className="h-[250px]">
                         <RevenueChart data={revenueView === 'month' ? stats?.monthlyRevenue : stats?.yearlyRevenue} />
                      </div>
                   </div>
                   <div className="bg-[#0f172a] rounded-[40px] p-10 border border-white/5 h-[400px]">
                      <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest opacity-40 italic">Occupancy Distribution</h3>
                      <div className="h-full flex flex-col justify-center gap-8">
                         {[
                           { l: 'MUMBAI', v: 85, c: '#FF4D6D' },
                           { l: 'GOA', v: 92, c: '#0ea5e9' },
                           { l: 'DELHI', v: 64, c: '#f59e0b' }
                         ].map( city => (
                           <div key={city.l}>
                              <div className="flex justify-between mb-2">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{city.l}</span>
                                 <span className="text-[10px] font-black text-white italic">{city.v}%</span>
                              </div>
                              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full transition-all duration-1000" style={{ width: city.v + '%', backgroundColor: city.c }} />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
                </>
              ) : (
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">No telemetry data available.</p>
              )}
            </div>
          )}

          {/* ══ TAB: Hotels ══ */}
          {tab === 'hotels' && (
            <div className="animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-white tracking-widest uppercase italic bg-gradient-to-r from-white to-white/20 bg-clip-text text-transparent">Property Portfolio</h3>
                <button onClick={() => { setEditingHotel(null); resetHotelForm(); setShowHotelForm(true); }}
                  className="bg-[#FF4D6D] hover:bg-[#ff3d5f] text-white text-[10px] font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-[#FF4D6D]/20 uppercase tracking-[0.2em] active:scale-95">
                  Register New Hotel
                </button>
              </div>

              {showHotelForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md">
                <form onSubmit={handleHotelSubmit} className="bg-[#0f172a] rounded-[48px] shadow-2xl border border-white/10 p-12 max-w-2xl w-full animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{editingHotel ? 'Refine Property' : 'Initialize Portfolio'}</h3>
                    <button type="button" onClick={() => setShowHotelForm(false)} className="text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <FormInput label="Hotel Designation" value={hotelForm.name} onChange={e => setHotelForm(p => ({ ...p, name: e.target.value }))} placeholder="The Grand Palace" required />
                    <FormInput label="Geographic Location" value={hotelForm.location} onChange={e => setHotelForm(p => ({ ...p, location: e.target.value }))} placeholder="MUMBAI, INDIA" required />
                    <FormInput label="Star Rating" type="number" value={hotelForm.rating} onChange={e => setHotelForm(p => ({ ...p, rating: e.target.value }))} placeholder="4.5" />
                    
                    <div className="sm:col-span-2 my-4">
                      <label className="block text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em] italic">Infrastructure & Amenities</label>
                      <div className="flex flex-wrap gap-3">
                        {['Breakfast included', 'Lunch included', 'WiFi', 'Cab facilities', 'Parking'].map(amentiy => {
                          const currentList = hotelForm.amenities ? hotelForm.amenities.split(',').map(a => a.trim()) : [];
                          const isChecked = currentList.includes(amentiy);
                          return (
                            <label key={amentiy} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest
                              ${isChecked ? 'bg-[#FF4D6D] border-[#FF4D6D] text-white shadow-lg shadow-[#FF4D6D]/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}>
                              <input type="checkbox" checked={isChecked} className="hidden"
                                onChange={() => {
                                  const newList = isChecked ? currentList.filter(a => a !== amentiy) : [...currentList, amentiy];
                                  setHotelForm(p => ({ ...p, amenities: newList.join(', ') }));
                                }}
                              />
                              {amentiy}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2">
                       <ImageUpload label="Property Visual Representative" currentUrl={hotelForm.imageUrl} onUpload={(url) => setHotelForm(p => ({ ...p, imageUrl: url }))} />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    <button type="submit" disabled={savingHotel}
                      className="flex-1 bg-white text-black hover:bg-[#FF4D6D] hover:text-white font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em]">
                      {savingHotel ? <Loader2 size={16} className="animate-spin mx-auto" /> : (editingHotel ? 'Execute Revision' : 'Confirm Registration')}
                    </button>
                  </div>
                </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {hotels.map(h => (
                  <div key={h.id} className="bg-[#0f172a] rounded-[40px] shadow-2xl border border-white/5 overflow-hidden group hover:border-[#FF4D6D]/30 transition-all">
                    <div className="h-48 relative overflow-hidden bg-slate-900 border-b border-white/5">
                      {h.imageUrl ? (
                        <img src={h.imageUrl} alt={h.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/5"><Hotel size={48} /></div>
                      )}
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                         <Star size={12} className="text-yellow-400 fill-yellow-400" />
                         <span className="text-white text-[10px] font-black">{h.rating || '—'}</span>
                      </div>
                    </div>
                    <div className="p-8">
                      <p className="text-[#FF4D6D] text-[10px] font-black tracking-[0.2em] uppercase mb-1">{h.location}</p>
                      <h3 className="font-black text-white text-xl truncate mb-8">{h.name}</h3>
                      
                      <div className="flex gap-4">
                        <button onClick={() => { setEditingHotel(h); setHotelForm({ name: h.name, location: h.location, description: h.description || '', rating: h.rating || '', imageUrl: h.imageUrl || '', amenities: h.amenities || '' }); setShowHotelForm(true); }}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5">
                          <Pencil size={14} /> REVISE
                        </button>
                        <button onClick={() => handleDeleteHotel(h.id)}
                          className="flex-1 py-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 border border-red-500/20">
                          <Trash2 size={14} /> PURGE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ TAB: Rooms ══ */}
          {tab === 'rooms' && (
            <div className="animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-end gap-8">
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">Inventory Logic</h2>
                    <select value={filterHotelId} onChange={e => setFilterHotelId(e.target.value)}
                      className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-slate-400 focus:outline-none focus:border-[#FF4D6D] uppercase tracking-widest">
                      <option value="">Full Cluster</option>
                      {hotels.map(h => <option key={h.id} value={h.id} className="bg-[#0f172a]">{h.name}</option>)}
                    </select>
                 </div>
                 <button onClick={() => { setEditingRoom(null); setShowRoomForm(true); }}
                  className="bg-[#FF4D6D] hover:bg-[#ff3d5f] text-white text-[10px] font-black px-8 py-4 rounded-2xl transition-all shadow-xl uppercase tracking-widest">
                  Inject Inventory Unit
                </button>
              </div>

              {showRoomForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md">
                <form onSubmit={handleRoomSubmit} className="bg-[#0f172a] rounded-[48px] shadow-2xl border border-white/10 p-12 max-w-2xl w-full animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{editingRoom ? 'Revise Unit' : 'Initialize Unit'}</h3>
                    <button type="button" onClick={() => setShowRoomForm(false)} className="text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                  </div>
                  
                  {roomFormError && (
                    <div className="mb-6 bg-red-500/10 text-red-500 p-4 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                      <AlertCircle size={14} /> {roomFormError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <div className="sm:col-span-2 mb-4">
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Parent Property</label>
                      <select value={roomForm.hotelId} onChange={e => setRoomForm(p => ({ ...p, hotelId: e.target.value }))}
                        className="w-full px-5 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:border-[#FF4D6D] transition-all">
                        <option value="" className="bg-[#0f172a]">Select Property</option>
                        {hotels.map(h => <option key={h.id} value={h.id} className="bg-[#0f172a]">{h.name}</option>)}
                      </select>
                    </div>
                    <FormInput label="Variant Designation" value={roomForm.roomType} onChange={e => setRoomForm(p => ({ ...p, roomType: e.target.value }))} placeholder="Deluxe Ocean Suite" required />
                    <FormInput label="Price / Night" type="number" value={roomForm.price} onChange={e => setRoomForm(p => ({ ...p, price: e.target.value }))} placeholder="5000" required />
                    <FormInput label="Capacity" type="number" value={roomForm.capacity} onChange={e => setRoomForm(p => ({ ...p, capacity: e.target.value }))} placeholder="2" required />
                    <FormInput label="Available Units" type="number" value={roomForm.availableRooms} onChange={e => setRoomForm(p => ({ ...p, availableRooms: e.target.value }))} placeholder="10" required />
                    <div className="sm:col-span-2">
                       <ImageUpload label="Variant Visual Representative" currentUrl={roomForm.imageUrl} onUpload={(url) => setRoomForm(p => ({ ...p, imageUrl: url }))} />
                    </div>
                  </div>
                  <button type="submit" disabled={savingRoom}
                    className="w-full bg-white text-black hover:bg-[#FF4D6D] hover:text-white font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] mt-6">
                    {savingRoom ? <Loader2 size={16} className="animate-spin mx-auto" /> : (editingRoom ? 'Commit Revision' : 'Confirm Injection')}
                  </button>
                </form>
                </div>
              )}

              <div className="bg-[#0f172a] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      {['Media', 'Property Origin', 'Variant', 'Pricing', 'Quota', 'Operations'].map(h => (
                        <th key={h} className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRooms.map(r => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-4">
                           <div className="w-16 h-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden relative">
                              <img src={r.imageUrl || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100" />
                           </div>
                        </td>
                        <td className="px-8 py-4 text-white font-black text-sm uppercase italic opacity-40 group-hover:opacity-100 transition-opacity">{r.hotelName}</td>
                        <td className="px-8 py-4 text-white font-black text-sm uppercase tracking-tighter">{r.roomType}</td>
                        <td className="px-8 py-4 text-[#FF4D6D] font-black text-lg">₹{r.price?.toLocaleString()}</td>
                        <td className="px-8 py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                                 <div className={`h-full ${r.availableRooms > 0 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: (Math.min(r.availableRooms, 10) * 10) + '%' }} />
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.availableRooms} Units</span>
                           </div>
                        </td>
                        <td className="px-8 py-4">
                           <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingRoom(r); setRoomForm({ hotelId: r.hotelId?.toString() || '', roomType: r.roomType || '', price: r.price?.toString() || '', capacity: r.capacity?.toString() || '', availableRooms: r.availableRooms?.toString() || '', description: r.description || '', imageUrl: r.imageUrl || '' }); setShowRoomForm(true); }}
                                className="text-slate-500 hover:text-white transition-colors"><Pencil size={16} /></button>
                              <button onClick={() => handleDeleteRoom(r.id)} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ TAB: Bookings ══ */}
          {tab === 'bookings' && (
            <div className="animate-in slide-in-from-bottom duration-500">
               <h3 className="text-2xl font-black text-white tracking-widest uppercase italic mb-12">Reservation Telemetry</h3>
               <div className="bg-[#0f172a] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      {['Sequence', 'Principal Traveler', 'Asset Configuration', 'Interval', 'Status'].map(h => (
                        <th key={h} className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6 text-slate-500 font-mono font-bold text-xs uppercase tracking-widest">{b.bookingRef}</td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-slate-500 uppercase">
                                 {b.customerName?.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-white text-sm uppercase italic">{b.customerName}</p>
                                 <p className="text-[9px] font-black text-slate-600 tracking-widest uppercase">{b.customerEmail}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-black text-[#FF4D6D] text-sm uppercase tracking-tighter italic">{b.hotelName}</p>
                           <p className="text-[10px] font-black text-slate-500 uppercase italic opacity-40">{b.roomType}</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-white font-black text-[10px] tracking-widest">
                              {b.checkIn} <ChevronRight size={12} className="text-[#FF4D6D]" /> {b.checkOut}
                           </div>
                        </td>
                        <td className="px-8 py-6"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ TAB: Users ══ */}
          {tab === 'users' && (
            <div className="animate-in slide-in-from-bottom duration-500">
               <h3 className="text-2xl font-black text-white tracking-widest uppercase italic mb-12">User Grid Authority</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {users.map(u => (
                    <div key={u.id} className="bg-[#0f172a] rounded-[40px] border border-white/5 p-10 hover:border-[#FF4D6D]/30 transition-all group">
                       <div className="flex items-center gap-6 mb-8">
                          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 flex items-center justify-center">
                             <Users size={32} className="text-white/20 group-hover:text-[#FF4D6D] transition-colors" />
                          </div>
                          <div>
                             <h4 className="font-black text-white text-xl tracking-tighter uppercase italic">{u.name}</h4>
                             <RoleBadge role={u.role} />
                          </div>
                       </div>
                       
                       <div className="space-y-4 mb-10">
                          <div>
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Network ID</p>
                             <p className="text-[11px] font-black text-white tracking-widest mb-1">{u.email}</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Authorized Action</p>
                             <select value={u.role} onChange={e => handleUpdateRole(u.id, e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black text-white focus:outline-none focus:border-[#FF4D6D] uppercase tracking-widest">
                                <option value="CUSTOMER" className="bg-[#0f172a]">CUSTOMER ACCESS</option>
                                <option value="ADMIN" className="bg-[#0f172a]">ADMIN AUTHORITY</option>
                             </select>
                          </div>
                       </div>
                       
                       <button onClick={() => handleDeleteUser(u.id)}
                         className="w-full py-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all border border-red-500/20 italic">
                         Revoke Protocol
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
