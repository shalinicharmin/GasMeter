import React, { useState, Fragment, useEffect } from 'react';
import {
  ListGroup,
  ListGroupItem,
  Tooltip,
  Spinner,
  Row,
  Col,
} from 'reactstrap';
import { RefreshCw } from 'react-feather';
import Select from 'react-select';
import Loader from '@src/views/project/misc/loader';
import no_data from '@src/assets/images/svg/no_data.svg';
import useJwt from '@src/auth/jwt/useJwt';

import { useSelector, useDispatch } from 'react-redux';

import { handleAlertsData as handlePssData } from '@store/actions/UtilityProject/MDMS/pss';
import { handleAlertsData as handleFeederData } from '@store/actions/UtilityProject/MDMS/feeder';
import { handleAlertsData as handleDtrData } from '@store/actions/UtilityProject/MDMS/dtr';
import { handleAlertsData as handleUserData } from '@store/actions/UtilityProject/MDMS/user';
import { handleConsumerTopAlertsData as handleConsumerTopAlertsData } from '@store/actions/UtilityProject/MDMS/userprofile';

import { useLocation, useHistory } from 'react-router-dom';
import authLogout from '../../../../../auth/jwt/logoutlogic';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

const SystemGeneratedAlert = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(false);

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const [refreshTooltipOpen, setRefreshTooltipOpen] = useState(false);

  const [refresh, setRefresh] = useState(false);

  const [filterOption, setFilterOption] = useState(undefined);

  // const dispatch = useDispatch()
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  );
  const selected_month = useSelector((state) => state.calendarReducer.month);

  let response, callAPI, responseData;

  if (props.hierarchy === 'pss') {
    response = useSelector((state) => state.UtilityMdmsPssAlertsReducer);
  } else if (props.hierarchy === 'feeder') {
    response = useSelector((state) => state.UtilityMdmsFeederAlertsReducer);
  } else if (props.hierarchy === 'dtr') {
    response = useSelector((state) => state.UtilityMdmsDtrAlertsReducer);
  } else if (props.hierarchy === 'user') {
    response = useSelector((state) => state.UtilityMdmsUserAlertsReducer);
  } else if (props.hierarchy === 'userProfile') {
    response = useSelector(
      (state) => state.UtilityMdmsConsumerTopAlertsReducer
    );
  }

  if (response && response.responseData) {
    responseData = response.responseData;
  } else {
    responseData = [];
  }

  const fetchData = async (params) => {
    return await useJwt
      .getHierarchyWiseSystemAlertsMDMSModule(params)
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
    // console.log('Response ....')
    // console.log(response)
    // console.log('Call API ....')
    // console.log(response.callAPI)
    // console.log('Refresh .....')
    // console.log(refresh)

    if (!response || response.callAPI || refresh || retry) {
      // console.log('Calling System Generated API Call ....')
      // console.log(props.hierarchy)

      //Call API and check response and dispatch
      // if (props.hierarchy === 'pss') {
      //   const params = {
      //     project: HierarchyProgress.project_name,
      //     year: selected_month.year,
      //     month: selected_month.month
      //   }

      //   const [statusCode, response] = await fetchData(params)
      //   if (statusCode) {
      //     setRefresh(false)
      //     setFilterOption(undefined)

      //     if (statusCode === 200) {
      //       dispatch(handlePssData(response.data.data.result.stat))
      //       //dispatch(handlePssData(data))
      //     }
      //   }
      // } else if (props.hierarchy === 'feeder') {
      //   const params = {
      //     project: HierarchyProgress.project_name,
      //     substation: HierarchyProgress.pss_name,
      //     year: selected_month.year,
      //     month: selected_month.month
      //   }

      //   const [statusCode, response] = await fetchData(params)
      //   if (statusCode) {
      //     setRefresh(false)
      //     setFilterOption(undefined)

      //     if (statusCode === 200) {
      //       dispatch(handleFeederData(response.data.data.result.stat))
      //     }
      //   }
      // } else if (props.hierarchy === 'dtr') {
      //   const params = {
      //     project: HierarchyProgress.project_name,
      //     substation: HierarchyProgress.pss_name,
      //     feeder: HierarchyProgress.feeder_name,
      //     year: selected_month.year,
      //     month: selected_month.month
      //   }

      //   const [statusCode, response] = await fetchData(params)
      //   if (statusCode) {
      //     setRefresh(false)
      //     setFilterOption(undefined)
      //     if (statusCode === 200) {
      //       dispatch(handleDtrData(response.data.data.result.stat))
      //     }
      //   }
      // } else if (props.hierarchy === 'user') {
      //   const params = {
      //     project: HierarchyProgress.project_name,
      //     substation: HierarchyProgress.pss_name,
      //     feeder: HierarchyProgress.feeder_name,
      //     dtr: HierarchyProgress.dtr_name,
      //     year: selected_month.year,
      //     month: selected_month.month
      //   }

      //   const [statusCode, response] = await fetchData(params)
      //   if (statusCode) {
      //     setRefresh(false)
      //     setFilterOption(undefined)
      //     if (statusCode === 200) {
      //       dispatch(handleUserData(response.data.data.result.stat))
      //     }
      //   }
      // } else if (props.hierarchy === 'userProfile') {
      //   const params = {
      //     project: HierarchyProgress.project_name,
      //     sc_no: HierarchyProgress.user_name
      //   }

      //   const [statusCode, response] = await fetchData(params)

      //   if (statusCode) {
      //     setRefresh(false)
      //     setFilterOption(undefined)
      //     if (statusCode === 200) {
      //       dispatch(handleConsumerTopAlertsData(response.data.data.result.stat))
      //     }
      //   }
      // }

      if (props.hierarchy === 'userProfile') {
        const params = {
          project: HierarchyProgress.project_name,
          sc_no: HierarchyProgress.user_name,
        };

        const [statusCode, response] = await fetchData(params);

        if (statusCode) {
          setRefresh(false);
          setFilterOption(undefined);
          if (statusCode === 200) {
            dispatch(
              handleConsumerTopAlertsData(response.data.data.result.stat)
            );
            setRetry(false);
          } else if (statusCode === 401 || statusCode === 403) {
            setLogout(true);
          } else {
            setRetry(false);
            setError(true);
            setErrorMessage('Network Error, please retry');
          }
        }
      }
    }
  }, [response, refresh, retry]);

  const refreshAlerts = () => {
    setRefresh(true);
  };

  // const onFilterOptionSelected = option => {
  //   if (option) {
  //     setFilterOption(option.value)
  //   }
  // }

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  if (hasError) {
    return (
      <Col xl="12" md="6" xs="12" className="mt-3 ">
        <CardInfo
          props={{
            message: { errorMessage },
            retryFun: { retryAgain },
            retry: { retry },
          }}
        />
      </Col>
    );
  } else if (response && !response.callAPI) {
    if (response.responseData.length > 0) {
      return (
        <div>
          <Row className="mb-1">
            <Col className="pl_30">
              {/* Filter dropdown */}
              {/* <Select
              isClearable={true}
              closeMenuOnSelect={true}
              onChange={onFilterOptionSelected}
              isSearchable={true}
              options={props.SGFilterOption}
              className='react-select border-secondary rounded'
              classNamePrefix='select'
              placeholder='Select Filter ...'
            /> */}
            </Col>
            <Col className="col-md-2 pr-3">
              {/* Refresh Icon */}
              <Fragment>
                {refresh ? (
                  <Spinner
                    id="refresh_table"
                    size="sm"
                    className="mt_10 float-right"
                  />
                ) : (
                  <RefreshCw
                    id="refresh_table"
                    size="14"
                    className="mt_10 float-right"
                    onClick={refreshAlerts}
                  />
                )}
                {/* <Tooltip placement='top' isOpen={refreshTooltipOpen} target='refresh_table' toggle={() => setRefreshTooltipOpen(!refreshTooltipOpen)}>
                Refresh Table
              </Tooltip> */}
              </Fragment>
            </Col>
          </Row>
          <ListGroup className={`${props.height} webi_scroller`}>
            {responseData.map((value, index) => {
              return (
                <ListGroupItem key={index}>
                  <h5 className="mb-0">{value.title}</h5>
                  <small className="float-right">{value.time}</small>
                  <br></br>
                  <p className="mb-1">{value.message}</p>
                </ListGroupItem>
              );
            })}
          </ListGroup>
        </div>
      );
    } else {
      return (
        <div>
          <Row className="mb-1">
            <Col className="pl_30"></Col>
            <Col className="col-md-2 pr-3">
              {/* Refresh Icon */}
              <Fragment>
                {refresh ? (
                  <Spinner
                    id="refresh_table"
                    size="sm"
                    className="mt_10 float-right"
                  />
                ) : (
                  <RefreshCw
                    id="refresh_table"
                    size="14"
                    className="mt_10 float-right"
                    onClick={refreshAlerts}
                  />
                )}
                {/* <Tooltip placement='top' isOpen={refreshTooltipOpen} target='refresh_table' toggle={() => setRefreshTooltipOpen(!refreshTooltipOpen)}>
                Refresh Table
              </Tooltip> */}
              </Fragment>
            </Col>
          </Row>
          <div className="super-center alert_dv">
            <div>
              <img src={no_data} style={{ height: '150px', width: '150px' }} />
              <p className="mt-1 ml-3">No data found</p>
            </div>
          </div>
        </div>
      );
    }
  } else if (!response || response.callAPI) {
    return (
      <div className="super-center alert_dv">
        <Loader hight={props.loaderHeight} />
      </div>
    );
  }
};

export default SystemGeneratedAlert;
