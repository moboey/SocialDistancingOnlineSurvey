import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../utils/logger'
import { getSurveyResult } from '../businesslogic/surveyBusinessLogic'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
const logger = createLogger('getSurvey')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Get Survey', event) 
  const ipAddrArr = event.multiValueHeaders['X-Forwarded-For']
  const ipAddr = ipAddrArr[0].split(',');
  logger.info('IP Address: '+ipAddr[0])
  const survey = await getSurveyResult(ipAddr[0])
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: survey
    })
  }

})

handler.use(
  cors({
    credentials: false
  })
)
