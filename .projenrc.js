const { AwsCdkConstructLibrary } = require('projen');

const project = new AwsCdkConstructLibrary({
  authorAddress: 'kcswinner@gmail.com',
  authorName: 'Ken Winner',
  name: 'cdk-bucket-deployment-expirator',
  description: 'Opinionated CDK Bucket Deployment object pruner for maintaining N old versions',
  repository: 'https://github.com/kcwinner/cdk-bucket-deployment-expirator.git',
  catalog: {
    twitter: 'KenWin0x539',
  },
  defaultReleaseBranch: 'main',
  codeCov: true,
  dependabotOptions: {
    ignore: [
      { dependencyName: '@aws-cdk*' },
    ],
  },

  cdkVersion: '1.87.1',
  cdkDependencies: [
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-s3-deployment',
    '@aws-cdk/core',
  ],
  peerDeps: [
    'constructs',
  ],
  devDeps: [
    'aws-sdk',
    'aws-sdk-mock',
    'esbuild',
    'nock',
  ],

  gitignore: [
    '.build',
  ],

  python: {
    distName: 'cdk-bucket-deployment-expirator',
    module: 'cdk_bucket_deployment_expirator',
  },
});

project.addTask('clean', {
  exec: 'rm -rf .build',
});

project.addTask('build:lambda', {
  exec: 'yarn run clean && esbuild lambda/src/index.ts --bundle --outdir=.build/ --target=node12 --platform=node',
});

project.addTask('test', {
  exec: 'yarn run build:lambda && jest --passWithNoTests --updateSnapshot && yarn run eslint',
});

project.synth();
