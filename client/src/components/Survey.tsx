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
  Image, Label,
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
    survey: { yes: '0', no: '0', maybe: '0', ipAddr: '', vote:'',when:''  },
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
        survey: { yes: surveyResult.yes, no: surveyResult.no, maybe: surveyResult.maybe, ipAddr: surveyResult.ipAddr, vote:surveyResult.vote,when:surveyResult.when  },
        loadingSurvey: false
      } )
      console.log(this.state.survey);
    } catch {
      alert('Post survey failed')
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Can social distancing flatten the curve?</Header>

        {this.renderSurveyInput()}

        {this.renderResult()}


      </div>
    )
  }

  renderSurveyInput() {
    return (
      <Grid padded>
        <Grid.Row>

          <Button
            size="large"
            color="teal"
            onClick={() => this.onSurveyPost('YES_INDEX')}
          >Yes
                  </Button>

          <Button
            size="large"
            color="yellow"
            onClick={() => this.onSurveyPost('MAYBE_INDEX')}
          >Not Sure
                  </Button>
          <Button
            size="large"
            color="red"
            onClick={() => this.onSurveyPost('NO_INDEX')}
          >No
                  </Button>
          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  renderResult() {
    if (this.state.loadingSurvey) {
      return this.renderLoading()
    }

    return this.renderChart()
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
            <PieChart width={350} height={350}>
              <Pie
                data={data}
                cx={180}
                cy={180}
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
          <Grid.Column centered  >
            <Grid  >
              <Grid.Row>
                <Grid.Column width={5} centered textAlign='center'>
                </Grid.Column>
                <Grid.Column width={3} floated="right" color='teal' key='teal' textAlign='center'>
                  Yes
                </Grid.Column>
                <Grid.Column width={3} floated="right" color='yellow' key='yellow' textAlign='center'>
                  Not sure
                </Grid.Column>
                <Grid.Column width={3} floated="right" color='red' key='red' textAlign='center'>
                  No
                </Grid.Column> 
              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={5} centered textAlign='right'>
                  <Label pointing='right' size="large">  Total    </Label>
                </Grid.Column>
                <Grid.Column    width={3} floated="right" textAlign='center'>
                  {this.state.survey.yes}
                </Grid.Column>
                <Grid.Column width={3} floated="right" textAlign='center'>
                  {this.state.survey.maybe}
                </Grid.Column>
                <Grid.Column width={3} floated="right" textAlign='center'>
                  {this.state.survey.no}
                </Grid.Column>

              </Grid.Row>
              <Grid.Row>
                <Grid.Column width={5} centered textAlign='right'>
                  <Label pointing='right' size="large">Percentage</Label>
                </Grid.Column>
                <Grid.Column width={3} floated="right" textAlign='center'>
                  {yesPercent}%
                </Grid.Column>
                <Grid.Column width={3} floated="right" textAlign='center'>
                  {maybePercent}%
                </Grid.Column>
                <Grid.Column width={3} floated="right" textAlign='center'>
                  {noPercent}%
                </Grid.Column> 
              </Grid.Row>  <Divider />
              <Grid.Row>
                <Grid.Column width={16} centered textAlign='left'>
                    Total votes : {totalVotes} 
                </Grid.Column>
              </Grid.Row>
            </Grid></Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );

  }

  renderSurveyResult() {
    return (
      <Grid padded>

        <Grid.Row>
          <Grid.Column width={3} floated="right">
            Yes : {this.state.survey.yes}
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            Maybe : {this.state.survey.maybe}
          </Grid.Column>
          <Grid.Column width={3} floated="right">
            No : {this.state.survey.no}
          </Grid.Column>

          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
        </Grid.Row>

      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
