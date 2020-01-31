import React from 'react';
import ReactDOM from 'react-dom';
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import { updateTodo } from './graphql/mutations';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// update処理
const updTodo = async updateid => {
  await API.graphql(graphqlOperation(updateTodo, {input: updateid}));
}

const UpdComponent = () => {
  return (
    <h1>
      Hello, world!
    </h1>
  );
}

export const UpdApp = updid => {
  ReactDOM.render(
    <UpdComponent />,
    document.getElementById('root')
  );
}
