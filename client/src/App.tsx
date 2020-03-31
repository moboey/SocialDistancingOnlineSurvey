import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment, Container } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Survey } from './components/Survey'


export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState { }

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

  }

  render() {
    return (
      <div>   <Container style={{ padding: '1em 1em'  }} >

        <Router history={this.props.history}>
          {this.generateCurrentPage()}
        </Router>
      </Container>
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
