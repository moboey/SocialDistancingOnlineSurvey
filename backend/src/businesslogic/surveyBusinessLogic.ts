import { createLogger } from '../utils/logger'
import { SurveyAccess } from '../datalayer/surveyDatalayer'
import { SurveyResult } from '../model/SurveyResult'   
const surveyAccess = new SurveyAccess()

const logger = createLogger('businesslogic')

export async function getSurveyResult(): Promise<SurveyResult> {
    logger.info('Getting survey')
    return surveyAccess.getSurveyResult()
}
 
export async function updateSurvey(surveyId : string): Promise<SurveyResult> {
    logger.info('Updating survey')
    return surveyAccess.updateSurvey(surveyId)
}