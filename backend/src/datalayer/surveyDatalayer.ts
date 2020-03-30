import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk' 
import { DocumentClient } from 'aws-sdk/clients/dynamodb'  
const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'
import { IPResult } from '../model/ipResult'

const logger = createLogger('datalayer')

export class SurveyAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly surveyTable = process.env.SURVEY_TABLE,
        private readonly ipTable = process.env.SURVEY_IP_TABLE,
        private readonly surveyIndex = process.env.SURVEY_INDEX,
        private readonly ipIndex = process.env.IP_INDEX) {
    }
 

    async getSurveyResultByIndex(indexType : string): Promise<number> {
        const resultYes = await this.docClient.query({
            TableName: this.surveyTable,
            KeyConditionExpression: this.surveyIndex+'= :id',
            ExpressionAttributeValues: {
                ':id': indexType
            }
        }).promise() 
        const total = resultYes.Items[0].count; 
        return total 
    }

    async getVoteByIP(ipAddr : string): Promise<IPResult> {
        const result = await this.docClient.query({
            TableName: this.ipTable,
            KeyConditionExpression: this.ipIndex+'= :id',
            ExpressionAttributeValues: {
                ':id': ipAddr
            }
        }).promise() 
        if (result.Items.length == 0){
            return undefined;
        }      
        const vote = result.Items[0].vote;     
        const when = result.Items[0].when;    
        let ipResult = {ipAddr:ipAddr, vote:vote, when: when }   
        return ipResult as IPResult
    }

    async updateIpVote(surveyIdValue: string, ipAddr:string) {
               
        logger.info('Updating ip vote :'+surveyIdValue +' '+ipAddr)        
 
        const params = {
            TableName: this.ipTable,
            Key: {
                "ipAddr": ipAddr
            },
            UpdateExpression: "set #vote =:a, #when =:b",
            ExpressionAttributeNames: {
                "#vote": "vote",
                "#when": "when"
            },
            ExpressionAttributeValues: {
                ":a": surveyIdValue,
                ":b": new Date().toISOString()
            },
            ReturnValues: "UPDATED_NEW"
        };
        await this.docClient.update(params, function (err, data) {
            if (err) {
                logger.error("Unable to update IP ", err)
                console.error("Unable to update IP. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                logger.info("Update IP success ", data)
                console.log("Update IP succeeded:", JSON.stringify(data, null, 2));
            }
        }).promise()
    } 

    async insertIpVote(surveyIdValue: string, ip:string) {               
        logger.info('Insert ip vote :'+surveyIdValue +' '+ip)             
        await this.docClient.put({
            TableName: this.ipTable,
            Item: {
                ipAddr : ip,
                vote : surveyIdValue,
                when : new Date().toISOString()
            }
        }).promise() 
    } 
     


    async updateSurveyByIndex(surveyIdValue: string, increment: number) {
               
        logger.info('Updating index :'+surveyIdValue)        

        const total = await this.getSurveyResultByIndex(surveyIdValue)
        logger.info('Current total :'+total)
        const params = {
            TableName: this.surveyTable,
            Key: {
                "surveyId": surveyIdValue
            },
            UpdateExpression: "set #count =:a",
            ExpressionAttributeNames: {
                "#count": "count"
            },
            ExpressionAttributeValues: {
                ":a": total + increment
            },
            ReturnValues: "UPDATED_NEW"
        };
        await this.docClient.update(params, function (err, data) {
            if (err) {
                logger.error("Unable to update ", err)
                console.error("Unable to update. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                logger.info("Update success ", data)
                console.log("Update succeeded:", JSON.stringify(data, null, 2));
            }
        }).promise()
    }


 
} 