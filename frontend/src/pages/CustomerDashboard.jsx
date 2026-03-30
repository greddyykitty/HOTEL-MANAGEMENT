import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { hotelService, bookingService } from '../services/api';
import {
  Search, MapPin, Star, Calendar, Users, LogOut, Hotel,
  BookOpen, CheckCircle, XCircle, Loader2, AlertCircle,
  ChevronRight, Wifi, Car, Coffee, Dumbbell, X, Bed
} from 'lucide-react';

// ── Amenity chip ───────────────────────────────────────────────────────────────
const AmenityIcon = ({ name }) => {
  const lower = name.toLowerCase();
  if (lower.includes('wifi')) return <Wifi size={11} />;
  if (lower.includes('park')) return <Car size={11} />;
  if (lower.includes('restaurant') || lower.includes('coffee') || lower.includes('bar')) return <Coffee size={11} />;
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('spa')) return <Dumbbell size={11} />;
  return <CheckCircle size={11} />;
};

// ── Star Rating ────────────────────────────────────────────────────────────────
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={11}
        className={i <= Math.round(rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'} />
    ))}
    <span className="text-[11px] text-slate-500 ml-1">{rating?.toFixed(1)}</span>
  </div>
);

// ── Booking Status Badge ───────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full
    ${status === 'CONFIRMED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
    {status === 'CONFIRMED' ? <CheckCircle size={10} /> : <XCircle size={10} />}
    {status}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user, logout } = useContext(AuthContext);

  const [tab, setTab] = useState('search');

  // Hotels state
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotelError, setHotelError] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [minRating, setMinRating] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterAmenity, setFilterAmenity] = useState('');

  // Hotel detail modal
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);

  // Booking
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // My bookings
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { fetchHotels(); }, []);
  useEffect(() => { if (tab === 'bookings') fetchMyBookings(); }, [tab]);

  const fetchHotels = async () => {
    setLoadingHotels(true);
    setHotelError('');
    try {
      const res = await hotelService.getHotels(
        searchLocation || undefined, 
        minRating || undefined,
        minPrice ? parseFloat(minPrice) : undefined,
        maxPrice ? parseFloat(maxPrice) : undefined,
        filterAmenity || undefined
      );
      setHotels(res.data);
    } catch {
      setHotelError('Failed to load hotels. Is the backend running?');
    } finally {
      setLoadingHotels(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  const handleSelectHotel = async (hotel) => {
    setSelectedHotel(hotel);
    setShowHotelModal(true);
    setLoadingRooms(true);
    try {
      const res = await hotelService.getRooms(hotel.id);
      setRooms(res.data);
    } catch {
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
    setBookingError('');
    setBookingSuccess(null);
    setShowBookingForm(true);
    setShowHotelModal(false);
  };

  const handleConfirmBooking = async () => {
    if (!checkIn || !checkOut) { setBookingError('Select check-in and check-out dates.'); return; }
    if (new Date(checkIn) >= new Date(checkOut)) { setBookingError('Check-out must be after check-in.'); return; }

    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await bookingService.createBooking({ roomId: selectedRoom.id, checkIn, checkOut, guests });
      setBookingSuccess(res.data);
      setShowBookingForm(false);
    } catch (err) {
      setBookingError(typeof err.response?.data === 'string' ? err.response.data : 'Booking failed. Room may be unavailable.');
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await bookingService.getMyBookings();
      setMyBookings(res.data);
    } catch { setMyBookings([]); }
    finally { setLoadingBookings(false); }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking? Available rooms will be restored.')) return;
    try {
      await bookingService.cancelBooking(id);
      fetchMyBookings();
    } catch (err) {
      alert(typeof err.response?.data === 'string' ? err.response.data : 'Failed to cancel booking.');
    }
  };

  const nightCount = checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 0;

  return (
    <div className="min-h-screen bg-[#fff0f0]">
      {/* ── Header ── */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel size={22} className="text-[#FF7B7B]" />
            <span className="font-extrabold text-slate-800 text-lg tracking-tight">HotelBooking</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {[
              { id: 'search', icon: <Search size={14} />, label: 'Browse Hotels' },
              { id: 'bookings', icon: <BookOpen size={14} />, label: 'My Bookings' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${tab === t.id ? 'bg-[#FF7B7B] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium hidden sm:block">
              Hi, {user?.name || user?.username || 'Guest'}
            </span>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#FF7B7B] text-sm font-medium transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
        <div className="sm:hidden flex border-t border-slate-100">
          {[{ id: 'search', label: 'Hotels' }, { id: 'bookings', label: 'My Bookings' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-xs font-semibold transition-colors
                ${tab === t.id ? 'border-b-2 border-[#FF7B7B] text-[#FF7B7B]' : 'text-slate-400'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ── Booking Success Banner ── */}
        {bookingSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
            <CheckCircle size={22} className="text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-700 text-base">Booking Confirmed! 🎉</p>
              <p className="text-green-600 text-sm mt-1">
                <strong>{bookingSuccess.hotelName}</strong> — {bookingSuccess.roomType}
              </p>
              <p className="text-green-600 text-sm">{bookingSuccess.checkIn} → {bookingSuccess.checkOut}</p>
              <p className="text-green-600 text-sm font-semibold mt-1">
                Booking Ref: <span className="bg-green-100 px-2 py-0.5 rounded font-mono">{bookingSuccess.bookingRef}</span>
              </p>
              <p className="text-green-600 text-sm">Total: ₹{bookingSuccess.totalPrice?.toLocaleString()}</p>
            </div>
            <button onClick={() => setBookingSuccess(null)} className="ml-auto text-green-400 hover:text-green-600">
              <X size={18} />
            </button>
          </div>
        )}

        {/* ══ TAB: Browse Hotels ══ */}
        {tab === 'search' && (
          <div>
            {/* Search Bar */}
            <form onSubmit={handleSearch}
              className="bg-white rounded-2xl shadow-md p-4 mb-6 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Location</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Mumbai, Goa..."
                    value={searchLocation} onChange={e => setSearchLocation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#FF7B7B]" />
                </div>
              </div>
              <div className="w-28">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Min Price (₹)</label>
                <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#FF7B7B]" />
              </div>
              <div className="w-28">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Max Price (₹)</label>
                <input type="number" placeholder="10000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#FF7B7B]" />
              </div>
              <div className="w-36">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Amenity</label>
                <select value={filterAmenity} onChange={e => setFilterAmenity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#FF7B7B]">
                  <option value="">Any Amenity</option>
                  <option value="Breakfast">Breakfast included</option>
                  <option value="Lunch">Lunch included</option>
                  <option value="WiFi">WiFi</option>
                  <option value="Cab">Cab facilities</option>
                  <option value="Parking">Parking</option>
                </select>
              </div>
              <div className="w-28">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Min Rating</label>
                <select value={minRating} onChange={e => setMinRating(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#FF7B7B]">
                  <option value="">Any</option>
                  <option value="3">3+ ★</option>
                  <option value="4">4+ ★</option>
                  <option value="4.5">4.5+ ★</option>
                </select>
              </div>
              <button type="submit" disabled={loadingHotels}
                className="bg-[#FF7B7B] hover:bg-[#ff6565] text-white font-bold px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 h-9">
                {loadingHotels ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Search
              </button>
            </form>

            {hotelError && (
              <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> {hotelError}
              </div>
            )}

            {loadingHotels ? (
              <div className="flex justify-center py-20">
                <Loader2 size={32} className="animate-spin text-[#FF7B7B]" />
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Hotel size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No hotels found. Try a different location.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {hotels.map(hotel => (
                  <div key={hotel.id}
                    onClick={() => handleSelectHotel(hotel)}
                    className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer
                               hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-slate-100">
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                        alt={hotel.name} className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'; }} />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                        <StarRating rating={hotel.rating} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 text-base mb-1 truncate">{hotel.name}</h3>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
                        <MapPin size={12} className="text-[#FF7B7B]" /> {hotel.location}
                      </div>
                      {hotel.amenities && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {hotel.amenities.split(',').slice(0, 4).map(a => (
                            <span key={a} className="flex items-center gap-1 bg-slate-50 text-slate-600 text-[10px] px-2 py-0.5 rounded-full border border-slate-100">
                              <AmenityIcon name={a.trim()} /> {a.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <button className="w-full bg-[#FF7B7B] hover:bg-[#ff6565] text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                        View Rooms <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: My Bookings ══ */}
        {tab === 'bookings' && (
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-4">My Booking History</h2>
            {loadingBookings ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[#FF7B7B]" /></div>
            ) : myBookings.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white rounded-2xl shadow-sm">
                <BookOpen size={36} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No bookings yet.</p>
                <button onClick={() => setTab('search')} className="mt-4 text-[#FF7B7B] font-semibold text-sm hover:underline">
                  Browse Hotels →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={b.status} />
                          <span className="text-[11px] text-slate-400 font-mono">{b.bookingRef}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">{b.hotelName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{b.hotelLocation} · {b.roomType}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-[#FF7B7B]" /> Check-in: <strong>{b.checkIn}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-[#FF7B7B]" /> Check-out: <strong>{b.checkOut}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} className="text-[#FF7B7B]" /> {b.guests} guest(s)
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#FF7B7B] text-lg">₹{b.totalPrice?.toLocaleString()}</p>
                        {b.status === 'CONFIRMED' && (
                          <button onClick={() => handleCancelBooking(b.id)}
                            className="mt-2 text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ════ HOTEL ROOMS MODAL ════ */}
      {showHotelModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8">
            <div className="relative h-52 overflow-hidden rounded-t-3xl bg-slate-100">
              <img src={selectedHotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                alt={selectedHotel.name} className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'; }} />
              <button onClick={() => setShowHotelModal(false)}
                className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-slate-600 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h2 className="text-xl font-extrabold text-slate-800">{selectedHotel.name}</h2>
                <StarRating rating={selectedHotel.rating} />
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                <MapPin size={12} className="text-[#FF7B7B]" /> {selectedHotel.location}
              </div>
              {selectedHotel.description && (
                <p className="text-sm text-slate-500 mb-4">{selectedHotel.description}</p>
              )}

              <h3 className="font-bold text-slate-700 text-sm mb-3">Available Rooms</h3>

              {loadingRooms ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#FF7B7B]" /></div>
              ) : rooms.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">No rooms found for this hotel.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rooms.map(room => (
                    <div key={room.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                      <div className="h-36 overflow-hidden bg-slate-100">
                        <img src={room.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
                          alt={room.roomType} className="w-full h-full object-cover"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'; }} />
                      </div>
                      <div className="p-3 flex-1 flex flex-col">
                        <h4 className="font-bold text-slate-800 text-sm">{room.roomType}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex-1 line-clamp-2">{room.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Users size={11} /> Max {room.capacity}</span>
                          <span className="flex items-center gap-1">
                            <Bed size={11} />
                            <span className={room.availableRooms > 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                              {room.availableRooms > 0 ? `${room.availableRooms} available` : 'Fully booked'}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-[#FF7B7B] text-base">
                            ₹{room.price?.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/night</span>
                          </span>
                          <button onClick={() => handleBookRoom(room)}
                            disabled={room.availableRooms <= 0}
                            className="bg-[#FF7B7B] hover:bg-[#ff6565] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            {room.availableRooms > 0 ? 'Book Now' : 'Unavailable'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════ BOOKING FORM MODAL ════ */}
      {showBookingForm && selectedRoom && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-slate-800">Confirm Booking</h2>
              <button onClick={() => setShowBookingForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="bg-[#fff0f0] rounded-xl p-4 mb-4">
              <p className="font-bold text-slate-800">{selectedRoom.hotelName}</p>
              <p className="text-sm text-slate-600 mt-0.5">{selectedRoom.roomType} · ₹{selectedRoom.price?.toLocaleString()}/night</p>
              <p className="text-xs text-slate-500 mt-0.5">Max {selectedRoom.capacity} guest(s) · {selectedRoom.availableRooms} rooms available</p>
            </div>

            {bookingError && (
              <div className="mb-3 bg-red-50 text-red-500 p-3 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle size={14} /> {bookingError}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Check-in</label>
                  <input type="date" value={checkIn} min={today} onChange={e => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#FF7B7B]" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Check-out (Max 10 Nights)</label>
                  <input type="date" value={checkOut} min={checkIn || today} 
                    max={checkIn ? new Date(new Date(checkIn).getTime() + 10 * 86400000).toISOString().split('T')[0] : undefined}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#FF7B7B]" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Guests</label>
                <input type="number" min={1} max={selectedRoom.capacity || 4} value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#FF7B7B]" />
              </div>
            </div>

            {nightCount > 0 && (
              <div className="mt-3 bg-green-50 text-green-700 rounded-xl p-3 text-sm font-medium">
                {nightCount} night(s) × ₹{selectedRoom.price?.toLocaleString()} = <strong>₹{(nightCount * selectedRoom.price).toLocaleString()}</strong>
              </div>
            )}

            <button onClick={handleConfirmBooking} disabled={bookingLoading}
              className="w-full mt-4 bg-[#FF7B7B] hover:bg-[#ff6565] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {bookingLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
