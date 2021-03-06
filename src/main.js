import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store.js'
const fb = require('./firebaseConfig.js')
import './assets/scss/app.scss'

Vue.config.productionTip = false


let app = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})