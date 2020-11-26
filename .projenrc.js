const { AwsCdkConstructLibrary } = require('projen');

const project = new AwsCdkConstructLibrary({
  authorAddress: "kcswinner@gmail.com",
  authorName: "Ken Winner",
  name: "cdk-bucket-deployment-expirator",
  repository: "https://github.com/kcwinner/cdk-bucket-deployment-expirator.git",
  cdkVersion: "1.75.0",
  cdkDependencies: [
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-s3',
    '@aws-cdk/core'
  ],
  peerDeps: [
    "constructs"
  ],
  devDeps: [
    'aws-sdk',
    'esbuild'
  ],

  gitignore: [
    '.build'
  ]
});

project.addFields({
  awscdkio: { twitter: "KenWin0x539" }
})

project.addScripts({
  'clean': 'rm -rf .build',
  'build:lambda': 'yarn run clean && esbuild lambda/src/index.ts --bundle --outdir=.build/ --target=node12 --platform=node',
  'test': 'yarn run clean && yarn run build:lambda && jest --passWithNoTests --updateSnapshot && yarn run eslint'
})

project.synth();
