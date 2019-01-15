# TrackRecord README

## How to deploy
1. Get Aws Credentials.
	- aws_access_key_id
	- aws_scret_access_key
2. Install awscli
	
	[Detailed Instructions](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)
	```
	pip install awsebcli --upgrade --user
	```

3. Add [trackrecord] entry to aws credentials to ~/.aws/credentials
	```[trackrecord]
	aws_access_key_id = XXXXXX
	aws_secret_access_key = XXXXXX 
	```

4. Create environment
	```
	eb init  --profile trackrecord 
	eb create --sample develop --profile trackrecord 
	```

5. Deploy app
	```
	eb deploy --profile trackrecord 
	```

6. Terminate app
	```
	eb terminate --profile trackrecord 
	```
## How to check instance

1. SSH into instance
	```
	eb ssh develop --profile trackrecord
	cd /var/app/current
	/opt/elasticbeanstalk/node-install/node-v6.11.5-linux-x64/bin/node src/server/server
	```
## Setting up Email in AWS

1. Add the AWS Domain Verification Record and AWS DKIM record set into DNS. The settings are in awe console for ses.


