import { LambdaInterface } from '@aws-lambda-powertools/commons';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
  } from 'aws-lambda';
  import { logger, tracer, metrics } from './common/powertools';

class LambdaHandler implements LambdaInterface {

    @logger.injectLambdaContext({ logEvent: true })
    @metrics.logMetrics({

        throwOnEmptyMetrics: false,
        captureColdStartMetric: true,
    })
   public async handler(
    event: unknown,
    context: Context
   ): Promise<void> {
        logger.info("Hello")
        logger.info("This is a slack message", { slack: true })
        return await Promise.resolve()
   }


}

const handlerInstance =  new LambdaHandler()
export const handler = handlerInstance.handler.bind(handlerInstance)