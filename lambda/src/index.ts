const AWS = require('aws-sdk');

const CFN_SUCCESS = 'SUCCESS';
const CFN_FAILED = 'FAILED';

let metaLookupKey = 'x-amz-meta-x-amzn-meta-deployed';

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
    metaLookupKey = props.MetaLookupKey ?? metaLookupKey;
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
    const { Contents } = await s3.listObjectsV2(listObjectsParams).promise();

    for (const file of Contents) {
        const headParams = {
            Bucket: sourceBucketName,
            Key: file.Key
        }

        // Run a head object to get S3 object metadata
        const { Metadata } = await s3.headObject(headParams).promise();
        const deploymentKey = Metadata[metaLookupKey] || 'unmarked';
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
        console.info('Removing:', filesToRemove);
    }


    await cfnSend({ event, context, responseStatus: CFN_SUCCESS, physicalResourceId: physicalId });
  } catch (err) {
    cfnError(`invalid request. Missing key ${err}`);
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
  console.info(responseUrl);

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
  const headers = {
    'content-type': '',
    'content-length': body.length.toString()
  }

  console.log(headers);
}

// # sends a response to cloudformation
// def cfn_send(event, context, responseStatus, responseData = {}, physicalResourceId = None, noEcho = False, reason = None):

// responseUrl = event['ResponseURL']
// logger.info(responseUrl)

// responseBody = {}
// responseBody['Status'] = responseStatus
// responseBody['Reason'] = reason or('See the details in CloudWatch Log Stream: ' + context.log_stream_name)
// responseBody['PhysicalResourceId'] = physicalResourceId or context.log_stream_name
// responseBody['StackId'] = event['StackId']
// responseBody['RequestId'] = event['RequestId']
// responseBody['LogicalResourceId'] = event['LogicalResourceId']
// responseBody['NoEcho'] = noEcho
// responseBody['Data'] = responseData

// body = json.dumps(responseBody)
// logger.info("| response body:\n" + body)

// headers = {
//   'content-type': '',
//   'content-length': str(len(body))
// }

// try:
// response = requests.put(responseUrl, data = body, headers = headers)
// logger.info("| status code: " + response.reason)
// except Exception as e:
// logger.error("| unable to send response to CloudFormation")
// logger.exception(e)