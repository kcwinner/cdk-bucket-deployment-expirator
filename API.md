# API Reference

**Classes**

Name|Description
----|-----------
[BucketDeploymentExpirator](#cdk-bucket-deployment-expirator-bucketdeploymentexpirator)|*No description*


**Structs**

Name|Description
----|-----------
[BucketDeploymentExpiratorProps](#cdk-bucket-deployment-expirator-bucketdeploymentexpiratorprops)|*No description*



## class BucketDeploymentExpirator  <a id="cdk-bucket-deployment-expirator-bucketdeploymentexpirator"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new BucketDeploymentExpirator(scope: Construct, id: string, props: BucketDeploymentExpiratorProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[BucketDeploymentExpiratorProps](#cdk-bucket-deployment-expirator-bucketdeploymentexpiratorprops)</code>)  *No description*
  * **bucketDeployment** (<code>[BucketDeployment](#aws-cdk-aws-s3-deployment-bucketdeployment)</code>)  The CDK Bucket Deployment Construct. 
  * **sourceBucket** (<code>[IBucket](#aws-cdk-aws-s3-ibucket)</code>)  The S3 bucket to remove old deployments from. 
  * **deploymentsToKeep** (<code>number</code>)  The number of old deployments to keep. __*Default*__: 3
  * **metaLookupKey** (<code>string</code>)  The S3 metadata key to look for as a timestamp. __*Default*__: "x-amz-meta-deployed"
  * **removeUnmarked** (<code>boolean</code>)  Whether or not to remove items without a metadata key. __*Default*__: false
  * **role** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  Execution role associated with this function. __*Default*__: A role is automatically created




## struct BucketDeploymentExpiratorProps  <a id="cdk-bucket-deployment-expirator-bucketdeploymentexpiratorprops"></a>






Name | Type | Description 
-----|------|-------------
**bucketDeployment** | <code>[BucketDeployment](#aws-cdk-aws-s3-deployment-bucketdeployment)</code> | The CDK Bucket Deployment Construct.
**sourceBucket** | <code>[IBucket](#aws-cdk-aws-s3-ibucket)</code> | The S3 bucket to remove old deployments from.
**deploymentsToKeep**? | <code>number</code> | The number of old deployments to keep.<br/>__*Default*__: 3
**metaLookupKey**? | <code>string</code> | The S3 metadata key to look for as a timestamp.<br/>__*Default*__: "x-amz-meta-deployed"
**removeUnmarked**? | <code>boolean</code> | Whether or not to remove items without a metadata key.<br/>__*Default*__: false
**role**? | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | Execution role associated with this function.<br/>__*Default*__: A role is automatically created



