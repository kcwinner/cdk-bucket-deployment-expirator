import '@aws-cdk/assert/jest';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { Stack } from '@aws-cdk/core';
import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
import * as nock from 'nock';
import { handler } from '../lambda/src';
import { BucketDeploymentExpirator } from '../src';

const mockDeploymentMetadata = [
  { deployed: '1606366699507' },
  { deployed: '1606366252586' },
  {},
];

beforeAll(() => {
  AWSMock.setSDKInstance(AWS);
  AWSMock.mock('S3', 'listObjectsV2', {
    IsTruncated: false,
    Contents: [
      { Key: 'asset-manifest.json', LastModified: '2020-11-26T02:40:52.000Z', ETag: '"38e"', Size: 6396, StorageClass: 'STANDARD' },
      { Key: 'favicon.ico', LastModified: '2020-11-26T02:40:53.000Z', ETag: '"d71"', Size: 32038, StorageClass: 'STANDARD' },
      { Key: 'index.html', LastModified: '2020-11-26T02:40:53.000Z', ETag: '"8a8"', Size: 4591, StorageClass: 'STANDARD' },
      { Key: 'manifest.json', LastModified: '2020-11-26T02:40:53.000Z', ETag: '"a91"', Size: 289, StorageClass: 'STANDARD' },
      { Key: 'robots.txt', LastModified: '2020-11-26T02:40:55.000Z', ETag: '"fa1"', Size: 67, StorageClass: 'STANDARD' },
      { Key: 'static/css/3.b96.chunk.css', LastModified: '2020-11-26T02:40:52.000Z', ETag: '"fe0"', Size: 5516, StorageClass: 'STANDARD' },
      { Key: 'static/css/3.b96.chunk.css.map', LastModified: '2020-11-26T02:40:54.000Z', ETag: '"6d2"', Size: 10714, StorageClass: 'STANDARD' },
      { Key: 'static/css/main.273.chunk.css', LastModified: '2020-11-26T02:40:54.000Z', ETag: '"36efafb351b6a0b366c99d2cf633bd5d"', Size: 1200, StorageClass: 'STANDARD' },
      { Key: 'static/css/main.273.chunk.css.map', LastModified: '2020-11-26T02:40:55.000Z', ETag: '"0dd"', Size: 2084, StorageClass: 'STANDARD' },
      { Key: 'static/js/10.129.chunk.js', LastModified: '2020-11-26T02:32:46.000Z', ETag: '"3c1"', Size: 6103, StorageClass: 'STANDARD' },
      { Key: 'static/js/10.129.chunk.js.map', LastModified: '2020-11-26T02:32:48.000Z', ETag: '"a2c"', Size: 21764, StorageClass: 'STANDARD' },
      { Key: 'static/js/10.c04.chunk.js', LastModified: '2020-11-25T15:24:43.000Z', ETag: '"e34"', Size: 6103, StorageClass: 'STANDARD' },
      { Key: 'static/js/10.c04.chunk.js.map', LastModified: '2020-11-25T15:24:46.000Z', ETag: '"737"', Size: 21764, StorageClass: 'STANDARD' },
      { Key: 'static/js/10.cab.chunk.js', LastModified: '2020-11-26T02:40:55.000Z', ETag: '"b5e"', Size: 6103, StorageClass: 'STANDARD' },
      { Key: 'static/js/10.cab.chunk.js.map', LastModified: '2020-11-26T02:40:53.000Z', ETag: '"bf3"', Size: 21764, StorageClass: 'STANDARD' },
      { Key: 'static/js/11.6e0.chunk.js', LastModified: '2020-11-25T15:24:47.000Z', ETag: '"522"', Size: 6402, StorageClass: 'STANDARD' },
      { Key: 'static/js/11.6e0.chunk.js.map', LastModified: '2020-11-25T15:24:46.000Z', ETag: '"2ee"', Size: 22921, StorageClass: 'STANDARD' },
      { Key: 'static/js/11.aea.chunk.js', LastModified: '2020-11-26T02:40:55.000Z', ETag: '"f69"', Size: 6402, StorageClass: 'STANDARD' },
    ],
    Name: 'test-bucket',
    Prefix: '',
    MaxKeys: 1000,
    CommonPrefixes: [],
    KeyCount: 17,
  });

  AWSMock.mock('S3', 'headObject', (_: any, callback: any) => {
    const metaObject = mockDeploymentMetadata[Math.floor(Math.random() * mockDeploymentMetadata.length)];
    callback(null, { Metadata: metaObject });
  });

  AWSMock.mock('S3', 'deleteObjects', (params: any, callback: any) => {
    callback(null, params.Delete.Objects);
  });

  nock('https://cloudformation-custom-resource-response-useast2.s3.us-east-2.amazonaws.com')
    .put('/')
    .reply(200);
});

afterAll(() => {
  AWSMock.restore('S3', 'listObjectsV2');
  AWSMock.restore('S3', 'headObject');
  AWSMock.restore('S3', 'deleteObjects');
});

test('Stack Resources', () => {
  // GIVEN
  const stack = new Stack();
  const bucket = new Bucket(stack, 'test-bucket');
  const bucketDeployment = new BucketDeployment(stack, 'test-deploy', {
    sources: [Source.asset('.build')], // We don't really care here
    destinationBucket: bucket,
    metadata: { deployed: new Date().getTime().toString() },
    prune: false,
  });

  // WHEN
  new BucketDeploymentExpirator(stack, 'test-pruner-construct', {
    bucketDeployment: bucketDeployment,
    sourceBucket: bucket,
  });

  // THEN
  expect(stack).toHaveResource('Custom::CDKBucketDeploymentExpirator', {
    ServiceToken: {
      'Fn::GetAtt': [
        'CustomCDKBucketDeploymentExpirator7EE36E3418604B22AC9E149ABDEB886C762ED068',
        'Arn',
      ],
    },
  });
});

test('Prune Function Mock', async () => {
  const event = {
    RequestType: 'Create',
    ServiceToken: 'arn:aws:lambda:us-east-2:111111111111:function:test-CDKBucketDeploymentExpirator-1234321',
    ResponseURL: 'https://cloudformation-custom-resource-response-useast2.s3.us-east-2.amazonaws.com/',
    StackId: 'arn:aws:cloudformation:us-east-2:111111111111:stack/test/1111c1e1-11f1-11ea-11ae-1a11111e1c1c',
    RequestId: '1111c1e1-11f1-11ea-11ae-1a11111e1c1c',
    LogicalResourceId: 'expiratorCustomResource',
    PhysicalResourceId: 'aws.cdk.s3deployment.1111c1e1-11f1-11ea-11ae-1a11111e1c1c',
    ResourceType: 'Custom::CDKBucketDeploymentExpirator',
    ResourceProperties: {
      SourceBucketName: 'test-bucket',
      MetaLookupKey: 'deployed',
      DeploymentsToKeep: 1,
      RemoveUnmarked: 'false',
    },
  };

  const context = {};

  await handler(event, context);
});