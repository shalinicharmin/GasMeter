import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // Don't forget to import the CSS
// import 'bootstrap/dist/css/bootstrap.min.css';
// import "./@core/scss/react/libs/flatpickr/flatpickr.scss"
// import "./@core/scss/react/libs/react-select/_react-select.scss"


// ** React Toastify
// import '@styles/react/libs/toastify/toastify.scss'

// // ** Core styles
// import './@core/assets/fonts/feather/iconfont.css'
// import './@core/scss/core.scss';
// import './assets/css/util.scss'
// import './assets/scss/style.scss'

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <ToastContainer />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
