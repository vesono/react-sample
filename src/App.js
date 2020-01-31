import React, { useEffect, useReducer } from 'react';
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import './App.css';

import { createTodo, updateTodo, deleteTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { onCreateTodo, onUpdateTodo, onDeleteTodo } from './graphql/subscriptions';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// アクションタイプ
const LIST = 'LIST';
const ADD = 'ADD';

const initialState = {
  todos: [],
};

// reducer定義
const reducer = (state, action) => {
  switch (action.type) {
    case LIST:
      return {...state, todos: action.todos};
      case ADD:
        return {...state, todos:[...state.todos, action.todo]};
    default:
      return state;
  }
};

// 新規タスク作成
const createNewTodo = async () => {
  const todo = { name: "Use AWS AppSync" , description: "Realtime and Offline" };
  await API.graphql(graphqlOperation(createTodo, { input: todo }));
}

// タスクの削除
const delTodo = async delid => {
  const deleteId = { id: delid };
  await API.graphql(graphqlOperation(deleteTodo, {input: deleteId}));
}

// main処理
const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // タスク一覧を取得（初めに動く）
    const getData = async () => {
      const todoData = await API.graphql(graphqlOperation(listTodos));
      // console.log(todoData);
      dispatch({ type: LIST, todos: todoData.data.listTodos.items });
    }
    getData();
    // 新規タスクを検知してリストに追加
    const insertSubscription = API.graphql(graphqlOperation(onCreateTodo)).subscribe({
      next: (eventData) => {
        // console.log(eventData);
        const todo = eventData.value.data.onCreateTodo;
        dispatch({ type: ADD, todo });
      }
    });
    // 削除されたら一覧取得する(listから消すのとどっちがいいんだろ・・・)
    const deleteSubscription = API.graphql(graphqlOperation(onDeleteTodo)).subscribe({
      next: eventData => getData()
    });
    return () => {
      insertSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    }
  }, [])

  return (
    <div>
    <div className="App">
      <button onClick={createNewTodo}>Add Todo</button>
    </div>
    <div>
      {state.todos.length > 0 ? 
        state.todos.map(todo => (
          <div>
            <button onClick={() => delTodo(todo.id)}>delete</button>
            <p key={todo.id}>
              {todo.name} : {todo.description}
            </p>
          </div>
        )) :
          <p>Add some todos!</p> 
      }
    </div>
  </div>
  );
}

export default App;
