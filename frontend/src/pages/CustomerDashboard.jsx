import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { hotelService, bookingService, reviewService } from '../services/api';
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
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={12}
        className={i <= Math.round(rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} />
    ))}
    <span className="text-xs font-black text-slate-400 ml-1.5">{rating?.toFixed(1) || 'N/A'}</span>
  </div>
);

// ── Booking Status Badge ───────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest
    ${status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
    {status === 'CONFIRMED' ? <CheckCircle size={12} /> : <XCircle size={12} />}
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

  // Reviews state
  const [hotelReviews, setHotelReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
  const currentDate = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

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
    setLoadingReviews(true);
    try {
      const [roomsRes, reviewsRes] = await Promise.all([
        hotelService.getRooms(hotel.id),
        reviewService.getHotelReviews(hotel.id)
      ]);
      setRooms(roomsRes.data);
      setHotelReviews(reviewsRes.data);
    } catch {
      setRooms([]);
      setHotelReviews([]);
    } finally {
      setLoadingRooms(false);
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewService.submitReview({
        hotelId: selectedHotel.id,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewComment('');
      setReviewRating(5);
      // Refresh reviews and hotel list (to update rating)
      const res = await reviewService.getHotelReviews(selectedHotel.id);
      setHotelReviews(res.data);
      fetchHotels();
    } catch (err) {
      alert("Failed to submit review. Try again.");
    } finally {
      setSubmittingReview(false);
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
    if (checkIn < currentDate) { setBookingError('Check-in date cannot be in the past.'); return; }
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
    try {
      await bookingService.cancelBooking(id);
      fetchMyBookings();
      alert('Booking Successfully Cancelled!');
    } catch (err) {
      alert(`[Cancel Failed] ${err.message} | Server says: ${JSON.stringify(err.response?.data)}`);
    }
  };

  const handleQuickRebook = async (b) => {
    try {
      setBookingLoading(true);
      const res = await hotelService.getRooms(b.hotelId);
      const room = res.data.find(r => r.id === b.roomId);
      if (!room) {
        alert("This exact room is no longer available at the hotel.");
        return;
      }
      setSelectedHotel({ id: b.hotelId, name: b.hotelName, location: b.hotelLocation });
      setSelectedRoom(room);
      setCheckIn('');
      setCheckOut('');
      setGuests(b.guests || 1);
      setBookingError('');
      setBookingSuccess(null);
      setShowBookingForm(true);
    } catch (err) {
      alert("Failed to fetch room details for rebooking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const nightCount = checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)
    : 0;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans pb-20">
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4D6D] rounded-lg flex items-center justify-center">
              <Hotel size={18} className="text-white" />
            </div>
            <span className="font-black text-white text-xl tracking-tighter uppercase italic">LuxeStay</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {[
              { id: 'search', label: 'Explore' },
              { id: 'bookings', label: 'My Bookings' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`text-sm font-bold tracking-wide transition-all hover:text-[#FF4D6D]
                  ${tab === t.id ? 'text-[#FF4D6D]' : 'text-slate-400'}`}>
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-400 font-medium hidden sm:block">
              Hello, <span className="text-white font-bold">{user?.name || user?.username || 'Traveler'}</span>
            </span>
            <button onClick={logout}
              className="group flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold transition-all px-4 py-2 rounded-full border border-white/10 hover:bg-white/5">
              <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Padding for Fixed Header ── */}
      <div className="h-20"></div>

      <main className="max-w-7xl mx-auto px-6">
        
        {/* ── Hero Search Section ── */}
        {tab === 'search' && (
          <div className="py-16 md:py-24 text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
              Your Gateway to <span className="text-[#FF4D6D]">Extraordinary</span> Stays
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-12">
              Discover handpicked luxury hotels across the globe. From urban penthouses to serene ocean retreats, experience travel like never before.
            </p>

            <form onSubmit={handleSearch}
              className="bg-[#0f172a] p-2 rounded-3xl shadow-2xl flex flex-wrap md:flex-nowrap gap-2 items-center border border-white/5 max-w-4xl mx-auto">
              <div className="flex-1 min-w-[200px] relative px-4 py-3">
                <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FF4D6D]" />
                <input type="text" placeholder="Where are you going?"
                  value={searchLocation} onChange={e => setSearchLocation(e.target.value)}
                  className="w-full pl-10 pr-3 bg-transparent text-white placeholder-slate-500 focus:outline-none font-bold text-sm" />
              </div>
              <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
              <div className="flex-1 min-w-[150px] px-4 py-3">
                <select value={minRating} onChange={e => setMinRating(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none font-bold text-sm appearance-none cursor-pointer">
                  <option value="" className="bg-[#0f172a]">Any Rating</option>
                  <option value="4" className="bg-[#0f172a]">4+ Stars</option>
                  <option value="4.5" className="bg-[#0f172a]">4.5+ Stars</option>
                </select>
              </div>
              <button type="submit" disabled={loadingHotels}
                className="w-full md:w-auto bg-[#FF4D6D] hover:bg-[#ff3d5f] text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#FF4D6D]/20">
                {loadingHotels ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                Explore
              </button>
            </form>
          </div>
        )}

        {/* ── Content Area ── */}
        <div className="mt-8">
          {bookingSuccess && (
            <div className="mb-8 bg-green-500/10 border border-green-500/20 rounded-3xl p-6 flex items-start gap-4">
              <CheckCircle size={28} className="text-green-500 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-white text-lg mb-1">Booking Confirmed! 🎉</p>
                <div className="text-slate-400 text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  <span>Hotel: <strong className="text-white">{bookingSuccess.hotelName}</strong></span>
                  <span>Ref: <strong className="text-white font-mono">{bookingSuccess.bookingRef}</strong></span>
                  <span>Stay: <strong className="text-white">{bookingSuccess.checkIn} to {bookingSuccess.checkOut}</strong></span>
                  <span>Total: <strong className="text-[#FF4D6D] font-bold">₹{bookingSuccess.totalPrice?.toLocaleString()}</strong></span>
                </div>
              </div>
              <button onClick={() => setBookingSuccess(null)} className="text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          )}

          {/* ══ TAB: Browse Hotels ══ */}
          {tab === 'search' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Featured Destinations</h2>
                  <p className="text-slate-500 text-sm mt-1">Explore our curated collection of world-class stays</p>
                </div>
                <div className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                  {hotels.length} results found
                </div>
              </div>

              {hotelError && (
                <div className="mb-8 bg-red-500/10 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-500/20">
                  <AlertCircle size={20} /> {hotelError}
                </div>
              )}

              {loadingHotels ? (
                <div className="flex justify-center py-32">
                  <Loader2 size={48} className="animate-spin text-[#FF4D6D] opacity-50" />
                </div>
              ) : hotels.length === 0 ? (
                <div className="text-center py-32 bg-[#0f172a] rounded-[40px] border border-white/5">
                  <Hotel size={64} className="mx-auto mb-6 text-slate-800" />
                  <p className="text-white text-xl font-bold">No results found</p>
                  <p className="text-slate-500 mt-2">Try adjusting your filters or location</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {hotels.map(hotel => (
                    <div key={hotel.id}
                      onClick={() => handleSelectHotel(hotel)}
                      className="group bg-[#0f172a] rounded-[32px] overflow-hidden cursor-pointer
                                border border-white/5 hover:border-[#FF4D6D]/30 transition-all duration-500 shadow-2xl">
                      <div className="relative h-64 overflow-hidden">
                        <img src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                          alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'; }} />
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-black text-sm">{hotel.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="p-8">
                        <p className="text-[#FF4D6D] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{hotel.location}</p>
                        <h3 className="font-black text-white text-xl mb-3 group-hover:text-[#FF4D6D] transition-colors truncate">{hotel.name}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 h-10 mb-6 font-medium">
                          {hotel.description || 'Experience ultra-modern luxury with a stunning view. The perfect blend of comfort and elegance for your stay.'}
                        </p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                          <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Price Starts From</p>
                            <p className="text-white text-xl font-black mt-0.5">₹{Math.floor(Math.random() * 50000 + 5000).toLocaleString()}<span className="text-slate-600 text-xs font-bold ml-1">/ night</span></p>
                          </div>
                          <button className="bg-white/5 hover:bg-[#FF4D6D] text-white p-4 rounded-2xl border border-white/10 transition-all group/btn">
                            <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: My Bookings ══ */}
          {tab === 'bookings' && (
            <div className="max-w-4xl mx-auto py-8">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">My Bookings</h2>
                  <p className="text-slate-500 font-medium mt-1">Manage your upcoming and past adventures</p>
                </div>
              </div>

              {loadingBookings ? (
                <div className="flex justify-center py-32"><Loader2 size={40} className="animate-spin text-[#FF4D6D] opacity-50" /></div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-20 bg-[#0f172a] rounded-[40px] border border-white/5 border-dashed">
                  <BookOpen size={48} className="mx-auto mb-6 text-slate-800" />
                  <p className="text-white text-lg font-bold">No bookings found</p>
                  <p className="text-slate-500 mb-8">Ready to start your next journey?</p>
                  <button onClick={() => setTab('search')} className="bg-[#FF4D6D] hover:bg-[#ff3d5f] text-white font-black px-8 py-3 rounded-2xl transition-all">
                    Explore Hotels
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {myBookings.map(b => (
                    <div key={b.id} className="bg-[#0f172a] rounded-[32px] border border-white/5 p-8 transition-all hover:border-white/10">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase
                              ${b.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                              {b.status}
                            </div>
                            <span className="text-[11px] text-slate-600 font-mono font-bold tracking-widest">{b.bookingRef}</span>
                          </div>
                          
                          <h3 className="text-2xl font-black text-white mb-2">{b.hotelName}</h3>
                          <div className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-6">
                            <MapPin size={14} className="text-[#FF4D6D]" /> {b.hotelLocation} · {b.roomType}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                            <div>
                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Check-in</p>
                              <p className="text-white font-bold">{b.checkIn}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Check-out</p>
                              <p className="text-white font-bold">{b.checkOut}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Guests</p>
                              <p className="text-white font-bold">{b.guests} Persons</p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col items-end gap-6 pt-4 border-t border-white/5 md:border-0">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Total Payment</p>
                            <p className="text-3xl font-black text-white">₹{b.totalPrice?.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             {b.status === 'CONFIRMED' && (
                              <button onClick={() => handleCancelBooking(b.id)}
                                className="px-6 py-3 rounded-2xl bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white text-xs font-black transition-all border border-red-500/20">
                                Cancel
                              </button>
                            )}
                            <button onClick={() => handleQuickRebook(b)}
                              className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-black transition-all border border-white/10">
                              Book Again
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ════ HOTEL ROOMS MODAL ════ */}
      {showHotelModal && selectedHotel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] rounded-[40px] shadow-2xl w-full max-w-4xl my-8 border border-white/10 overflow-hidden">
            <div className="relative h-72 overflow-hidden bg-slate-900">
              <img src={selectedHotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                alt={selectedHotel.name} className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'; }} />
              <button onClick={() => setShowHotelModal(false)}
                className="absolute top-6 right-6 bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/10 transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
                <div>
                  <p className="text-[#FF4D6D] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{selectedHotel.location}</p>
                  <h2 className="text-4xl font-black text-white tracking-tighter">{selectedHotel.name}</h2>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                  <StarRating rating={selectedHotel.rating} />
                  <span className="text-white font-black text-lg">{selectedHotel.rating?.toFixed(1)}</span>
                </div>
              </div>

              {selectedHotel.description && (
                <p className="text-slate-400 text-lg leading-relaxed mb-12 font-medium">
                  {selectedHotel.description}
                </p>
              )}

              <div className="mb-12">
                <h3 className="text-xl font-black text-white mb-6 tracking-tight">Available Stays</h3>
                {loadingRooms ? (
                  <div className="flex justify-center py-8"><Loader2 size={32} className="animate-spin text-[#FF4D6D]" /></div>
                ) : rooms.length === 0 ? (
                  <p className="text-center py-8 text-slate-500 font-bold border border-white/5 border-dashed rounded-3xl">No rooms available for the selected dates.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rooms.map(room => (
                      <div key={room.id} className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden group hover:border-[#FF4D6D]/30 transition-all">
                        <div className="h-48 overflow-hidden relative">
                          <img src={room.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
                            alt={room.roomType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                            {room.roomType}
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-4 text-slate-400 text-xs font-bold mb-4">
                            <span className="flex items-center gap-1.5"><Users size={14} className="text-[#FF4D6D]" /> Up to {room.capacity} Guests</span>
                            <span className="flex items-center gap-1.5">
                              <Bed size={14} className="text-[#FF4D6D]" /> 
                              {room.availableRooms > 0 ? `${room.availableRooms} Left` : 'Sold Out'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-white text-2xl font-black">₹{room.price?.toLocaleString()} <span className="text-slate-500 text-xs font-bold">/ night</span></p>
                            <button onClick={() => handleBookRoom(room)}
                              disabled={room.availableRooms <= 0}
                              className="bg-[#FF4D6D] hover:bg-[#ff3d5f] disabled:bg-white/5 disabled:text-slate-600 text-white font-black px-6 py-2 rounded-xl transition-all active:scale-95">
                              Reserve
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Reviews ── */}
              <div className="pt-12 border-t border-white/5">
                <h3 className="text-xl font-black text-white mb-8 tracking-tight">Guest Insights</h3>
                
                {user && (
                  <form onSubmit={handleSubmitReview} className="mb-12 bg-white/5 rounded-3xl p-8 border border-white/5">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <button key={i} type="button" onClick={() => setReviewRating(i)}
                            className="focus:outline-none transition-all hover:scale-110">
                            <Star size={24} className={i <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} />
                          </button>
                        ))}
                      </div>
                      <span className="text-white font-black text-sm uppercase tracking-widest">{reviewRating} Stars</span>
                    </div>
                    <textarea 
                      placeholder="Was your stay extraordinary? Share your thoughts..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      className="w-full p-6 bg-[#020617] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF4D6D] min-h-[120px] font-medium"
                    />
                    <div className="flex justify-end mt-4">
                      <button type="submit" disabled={submittingReview || !reviewComment.trim()}
                        className="bg-white text-black hover:bg-[#FF4D6D] hover:text-white font-black px-8 py-3 rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50">
                        {submittingReview ? <Loader2 size={18} className="animate-spin" /> : 'Publish Review'}
                      </button>
                    </div>
                  </form>
                )}

                {loadingReviews ? (
                  <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#FF4D6D]" /></div>
                ) : hotelReviews.length === 0 ? (
                  <p className="text-center py-8 text-slate-600 font-bold italic">No stories shared yet. Be the first to tell yours.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hotelReviews.map(rev => (
                      <div key={rev.id} className="bg-white/5 rounded-3xl p-6 border border-white/5">
                        <div className="flex justify-between items-start mb-4">
                          <span className="font-black text-white text-sm">{rev.userName}</span>
                          <StarRating rating={rev.rating} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-4 italic">"{rev.comment}"</p>
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                          {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ BOOKING FORM MODAL ════ */}
      {showBookingForm && selectedRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-[40px] shadow-2xl w-full max-w-lg p-10 border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white tracking-tighter">Finalize Stay</h2>
              <button onClick={() => setShowBookingForm(false)} className="text-slate-500 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
              <p className="text-[#FF4D6D] text-[10px] font-black uppercase tracking-[0.2em] mb-1">{selectedRoom.hotelName}</p>
              <h3 className="font-black text-white text-xl">{selectedRoom.roomType}</h3>
              <p className="text-slate-400 font-bold mt-4">₹{selectedRoom.price?.toLocaleString()} <span className="text-xs text-slate-600 uppercase tracking-widest font-black">/ Night</span></p>
            </div>

            {bookingError && (
              <div className="mb-6 bg-red-500/10 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-500/20">
                <AlertCircle size={18} /> {bookingError}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Check-in</label>
                  <input type="date" value={checkIn} min={currentDate} onChange={e => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 bg-[#020617] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#FF4D6D] font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Check-out</label>
                  <input type="date" value={checkOut} min={checkIn || currentDate} 
                    max={checkIn ? new Date(new Date(checkIn).getTime() + 10 * 86400000).toISOString().split('T')[0] : undefined}
                    onChange={e => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 bg-[#020617] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#FF4D6D] font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Guests</label>
                <input type="number" min={1} max={selectedRoom.capacity || 4} value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#020617] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#FF4D6D] font-bold" />
              </div>
            </div>

            {nightCount > 0 && (
              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                <span className="text-slate-400 font-bold italic">{nightCount} Night Stay</span>
                <span className="text-white text-2xl font-black">₹{(nightCount * selectedRoom.price).toLocaleString()}</span>
              </div>
            )}

            <button onClick={handleConfirmBooking} disabled={bookingLoading}
              className="w-full mt-10 bg-[#FF4D6D] hover:bg-[#ff3d5f] text-white font-black py-5 rounded-[24px] shadow-xl shadow-[#FF4D6D]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-60">
              {bookingLoading ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle size={24} />}
              Confirm Reservation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
