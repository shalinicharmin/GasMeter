import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SummaryUtility from '@src/views/project/utility/module/summary';
import MdmsUtility from '@src/views/project/utility/module/mdms';
import AnalyticsUtility from '@src/views/project/utility/module/analytics';
import FfmUtility from '@src/views/project/utility/module/ffm';
import GisUtility from '@src/views/project/utility/module/gis';
import OaUtility from '@src/views/project/utility/module/oa';
import MDMSGasAnalytics from './module/mdmsGasAnalytics';

import HesUtility from '@src/views/project/utility/module/hes';

import jwt_decode from 'jwt-decode';

import Error from '@src/views/Error';
import Loader from '@src/views/project/misc/loader';
import useJwt from '@src/auth/jwt/useJwt';

import { handleMDMSFlow } from '../../../redux/actions/UtilityProject/MDMS/mdmsflow';

// ** Utils
import { isUserLoggedIn } from '@utils';
import MeterConfigDashboard from '../commonModules/meterConfigDashboard';
import MeterConfigurationUtility from './module/meterconfigurationUtility';
import HealthPortal from '../coliving/module/healthPortal';
import Prepaid_Engine from '@src/views/project/utility/module/prepaidEngine/index.js';
import Billing_Engine from './module/billingEngine';
import Sat from './module/sat';
import SLA_Reports from './module/sla-Reports';

const UtilityProject = (modul) => {
  // console.log('Inside Utility Index ....')

  // console.log("modul Passed ...")
  // console.log(modul)

  // const dispatch = useDispatch()
  // const responseData = useSelector(state => state.UtilityMdmsFlowReducer)

  // const selected_month = useSelector(state => state.calendarReducer.month)
  const location = useLocation();
  const projectName =
    location.pathname.split('/')[2] === 'sbpdcl'
      ? 'ipcl'
      : location.pathname.split('/')[2];
  // const [mdmsFlow, setMdmsFlow] = useState(undefined)

  const email_address = jwt_decode(localStorage.getItem('accessToken')).userData
    .email;

  const componentReturn =
    modul === 'summary' ? (
      <SummaryUtility project={projectName[2]} />
    ) : modul === 'mdms' ? (
      // <MdmsUtility />
      email_address === 'thinkgas@grampower.com' ? (
        <MDMSGasAnalytics />
      ) : (
        <MdmsUtility />
      )
    ) : modul === 'hes' ? (
      <HesUtility />
    ) : modul === 'analytics' ? (
      <AnalyticsUtility project={projectName[2]} />
    ) : modul === 'ffm-control' ? (
      <FfmUtility project={projectName[2]} />
    ) : modul === 'gis' ? (
      <GisUtility project={projectName[2]} />
    ) : modul === 'operations-automation' ? (
      <OaUtility project={projectName[2]} />
    ) : modul === 'meter-configuration' ? (
      <MeterConfigurationUtility />
    ) : modul === 'health-portal' ? (
      <HealthPortal />
    ) : modul === 'prepaid-engine' ? (
      <Prepaid_Engine />
    ) : modul === 'billing-engine' ? (
      <Billing_Engine />
    ) : modul === 'sat' ? (
      <Sat />
    ) : modul === 'sla-reports' ? (
      <SLA_Reports />
    ) : (
      <Error />
    );

  return componentReturn;
};

export default UtilityProject;
