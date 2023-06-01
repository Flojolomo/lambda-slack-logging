import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as destinations from 'aws-cdk-lib/aws-logs-destinations';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Effect, Policy, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class LoggingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const subscriptionHandler = new NodejsFunction(this, "subscription-handler", {
      logRetention: logs.RetentionDays.ONE_DAY
    })

    subscriptionHandler.role?.grantAssumeRole(new ServicePrincipal("logs.amazonaws.com"))
    subscriptionHandler.role?.attachInlinePolicy(new Policy(this, "ssm-policy", {
      statements: [new PolicyStatement({
        actions: ["ssm:GetParameter"],
        effect: Effect.ALLOW,
        resources: ["*"]
      })]
    }))

    const exampleFunction  = new NodejsFunction(this, "example-function", {
      logRetention: logs.RetentionDays.ONE_DAY
    })

    const filterPattern = logs.FilterPattern.stringValue("$.slack", "=", "true")
    exampleFunction.logGroup.addSubscriptionFilter("slack", {
      destination: new destinations.LambdaDestination(subscriptionHandler,),
      filterPattern
    })

    const metricFilter = exampleFunction.logGroup.addMetricFilter("slackLogs", {
      filterPattern,
      metricNamespace: "custom",
      metricName: "slackLogs",
      defaultValue: 0,
      metricValue: '1',
    })

    metricFilter.metric({
      statistic: "n",
      period: cdk.Duration.seconds(30)
    })
  }
}
