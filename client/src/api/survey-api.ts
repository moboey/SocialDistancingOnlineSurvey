import { apiEndpoint } from '../config'
import { SurveyResult } from '../types/Survey'; 
import Axios from 'axios' 

export async function getSurvey(): Promise<SurveyResult> {
  console.log('Fetching survey')

  const response = await Axios.get(`${apiEndpoint}/`, {
    headers: {
      'Content-Type': 'application/json'
    },
  })
  console.log('Survey:', response.data)
  return response.data.items
}


export async function surveyPost(surveyId: string): Promise<SurveyResult> {
  console.log('Update survey')
  const response = await Axios.post(`${apiEndpoint}/${surveyId}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  console.log('response from update:'+response.data)
  return response.data.items
}
    