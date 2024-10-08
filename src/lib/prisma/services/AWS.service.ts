import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class AWSService {
  s3: S3Client;

  constructor() {
    const options: S3ClientConfig = {
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      endpoint: process.env.NEXT_PUBLIC_AWS_STORAGE_URL,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY!,
      },
      forcePathStyle: true,
    };

    this.s3 = new S3Client(options);
  }
  async getUploadUrl(Key: string) {
    const Bucket = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;

    return getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket,
        Key,
        ACL: 'public-read',
      }),
      { expiresIn: 3600 },
    )
      .then(url => ({ url }))
      .catch(err => {
        console.log({ err });

        return err;
      });
  }
  async deleteAttachment(path: string) {
    const Bucket = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
    const key = path.substring(path.indexOf(Bucket + '/') + 8); //TODO: needs to be tested with minio

    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket,
          Key: key,
        }),
      );
    } catch (err) {
      console.error('File does not exist:', err);
      return;
    }

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
        Key: key,
      }),
    );
  }
}
