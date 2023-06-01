import { LambdaInterface } from '@aws-lambda-powertools/commons';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    CloudWatchLogsEvent,
    Context,
  } from 'aws-lambda';
  import { logger, tracer, metrics } from './common/powertools';
  const zlib = require('zlib');
  import { IncomingWebhook } from '@slack/webhook'
import {GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm"



const client = new SSMClient({})
const webhook: Promise<IncomingWebhook> = new Promise(async (resolve, reject) => {
  const slackWebhook = (await client.send(new GetParameterCommand({
    Name: "SlackWebhook"
  }))).Parameter?.Value

  resolve(new IncomingWebhook(slackWebhook!))
} )


class LambdaHandler implements LambdaInterface {

    private webhook: IncomingWebhook


    @logger.injectLambdaContext({ logEvent: true })
    @metrics.logMetrics({

        throwOnEmptyMetrics: false,
        captureColdStartMetric: true,
    })
   public async handler(
    event: CloudWatchLogsEvent,
    context: Context
   ): Promise<void> {
        var payload = Buffer.from(event.awslogs.data, 'base64');

        const messages: Array<unknown> = await new Promise((resolve, reject ) => {
          zlib.gunzip(payload, function(e: any, result: any) {
            if (e) {
                reject(e)
            } else {
                result = JSON.parse(result.toString());
                console.log("Event Data:", JSON.stringify(result, null, 2));



                resolve(
                  result.logEvents.map((event: any) => {
                    const {message} = JSON.parse(event.message)
                    return message
                  })
                )
            }
          });
        })

        await Promise.all(messages.map(async message => {
          return await (await webhook).send(message as string)
        }))
   }
}

const handlerInstance =  new LambdaHandler()
export const handler = handlerInstance.handler.bind(handlerInstance)