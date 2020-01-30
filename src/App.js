import React, { useEffect, useReducer } from 'react';
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import './App.css';

import { createTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { onCreateTodo } from './graphql/subscriptions';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// アクションタイプ
const QUERY = 'QUERY';
const SUBSCRIPTION = 'SUBSCRIPTION';

const initialState = {
  todos: [],
};

// 新規タスク作成
async function createNewTodo() {
  const todo = { name: "Use AWS AppSync" , description: "Realtime and Offline" };
  await API.graphql(graphqlOperation(createTodo, { input: todo }));
}

// reducer定義
const reducer = (state, action) => {
  switch (action.type) {
    case QUERY:
      return {...state, todos: action.todos};
      case SUBSCRIPTION:
        console.log({...state, todos:[...state.todos, action.todo]});
        return {...state, todos:[...state.todos, action.todo]};
    default:
      return state;
  }
};

// main処理
function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // タスク一覧を取得（初めに動く）
    async function getData() {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      dispatch({ type: QUERY, todos: todoData.data.listTodos.items });
    }
    getData();
    // 変更を検知して、再取得を実施する
    const subscription = API.graphql(graphqlOperation(onCreateTodo)).subscribe({
      next: (eventData) => {
        const todo = eventData.value.data.onCreateTodo;
        dispatch({ type: SUBSCRIPTION, todo });
      }
    });
    return () => subscription.unsubscribe();
  }, [])

  return (
    <div>
    <div className="App">
      <button onClick={createNewTodo}>Add Todo</button>
    </div>
    <div>
      {state.todos.length > 0 ? 
        state.todos.map(todo => (
          <p key={todo.id}>
            {todo.name} : {todo.description}
          </p>
        )) :
          <p>Add some todos!</p> 
      }
    </div>
  </div>
  );
}

export default App;
