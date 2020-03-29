import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../utils/logger'
import { getSurveyResult } from '../businesslogic/surveyBusinessLogic'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
const logger = createLogger('getSurvey')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Get Survey', event) 

  const survey = await getSurveyResult()
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: survey
    })
  }

})

handler.use(
  cors({
    credentials: true
  })
)
