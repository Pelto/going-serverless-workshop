# Going to Production

What are the missing pieces?


## Build Automation

- CodeStar
- CodeCommit
- CodePipeline
- CodeBuild


## CloudWatch

- Measure
- Dashboards
- Alarms
- Notifications


## DynamoDB

- Revise provisioned capacity
- Monitor actual capacity to avoid throttling
- Autoscaling may be an option
- Query pagination (last evaluated key / exclusive start key) for leaderboard


## Lambda

- Increase memory size
- Dead letter queue for update score lambda


## API Gateway

- Throttling
- API Keys
- Metrics


## S3

- Metrics
- Logging


## DNS

- Route53 for domain names
- Certificate Manager for HTTPS
- CloudFront


## Users

- Cognito for authentication
- Amazon Cognito User Pools for user repository