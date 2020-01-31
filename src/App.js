import React, { useEffect, useReducer, useRef } from 'react';
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import { createTodo, deleteTodo } from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { onCreateTodo, onUpdateTodo, onDeleteTodo } from './graphql/subscriptions';
import './App.css';
import { UpdApp } from './UpdateTodo';

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
const createNewTodo = async formTodo => {
  const todo = { name: "Test name" , description: formTodo };
  await API.graphql(graphqlOperation(createTodo, { input: todo }));
}

// タスクの削除
const delTodo = async delid => {
  const deleteId = { id: delid };
  await API.graphql(graphqlOperation(deleteTodo, {input: deleteId}));
}

// main処理
const App = () => {
  const inputRef = useRef();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSubmit = e => {
    console.log(inputRef);
    e.preventDefault();
    createNewTodo(inputRef.current.value);
    inputRef.current.value = '';
  }

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
    // アプデも一覧を再取得
    const updateSubscription = API.graphql(graphqlOperation(onUpdateTodo)).subscribe({
      next: eventData => getData()
    });
    return () => {
      insertSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
      updateSubscription.unsubscribe();
    }
  }, [])

  return (
  <div>
    <div>
      新規タスク<br />
      <form>
        <input type="text" ref={inputRef} onKeyPress={e => {if (e.key === 'Enter') e.preventDefault();}}/>
        <input type="submit" value="追加" onClick={e => handleSubmit(e)}/>
      </form>
    </div>
    <ul>
      {state.todos.length > 0 ? 
        state.todos.map(todo => (
          <div>
            <li key={todo.id}>
              {todo.description}
            </li>
            <button onClick={() => UpdApp(todo.id)}>編集</button>
            <button onClick={() => delTodo(todo.id)}>削除</button>
          </div>
        )) :
          <p>Add some todos!</p> 
      }
    </ul>
  </div>
  );
}

export default App;
