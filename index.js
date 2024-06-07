/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import axios from 'axios';
import {baseURL} from './app/store/constants';

axios.defaults.baseURL = baseURL;

AppRegistry.registerComponent(appName, () => App);
