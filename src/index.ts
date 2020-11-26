import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { IRole } from '@aws-cdk/aws-iam';
import { Code, Runtime, SingletonFunction } from '@aws-cdk/aws-lambda';
import { IBucket } from '@aws-cdk/aws-s3';
import { Construct, Duration, CustomResource } from '@aws-cdk/core';

const handlerCodeBundle = path.join(__dirname, '..', '.build');
const handlerSourceDirectory = path.join(__dirname, '..', 'lambda', 'src');

export interface BucketDeploymentExpiratorProps {
  /**
   * The S3 bucket to sync the contents of the zip file to.
   */
  readonly sourceBucket: IBucket;

  /**
   * The number of old deployments to keep
   * @default 3
   */
  readonly deploymentsToKeep?: number;

  /**
   * Whether or not to remove items without a metadata key
   * @default false
   */
  readonly removeUnmarked?: boolean;

  /**
   * Execution role associated with this function
   *
   * @default - A role is automatically created
   */
  readonly role?: IRole;

  /**
   * The S3 metadata key to look for as a timestamp
   * @default "x-amz-meta-x-amzn-meta-deployed"
   */
  readonly metaLookupKey?: string;
}

export class BucketDeploymentExpirator extends Construct {
  constructor(scope: Construct, id: string, props: BucketDeploymentExpiratorProps) {
    super(scope, id);

    const assetHash = calcSourceHash(handlerSourceDirectory);

    const handler = new SingletonFunction(this, 'CustomResourceHandler', {
      uuid: this.renderSingletonUuid(),
      code: Code.fromAsset(handlerCodeBundle, { assetHash }),
      runtime: Runtime.NODEJS_12_X,
      handler: 'index.handler',
      lambdaPurpose: 'Custom::CDKSPAPruner',
      timeout: Duration.minutes(15),
      role: props.role,
    });

    const handlerRole = handler.role;
    if (!handlerRole) { throw new Error('lambda.SingletonFunction should have created a Role'); }

    props.sourceBucket.grantRead(handler);
    props.sourceBucket.grantDelete(handler);

    new CustomResource(this, 'CustomResource', {
      serviceToken: handler.functionArn,
      resourceType: 'Custom::CDKSPAPruner',
      properties: {
        SourceBucketName: props.sourceBucket.bucketName,
        MetaLookupKey: props.metaLookupKey,
        DeploymentsToKeep: props.deploymentsToKeep ?? 3,
        RemoveUnmarked: props.removeUnmarked ?? false
      },
    });
  }

  private renderSingletonUuid() {
    return '7EE36E34-1860-4B22-AC9E-149ABDEB886C';
  }
}

/**
 * We need a custom source hash calculation since the bundle.zip file
 * contains python dependencies installed during build and results in a
 * non-deterministic behavior.
 *
 * So we just take the `src/` directory of our custom resource code.
 */
function calcSourceHash(srcDir: string): string {
  const sha = crypto.createHash('sha256');
  for (const file of fs.readdirSync(srcDir)) {
    const data = fs.readFileSync(path.join(srcDir, file));
    sha.update(`<file name=${file}>`);
    sha.update(data);
    sha.update('</file>');
  }

  return sha.digest('hex');
}