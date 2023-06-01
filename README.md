# Logging
The intention of this project is to demonstrate logging, utilizing cloudwatch log susbcriptions and log filters

1. The first step is to have a a lambda function utilizing lambda powertools to have a structured logging into cloudwatch.
2. Create a lambda function to decode & process the logs
3. Create log subscription filter with lambda destination
4. Send logs to slack
5. Integrate parameter store into lambda
```
aws ssm put-parameter \
  --name "SlackWebhook" \
  --value "***" \
  --type "String" \
  --overwrite
```
6. Create metric filter to count logs

## Links
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/SubscriptionFilters.html#LambdaFunctionExample
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CreateMetricFilterProcedure.html