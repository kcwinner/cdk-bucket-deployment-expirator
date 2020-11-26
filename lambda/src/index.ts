import * as AWS from 'aws-sdk';
import * as https from 'https';

const CFN_SUCCESS = 'SUCCESS';
const CFN_FAILED = 'FAILED';

export async function handler(event: any, context: any) {
  const s3 = new AWS.S3(); // Needs to be initialized here to use aws-sdk-mock
  console.info(event);

  const cfnError = async (message: string = '') => {
    console.error('| cfnError:', message);
    await cfnSend({
      event,
      context,
      responseStatus: CFN_FAILED,
      reason: message
    });
  }

  try {
    // cloudformation request type (create/update/delete)
    const requestType = event.RequestType;

    // extract resource properties
    const props = event.ResourceProperties;
    const physicalId = event.PhysicalResourceId ?? undefined;

    const sourceBucketName = props.SourceBucketName;
    const metaLookupKey = props.MetaLookupKey;
    const deploymentsToKeep = props.DeploymentsToKeep;
    const removeUnmarked = props.RemoveUnmarked;

    // Check if it's a delete. If so, do nothing
    if (requestType === 'Delete') {
      await cfnSend({ event, context, responseStatus: CFN_SUCCESS, physicalResourceId: physicalId });
      return;
    }

    const deployments: { [key: string]: string[] } = {};

    const listObjectsParams = {
      Bucket: sourceBucketName
    }

    // TODO: Check for IsTruncated
    const listObjectsResult = await s3.listObjectsV2(listObjectsParams).promise();
    const contents = listObjectsResult.Contents ?? [];

    for (const file of contents) {
      if (!file.Key) continue;

      const headParams = {
        Bucket: sourceBucketName,
        Key: file.Key
      }

      // Run a head object to get S3 object metadata
      const headObjectResult = await s3.headObject(headParams).promise();
      const metadata = headObjectResult.Metadata ?? {}

      const deploymentKey = metadata[metaLookupKey] || 'unmarked';
      if (deploymentKey === 'unmarked' && !removeUnmarked) continue;
      if (!deployments[deploymentKey]) deployments[deploymentKey] = [];

      deployments[deploymentKey].push(file.Key);
    }

    console.info('Deployments:', deployments);

    const deploymentTimestamps = Object.keys(deployments).filter(key => key !== 'unmarked').sort().reverse();
    if (removeUnmarked) deploymentTimestamps.push('unmarked');
    console.info('Deployment Timestamps:', deploymentTimestamps);

    // Slice starting at the index to remove since we reverse sorted
    const deploymentsToRemove = deploymentTimestamps.slice(deploymentsToKeep);
    for (const deployment of deploymentsToRemove) {
      const filesToRemove = deployments[deployment];
      console.info(`Removing ${deployment}:`, filesToRemove);

      const deleteParams = {
        Bucket: sourceBucketName,
        Delete: {
          Objects: filesToRemove.map(file => { Key: file })
        }
      }

      console.log('DELETE PARAMS:', deleteParams);
    }

    await cfnSend({ event, context, responseStatus: CFN_SUCCESS, physicalResourceId: physicalId });
  } catch (err) {
    await cfnError(`invalid request. Missing key ${err}`);
  }
}

interface CfnSendOptions {
  event: any;
  context: any;
  responseStatus: 'SUCCESS' | 'FAILED';
  responseData?: any
  physicalResourceId?: any
  noEcho?: boolean
  reason?: string
}

async function cfnSend(options: CfnSendOptions) {
  const { event, context } = options;

  const responseUrl = event.ResponseURL;
  const responseBody = {
    Status: options.responseStatus,
    Reason: options.reason ?? `See the details in CloudWatch Log Stream: ${context.logStreamName}`,
    PhysicalResourceId: options.physicalResourceId ?? context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    NoEcho: options.noEcho ?? false,
    Data: options.responseData
  };

  const body = JSON.stringify(responseBody);
  const putOptions: https.RequestOptions = {
    port: 443,
    method: 'PUT',
    headers: {
      'Content-Type': '',
      'Content-Length': body.length
    }
  }

  try {
    const response = await putAsync(responseUrl, putOptions, body);
    console.info("| status code: " + response.statusCode);
  } catch (err) {
    console.error('| unable to send response to CloudFormation');
    console.error(err);
  }

}

async function putAsync(url: string, options: https.RequestOptions, body: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = https.request(url, options, (resp) => {
      let response = {
        statusCode: -1,
        statusMessage: '',
        data: ''
      };

      resp.on('data', (chunk) => {
        response.data += chunk;
      });

      resp.on('end', () => {
        response.statusCode = resp.statusCode ?? 500;
        response.statusMessage = resp.statusMessage ?? '';
        resolve(response);
      });

      resp.on('error', (err) => {
        reject(err);
      })
    });

    request.on('error', (err) => {
      reject(err);
    })

    request.write(body);
    request.end();
  })
}