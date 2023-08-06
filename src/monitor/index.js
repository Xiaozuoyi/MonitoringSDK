import injectJsError from './lib/jsError'
import xhrMonitor from './lib/xhr'
import blankScreen from './lib/blankScreen'
import timing from './lib/timing'
import injectFetch from './lib/fetch'

injectJsError()
xhrMonitor()
injectFetch()
blankScreen()
timing()
