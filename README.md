# CDK Bucket Deployment Expirator

## Why This Package

I've been having issues with my React deployments to AWS S3 while using Cloudfront due to browsers caching and attempting to load chunks that were unavailable after using [CDK Bucket Deployment](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html).

I had been using `prune: true` to clean up the bucket and this was causing all previous chunks to be deleted. However, the reality is we want to support N number of older chunks, just in case, and provide a mechanism for alerting the user that a new version is available (not part of this construct).

## Must Be Used With CDK Bucket Deployment

```typescript
const sourceBucket = new Bucket(this, 'SourceBucket');
const now = new Date().getTime();

new BucketDeployment(this, 'deploy-pwa-exclude-index', {
  sources: [Source.asset('path/to/assets')],
  destinationBucket: pwaBucket,
  metadata: { deployed: now.toString() }, // This actually turns into x-amz-meta-x-amzn-meta-deployed right now
  prune: false
});

new BucketDeploymentExpirator(this, 'expirator', {
  sourceBucket: sourceBucket
})
```

## References

* [CDK Bucket Deployment](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html)