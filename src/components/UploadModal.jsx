import { useState } from 'react';
import axios from 'axios';
import { Film, LoaderCircle, UploadCloud, X } from 'lucide-react';
import { api, getApiErrorMessage } from '../context/AuthContext';

const initialForm = {
  title: '',
  description: '',
  mood: '',
  duration: '',
  release_year: '',
  rating: '',
  is_vip: false,
};

export default function UploadModal({ onClose, onUploaded }) {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!file || !file.type.startsWith('video/')) {
      setError('Choose a valid video file to upload.');
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      const { data: presign } = await api.post('/upload/presign', {
        filename: file.name,
        contentType: file.type,
      });
      if (!presign.uploadUrl || !presign.key) {
        throw new Error('The server returned an invalid upload response.');
      }

      await axios.put(presign.uploadUrl, file, {
        headers: { 'Content-Type': presign.contentType || file.type },
        onUploadProgress: ({ loaded, total }) => {
          if (total) setProgress(Math.round((loaded / total) * 100));
        },
      });

      const { data } = await api.post('/movies', {
        ...form,
        release_year: form.release_year ? Number(form.release_year) : null,
        rating: form.rating ? Number(form.rating) : null,
        r2_key: presign.key,
      });
      onUploaded(data.movie);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Upload failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !loading && onClose()}>
      <section aria-labelledby="upload-title" aria-modal="true" className="upload-modal" role="dialog">
        <button aria-label="Close upload dialog" className="icon-button upload-close" disabled={loading} onClick={onClose} type="button"><X size={19} /></button>
        <p className="eyebrow">STUDIO ACCESS</p>
        <h2 id="upload-title">Add a new title.</h2>
        <p className="muted">Upload your video directly to secure RAYN storage.</p>

        <form className="upload-form" onSubmit={handleSubmit}>
          <label className="upload-file">
            <Film size={19} />
            <span>{file ? file.name : 'Choose a video file'}</span>
            <input accept="video/*" onChange={(event) => setFile(event.target.files?.[0] || null)} required type="file" />
          </label>
          <div className="upload-fields">
            <label>Title<input maxLength={255} name="title" onChange={updateField} required value={form.title} /></label>
            <label>Mood<input maxLength={50} name="mood" onChange={updateField} placeholder="e.g. Sci-fi" value={form.mood} /></label>
            <label>Description<textarea maxLength={5000} name="description" onChange={updateField} rows={3} value={form.description} /></label>
            <div className="upload-inline">
              <label>Duration<input maxLength={50} name="duration" onChange={updateField} placeholder="1h 42m" value={form.duration} /></label>
              <label>Release year<input max="9999" min="1888" name="release_year" onChange={updateField} type="number" value={form.release_year} /></label>
              <label>Rating<input max="10" min="0" name="rating" onChange={updateField} step="0.1" type="number" value={form.rating} /></label>
            </div>
            <label className="vip-checkbox"><input checked={form.is_vip} name="is_vip" onChange={updateField} type="checkbox" /> VIP exclusive</label>
          </div>
          {loading && (
            <div aria-live="polite" className="upload-progress">
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              <span>{progress === 100 ? 'Saving movie details…' : `Uploading video · ${progress}%`}</span>
            </div>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button upload-submit" disabled={loading} type="submit">
            {loading ? <LoaderCircle className="spin" size={17} /> : <UploadCloud size={17} />}
            {loading ? 'PLEASE WAIT…' : 'UPLOAD TITLE'}
          </button>
        </form>
      </section>
    </div>
  );
}
