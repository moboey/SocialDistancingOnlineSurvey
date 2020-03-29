import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { SurveyResult } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: SurveyResult
  newTodoName: string
  loadingSurvey: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: {yes:'0',no:'0',maybe:'0'},
    newTodoName: '',
    loadingSurvey: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    console.log('update Survey')
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      console.log('created Todo:'+newTodo)
      this.setState({
        //todos: [...this.state.todos, newTodo],
        //newTodoName: ''
      })
    } catch(e) {
      alert('Todo creation failed :'+e)
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        //todos: this.state.todos.filter(todo => todo.todoId != todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      /*const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })*/
    } catch {
      alert('Todo update failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos()
      this.setState({
        todos,
        loadingSurvey: false
      })
    } catch (e) {
      alert(`Failed to fetch survey result: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Can social distancing flatten the curve?</Header>

        {this.renderSurveyInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderSurveyInput() {
    return (
      <Grid padded>
      <Grid.Row>
       
        <Button          
          size="large"          
          color="teal"   block
          onClick={() => this.onTodoCreate}
                >Yes   
                  </Button>  
            
        <Button            
          size="large"                 
          color="yellow"   block
          onClick={() => this.onTodoCreate}
                >Maybe   
                  </Button> 
        <Button            
          size="large"                 
          color="red"   block
          onClick={() => this.onTodoCreate}
                >No
                  </Button>     
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
      </Grid>
    )
  }

  renderTodos() {
    if (this.state.loadingSurvey) {
      return this.renderLoading()
    }

    return this.renderSurveyResult()
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

  renderSurveyResult() {
    return (
      <Grid padded>
       
            <Grid.Row>             
              <Grid.Column width={3} floated="right">
                Yes : {this.state.todos.yes}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                No : {this.state.todos.no}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                Maybe : {this.state.todos.maybe}
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
