import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda' 
import { createLogger } from '../utils/logger'
import { updateSurvey } from '../businesslogic/surveyBusinessLogic' 
const logger = createLogger('updateTodo')
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const surveyId = event.pathParameters.surveyId
 
  logger.info('Updating Survey', surveyId)
  const survey = await updateSurvey(surveyId)

  return {
    statusCode: 201,
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