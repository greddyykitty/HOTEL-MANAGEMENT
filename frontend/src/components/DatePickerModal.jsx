import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

const ScrollColumn = ({ items, selectedValue, onSelect, itemHeight = 48 }) => {
  const scrollRef = useRef(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
     const index = items.findIndex((item) => item.value === selectedValue);
     if (scrollRef.current && index !== -1) {
       isProgrammaticScroll.current = true;
       scrollRef.current.scrollTop = index * itemHeight;
       setTimeout(() => {
           isProgrammaticScroll.current = false;
       }, 50);
     }
  }, [selectedValue, items, itemHeight]);

  const handleScroll = (e) => {
    if (isProgrammaticScroll.current) return;
    const scrollTop = e.target.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    if (items[index] && items[index].value !== selectedValue) {
      onSelect(items[index].value);
    }
  };

  return (
    <div className="flex-1 relative group">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[240px] overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden relative z-10 py-[96px]"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {items.map((item) => (
          <div 
            key={item.value} 
            className={`h-[48px] flex items-center justify-center snap-center transition-all duration-300 cursor-pointer
              ${item.value === selectedValue ? 'text-white font-black text-2xl scale-110' : 'text-slate-600 font-bold text-sm'}
            `}
            onClick={() => {
               const idx = items.findIndex((i) => i.value === item.value);
               if (scrollRef.current) {
                 scrollRef.current.scrollTo({
                   top: idx * itemHeight,
                   behavior: 'smooth'
                 });
               }
               onSelect(item.value);
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const DatePickerModal = ({ isOpen, onClose, initialDate, onSelect }) => {
  const defaultDate = initialDate ? new Date(initialDate) : new Date(2000, 0, 1);

  const [year, setYear] = useState(defaultDate.getFullYear());
  const [month, setMonth] = useState(defaultDate.getMonth());
  const [day, setDay] = useState(defaultDate.getDate());

  useEffect(() => {
    if (isOpen) {
      const d = initialDate ? new Date(initialDate) : new Date(2000, 0, 1);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
      setDay(d.getDate());
    }
  }, [isOpen, initialDate]);

  const currentYear = new Date().getFullYear();
  const yearItems = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => {
     const value = 1920 + i;
     return { label: value.toString(), value };
  });

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const monthItems = monthNames.map((name, index) => ({ label: name, value: index }));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayItems = Array.from({ length: daysInMonth }, (_, i) => {
      const value = i + 1;
      return { label: value.toString().padStart(2, '0'), value };
  });

  const validDay = day > daysInMonth ? daysInMonth : day;

  if (!isOpen) return null;

  const handleSubmit = () => {
     const m = (month + 1).toString().padStart(2, '0');
     const d = validDay.toString().padStart(2, '0');
     onSelect(`${year}-${m}-${d}`);
     onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-[#0f172a] rounded-[48px] w-full max-w-md overflow-hidden shadow-2xl border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-10 pt-10 pb-6 border-b border-white/5">
          <div>
            <p className="text-[#FF4D6D] text-[10px] font-black uppercase tracking-[0.4em] mb-1">Temporal Selection</p>
            <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Birth Date</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-500 hover:text-white transition-all bg-white/5 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative py-8 px-8 bg-[#0f172a]">
          {/* Selection Highlight */}
          <div className="absolute top-1/2 left-8 right-8 h-[54px] bg-white/5 border-y border-white/10 -translate-y-1/2 z-0 rounded-2xl pointer-events-none"></div>

          <div className="flex gap-4 relative z-10">
            <ScrollColumn items={yearItems} selectedValue={year} onSelect={setYear} />
            <ScrollColumn items={monthItems} selectedValue={month} onSelect={setMonth} />
            <ScrollColumn items={dayItems} selectedValue={validDay} onSelect={setDay} />
          </div>
        </div>

        <div className="p-10 pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-white text-black hover:bg-[#FF4D6D] hover:text-white py-5 rounded-[24px] transition-all active:scale-[0.98] font-black tracking-[0.3em] text-[11px] uppercase shadow-xl shadow-white/5"
          >
            Confirm Calibration
          </button>
        </div>

      </div>
    </div>
  );
};

export default DatePickerModal;
