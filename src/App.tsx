import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Phone, Activity, Sparkles, Hand, HeartPulse, ChevronRight, ChevronLeft, User, Star, Clock, Check } from 'lucide-react';
import { useState, useMemo } from 'react';

const SERVICE_CATALOG = [
  {
    category: 'Fizjoterapia i osteopatia',
    items: [
      { name: 'Konsultacja + terapia indywidualna', time: '1g 15min', price: '280 zł' },
      { name: 'Terapia indywidualna', time: '50min', price: '230 zł' },
      { name: 'Terapia czaszkowo - krzyżowa', time: '50min', price: '230 zł' },
      { name: 'Konsultacja + terapia + zestaw ćwiczeń', time: '2g', price: '390 zł' }
    ]
  },
  {
    category: 'Kobido & Face Care',
    items: [
      { name: 'Rytuał Kobido', time: '1g 15min', price: '300 zł' },
      { name: 'Rytuał Kobido Premium', time: '1g 45min', price: '390 zł' },
      { name: 'Estetic Manual Face Lift', time: '2g', price: '450 zł' },
      { name: 'Rewitalizacja okolicy ust', time: '55min', price: '250 zł' }
    ]
  },
  {
    category: 'Masaż & Pilates',
    items: [
      { name: 'Masaż terapeutyczny/relaksacyjny', time: '55min', price: '230 zł' },
      { name: 'Masaż leczniczy kobiet w ciąży', time: '55min', price: '230 zł' },
      { name: 'Pilates Therapy', time: '50min', price: '150 zł' }
    ]
  },
  {
    category: 'Pakiety (5 zabiegów)',
    items: [
      { name: 'Pakiet 5x fizjoterapia (cena za zabieg)', time: '50min', price: '210 zł' },
      { name: 'Pakiet 5x Rytuał Kobido (cena za zabieg)', time: '1g 15min', price: '270 zł' },
      { name: 'Pakiet 5x masaż relaksacyjny 90 min (cena za zabieg)', time: '1g 30min', price: '280 zł' }
    ]
  }
];

const MONTH_NAMES_PL = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
const WEEKDAY_NAMES_PL = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

// Mon-Thu-Fri: 12-20, Tue-Wed: 8-17, Sat-Sun: closed
function slotsForDate(date: Date): string[] {
  const day = date.getDay();
  if (day === 0 || day === 6) return [];
  if (day === 2 || day === 3) {
    return ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  }
  return ['12:00', '13:00', '14:00', '15:00', '17:00', '18:00', '19:00'];
}

type SelectedService = { name: string; time: string; price: string; category: string };

function ReservationWidget() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [service, setService] = useState<SelectedService | null>(null);
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const lastOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    const offset = (firstOfMonth.getDay() + 6) % 7; // make Monday = 0
    const days: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= lastOfMonth.getDate(); d++) days.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
    return days;
  }, [viewMonth]);

  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isClosedDay = (d: Date) => { const dow = d.getDay(); return dow === 0 || dow === 6; };

  const goToMonth = (delta: number) => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));
  };

  const reset = () => {
    setStep(1); setService(null); setDate(null); setTime(null);
    setName(''); setPhone(''); setEmail(''); setNotes(''); setConfirmed(false);
  };

  if (confirmed && service && date && time) {
    return (
      <div className="bg-white p-8 md:p-10 rounded-[40px] soft-shadow border border-[#E8E6DF] w-full">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[#5A5A40] flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl italic text-[#5A5A40] mb-2">Rezerwacja przyjęta</h3>
          <p className="text-sm opacity-70 mb-8 max-w-sm">Wysłaliśmy potwierdzenie na podany adres e-mail. Do zobaczenia!</p>
          <div className="w-full bg-[#f9f9f7] rounded-2xl p-6 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Usługa</span>
              <span className="font-semibold text-right max-w-[60%]">{service.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Termin</span>
              <span className="font-semibold">{date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}, {time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Czas trwania</span>
              <span className="font-semibold">{service.time}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-[#E8E6DF]">
              <span className="opacity-60">Do zapłaty na miejscu</span>
              <span className="font-bold text-[#5A5A40]">{service.price}</span>
            </div>
          </div>
          <button
            onClick={reset}
            className="text-[10px] font-sans uppercase tracking-[0.2em] border-b border-[#5A5A40] pb-1 font-bold text-[#5A5A40] hover:opacity-70 transition-opacity"
          >
            Nowa rezerwacja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-[40px] soft-shadow border border-[#E8E6DF] w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
              className="w-7 h-7 rounded-full border border-[#E8E6DF] flex items-center justify-center hover:bg-[#f5f5f0] transition-colors"
              aria-label="Wróć"
            >
              <ChevronLeft className="w-4 h-4 text-[#5A5A40]" />
            </button>
          )}
          <span className="text-sm uppercase tracking-widest font-sans font-bold text-[#5A5A40]">Rezerwacja wizyty</span>
        </div>
        <span className="text-[10px] font-sans opacity-40">Krok {step} / 4</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#5A5A40]' : 'bg-[#E8E6DF]'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <div className="text-[11px] font-sans uppercase tracking-widest opacity-60 mb-1">Krok 1</div>
              <h3 className="text-xl text-[#333]">Wybierz usługę</h3>
            </div>
            <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2 -mr-2">
              {SERVICE_CATALOG.map((cat) => (
                <div key={cat.category}>
                  <div className="text-[10px] font-sans uppercase tracking-widest font-bold opacity-50 mb-2">{cat.category}</div>
                  <div className="space-y-2">
                    {cat.items.map((item) => {
                      const selected = service?.name === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={() => setService({ ...item, category: cat.category })}
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex justify-between items-center gap-3 ${
                            selected
                              ? 'border-[#5A5A40] bg-[#5A5A40]/5'
                              : 'border-[#eee] bg-[#f9f9f7] hover:border-[#5A5A40]/40'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm text-[#333] truncate">{item.name}</div>
                            <div className="text-[10px] font-sans uppercase opacity-50 tracking-widest mt-0.5 flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />{item.time}
                            </div>
                          </div>
                          <div className="text-sm font-sans font-bold text-[#5A5A40] whitespace-nowrap">{item.price}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              disabled={!service}
              onClick={() => setStep(2)}
              className="w-full py-5 px-4 bg-[#5A5A40] text-white rounded-2xl font-sans uppercase text-[11px] tracking-[0.2em] font-bold shadow-lg shadow-[#5A5A4033] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Wybierz termin <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <div className="text-[11px] font-sans uppercase tracking-widest opacity-60 mb-1">Krok 2</div>
              <h3 className="text-xl text-[#333]">Wybierz datę</h3>
            </div>
            <div className="bg-[#f9f9f7] rounded-2xl p-4 border border-[#eee]">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => goToMonth(-1)}
                  disabled={viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth()}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
                  aria-label="Poprzedni miesiąc"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm font-sans font-bold text-[#5A5A40]">
                  {MONTH_NAMES_PL[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </div>
                <button
                  onClick={() => goToMonth(1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Następny miesiąc"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAY_NAMES_PL.map((d) => (
                  <div key={d} className="text-[10px] font-sans uppercase tracking-widest opacity-40 text-center py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const past = d < today;
                  const closed = isClosedDay(d);
                  const disabled = past || closed;
                  const selected = date && sameDay(d, date);
                  const isToday = sameDay(d, today);
                  return (
                    <button
                      key={i}
                      disabled={disabled}
                      onClick={() => { setDate(d); setTime(null); }}
                      className={`aspect-square rounded-lg text-sm font-sans transition-all ${
                        selected
                          ? 'bg-[#5A5A40] text-white font-bold'
                          : disabled
                          ? 'opacity-25 cursor-not-allowed'
                          : 'hover:bg-white text-[#333]'
                      } ${isToday && !selected ? 'ring-1 ring-[#5A5A40]/40' : ''}`}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
            {date && (
              <div>
                <div className="text-[10px] font-sans uppercase tracking-widest opacity-50 mb-3">
                  Dostępne godziny — {date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {slotsForDate(date).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`py-2.5 rounded-xl text-sm font-sans border transition-all ${
                        time === t
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] font-bold'
                          : 'border-[#eee] bg-[#f9f9f7] hover:border-[#5A5A40]/40'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              disabled={!date || !time}
              onClick={() => setStep(3)}
              className="w-full py-5 px-4 bg-[#5A5A40] text-white rounded-2xl font-sans uppercase text-[11px] tracking-[0.2em] font-bold shadow-lg shadow-[#5A5A4033] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Twoje dane <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <div className="text-[11px] font-sans uppercase tracking-widest opacity-60 mb-1">Krok 3</div>
              <h3 className="text-xl text-[#333]">Twoje dane</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-sans uppercase tracking-widest opacity-50 block mb-1.5">Imię i nazwisko</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anna Kowalska"
                    className="w-full pl-11 pr-4 py-3 bg-[#f9f9f7] rounded-2xl border border-[#eee] text-sm focus:outline-none focus:border-[#5A5A40] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-sans uppercase tracking-widest opacity-50 block mb-1.5">Telefon</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+48 600 000 000"
                    className="w-full pl-11 pr-4 py-3 bg-[#f9f9f7] rounded-2xl border border-[#eee] text-sm focus:outline-none focus:border-[#5A5A40] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-sans uppercase tracking-widest opacity-50 block mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anna@example.com"
                  className="w-full px-4 py-3 bg-[#f9f9f7] rounded-2xl border border-[#eee] text-sm focus:outline-none focus:border-[#5A5A40] transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-sans uppercase tracking-widest opacity-50 block mb-1.5">Uwagi (opcjonalnie)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Pierwsza wizyta, ból w odcinku lędźwiowym..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#f9f9f7] rounded-2xl border border-[#eee] text-sm focus:outline-none focus:border-[#5A5A40] transition-colors resize-none"
                />
              </div>
            </div>
            <button
              disabled={!name || !phone || !email}
              onClick={() => setStep(4)}
              className="w-full py-5 px-4 bg-[#5A5A40] text-white rounded-2xl font-sans uppercase text-[11px] tracking-[0.2em] font-bold shadow-lg shadow-[#5A5A4033] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Podsumowanie <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === 4 && service && date && time && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <div className="text-[11px] font-sans uppercase tracking-widest opacity-60 mb-1">Krok 4</div>
              <h3 className="text-xl text-[#333]">Potwierdź rezerwację</h3>
            </div>
            <div className="bg-[#f9f9f7] rounded-2xl p-5 space-y-3 border border-[#eee]">
              <div className="text-[10px] font-sans uppercase tracking-widest opacity-50 mb-1">Wizyta</div>
              <div className="text-base text-[#333]">{service.name}</div>
              <div className="text-[10px] font-sans uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />{service.time} · {service.price}
              </div>
              <div className="h-px bg-[#E8E6DF] my-2" />
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[#5A5A40]" />
                {date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, {time}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-[#5A5A40]" />{name}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#5A5A40]" />{phone}
              </div>
            </div>
            <p className="text-[11px] opacity-60 leading-relaxed">
              Klikając „Potwierdź" akceptujesz regulamin gabinetu. Możesz odwołać wizytę bezpłatnie do 24h przed terminem.
            </p>
            <button
              onClick={() => setConfirmed(true)}
              className="w-full py-5 px-4 bg-[#5A5A40] text-white rounded-2xl font-sans uppercase text-[11px] tracking-[0.2em] font-bold shadow-lg shadow-[#5A5A4033] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" /> Potwierdź rezerwację
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen font-serif text-[#333333] bg-[#f5f5f0] selection:bg-[#5A5A40] selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#f5f5f0]/90 backdrop-blur-md pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-baseline h-16">
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight text-[#5A5A40] font-sans">HOLISTEO</span>
              <span className="text-[10px] font-sans uppercase tracking-[0.3em] opacity-60">Osteopatia & Fizjoterapia</span>
            </div>
            <div className="hidden md:flex gap-10 text-[11px] font-sans uppercase tracking-widest font-semibold">
              <a href="#services" className="border-b border-transparent hover:border-[#5A5A40] pb-1 opacity-50 hover:opacity-100 transition-all">Usługi</a>
              <a href="#reviews" className="border-b border-transparent hover:border-[#5A5A40] pb-1 opacity-50 hover:opacity-100 transition-all">Opinie</a>
              <a href="#contact" className="border-b border-transparent hover:border-[#5A5A40] pb-1 opacity-50 hover:opacity-100 transition-all">Kontakt</a>
            </div>
            <div>
              <a href="#booking" className="bg-[#5A5A40] text-white px-6 py-3 rounded-2xl font-sans uppercase text-[10px] tracking-[0.2em] font-bold shadow-lg shadow-[#5A5A4033] hover:opacity-90 transition-opacity">
                Zarezerwuj Wizytę
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-28 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 text-[#5A5A40] font-light italic"
          >
            Przywracamy <br />
            <span className="font-semibold not-italic">Naturalny Ruch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl leading-relaxed mb-10 max-w-lg opacity-80"
          >
            Profesjonalna pomoc w powrocie do zdrowia. Kompleksowe podejście do Twojego ciała w spokojnej, relaksującej atmosferze.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a href="#booking" className="bg-[#5A5A40] text-white px-8 py-4 rounded-2xl font-sans uppercase text-[11px] tracking-[0.2em] font-bold shadow-lg shadow-[#5A5A4033] hover:opacity-90 transition-all flex items-center justify-center gap-3">
              <Calendar className="w-4 h-4" />
              Zarezerwuj teraz
            </a>
            <a href="#services" className="bg-transparent text-[#5A5A40] border border-[#E8E6DF] px-8 py-4 rounded-2xl font-sans uppercase text-[11px] tracking-[0.2em] font-bold hover:bg-black/5 transition-all flex items-center justify-center gap-2">
              Poznaj nasze usługi
            </a>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="bg-[#E8E6DF] p-10 md:p-16 rounded-[48px]">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl italic text-[#5A5A40] mb-4">Katalog Terapii</h2>
            <p className="text-lg opacity-80 max-w-2xl font-serif">
              Zapoznaj się z naszymi usługami. Wybraną terapię zarezerwujesz bezpośrednio na stronie.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {SERVICE_CATALOG.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <h3 className="text-xl text-[#333] border-b border-[#5A5A40]/20 pb-3">{section.category}</h3>
                <div className="space-y-4">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-baseline group">
                      <div>
                        <div className="text-lg text-[#333] group-hover:text-[#5A5A40] transition-colors">{item.name}</div>
                        <div className="text-[10px] font-sans uppercase opacity-50 tracking-widest">{item.time}</div>
                      </div>
                      <div className="text-sm font-sans font-bold text-[#5A5A40] whitespace-nowrap ml-4">{item.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <a
              href="#booking"
              className="text-[10px] font-sans uppercase tracking-[0.2em] border-b border-[#333] pb-1 font-bold inline-flex items-center gap-2 hover:gap-3 transition-all text-[#5A5A40]"
            >
              Zarezerwuj wizytę online <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Booking & Reviews Layout Grid for Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 py-12">
        
        {/* Booking Section */}
        <section id="booking" className="lg:col-span-7 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl italic text-[#5A5A40] mb-6">Gotowy/a na wizytę?</h2>
          <p className="text-lg opacity-80 mb-10 max-w-xl font-serif">
            Zarezerwuj termin bezpośrednio u nas — bez przekierowań i pośredników. Wybierz usługę, datę i godzinę, a potwierdzenie otrzymasz mailem.
          </p>
          <div className="max-w-md w-full">
            <ReservationWidget />
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#5A5A40] text-[#f5f5f0] p-10 md:p-12 rounded-[48px] h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-8">
                <div className="text-3xl italic">Głos Pacjentów</div>
                <div className="flex gap-1 text-[#E8E6DF]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
              
              <div className="space-y-8">
                {[1, 2].map((i) => (
                  <div key={i} className="mb-4">
                    <p className="text-lg leading-relaxed italic opacity-90 mb-4 font-serif">
                      "Profesjonalizm w każdym calu. Po miesiącach bólu, wreszcie trafiłam w ręce specjalistów."
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-sans uppercase tracking-widest font-bold opacity-60">— Opinia pacjenta</span>
                    </div>
                    {i === 1 && <div className="h-px bg-white/10 w-full mt-6"></div>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-6 mt-6">
              <button className="text-[10px] font-sans uppercase tracking-widest border border-white/20 px-6 py-3 rounded-full hover:bg-white hover:text-[#5A5A40] transition-colors font-bold w-full sm:w-auto">
                Zostaw opinię
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Footer / Contact */}
      <footer id="contact" className="mt-16 py-12 border-t border-[#E8E6DF] max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          
          <div className="flex flex-col sm:flex-row gap-12 lg:gap-24">
            <div className="space-y-4 max-w-sm">
              <span className="text-3xl font-bold tracking-tight text-[#5A5A40] font-sans block mb-2">HOLISTEO</span>
              <p className="opacity-80 text-lg leading-relaxed">
                Holistyczne podejście do Twojego zdrowia i ciała. Osteopatia, fizjoterapia i relaks na najwyższym poziomie.
              </p>
            </div>

            <div className="flex gap-12 sm:gap-16 pt-2 md:pt-0">
              <div className="space-y-2">
                <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold opacity-40 mb-3">Lokalizacja</div>
                <div className="text-sm font-sans">Lutniowa 25/9</div>
                <div className="text-sm font-sans">Warszawa, Polska</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold opacity-40 mb-3">Godziny</div>
                <div className="text-sm font-sans whitespace-nowrap">Pon, Czw, Pt: 12:00 - 20:00</div>
                <div className="text-sm font-sans whitespace-nowrap">Wt, Śr: 08:00 - 17:00</div>
                <div className="text-sm font-sans whitespace-nowrap opacity-60">Sob - Ndz: Zamknięte</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full border border-[#E8E6DF] flex items-center justify-center text-[10px] font-sans font-bold opacity-60 hover:opacity-100 hover:border-[#5A5A40] transition-all">IG</a>
            <a href="#" className="w-10 h-10 rounded-full border border-[#E8E6DF] flex items-center justify-center text-[10px] font-sans font-bold opacity-60 hover:opacity-100 hover:border-[#5A5A40] transition-all">FB</a>
          </div>
        </div>
        
        <div className="mt-16 pt-8 flex justify-between items-center text-xs font-sans opacity-50 border-t border-[#E8E6DF]">
          <p>&copy; {new Date().getFullYear()} Holisteo. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}
