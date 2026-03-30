import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ScrollColumn = ({ items, selectedValue, onSelect, itemHeight = 40 }) => {
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
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 h-[200px] overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden relative z-10"
      style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
    >
      <div style={{ height: '80px' }} />
      {items.map((item) => (
        <div 
          key={item.value} 
          className={`h-[40px] flex items-center justify-center snap-center transition-all duration-200 cursor-pointer
            ${item.value === selectedValue ? 'text-slate-900 font-semibold text-xl' : 'text-slate-400 font-medium text-sm'}
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
      <div style={{ height: '80px' }} />
    </div>
  );
};

const DatePickerModal = ({ isOpen, onClose, initialDate, onSelect }) => {
  const defaultDate = initialDate ? new Date(initialDate) : new Date(1998, 5, 24);

  const [year, setYear] = useState(defaultDate.getFullYear());
  const [month, setMonth] = useState(defaultDate.getMonth());
  const [day, setDay] = useState(defaultDate.getDate());

  useEffect(() => {
    if (isOpen) {
      const d = initialDate ? new Date(initialDate) : new Date(1998, 5, 24);
      setYear(d.getFullYear());
      setMonth(d.getMonth());
      setDay(d.getDate());
    }
  }, [isOpen, initialDate]);

  const currentYear = new Date().getFullYear();
  const yearItems = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
     const value = 1900 + i;
     return { label: value.toString(), value };
  }).reverse(); // Latest years on top usually, or standard order? The image has older years first: 1995, 1996, 1997, 1998. So we keep it normal. (Reverting back to normal)

  // the image had 1995..2001 so normal order is good.
  const normalYearItems = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
     const value = 1900 + i;
     return { label: value.toString(), value };
  });


  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthItems = monthNames.map((name, index) => ({ label: name, value: index }));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayItems = Array.from({ length: daysInMonth }, (_, i) => {
      const value = i + 1;
      return { label: value.toString(), value };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="w-6"></div>
          <h2 className="text-[14px] font-bold text-slate-800 tracking-wider">SET BIRTHDAY</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 transition-colors w-6 flex justify-end"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative py-4 px-4 bg-white">
          <div className="absolute top-1/2 left-0 right-0 h-[40px] bg-slate-100/70 -translate-y-1/2 z-0"></div>

          <div className="flex gap-2">
            <ScrollColumn items={normalYearItems} selectedValue={year} onSelect={setYear} />
            <ScrollColumn items={monthItems} selectedValue={month} onSelect={setMonth} />
            <ScrollColumn items={dayItems} selectedValue={validDay} onSelect={setDay} />
          </div>
        </div>

        <div className="p-6 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-[#111] hover:bg-black text-white py-4 rounded-xl transition-all active:scale-[0.98] font-bold tracking-wider text-sm shadow-md"
          >
            SUBMIT
          </button>
        </div>

      </div>
    </div>
  );
};

export default DatePickerModal;
