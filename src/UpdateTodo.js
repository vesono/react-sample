import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import { updateTodo } from './graphql/mutations';
import App from './App';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// update処理
const updTodo = async (updateid, value) => {
  const updNewTodo = {
    id: updateid,
    name: "Test name",
    description: value
  };
  console.log(updNewTodo);
  await API.graphql(graphqlOperation(updateTodo, {input: updNewTodo}));
  ReactDOM.render(<App />, document.getElementById('root'));
}

const UpdComponent = props => {
  const inputRef = useRef();
  console.log(props.keyid);

  const handleSubmit = (e, id) => {
    e.preventDefault();
    updTodo(id, inputRef.current.value);
    inputRef.current.value = '';
  }

  return (
    <div>
      タスク修正
      <form>
        <input type="text" ref={inputRef} onKeyPress={e => {if (e.key === 'Enter') e.preventDefault();}}/>
        <input type="submit" value="変更" onClick={(e) => handleSubmit(e, props.keyid)}/>
      </form>
    </div>
  );
}

export const UpdApp = updid => {
  ReactDOM.render(
    <UpdComponent keyid={updid} />,
    document.getElementById('root')
  );
}
