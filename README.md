# RAYN STREAM

## Backend movie API

Apply `server/database.sql` to add the movie VIP-access and private R2 object-key columns. Set `JWT_SECRET` and the R2 credentials in the server environment:

- `R2_ACCOUNT_ID` (or `R2_ENDPOINT`)
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID` (or `AWS_ACCESS_KEY_ID`)
- `R2_SECRET_ACCESS_KEY` (or `AWS_SECRET_ACCESS_KEY`)

Store each private movie object's key in `movies.r2_key`. Do not put a public URL in this field.

- `GET /api/movies?tier=all|free|vip` lists movie metadata without exposing storage keys.
- `GET /api/movies/:id/stream` requires a Bearer JWT; non-VIP members can stream free titles.
- `GET /api/movies/:id/download` requires a VIP Bearer JWT and returns an attachment URL that expires after one hour.

The authentication endpoints also require `JWT_SECRET`; the server intentionally has no hard-coded signing-secret fallback.

## Admin uploads

Run `server/database.sql` to add the `users.is_admin` permission. New accounts are not admins; grant the role only to trusted operators from the database:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'operator@example.com';
```

Admin users can request `POST /api/upload/presign` with `{ "filename": "feature.mp4", "contentType": "video/mp4" }`. The endpoint returns `{ uploadUrl, key, contentType, expiresIn }`; PUT the file directly to `uploadUrl` using the returned `contentType`, then create its movie metadata with admin-authenticated `POST /api/movies` and the returned `key` as `r2_key`. The frontend upload form follows this sequence.

Configure the R2 bucket CORS policy to allow `PUT` from the frontend origins and allow the `Content-Type` request header; otherwise browsers will block direct uploads even when the presigned URL is valid. The frontend API base defaults to `http://localhost:5000/api`; set `VITE_API_URL` to override it.