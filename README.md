To create a policy:

```
var policy = S3DirectPolicy.create(
    'accessKeyId',
    'secretAccessKey',
    {
        key: 'myKey',
        bucket: 'myBucket',
        acl: 'public-read',
        expiration: 30
    }
).toJSON();
```

Your generated `policy` is now an object that looks like this:

```
{
    url: 'https://s3.amazonaws.com/myBucket',
    credentials: {
        AWSAccessKeyId: 'accessKeyId',
        policy: 'eyJleHBpcmF...',
        signature: 'vndEsygZCg7eD4CFInh6cY6f3SQ=',
        acl: 'public-read',
        key: 'myKey'
    }
}
```
