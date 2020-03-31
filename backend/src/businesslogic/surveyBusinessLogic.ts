import { createLogger } from '../utils/logger'
import { SurveyAccess } from '../datalayer/surveyDatalayer'
import { SurveyResult } from '../model/SurveyResult'
const surveyAccess = new SurveyAccess()

const logger = createLogger('businesslogic')

export async function getSurveyResult(ipAddr): Promise<SurveyResult> {
    
    logger.info('Getting survey result')
    const yesTotal = await surveyAccess.getSurveyResultByIndex(process.env.SURVEY_YES_INDEX)
    const noTotal = await surveyAccess.getSurveyResultByIndex(process.env.SURVEY_NO_INDEX)
    const maybeTotal = await surveyAccess.getSurveyResultByIndex(process.env.SURVEY_MAYBE_INDEX)
    const oldVote = await surveyAccess.getLatestVoteByIP(ipAddr)    
    let surveyResult = { yes: yesTotal, no: noTotal, maybe: maybeTotal } as SurveyResult    
    if (oldVote) {
        logger.info('Voted before')
        surveyResult.ipAddr = oldVote.ipAddr
        surveyResult.vote = oldVote.vote
        surveyResult.when = oldVote.when
        surveyResult.total = oldVote.total
    } else{
        logger.info('Never voted before')
    }
    return surveyResult as SurveyResult
}

export async function updateSurvey(surveyId: string, ipAddr: string): Promise<SurveyResult> {
    logger.info('Updating survey')
    if (surveyId !== process.env.SURVEY_YES_INDEX && surveyId !== process.env.SURVEY_NO_INDEX && surveyId !== process.env.SURVEY_MAYBE_INDEX)
        throw new Error(
            'Invalid survey index type. Should be of either Yes, No or Maybe'
        )

    const oldVote = await surveyAccess.getLatestVoteByIP(ipAddr)
    if (oldVote) {
        logger.info('Found existing voter :'+oldVote)
        //existing voter. check if voter has changed vote
        if (oldVote.vote === surveyId) {
            //same vote. do nothing for now. placeholder for future behaviour
            logger.info(' No change in vote ')
        } else {
            //vote change
            logger.info(' Detected a vote change')
            //decrement previous vote
            await surveyAccess.updateSurveyByIndex(oldVote.vote, -1)
            //increment new vote
            await surveyAccess.updateSurveyByIndex(surveyId, 1)
            //log vote change
            await surveyAccess.insertIpVote(surveyId, ipAddr)
        }
    } else {
        //new voter
        logger.info(' Detected a new voter ')
        await surveyAccess.updateSurveyByIndex(surveyId, 1)
        //log vote 
        await surveyAccess.insertIpVote(surveyId, ipAddr)
    }
    const result = await getSurveyResult(ipAddr);
    if (!oldVote) {
        //is a new vote. so remove the ipAddr from the result
        result.ipAddr=''
        result.when='' 
    }    
    return result
}