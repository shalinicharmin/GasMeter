import React, { useEffect, useState } from 'react';
import { Row } from 'reactstrap';
import RechargeReport from './RechargeReport';
import BillReport from './BillReport';
import MeterChange from './MeterChange';
import { handleSiteList } from '@store/actions/coliving/analytics';
import useJwt from '@src/auth/jwt/useJwt';
import jwt_decode from 'jwt-decode';
import SourceStatus from './SourceStatus';
import authLogout from '@src/auth/jwt/logoutlogic';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
// import Loading from "./Loading";
import Loader from '@src/views/project/misc/loader';
import DgRuntime from './DgRuntime';
import DailyConsumption from './DailyConsumption';
import FrociReport from './FrociReport';

const Analytics = () => {
  const location = useLocation();
  const vertical = location.pathname.split('/')[1];
  const project = location.pathname.split('/')[2];
  const [reportAccess, setReportAccess] = useState([]);
  const [siteList, setSiteList] = useState([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(async () => {
    await dispatch(handleSiteList(siteList));
  }, [siteList, vertical, project]);

  useEffect(async () => {
    setIsLoading(true);
    try {
      const userPayload = await jwt_decode(localStorage.getItem('accessToken'));
      const res = await useJwt.getUserReportData({
        email: userPayload.username,
      });
      setReportAccess(
        res.data.data.result[0].report_access.find((item) => {
          return (
            project === item.project.toLowerCase() &&
            vertical === item.vertical.toLowerCase()
          );
        }).report_access
      );
    } catch (err) {
      if (err.response) {
        if (err.response.status && [401, 403].includes(err.response.status)) {
          toast.error(
            <Toast
              msg={'User access updated. Please login again.'}
              type="warning"
            />,
            {
              hideProgressBar: true,
            }
          );
          authLogout(history, dispatch);
        } else if (err.response.status && [400].includes(err.response.status)) {
          toast.error(
            <Toast
              msg={JSON.stringify(err.response.data.data.error)
                .toString()
                .substring(0, 100)
                .concat('...')}
              type="danger"
            />,
            {
              hideProgressBar: true,
            }
          );
          setData([]);
        } else {
          toast.error(
            <Toast
              msg={'Cannot fetch user report access. Please try again.'}
              type="danger"
            />,
            {
              hideProgressBar: true,
            }
          );
        }
      } else {
        toast.error(
          <Toast
            msg={'Cannot fetch user report access. Please try again.'}
            type="danger"
          />,
          {
            hideProgressBar: true,
          }
        );
      }
    }
    setIsLoading(false);
  }, [vertical, project]);

  const sortedReportAccess = reportAccess.sort((a, b) => {
    if (a.report_id < b.report_id) {
      return -1;
    } else if (a.report_id > b.report_id) {
      return 1;
    }
    return 0;
  });
  return (
    <>
      {isLoading ? (
        // <Loading />
        <Loader hight="min-height-330" />
      ) : (
        <>
          <h3 className="mb-2">Reports</h3>
          <Row>
            {sortedReportAccess.map((item) => {
              switch (item.report_id.toString()) {
                case '1001':
                  return <RechargeReport key={item.report_id} />;
                case '1002':
                  return <DgRuntime key={item.report_id} />;
                case '1003':
                  return <MeterChange key={item.report_id} />;
                case '1004':
                  return <BillReport key={item.report_id} />;
                case '1006':
                  return <DailyConsumption key={item.report_id} />;
                case '1008':
                  return <FrociReport key={item.report_id} />;
                default:
                  break;
              }
            })}
          </Row>
          {reportAccess.map((item) => {
            if (item.report_id.toString() === '1007') {
              return <SourceStatus key={item.report_id} />;
            }
          })}
        </>
      )}
    </>
  );
};
export default Analytics;
