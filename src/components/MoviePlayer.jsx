import { useEffect, useState } from 'react';
import { ArrowDownToLine, Crown, LoaderCircle, LockKeyhole, Play, X } from 'lucide-react';
import { api, getApiErrorMessage, useAuth } from '../context/AuthContext';

export default function MoviePlayer({ movie, onClose, onSignIn }) {
  const { user } = useAuth();
  const [streamUrl, setStreamUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradePrompt, setUpgradePrompt] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setStreamUrl('');

    api.get(`/movies/${movie.id}/stream`)
      .then(({ data }) => {
        if (!data.url) throw new Error('The server did not return a stream URL.');
        if (active) setStreamUrl(data.url);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401) {
          setError('Sign in to stream this title.');
        } else {
          setError(getApiErrorMessage(requestError, 'Unable to load this movie.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [movie.id]);

  async function handleDownload() {
    if (!user) {
      setUpgradePrompt('signin');
      return;
    }
    setDownloadLoading(true);
    setUpgradePrompt(false);
    try {
      const { data } = await api.get(`/movies/${movie.id}/download`);
      if (!data.url) throw new Error('The server did not return a download URL.');
      window.location.assign(data.url);
    } catch (requestError) {
      if (requestError.response?.status === 403) {
        setUpgradePrompt('vip');
      } else if (requestError.response?.status === 401) {
        setUpgradePrompt('signin');
      } else {
        setError(getApiErrorMessage(requestError, 'Unable to start this download.'));
      }
    } finally {
      setDownloadLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="player-title" aria-modal="true" className="player-modal" role="dialog">
        <button aria-label="Close player" className="icon-button player-close" onClick={onClose} type="button"><X size={20} /></button>
        <div className="player-screen">
          {loading && <div className="player-state"><LoaderCircle className="spin" size={28} /><span>Preparing your stream…</span></div>}
          {!loading && streamUrl && <video autoPlay className="movie-video" controls playsInline src={streamUrl} />}
          {!loading && error && (
            <div className="player-state">
              <LockKeyhole size={25} />
              <p>{error}</p>
              {error.startsWith('Sign in') && <button className="primary-button" onClick={onSignIn} type="button">SIGN IN</button>}
            </div>
          )}
        </div>
        <div className="player-details">
          <div>
            <p className="eyebrow">{movie.is_vip ? 'VIP EXCLUSIVE' : 'NOW STREAMING'}</p>
            <h2 id="player-title">{movie.title}</h2>
            <p className="muted">{[movie.mood, movie.duration, movie.release_year].filter(Boolean).join(' · ')}</p>
          </div>
          <button className="secondary-button" disabled={downloadLoading} onClick={handleDownload} type="button">
            {downloadLoading ? <LoaderCircle className="spin" size={16} /> : <ArrowDownToLine size={16} />}
            {downloadLoading ? 'GETTING LINK…' : 'DOWNLOAD'}
          </button>
        </div>

        {upgradePrompt && (
          <div className="prompt-backdrop">
            <section aria-labelledby="upgrade-title" aria-modal="true" className="upgrade-card" role="dialog">
              <button aria-label="Close prompt" className="icon-button prompt-close" onClick={() => setUpgradePrompt(false)} type="button"><X size={18} /></button>
              {upgradePrompt === 'vip' ? <Crown className="upgrade-icon" size={26} /> : <LockKeyhole className="upgrade-icon" size={26} />}
              <h3 id="upgrade-title">{upgradePrompt === 'vip' ? 'Make it VIP.' : 'Sign in to continue.'}</h3>
              <p>{upgradePrompt === 'vip' ? 'Downloads are a VIP benefit. Upgrade your membership to take this movie with you.' : 'Sign in to your RAYN STREAM account to download this movie.'}</p>
              {upgradePrompt === 'signin' && <button className="primary-button" onClick={onSignIn} type="button"><Play size={14} /> SIGN IN</button>}
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
