import React, { useEffect, useReducer } from 'react';
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import './App.css';

import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// 新しいタスクを作成
async function createNewTodo() {
  const todo = { name: "Use AWS AppSync" , description: "Realtime and Offline" };
  // 新規タスク作成
  await API.graphql(graphqlOperation(createTodo, { input: todo }));
}

const QUERY = 'QUERY';
const initialState = {
  todos: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case QUERY:
      return {...state, todos: action.todos};
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function getData() {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      dispatch({ type: QUERY, todos: todoData.data.listTodos.items });
    }
    getData();
  }, []);

  return (
    <div>
    <div className="App">
      <button onClick={createNewTodo}>Add Todo</button>
    </div>
    <div>
      {state.todos.length > 0 ? 
        state.todos.map((todo) => <p key={todo.id}>{todo.name} : {todo.description}</p>) :
        <p>Add some todos!</p> 
      }
    </div>
  </div>
  );
}

export default App;
