import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clapperboard, Clock3, Crown, Film, LoaderCircle, LogOut, Play, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { api, getApiErrorMessage, useAuth } from '../context/AuthContext';
import MoviePlayer from '../components/MoviePlayer';
import UploadModal from '../components/UploadModal';

const filters = [
  { value: 'all', label: 'All titles' },
  { value: 'free', label: 'Free' },
  { value: 'vip', label: 'VIP exclusive' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tier, setTier] = useState('all');
  const [movies, setMovies] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/movies', { params: { tier } });
      const results = Array.isArray(data.movies) ? data.movies : [];
      setMovies(results);
      setFeatured((current) => results.find((movie) => movie.id === current?.id) || results[0] || null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load movies. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [tier]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  function openPlayer(movie) {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedMovie(movie);
  }

  function handleUploadComplete(movie) {
    setShowUpload(false);
    setTier('all');
    setFeatured(movie);
    loadMovies();
  }

  const hero = featured || movies[0];

  return (
    <div className="dashboard">
      <header className="site-header">
        <Link aria-label="RAYN STREAM home" className="brand-lockup" to="/">
          <span className="brand-mark"><Clapperboard size={19} /></span>
          <span>RAYN<span className="brand-accent">.</span> <small>STREAM</small></span>
        </Link>
        <nav aria-label="Main navigation" className="header-actions">
          {user ? (
            <>
              <span className="user-name">{user.name}</span>
              <span className={`member-badge ${user.isVip ? 'vip' : ''}`}>
                {user.isVip && <Crown size={12} />}
                {user.isVip ? 'VIP' : 'STANDARD'}
              </span>
              {user.isAdmin && (
                <button className="secondary-button admin-button" onClick={() => setShowUpload(true)} type="button">
                  <Plus size={15} /> ADD TITLE
                </button>
              )}
              <button aria-label="Sign out" className="icon-button" onClick={() => { logout(); navigate('/'); }} title="Sign out" type="button">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link className="header-link" to="/login">Sign in</Link>
              <Link className="primary-button header-join" to="/signup">JOIN RAYN</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="hero-section">
          {hero?.thumbnail_url && <img alt="" className="hero-image" src={hero.thumbnail_url} />}
          <div className="hero-scrim" />
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={14} /> YOUR NEXT FAVORITE IS HERE</p>
            <h1>{hero?.title || 'Stories for every state of mind.'}</h1>
            {hero ? (
              <>
                <p className="hero-description">{hero.description || 'Settle in and discover a story made for tonight.'}</p>
                <div className="hero-meta">
                  {hero.release_year && <span>{hero.release_year}</span>}
                  {hero.mood && <span>{hero.mood}</span>}
                  {hero.duration && <span><Clock3 size={14} /> {hero.duration}</span>}
                  {hero.is_vip && <span className="hero-vip"><Crown size={13} /> VIP EXCLUSIVE</span>}
                </div>
                <button className="primary-button hero-play" onClick={() => openPlayer(hero)} type="button">
                  <Play fill="currentColor" size={16} /> PLAY MOVIE
                </button>
              </>
            ) : (
              <p className="hero-description">A little cinema, right where you are.</p>
            )}
          </div>
          <div className="hero-indicator"><span /> RAYN STREAMING</div>
        </section>

        <section className="catalog-section" aria-labelledby="catalog-heading">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow"><Film size={14} /> THE COLLECTION</p>
              <h2 id="catalog-heading">Find your next story.</h2>
            </div>
            <div aria-label="Filter titles" className="filter-tabs" role="tablist">
              {filters.map((filter) => (
                <button
                  aria-selected={tier === filter.value}
                  className={`filter-tab ${tier === filter.value ? 'active' : ''}`}
                  key={filter.value}
                  onClick={() => setTier(filter.value)}
                  role="tab"
                  type="button"
                >
                  {filter.value === 'vip' && <Crown size={13} />}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="catalog-state"><LoaderCircle className="spin" size={26} /><span>Loading the collection…</span></div>
          ) : error ? (
            <div className="catalog-state catalog-error">
              <p>{error}</p>
              <button className="secondary-button" onClick={loadMovies} type="button">TRY AGAIN</button>
            </div>
          ) : movies.length === 0 ? (
            <div className="catalog-state"><Film size={25} /><span>No titles in this collection yet.</span></div>
          ) : (
            <div className="movie-grid">
              {movies.map((movie) => (
                <button className="movie-card" key={movie.id} onClick={() => openPlayer(movie)} type="button">
                  <span className="poster-wrap">
                    {movie.thumbnail_url ? (
                      <img alt="" className="poster" loading="lazy" src={movie.thumbnail_url} />
                    ) : (
                      <span className="poster-placeholder"><Film size={31} /></span>
                    )}
                    <span className="poster-shade" />
                    {movie.is_vip && <span className="poster-vip"><Crown size={12} /> VIP</span>}
                    <span className="poster-play"><Play fill="currentColor" size={17} /></span>
                  </span>
                  <span className="movie-info">
                    <span className="movie-title">{movie.title}</span>
                    <span className="movie-meta">
                      {movie.mood && <span>{movie.mood}</span>}
                      {movie.duration && <span>{movie.duration}</span>}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <span>© 2026 RAYN STREAM · STORIES FOR EVERY STATE OF MIND</span>
        <span><ShieldCheck size={13} /> Private streams, made for you</span>
      </footer>

      {selectedMovie && (
        <MoviePlayer
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSignIn={() => { setSelectedMovie(null); navigate('/login'); }}
        />
      )}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploadComplete}
        />
      )}
    </div>
  );
}
