import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clapperboard, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { getApiErrorMessage, useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create your account. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="brand-lockup" to="/">
          <span className="brand-mark"><Clapperboard size={20} /></span>
          <span>RAYN<span className="brand-accent">.</span> <small>STREAM</small></span>
        </Link>
        <p className="eyebrow">YOUR SEAT IS WAITING</p>
        <h1>Join the reel.</h1>
        <p className="auth-intro">Create your account and make this your own little cinema.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <span className="field-wrap">
              <UserRound aria-hidden="true" size={17} />
              <input
                autoComplete="name"
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                value={name}
              />
            </span>
          </label>
          <label>
            Email address
            <span className="field-wrap">
              <Mail aria-hidden="true" size={17} />
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>
          <label>
            Password
            <span className="field-wrap">
              <LockKeyhole aria-hidden="true" size={17} />
              <input
                autoComplete="new-password"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" disabled={loading} type="submit">
            {loading && <LoaderCircle className="spin" size={17} />}
            {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
