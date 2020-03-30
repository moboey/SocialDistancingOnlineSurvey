import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth' 
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Survey } from './components/Survey'
 

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)
 
  }
 
  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}> 
                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }
 
  generateCurrentPage() { 

    return (
      
      <Switch>
        <Route
          path="/"           
          render={props => {
            return <Survey {...props} />
          }}
        />         
      </Switch>
    )
  }
}
