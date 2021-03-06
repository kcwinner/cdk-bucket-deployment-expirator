# CDK Bucket Deployment Expirator

![build](https://github.com/kcwinner/cdk-bucket-deployment-expirator/workflows/Build/badge.svg)
[![codecov](https://codecov.io/gh/kcwinner/cdk-bucket-deployment-expirator/branch/main/graph/badge.svg)](https://codecov.io/gh/kcwinner/cdk-bucket-deployment-expirator)
[![dependencies Status](https://david-dm.org/kcwinner/cdk-bucket-deployment-expirator/status.svg)](https://david-dm.org/kcwinner/cdk-bucket-deployment-expirator)
[![npm](https://img.shields.io/npm/dt/cdk-bucket-deployment-expirator)](https://www.npmjs.com/package/cdk-bucket-deployment-expirator)

[![npm version](https://badge.fury.io/js/cdk-bucket-deployment-expirator.svg)](https://badge.fury.io/js/cdk-bucket-deployment-expirator)
[![PyPI version](https://badge.fury.io/py/cdk-bucket-deployment-expirator.svg)](https://badge.fury.io/py/cdk-bucket-deployment-expirator)

## Why This Package

I've been having issues with my React deployments to AWS S3 while using Cloudfront due to browsers caching and attempting to load chunks that were unavailable after using [CDK Bucket Deployment](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html).

I had been using `prune: true` to clean up the bucket and this was causing all previous chunks to be deleted. However, the reality is we want to support N number of older chunks, just in case, and provide a mechanism for alerting the user that a new version is available (not part of this construct).

## Must Be Used With CDK Bucket Deployment

```typescript
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';

...
...

const bucket = new Bucket(this, 'SourceBucket');
const now = new Date().getTime();

const bucketDeployment = new BucketDeployment(this, 'deploy-spa', {
  sources: [Source.asset('path/to/assets')],
  destinationBucket: bucket,
  metadata: { deployed: now.toString() },
  prune: false
});

new BucketDeploymentExpirator(this, 'expirator', {
  bucketDeployment: bucketDeployment, // need this to add cfn depends on
  sourceBucket: bucket
})
```

## Versioning

I will *attempt* to align the major and minor version of this package with [AWS CDK], but always check the release descriptions for compatibility.

This currently supports [![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/kcwinner/cdk-bucket-deployment-expirator/@aws-cdk/core)](https://github.com/aws/aws-cdk)

## References

* [CDK Bucket Deployment](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html)