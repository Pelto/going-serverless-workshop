# Going to Production

What are the missing pieces?


## CloudWatch

- Measure
- Dashboards
- Alarms
- Notifications


## DynamoDB

- Autoscaling
- Query pagination (last evalutated key / exclusive start key) for leaderboard


## Lambda

- Increase memory size
- Dead letter queue for update score lambda


## DNS

- Route53 for domain names
- Certificate Manager for HTTPS
- CloudFront?


## Users

- Cognito for authentication
- Amazon Cognito User Pools for user repository