import { startServer } from './App'
import { startWorkers } from './workers/index'
import env from './environment'

startServer()

if (env('ENABLE_WORKERS')) {
  // startWorkers()
} else {
  console.log('--- WORKERS NOT ENABLED ---')
}
