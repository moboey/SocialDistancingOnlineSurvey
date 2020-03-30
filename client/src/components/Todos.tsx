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
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, surveyPost, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { SurveyResult } from '../types/Todo'

const COLORS = ['teal', 'orange', 'red'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, index,
}: {cx : any, cy : any, midAngle:any, innerRadius:any, outerRadius:any, percent:any, index:any,}) => {
   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: SurveyResult
  loadingSurvey: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: {yes:'0',no:'0',maybe:'0'}, 
    loadingSurvey: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    console.log('update Survey')
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: '',
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

  onSurveyPost = async (surveyIndex: string) => {
    try {
      const todos = await surveyPost(surveyIndex) 
      this.setState({
        todos,
        loadingSurvey: false
      })
    } catch {
      alert('Post survey failed')
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Can social distancing flatten the curve?</Header>

        {this.renderSurveyInput()}

        {this.renderTodos()}

        {this.renderChart()}
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
                >Maybe   
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

  renderChart(){   
    
    const data = [
      { name: 'Yes', value: this.state.todos.yes} ,
      { name: 'Not sure', value: this.state.todos.maybe },
      { name: 'No', value: this.state.todos.no },
    ];
    
    return (
      <Grid padded>
      <Grid.Row>
      <Grid.Column >
      <PieChart width={350} height={350}>
        <Pie
          data={data}
          cx={180}
          cy={180}
          labelLine={false}          
          outerRadius={150}
          //label={this.renderCustomizedLabel}
          fill="#8884d8"
          dataKey="value"
        >
          {
            data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
          }
        </Pie>
      </PieChart></Grid.Column></Grid.Row>
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
                Yes : {this.state.todos.yes}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                Maybe : {this.state.todos.maybe}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                No : {this.state.todos.no}
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
