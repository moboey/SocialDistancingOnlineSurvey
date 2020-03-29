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
 

    async getSurveyResultByIndex(indexType : string): Promise<number> {
        const resultYes = await this.docClient.query({
            TableName: this.surveyTable,
            KeyConditionExpression: process.env.SURVEY_INDEX+'= :id',
            ExpressionAttributeValues: {
                ':id': indexType
            }
        }).promise() 
        const total = resultYes.Items[0].count; 
        return total 
    }
    
    async updateSurvey(surveyId : string): Promise<SurveyResult> {     
        await this.updateSurveyByIndex(surveyId)
        const result = await this.getSurveyResult()
        return result as SurveyResult
    }
    
    async updateSurveyByIndex(surveyIdValue: string) {
               
        logger.info('Updating index :'+surveyIdValue)
        const total = await this.getSurveyResultByIndex(surveyIdValue) +1 
        const params = {
            TableName: process.env.SURVEY_TABLE,
            Key: {
                surveyId : surveyIdValue 
            },
            UpdateExpression: "set #count =:a",
            ExpressionAttributeNames: {
                "#name": "count"
            },
            ExpressionAttributeValues: {
                ":a": total 
            },
            ReturnValues: "UPDATED_NEW"
        };
        await this.docClient.update(params, function (err, data) {
            if (err) {
                logger.error("Unable to update", err)
                console.error("Unable to update. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                logger.info("Update success", data)
                console.log("Update succeeded:", JSON.stringify(data, null, 2));
            }
        }).promise()
    }



    async getSurveyResult(): Promise<SurveyResult> {
        logger.info('Getting survey result')
        const yesTotal = await this.getSurveyResultByIndex(process.env.SURVEY_YES_INDEX)
        const noTotal = await this.getSurveyResultByIndex(process.env.SURVEY_NO_INDEX)
        const maybeTotal = await this.getSurveyResultByIndex(process.env.SURVEY_MAYBE_INDEX)        
        let surveyResult = {yes:yesTotal, no:noTotal, maybe:maybeTotal} 
        return surveyResult as SurveyResult
    }  
} 