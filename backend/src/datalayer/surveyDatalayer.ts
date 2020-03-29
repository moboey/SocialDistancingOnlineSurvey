import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { SurveyResult } from '../model/SurveyResult'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'

const logger = createLogger('datalayer')

export class SurveyAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly surveyTable = process.env.SURVEY_TABLE) {
    }
    async getSurveyResult(): Promise<SurveyResult> {
        logger.info('Getting survey result')
        const resultYes = await this.docClient.query({
            TableName: this.surveyTable,
            KeyConditionExpression: process.env.SURVEY_INDEX+'= :id',
            ExpressionAttributeValues: {
                ':id': process.env.SURVEY_YES_INDEX
            }
        }).promise() 
        const yesTotal = resultYes.Items[0].count;

        const resultNo = await this.docClient.query({
            TableName: this.surveyTable,
            KeyConditionExpression: process.env.SURVEY_INDEX+'= :id',
            ExpressionAttributeValues: {
                ':id': process.env.SURVEY_NO_INDEX
            }
        }).promise() 
        const noTotal = resultNo.Items[0].count;

        const resultMaybe = await this.docClient.query({
            TableName: this.surveyTable,
            KeyConditionExpression: process.env.SURVEY_INDEX+'= :id',
            ExpressionAttributeValues: {
                ':id': process.env.SURVEY_NO_INDEX
            }
        }).promise()  
        const maybeTotal = resultMaybe.Items[0].count;
        
        let surveyResult = {yes:yesTotal, no:noTotal, maybe:maybeTotal} 
        return surveyResult as SurveyResult
    }  
} 