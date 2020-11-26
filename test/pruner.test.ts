import '@aws-cdk/assert/jest';
import { Bucket } from '@aws-cdk/aws-s3';
import { Stack } from '@aws-cdk/core';
import { BucketDeploymentExpirator } from '../src';

test('Stack Resources', () => {
  // GIVEN
  const stack = new Stack();
  const bucket = new Bucket(stack, 'test-bucket');

  // WHEN
  new BucketDeploymentExpirator(stack, 'test-pruner-construct', {
    sourceBucket: bucket,
  });

  // THEN
  expect(stack).toHaveResource('Custom::CDKSPAPruner', {
    ServiceToken: {
      'Fn::GetAtt': [
        'CustomCDKSPAPruner7EE36E3418604B22AC9E149ABDEB886C0D2EA613',
        'Arn',
      ],
    },
  });
});

test('Prune Function Mock', () => {

});