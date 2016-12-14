import { createStore, applyMiddleware, compose } from 'redux';
import createMiddleware from './middleware/clientMiddleware';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import Immutable from 'immutable';
import createLogger from 'redux-logger';

export default function configureStore(history, client, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = routerMiddleware(history);

  const middlewares = [createMiddleware(client), reduxRouterMiddleware, thunk];
  const tools = [];

  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    middlewares.push(createLogger());
    const { persistState } = require('redux-devtools');
    const DevTools = require('../containers/DevTools/DevTools');
    tools.push(window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument());
    tools.push(persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)));
  }

  const reducer = require('./modules/reducer');
  if (data) {
    data.pagination = Immutable.fromJS(data.pagination);
  }
  const store = createStore(reducer, data, compose(
    applyMiddleware(...middlewares),
    ...tools,
  ));

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      store.replaceReducer(require('./modules/reducer'));
    });
  }

  return store;
}
