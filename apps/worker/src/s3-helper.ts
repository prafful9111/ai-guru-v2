import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_REGION = process.env.AWS_REGION || "";

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

type S3ObjectLocation = {
  bucket: string;
  key: string;
};

const extractVirtualHostedBucket = (hostname: string): string | null => {
  const marker = ".s3.";
  const index = hostname.indexOf(marker);

  if (index <= 0) {
    return null;
  }

  return hostname.slice(0, index);
};

export const extractS3ObjectLocation = (fileUrl: string): S3ObjectLocation => {
  const parsed = new URL(fileUrl);
  const hostname = parsed.hostname;

  const virtualHostedBucket = extractVirtualHostedBucket(hostname);

  if (virtualHostedBucket) {
    return {
      bucket: virtualHostedBucket,
      key: parsed.pathname.replace(/^\/+/, ""),
    };
  }

  const pathParts = parsed.pathname.replace(/^\/+/, "").split("/");

  if (hostname.startsWith("s3.") && pathParts.length >= 2) {
    const [bucket, ...keyParts] = pathParts;
    return {
      bucket: bucket || process.env.AWS_BUCKET_NAME!,
      key: keyParts.join("/"),
    };
  }

  if (process.env.AWS_BUCKET_NAME) {
    return {
      bucket: process.env.AWS_BUCKET_NAME,
      key: parsed.pathname.replace(/^\/+/, ""),
    };
  }

  throw new Error(`Unable to resolve S3 bucket from URL: ${fileUrl}`);
};

const getAudioMimeTypeFromUrl = (audioUrl: string): string => {
  const normalizedUrl = audioUrl.toLowerCase();

  if (normalizedUrl.endsWith(".mp3")) return "audio/mpeg";
  if (normalizedUrl.endsWith(".wav")) return "audio/wav";
  if (normalizedUrl.endsWith(".ogg")) return "audio/ogg";
  if (normalizedUrl.endsWith(".m4a")) return "audio/mp4";
  if (normalizedUrl.endsWith(".webm")) return "audio/webm";

  return "audio/mpeg";
};

export const getPresignedGetUrl = async (
  fileUrl: string,
  expiresInSeconds = Number(process.env.AUDIO_GET_URL_EXPIRES_IN_SECONDS) ||
    3600,
): Promise<{ presignedUrl: string; mimeType: string }> => {
  const { bucket, key } = extractS3ObjectLocation(fileUrl);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const presignedUrl = await getSignedUrl(s3, command, {
    expiresIn: expiresInSeconds,
  });
  return {
    presignedUrl,
    mimeType: getAudioMimeTypeFromUrl(fileUrl),
  };
};
