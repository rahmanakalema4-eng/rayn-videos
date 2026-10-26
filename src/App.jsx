import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  Clapperboard,
  Clock3,
  CreditCard,
  Film,
  Heart,
  Info,
  Menu,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
  Zap,
} from 'lucide-react';

const previewVideo =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';

const movies = [
  {
    id: 'night-shift',
    title: 'Night Shift',
    year: '2025',
    genre: 'Mystery',
    rating: '8.4',
    duration: '1h 48m',
    image:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=760&q=85',
    moods: ['Late Night Thrill', 'Mind-Benders'],
    label: 'EDITOR\'S PICK',
  },
  {
    id: 'blue-hour',
    title: 'The Blue Hour',
    year: '2024',
    genre: 'Drama',
    rating: '7.9',
    duration: '1h 36m',
    image:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=760&q=85',
    moods: ['Feel Good Vibes'],
    label: 'RAYN ORIGINAL',
  },
  {
    id: 'the-loop',
    title: 'The Loop',
    year: '2025',
    genre: 'Sci-fi',
    rating: '8.1',
    duration: '1h 42m',
    image:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=760&q=85&sat=-35',
    moods: ['Mind-Benders', 'Quick 10-Min Break'],
    label: 'TRENDING',
  },
  {
    id: 'soft-landing',
    title: 'Soft Landing',
    year: '2024',
    genre: 'Comedy',
    rating: '7.6',
    duration: '1h 29m',
    image:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=760&q=85',
    moods: ['Feel Good Vibes', 'Quick 10-Min Break'],
    label: 'EASY WATCH',
  },
  {
    id: 'deep-water',
    title: 'Deep Water',
    year: '2025',
    genre: 'Thriller',
    rating: '8.0',
    duration: '1h 51m',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=760&q=85',
    moods: ['Late Night Thrill'],
    label: 'NEW THIS WEEK',
  },
  {
    id: 'small-worlds',
    title: 'Small Worlds',
    year: '2024',
    genre: 'Adventure',
    rating: '7.8',
    duration: '1h 34m',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=760&q=85',
    moods: ['Feel Good Vibes', 'Mind-Benders'],
    label: 'HIDDEN GEM',
  },
  {
    id: 'after-image',
    title: 'After Image',
    year: '2025',
    genre: 'Mystery',
    rating: '8.3',
    duration: '1h 45m',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=760&q=85',
    moods: ['Mind-Benders', 'Late Night Thrill'],
    label: 'RAYN ORIGINAL',
  },
  {
    id: 'one-more-day',
    title: 'One More Day',
    year: '2024',
    genre: 'Romance',
    rating: '7.7',
    duration: '1h 31m',
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=760&q=85',
    moods: ['Quick 10-Min Break', 'Feel Good Vibes'],
    label: 'JUST ADDED',
  },
];

const moods = [
  { name: 'Late Night Thrill', icon: '◒' },
  { name: 'Quick 10-Min Break', icon: '◷' },
  { name: 'Feel Good Vibes', icon: '☼' },
  { name: 'Mind-Benders', icon: '◇' },
];

const plans = [
  {
    name: 'Daily Pass',
    price: '$1.99',
    period: '/ day',
    description: 'A night in, on your terms.',
    features: ['Full HD streaming', 'Unlimited downloads', 'Valid for 24 hours'],
  },
  {
    name: 'Monthly VIP',
    price: '$8.99',
    period: '/ month',
    description: 'Your own little cinema.',
    features: ['Up to 4K streaming', 'Offline viewing', 'Cancel any time'],
    featured: true,
  },
];

function IconButton({ label, onClick, children, className = '' }) {
  return (
    <button
      aria-label={label}
      className={`grid size-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/75 transition hover:border-white/25 hover:bg-white/10 hover:text-white ${className}`}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function App() {
  const [dataSaver, setDataSaver] = useState(false);
  const [activeMood, setActiveMood] = useState('All titles');
  const [search, setSearch] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(movies[0]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [download, setDownload] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef(null);

  const filteredMovies = movies.filter((movie) => {
    const matchesMood = activeMood === 'All titles' || movie.moods.includes(activeMood);
    const matchesSearch = `${movie.title} ${movie.genre}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return matchesMood && matchesSearch;
  });

  useEffect(() => {
    if (download?.status !== 'downloading') return undefined;

    const timer = window.setInterval(() => {
      setDownload((current) => {
        if (!current || current.status !== 'downloading') return current;
        const progress = Math.min(current.progress + 10, 100);
        return {
          ...current,
          progress,
          status: progress === 100 ? 'ready' : 'downloading',
        };
      });
    }, 170);

    return () => window.clearInterval(timer);
  }, [download?.status]);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isModalOpen]);

  function selectMovie(movie) {
    setSelectedMovie(movie);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startDownload(movie) {
    setDownload({ title: movie.title, progress: 0, status: 'downloading' });
  }

  function toggleSaved(movieId) {
    setSavedMovies((current) =>
      current.includes(movieId)
        ? current.filter((savedId) => savedId !== movieId)
        : [...current, movieId],
    );
  }

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function openPlans() {
    setCheckoutMessage('');
    setIsModalOpen(true);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#111310] text-[#f3f1e9] selection:bg-[#e37558] selection:text-[#111310]">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-[0.12] [background-image:radial-gradient(#ffffff_0.55px,transparent_0.55px)] [background-size:7px_7px]" />

      <header className="relative z-20 border-b border-white/[0.08] bg-[#111310]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a aria-label="Rayn Stream home" className="flex items-center gap-3" href="#top">
            <span className="grid size-9 place-items-center rounded-full bg-[#e37558] text-[#171512]">
              <Clapperboard size={18} strokeWidth={2.5} />
            </span>
            <span className="text-[15px] font-black tracking-[0.18em]">RAYN<span className="text-[#e37558]">.</span></span>
            <span className="hidden text-[10px] font-semibold tracking-[0.2em] text-white/35 sm:block">STREAM</span>
          </a>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <a className="text-sm font-medium text-white transition hover:text-[#e37558]" href="#discover">Discover</a>
            <a className="text-sm font-medium text-white/50 transition hover:text-white" href="#collection">My collection <span className="ml-1 text-[#e37558]">{savedMovies.length || ''}</span></a>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              aria-checked={dataSaver}
              aria-label={`Data Saver Mode ${dataSaver ? 'on' : 'off'}`}
              className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 transition hover:border-white/20 sm:px-3.5"
              onClick={() => setDataSaver((current) => !current)}
              role="switch"
              type="button"
            >
              <span className={`relative h-[17px] w-[30px] rounded-full transition ${dataSaver ? 'bg-[#e37558]' : 'bg-white/20'}`}>
                <span className={`absolute top-[3px] size-[11px] rounded-full bg-white transition-transform ${dataSaver ? 'translate-x-[16px]' : 'translate-x-[3px]'}`} />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-[10px] font-bold leading-3 text-white/85">{dataSaver ? 'DATA SAVER' : 'STANDARD HD'}</span>
                <span className="block pt-0.5 text-[9px] leading-3 text-white/40">{dataSaver ? '480p · low data' : '1080p · best quality'}</span>
              </span>
              <Zap className={`size-3.5 sm:hidden ${dataSaver ? 'text-[#e37558]' : 'text-white/50'}`} />
            </button>
            <button
              className="hidden rounded-full bg-[#e37558] px-4 py-2.5 text-[11px] font-extrabold tracking-[0.08em] text-[#171512] transition hover:bg-[#f08a6c] sm:block"
              onClick={openPlans}
              type="button"
            >
              GET VIP
            </button>
            <IconButton
              className="md:hidden"
              label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </IconButton>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1 border-t border-white/10 px-6 py-3 md:hidden">
            <a className="py-2 text-sm text-white" href="#discover" onClick={() => setMobileMenuOpen(false)}>Discover</a>
            <a className="py-2 text-sm text-white/60" href="#collection" onClick={() => setMobileMenuOpen(false)}>My collection ({savedMovies.length})</a>
            <button className="py-2 text-left text-sm font-semibold text-[#e37558]" onClick={openPlans} type="button">Explore VIP plans</button>
          </nav>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12" id="top">
        <section aria-label="Featured movie" className="grid gap-7 pb-14 pt-7 lg:grid-cols-[minmax(0,1.75fr)_minmax(290px,0.8fr)] lg:gap-9 lg:pb-[72px] lg:pt-10">
          <div className="relative isolate aspect-video min-h-[260px] overflow-hidden rounded-[5px] border border-white/10 bg-[#242720] sm:min-h-[360px] lg:min-h-0">
            <video
              aria-label={`${selectedMovie.title} preview`}
              className="absolute inset-0 size-full object-cover"
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              playsInline
              poster={selectedMovie.image.replace('w=760', 'w=1400')}
              preload={dataSaver ? 'none' : 'metadata'}
              ref={videoRef}
              src={previewVideo}
            />
            <div className="absolute inset-0 -z-0 bg-gradient-to-t from-black/85 via-black/10 to-black/25" />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-sm border border-white/15 bg-black/50 px-2.5 py-1.5 text-[9px] font-bold tracking-[0.15em] text-white/90 backdrop-blur sm:left-6 sm:top-6">
              <span className="size-1.5 animate-pulse rounded-full bg-[#e37558]" />
              NOW STREAMING · {dataSaver ? '480P' : '1080P'}
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 sm:bottom-6 sm:left-6 sm:right-6">
              <div>
                <p className="mb-2 text-[9px] font-bold tracking-[0.22em] text-[#f09579] sm:text-[10px]">RAYN ORIGINAL · PREVIEW</p>
                <p className="font-serif text-[27px] leading-none tracking-tight text-white sm:text-[38px]">{selectedMovie.title}</p>
              </div>
              <button
                aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e37558] text-[#171512] shadow-lg transition hover:scale-105 hover:bg-[#f08a6c] sm:size-14"
                onClick={togglePlayback}
                type="button"
              >
                {isPlaying ? <Pause fill="currentColor" size={19} /> : <Play className="translate-x-px" fill="currentColor" size={20} />}
              </button>
            </div>
            <div className="absolute bottom-[76px] right-5 flex items-center gap-2 text-white/60 sm:bottom-[91px] sm:right-7">
              <Volume2 size={14} />
              <span className="text-[9px] font-semibold tracking-[0.12em]">PREVIEW</span>
            </div>
          </div>

          <div className="flex flex-col justify-center py-1 lg:py-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#e37558]">TONIGHT'S FEATURE</span>
              <span className="h-px w-8 bg-[#e37558]/60" />
            </div>
            <h1 className="max-w-lg font-serif text-[40px] leading-[0.98] tracking-tight sm:text-[52px] lg:text-[clamp(42px,4vw,61px)]">{selectedMovie.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-white/55">
              <span className="text-white/80">{selectedMovie.year}</span>
              <span className="size-1 rounded-full bg-[#e37558]" />
              <span>{selectedMovie.genre}</span>
              <span className="size-1 rounded-full bg-white/25" />
              <span className="flex items-center gap-1 text-[#f0bd72]"><span className="text-[13px]">★</span>{selectedMovie.rating}</span>
              <span className="size-1 rounded-full bg-white/25" />
              <span className="flex items-center gap-1"><Clock3 size={12} />{selectedMovie.duration}</span>
            </div>
            <p className="mt-5 max-w-md text-[13px] leading-[1.8] text-white/55">
              One signal. Two timelines. A city that remembers everything except the truth. Step into a story that stays with you after the credits.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <button
                className="flex h-11 items-center gap-2.5 rounded-sm bg-[#e37558] px-5 text-[11px] font-extrabold tracking-[0.08em] text-[#171512] transition hover:bg-[#f08a6c]"
                onClick={togglePlayback}
                type="button"
              >
                {isPlaying ? <Pause fill="currentColor" size={14} /> : <Play fill="currentColor" size={14} />}
                {isPlaying ? 'PAUSE PREVIEW' : 'PLAY PREVIEW'}
              </button>
              <button
                className="flex h-11 items-center gap-2 rounded-sm border border-white/15 px-4 text-[10px] font-bold tracking-[0.07em] text-white/80 transition hover:border-white/35 hover:bg-white/[0.04]"
                onClick={() => startDownload(selectedMovie)}
                type="button"
              >
                <ArrowDownToLine size={15} /> DOWNLOAD
              </button>
              <button
                aria-label={savedMovies.includes(selectedMovie.id) ? 'Remove from collection' : 'Add to collection'}
                className={`grid size-11 place-items-center rounded-sm border border-white/15 transition hover:border-white/35 ${savedMovies.includes(selectedMovie.id) ? 'text-[#e37558]' : 'text-white/65'}`}
                onClick={() => toggleSaved(selectedMovie.id)}
                title={savedMovies.includes(selectedMovie.id) ? 'Remove from collection' : 'Add to collection'}
                type="button"
              >
                <Heart fill={savedMovies.includes(selectedMovie.id) ? 'currentColor' : 'none'} size={16} />
              </button>
            </div>
            {download && (
              <div aria-live="polite" className="mt-5 max-w-md border-l-2 border-[#e37558] bg-white/[0.035] px-3.5 py-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-[10px]">
                  <span className="text-white/80">{download.status === 'ready' ? 'READY OFFLINE' : 'PREPARING DOWNLOAD'} · {download.title}</span>
                  <span className="tabular-nums text-[#f09579]">{download.progress}%</span>
                </div>
                <div className="h-1 overflow-hidden bg-white/10">
                  <div className="h-full bg-[#e37558] transition-[width] duration-200" style={{ width: `${download.progress}%` }} />
                </div>
              </div>
            )}
            <div className="mt-7 flex items-center gap-2 text-[10px] text-white/35">
              <ShieldCheck size={13} /> Private viewing · No ads · Watch anywhere
            </div>
          </div>
        </section>

        <section aria-labelledby="mood-heading" className="border-y border-white/[0.09] py-6 sm:py-7" id="discover">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] text-[#e37558]">PICK YOUR FEELING</p>
                <h2 className="mt-1 font-serif text-[20px]" id="mood-heading">A little mood goes a long way.</h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter movies by mood">
              <button
                aria-pressed={activeMood === 'All titles'}
                className={`h-9 rounded-full border px-3.5 text-[10px] font-semibold transition ${activeMood === 'All titles' ? 'border-[#e37558]/60 bg-[#e37558]/10 text-[#f09579]' : 'border-white/10 text-white/55 hover:border-white/25 hover:text-white'}`}
                onClick={() => setActiveMood('All titles')}
                type="button"
              >
                All titles
              </button>
              {moods.map((mood) => (
                <button
                  aria-pressed={activeMood === mood.name}
                  className={`flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[10px] font-semibold transition ${activeMood === mood.name ? 'border-[#e37558]/60 bg-[#e37558]/10 text-[#f09579]' : 'border-white/10 text-white/55 hover:border-white/25 hover:text-white'}`}
                  key={mood.name}
                  onClick={() => setActiveMood(mood.name)}
                  type="button"
                >
                  <span aria-hidden="true" className="text-[13px] leading-none">{mood.icon}</span>{mood.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="catalog-heading" className="pt-8 sm:pt-10" id="collection">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-7 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#e37558]">
                <Sparkles size={13} />
                <span className="text-[9px] font-bold tracking-[0.2em]">CURATED FOR YOU</span>
              </div>
              <h2 className="font-serif text-[27px] sm:text-[31px]" id="catalog-heading">
                {activeMood === 'All titles' ? 'Worth staying in for.' : activeMood}
              </h2>
            </div>
            <label className="flex h-10 w-full items-center gap-2.5 border-b border-white/15 text-white/40 transition focus-within:border-[#e37558] sm:w-[210px]">
              <Search size={15} />
              <input
                aria-label="Search titles"
                className="min-w-0 flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-white/35"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search titles..."
                type="search"
                value={search}
              />
              <ChevronDown className="size-3 -rotate-90 text-white/25" />
            </label>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 xl:grid-cols-5">
              {filteredMovies.map((movie, index) => (
                <article className="group min-w-0" key={movie.id}>
                  <div className="relative aspect-[0.73] overflow-hidden rounded-[3px] bg-[#242720]">
                    <img
                      alt={`${movie.title} atmospheric poster`}
                      className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      decoding="async"
                      loading={index > 2 ? 'lazy' : 'eager'}
                      src={movie.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-black/15 opacity-80 transition group-hover:opacity-100" />
                    <span className="absolute left-2.5 top-2.5 bg-[#111310]/80 px-2 py-1 text-[8px] font-bold tracking-[0.12em] text-[#f0bd72] backdrop-blur">{movie.label}</span>
                    <button
                      aria-label={`Play ${movie.title}`}
                      className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-full border border-white/55 bg-black/35 text-white opacity-0 backdrop-blur transition duration-200 hover:bg-[#e37558] group-hover:scale-100 group-hover:opacity-100 focus:scale-100 focus:opacity-100"
                      onClick={() => selectMovie(movie)}
                      title={`Play ${movie.title}`}
                      type="button"
                    >
                      <Play className="translate-x-px" fill="currentColor" size={16} />
                    </button>
                    <div className="absolute bottom-2.5 right-2.5 flex gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      <IconButton
                        className="size-8 border-white/20 bg-black/40 text-white backdrop-blur hover:bg-[#e37558] hover:text-[#171512]"
                        label={`Download ${movie.title}`}
                        onClick={() => startDownload(movie)}
                      >
                        <ArrowDownToLine size={14} />
                      </IconButton>
                      <IconButton
                        className={`size-8 border-white/20 bg-black/40 text-white backdrop-blur hover:bg-[#e37558] hover:text-[#171512] ${savedMovies.includes(movie.id) ? 'text-[#f09579]' : ''}`}
                        label={savedMovies.includes(movie.id) ? `Remove ${movie.title} from collection` : `Save ${movie.title}`}
                        onClick={() => toggleSaved(movie.id)}
                      >
                        <Heart fill={savedMovies.includes(movie.id) ? 'currentColor' : 'none'} size={14} />
                      </IconButton>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-semibold text-white/90">{movie.title}</h3>
                      <p className="mt-1 text-[10px] text-white/40">{movie.genre} <span className="px-1 text-white/20">·</span> {movie.duration}</p>
                    </div>
                    <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[10px] text-[#f0bd72]"><span>★</span>{movie.rating}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border-y border-white/10 py-14 text-center">
              <Film className="mx-auto mb-3 text-white/30" size={23} />
              <p className="font-serif text-xl">Nothing on this reel yet.</p>
              <p className="mt-2 text-xs text-white/45">Try another mood or search term.</p>
            </div>
          )}
        </section>

        <section className="mt-16 flex flex-col justify-between gap-5 border-t border-white/10 py-7 sm:flex-row sm:items-center" aria-label="Membership offer">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full border border-[#e37558]/30 text-[#e37558]"><CreditCard size={16} /></div>
            <div>
              <p className="text-[12px] font-semibold">Your next favorite is one pass away.</p>
              <p className="mt-1 text-[10px] text-white/45">A day pass from $1.99. No commitment, just good films.</p>
            </div>
          </div>
          <button className="flex h-10 w-fit items-center gap-2 border-b border-[#e37558]/70 text-[10px] font-bold tracking-[0.1em] text-[#f09579] transition hover:border-[#f09579]" onClick={openPlans} type="button">
            SEE MEMBERSHIP OPTIONS <ChevronDown className="size-3 -rotate-90" />
          </button>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-3 px-5 py-5 text-[9px] tracking-[0.04em] text-white/30 sm:flex-row sm:px-8 lg:px-12">
          <span>© 2025 RAYN STREAM. STORIES FOR EVERY STATE OF MIND.</span>
          <span className="flex items-center gap-2"><Info size={11} /> Streaming preview only · Membership checkout is a demo</span>
        </div>
      </footer>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <section aria-labelledby="plans-heading" aria-modal="true" className="relative my-auto w-full max-w-[660px] border border-white/10 bg-[#171915] px-5 py-7 shadow-2xl sm:px-9 sm:py-9" role="dialog">
            <button aria-label="Close membership options" className="absolute right-4 top-4 text-white/45 transition hover:text-white" onClick={() => setIsModalOpen(false)} type="button"><X size={18} /></button>
            <p className="text-[9px] font-bold tracking-[0.2em] text-[#e37558]">THE GOOD STUFF, UNLOCKED</p>
            <h2 className="mt-2 font-serif text-[31px]" id="plans-heading">Make it a movie night.</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-white/50">Pick a pass. Settle in. The kettle can wait.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => (
                <article className={`relative border p-4 sm:p-5 ${plan.featured ? 'border-[#e37558]/60 bg-[#e37558]/[0.06]' : 'border-white/10 bg-white/[0.02]'}`} key={plan.name}>
                  {plan.featured && <span className="absolute right-3 top-3 text-[8px] font-bold tracking-[0.1em] text-[#f09579]">BEST VALUE</span>}
                  <p className="text-[10px] font-bold tracking-[0.12em] text-white/65">{plan.name.toUpperCase()}</p>
                  <p className="mt-3 flex items-baseline gap-1"><span className="font-serif text-[32px]">{plan.price}</span><span className="text-[10px] text-white/40">{plan.period}</span></p>
                  <p className="mt-1 text-[10px] text-white/50">{plan.description}</p>
                  <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-4">
                    {plan.features.map((feature) => <li className="flex items-center gap-2 text-[10px] text-white/65" key={feature}><Check className="size-3.5 text-[#e37558]" />{feature}</li>)}
                  </ul>
                  <button
                    className={`mt-5 flex h-10 w-full items-center justify-center gap-2 text-[9px] font-extrabold tracking-[0.1em] transition ${plan.featured ? 'bg-[#e37558] text-[#171512] hover:bg-[#f08a6c]' : 'border border-white/15 text-white/80 hover:border-white/35 hover:bg-white/[0.04]'}`}
                    onClick={() => setCheckoutMessage(`${plan.name} selected. Payment gateway integration is coming soon.`)}
                    type="button"
                  >
                    <CreditCard size={13} /> CONTINUE WITH {plan.name.toUpperCase()}
                  </button>
                </article>
              ))}
            </div>
            {checkoutMessage && <p aria-live="polite" className="mt-4 border-l-2 border-[#e37558] bg-white/[0.04] px-3 py-2.5 text-[10px] text-white/75">{checkoutMessage}</p>}
            <p className="mt-4 text-center text-[9px] text-white/30">Secure payment simulation · No charges will be made</p>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;