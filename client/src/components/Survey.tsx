import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import { PureComponent } from 'react';
import {
  PieChart, Pie, Sector, Cell,
} from 'recharts';

import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image, Label,Statistic,Message,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, surveyPost, patchTodo } from '../api/survey-api'
import Auth from '../auth/Auth'
import { SurveyResult } from '../types/Survey'

const COLORS = ['teal', 'orange', 'red'];


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

  render() {
    let history = undefined
    if(this.state.survey.ipAddr){
      history = this.renderSurveyHistory()
    }
    return (
      <div>
        <Header as="h1">Can social distancing flatten the curve?</Header>

        {this.renderSurveyInput()}
        
        {this.renderResult()}
        {history}

      </div>
    )
  }

  renderResult() {
    if (this.state.loadingSurvey) {
      return this.renderLoading()
    }

    return this.renderChart()
  }

  renderSurveyHistory() {
    let voted = "No" 
    if(this.state.survey.vote==='YES_INDEX'){
      voted="Yes"
    }else if(this.state.survey.vote==='MAYBE_INDEX'){
      voted="Not sure"
    } 
    return (
      <Grid padded>
        <Grid.Row><Grid.Column width={16} centered> 
        <Message size='tiny' >
    <Message.Header>Welcome back! Changed your mind?</Message.Header>
    <p>
      You had last voted '{voted}' on {this.state.survey.when}, using IP address {this.state.survey.ipAddr}. </p>
      <p> You can change your vote if you wish. </p>
  </Message>
          </Grid.Column></Grid.Row>
          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
      </Grid>
    )
  }

  renderSurveyInput() {
    return (
      <Grid padded>
        <Grid.Row>
        <Grid.Column width={16} centered>
          <Button as='div' labelPosition='right' size='massive'
          onClick={() => this.onSurveyPost('YES_INDEX')}>
            <Button color='teal'>
              <Icon name='checkmark' />Yes
            </Button>
            <Label as='a' basic color='teal' pointing='left'>
            {this.state.survey.yes}
            </Label>
          </Button>
          <Button as='div' labelPosition='right'size='massive'
          onClick={() => this.onSurveyPost('MAYBE_INDEX')}>
            <Button color='yellow'>
              <Icon name='help' />Not sure
            </Button>
            <Label as='a' basic color='yellow' pointing='left'>
            {this.state.survey.maybe}
            </Label>
          </Button>
          <Button as='div' labelPosition='right'size='massive'
          onClick={() => this.onSurveyPost('NO_INDEX')}>
            <Button color='red'>
              <Icon name='ban' />No
            </Button>
            <Label as='a' basic color='red' pointing='left'>
            {this.state.survey.no}
            </Label>
          </Button>
          </Grid.Column> 
        </Grid.Row>
      </Grid>
    )
  }


  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Survey Result
        </Loader>
      </Grid.Row>
    )
  }

  renderChart() {

    const data = [
      { name: 'Yes', value: this.state.survey.yes },
      { name: 'Not sure', value: this.state.survey.maybe },
      { name: 'No', value: this.state.survey.no },
    ];
    const totalVotes = this.state.survey.yes + this.state.survey.maybe + this.state.survey.no
    const yesPercent = Math.round((Number(this.state.survey.yes) / Number(totalVotes)) * 100)
    const maybePercent = Math.round((Number(this.state.survey.maybe) / Number(totalVotes)) * 100)
    const noPercent = Math.round((Number(this.state.survey.no) / Number(totalVotes)) * 100)
    return (


      <Grid columns='equal'>
        <Grid.Row>
          <Grid.Column centered>
            <PieChart width={390} height={350}>
              <Pie
                data={data}
                cx={210}
                cy={150}
                labelLine={false}
                outerRadius={150}

                fill="#8884d8"
                dataKey="value"
              >
                {
                  data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
              </Pie>
            </PieChart></Grid.Column> 
          <Grid.Column centered>
            <Grid.Row centered> 
             
              
              <Statistic size='tiny'>
              <Statistic.Value>{yesPercent}</Statistic.Value>
              <Statistic.Label>Yes %</Statistic.Label>
              </Statistic>

              <Statistic size='tiny'>
              <Statistic.Value>{maybePercent}</Statistic.Value>
              <Statistic.Label>Not Sure %</Statistic.Label>
              </Statistic>

              <Statistic size='tiny'>
              <Statistic.Value>{noPercent}</Statistic.Value>
              <Statistic.Label>No %</Statistic.Label>
              </Statistic>
            </Grid.Row> 
            <Grid.Row centered>
            <Statistic  centered>
              <Statistic.Value>{totalVotes}</Statistic.Value>
              <Statistic.Label>Votes</Statistic.Label>
              </Statistic>
            </Grid.Row>
            </Grid.Column>
        </Grid.Row> 
      </Grid>
    );

  } 

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
