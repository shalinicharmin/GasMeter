import { Row } from 'reactstrap';
import CardAllProject from '@src/views/ui-elements/cards/advance/CardAllProject';
import useJwt from '@src/auth/jwt/useJwt';
import { handleAllProjects } from '@store/actions/projects';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import '@styles/react/libs/charts/apex-charts.scss';
import '@styles/base/pages/dashboard-ecommerce.scss';

import { useHistory } from 'react-router-dom';

import jwt_decode from 'jwt-decode';

import authLogout from '../auth/jwt/logoutlogic';

const AllProject = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const response = useSelector((state) => state.projects);

  if (localStorage.getItem('accessToken')) {
    // userData = jwt_decode(localStorage.getItem('accessToken')).userData.default_route
    // history.push(jwt_decode(localStorage.getItem('accessToken')).userData.default_route, { replace: true })
    const defaultRoute = jwt_decode(localStorage.getItem('accessToken'))
      .userData.default_route;
    window.location.href = `#${defaultRoute}`;
  }

  // if (localStorage.getItem('default_route')) {
  //   history.push(localStorage.getItem('default_route'), { replace: true })
  // }

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  let responseData = null;
  if (response && response.responseData) {
    responseData = response.responseData;
  } else {
    responseData = [];
  }

  const fetchData = async (params) => {
    return await useJwt
      .getAllProjectSummary(params)
      .then((res) => {
        const status = res.status;
        return [status, res];
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status;
          return [status, err];
        } else {
          return [0, err];
        }
      });
  };

  useEffect(async () => {
    if (!response || response.callAPI) {
      const params = {
        project: 'all',
      };

      const [statusCode, response] = await fetchData(params);

      // console.log('All projects response ...')
      // console.log(response)

      if (statusCode) {
        if (statusCode === 200) {
          dispatch(handleAllProjects(response.data.data.result.stat));
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true);
        }
      }
    }
  }, [response]);

  return (
    <div id="dashboard-ecommerce">
      <Row className="match-height">
        <CardAllProject data={responseData} />
      </Row>
    </div>
  );
};

export default AllProject;
