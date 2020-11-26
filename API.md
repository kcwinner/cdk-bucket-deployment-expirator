# API Reference

**Classes**

Name|Description
----|-----------
[SPAPruner](#cdk-spa-pruner-spapruner)|*No description*


**Structs**

Name|Description
----|-----------
[SPAPrunerProps](#cdk-spa-pruner-spaprunerprops)|*No description*



## class SPAPruner  <a id="cdk-spa-pruner-spapruner"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new SPAPruner(scope: Construct, id: string, props: SPAPrunerProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[SPAPrunerProps](#cdk-spa-pruner-spaprunerprops)</code>)  *No description*
  * **sourceBucket** (<code>[IBucket](#aws-cdk-aws-s3-ibucket)</code>)  The S3 bucket to sync the contents of the zip file to. 
  * **metaLookupKey** (<code>string</code>)  The S3 metadata key to look for as a timestamp. __*Default*__: "x-amz-meta-x-amzn-meta-deployed"
  * **role** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  Execution role associated with this function. __*Default*__: A role is automatically created




## struct SPAPrunerProps  <a id="cdk-spa-pruner-spaprunerprops"></a>






Name | Type | Description 
-----|------|-------------
**sourceBucket** | <code>[IBucket](#aws-cdk-aws-s3-ibucket)</code> | The S3 bucket to sync the contents of the zip file to.
**metaLookupKey**? | <code>string</code> | The S3 metadata key to look for as a timestamp.<br/>__*Default*__: "x-amz-meta-x-amzn-meta-deployed"
**role**? | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | Execution role associated with this function.<br/>__*Default*__: A role is automatically created



