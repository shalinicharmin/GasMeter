import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
// import ForgotPassword from './pages/forgotPassword';
// import HesUtility from './pages/utility/module/hes';
import LayoutWrapper from './components/layout/LayoutWrapper';
import Home from "./pages/home"
import Error from './pages/error';
import SBPDCLUtility from './pages/Utility/SBPDCL';
import LPDDUtility from './pages/Utility/LPDD';

const App = () => {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="utility/sbpdcl/hes"
          element={<LayoutWrapper children={<SBPDCLUtility />} />}
        />
        <Route path="/" element={<Login />} />

        <Route
          path="utility/lpdd/hes"
          element={<LayoutWrapper children={<LPDDUtility />} />}
        />
        {/* <Route
          path="utility/sbpdcl/hes"
          element={<LayoutWrapper children={<HesUtility />} />}
        />

        <Route path="forgot-password" element={<ForgotPassword />} /> */}
        <Route
          path="utility/lpdd/hes"
          element={<LayoutWrapper children={<Home />} />}
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
