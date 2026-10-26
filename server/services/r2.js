const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const endpoint = process.env.R2_ENDPOINT || (
    accountId ? `https://${accountId}.r2.cloudflarestorage.com` : null
  );
  const bucket = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 is not configured. Set R2_ACCOUNT_ID (or R2_ENDPOINT), R2_BUCKET_NAME, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.');
  }

  return { endpoint, bucket, accessKeyId, secretAccessKey };
}

function createR2Client() {
  const { endpoint, accessKeyId, secretAccessKey } = getR2Config();
  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

async function createMovieUrl(key, { download = false, filename } = {}) {
  const { bucket } = getR2Config();
  const client = createR2Client();
  const options = { Bucket: bucket, Key: key };

  if (download) {
    const safeFilename = filename.replace(/[\r\n"\\]/g, '_');
    options.ResponseContentDisposition = `attachment; filename="${safeFilename}"`;
  }

  return getSignedUrl(client, new GetObjectCommand(options), { expiresIn: 60 * 60 });
}

async function createMovieUploadUrl(key, contentType) {
  const { bucket } = getR2Config();
  const client = createR2Client();
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 15 * 60 },
  );
}

module.exports = { createMovieUrl, createMovieUploadUrl };
