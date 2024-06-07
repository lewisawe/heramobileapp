import {createStore} from 'redux';
import rootReducer from './reducers/root';

export default () => {
  return createStore(rootReducer);
};
