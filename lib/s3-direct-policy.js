var Generator = require('generate-js'),
    crypto = require('crypto');

var S3DirectPolicy = Generator.generate(function S3DirectPolicy(accessKeyId, secretAccessKey, options) {
    var _ = this;

    _.defineProperties({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        options: options
    });

    _.requireKeys(
        _,
        'S3DirectPolicy',
        ['accessKeyId', 'secretAccessKey']
    );

    _.requireKeys(
        options,
        'options',
        ['bucket', 'expiration', 'key', 'acl']
    );
});

S3DirectPolicy.definePrototype({
    requireKeys: function requireKeys(obj, objName, keys) {
        for (var i = keys.length - 1; i >= 0; i--) {
            if (!obj[keys[i]]) {
                throw new Error('`' + objName + '.' + keys[i] + '` is required.');
            }
        }
    },

    signature: function signature() {
        var _ = this;
        return crypto.createHmac('sha1', _.secretAccessKey).update(_.policy()).digest('base64');
    },

    policy: function policy() {
        var _ = this;

        if (typeof _.options.expiration === 'number') {
            var now = new Date();
            now.setSeconds(now.getSeconds() + _.options.expiration);
            _.options.expiration = now.toISOString();
        }

        var plcy = {
            expiration: _.options.expiration,
            conditions: _.conditions()
        };

        return new Buffer(JSON.stringify(plcy)).toString('base64');
    },

    toJSON: function toJSON() {
        var _ = this;

        return {
            url: 'https://s3.amazonaws.com/' + _.options.bucket,
            credentials: {
                AWSAccessKeyId: _.accessKeyId,
                policy:         _.policy(),
                signature:      _.signature(),
                acl:            _.options.acl,
                key:            _.options.key
            }
        };
    },

    conditions: function conditions() {
        var _ = this,
            dynamic_key = _.options.key.indexOf('${filename}') !== -1,
            prefix      = _.options.key.slice(0, (_.options.key.indexOf('${filename}') - 1)),
            conds  = [];

                          conds.push({ bucket: _.options.bucket });
                          conds.push({ acl: _.options.acl });
        if (!dynamic_key) conds.push({ key: _.options.key });
        if (dynamic_key)  conds.push(['starts-with', '$key', prefix]);
                          conds.push(['starts-with', '$Content-Type', '']);
                          conds.push(['starts-with', '$name', '']);

        return conds;
    },
});

module.exports = S3DirectPolicy;

if (!module.parent) {
    console.log(
        S3DirectPolicy.create(
            'accessKeyId',
            'secretAccessKey',
            {
                key: 'myKey',
                bucket: 'myBucket',
                acl: 'public-read',
                expiration: 30
            }
        ).toJSON()

        // Returns
        // {
        //     url: 'https://s3.amazonaws.com/myBucket',
        //     credentials: {
        //         AWSAccessKeyId: 'accessKeyId',
        //         policy: 'eyJleHBpcmF0aW9uIjoiMjAxNS0xMi0xNVQwMDoyNTowNy4wNTZaIiwiY29uZGl0aW9ucyI6W3siYnVja2V0IjoibXlCdWNrZXQifSx7ImFjbCI6InB1YmxpYy1yZWFkIn0seyJrZXkiOiJteUtleSJ9LFsic3RhcnRzLXdpdGgiLCIkQ29udGVudC1UeXBlIiwiIl1dfQ==',
        //         signature: 'vndEsygZCg7eD4CFInh6cY6f3SQ=',
        //         acl: 'public-read',
        //         key: 'myKey'
        //     }
        // }
    );
}
