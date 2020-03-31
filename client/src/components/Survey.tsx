import dateFormat from 'dateformat'
import { History } from 'history' 
import * as React from 'react' 
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  Button,   Header, Icon, 
  Image, Label, Statistic, Message, Grid, Container, Segment, Loader, Form, Radio
} from 'semantic-ui-react'

import {   getTodos, surveyPost  } from '../api/survey-api' 
import { SurveyResult } from '../types/Survey'



interface SurveyProps {
  history: History
}

interface SurveyState {
  survey: SurveyResult
  loadingSurvey: boolean
}

export class Survey extends React.PureComponent<SurveyProps, SurveyState> {
  state: SurveyState = {
    survey: { yes: '0', no: '0', maybe: '0', ipAddr: '', vote: '', when: '' },
    loadingSurvey: true
  }

  render() {
    
    return (
      <Container >
        <Header as="h1">Can social distancing flatten the curve?</Header>
        
       
        {this.renderResults()}
      </Container>
    )
  }

  renderResults() {

    if (this.state.loadingSurvey) {
      return this.renderLoading()
    }
    let history = undefined
    if (this.state.survey.ipAddr) {
      history = this.renderSurveyHistory()
    }

    return (
      <Segment     >
        {history}
         {this.renderSurveyInput()}
        {this.renderChart()}
        {this.renderSurveyStats()}
      </Segment>
      )
  }

  async componentDidMount() {
    try {
      const survey = await getTodos()
      this.setState({
        survey,
        loadingSurvey: false
      })
    } catch (e) {
      alert(`Failed to fetch survey result: ${e.message}`)
    }
  }

  onSurveyPost = async (surveyIndex: string) => {

    try {
      const surveyResult = await surveyPost(surveyIndex)
      await this.setState({
        survey: { yes: surveyResult.yes, no: surveyResult.no, maybe: surveyResult.maybe, ipAddr: surveyResult.ipAddr, vote: surveyResult.vote, when: surveyResult.when },
        loadingSurvey: false
      })
      console.log(this.state.survey);
    } catch {
      alert('Post survey failed')
    }
  } 

  


  renderSurveyHistory() {
    if (this.state.loadingSurvey) {
      return this.renderLoading()
    }
    const COLORS = ["red","yellow","teal"]
    let voted = "No" 
    if (this.state.survey.vote === 'YES_INDEX') {
      voted = "Yes" 
    } else if (this.state.survey.vote === 'MAYBE_INDEX') {
      voted = "Maybe" 
    }  
    return (
      <Segment   textAlign='center' basic  >
        <Message size='tiny'  >
        <Message.Header >Welcome back! Changed your mind?</Message.Header>
        <Message.Content size='tiny'>
        <p></p><p>
          You had last voted '{voted}' on {this.state.survey.when}. </p>
          <p> Your IP address is {this.state.survey.ipAddr}. </p>
        <p> You can change your vote if you wish. </p></Message.Content>
      </Message></Segment>
    )
  }

  
  renderSurveyInput() {
    return (
      <Segment basic vertical style={{display: 'flex',   justifyContent:'center', alignItems:'center' }} > 
          <Grid  columns='3' padded>
          <Grid.Column  >
         
          <Radio toggle   
            label='Yes'
            name='radioGroup'
            value='YES_INDEX'
            checked={this.state.survey.vote === 'YES_INDEX'}
            onChange={() => this.onSurveyPost('YES_INDEX')}
          />
         </Grid.Column><Grid.Column> 
        
          <Radio toggle
            label='Maybe'
            name='radioGroup'
            value='MAYBE_INDEX'
            checked={this.state.survey.vote === 'MAYBE_INDEX'}
            onChange={() => this.onSurveyPost('MAYBE_INDEX')}
          />
          </Grid.Column><Grid.Column>
          <Radio toggle
            label='No'
            name='radioGroup'
            value='NO_INDEX'
            checked={this.state.survey.vote === 'NO_INDEX'}
            onChange={() => this.onSurveyPost('NO_INDEX')}
          />
        </Grid.Column> </Grid>
          
      </Segment>
    )
  }
  renderSurveyStats() {
    if (this.state.loadingSurvey) {
      return this.renderLoading()
    }
    const totalVotes = this.state.survey.yes + this.state.survey.maybe + this.state.survey.no
    const yesPercent = Math.round((Number(this.state.survey.yes) / Number(totalVotes)) * 100)
    const maybePercent = Math.round((Number(this.state.survey.maybe) / Number(totalVotes)) * 100)
    const noPercent = Math.round((Number(this.state.survey.no) / Number(totalVotes)) * 100)
    return (
      <Segment   basic   style={{display: 'flex',   justifyContent:'center', alignItems:'center' }} >
        <Grid  columns='4' padded>
 <Grid.Column> 
        <Statistic size='mini'>
          <Statistic.Value>{yesPercent}%</Statistic.Value>
          <Statistic.Label>Yes</Statistic.Label>
        </Statistic>
        </Grid.Column><Grid.Column>
        <Statistic size='mini'>
          <Statistic.Value>{maybePercent}%</Statistic.Value>
          <Statistic.Label>Maybe</Statistic.Label>
        </Statistic>
        </Grid.Column><Grid.Column>
        <Statistic size='mini'>
          <Statistic.Value>{noPercent}%</Statistic.Value>
          <Statistic.Label>No</Statistic.Label>
        </Statistic>
        </Grid.Column><Grid.Column>
        <Statistic size='mini'>
          <Statistic.Value>{totalVotes}</Statistic.Value>
          <Statistic.Label>Total</Statistic.Label>
        </Statistic>
        </Grid.Column> </Grid>
      </Segment>
    )
  }
  


  renderLoading() {
    return (
      <Segment >
        <Loader indeterminate active inline="centered">
          Loading Survey Result
        </Loader>
        </Segment>
    )
  }

  renderChart() {

    if (this.state.loadingSurvey) {
      return this.renderLoading()
    }
 
    const totalVotes = this.state.survey.yes + this.state.survey.maybe + this.state.survey.no
    const data = [
      {
        name: 'Vote result', Yes: this.state.survey.yes, Maybe: this.state.survey.maybe,  No: this.state.survey.no, amt: totalVotes,
      },       
    ];

    return (
      <Segment basic style={{display: 'flex',  justifyContent:'center', alignItems:'center' }} >
      <BarChart
        width={190}
        height={190}
        data={data}
        margin={{
          top: 5, right: 0, left: 0, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Yes" fill="teal" background={{ fill: '#eee' }} />
        <Bar dataKey="Maybe" fill="orange" />
        <Bar dataKey="No" fill="red" />
      </BarChart>
      </Segment>
    );



  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
