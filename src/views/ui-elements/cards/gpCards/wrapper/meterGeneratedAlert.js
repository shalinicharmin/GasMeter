import React, { useState, Fragment, useEffect } from 'react';
import Avatar from '@components/avatar';
import { Spinner, Row, Col, Button } from 'reactstrap';
import { Bell, RefreshCw } from 'react-feather';
import Select from 'react-select';
import Loader from '@src/views/project/misc/loader';
import no_data from '@src/assets/images/svg/no_data.svg';
import useJwt from '@src/auth/jwt/useJwt';

import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import authLogout from '../../../../../auth/jwt/logoutlogic';

import { handleMeterAlertsData as handlePssData } from '@store/actions/UtilityProject/MDMS/pss';
import { handleMeterAlertsData as handleFeederData } from '@store/actions/UtilityProject/MDMS/feeder';
import { handleMeterAlertsData as handleDtrData } from '@store/actions/UtilityProject/MDMS/dtr';
import { handleMeterAlertsData as handleUserData } from '@store/actions/UtilityProject/MDMS/user';
import { handleConsumerTopMeterAlertsData as handleConsumerTopMeterAlertsData } from '@store/actions/UtilityProject/MDMS/userprofile';
import EventHistoryModal from '@src/views/project/utility/module/mdms/userProfile/wrapper/eventHistoryModal';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

const MeterGeneratedAlert = (props) => {
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

  const [refresh, setRefresh] = useState(false);
  const [filterOption, setFilterOption] = useState(undefined);
  const [explore, setExplore] = useState(false);

  // const dispatch = useDispatch()
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  );
  const selected_month = useSelector((state) => state.calendarReducer.month);

  let response, responseData;

  if (props.hierarchy === 'pss') {
    response = useSelector((state) => state.UtilityMdmsPssMeterAlertsReducer);
  } else if (props.hierarchy === 'feeder') {
    response = useSelector(
      (state) => state.UtilityMdmsFeederMeterAlertsReducer
    );
  } else if (props.hierarchy === 'dtr') {
    response = useSelector((state) => state.UtilityMdmsDtrMeterAlertsReducer);
  } else if (props.hierarchy === 'user') {
    response = useSelector((state) => state.UtilityMdmsUserMeterAlertsReducer);
  } else if (props.hierarchy === 'userProfile') {
    response = useSelector(
      (state) => state.UtilityMdmsConsumerTopMeterAlertsReducer
    );
  }

  if (response && response.responseData) {
    // Remove events with only time and no events
    const temp = response.responseData;
    responseData = temp.filter(function (item) {
      return item.event_message.length > 0;
    });
  } else {
    responseData = [];
  }

  // console.log('Meter Generated Alerts Response Data ...')
  // console.log(responseData)

  // const dummyData = []

  const fetchData = async (params) => {
    return await useJwt
      .getHierarchyWiseMeterAlertsMDMSModule(params)
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
      // console.log('Calling Meter Generated Alerts API Call ....')
      // console.log(props.hierarchy)

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
      //       // dispatch(handlePssData(response.data.data.result.stat))
      //       //dispatch(handlePssData(data))
      //       dispatch(handlePssData(dummyData))
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
      //       // dispatch(handleFeederData(response.data.data.result.stat))
      //       dispatch(handleFeederData(dummyData))
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
      //       // dispatch(handleDtrData(response.data.data.result.stat))
      //       dispatch(handleDtrData(dummyData))
      //     }
      //   }
      // } else if (props.hierarchy === 'user') {
      //   dispatch(handleUserData(dummyData))
      //   setRefresh(false)
      //   setFilterOption(undefined)
      // } else if (props.hierarchy === 'userProfile') {
      //   const params = {
      //     meter: HierarchyProgress.user_name,
      //     project: HierarchyProgress.project_name
      //   }
      //   const [statusCode, response] = await fetchData(params)
      //   if (statusCode) {
      //     setRefresh(false)
      //     setFilterOption(undefined)
      //     if (statusCode === 200) {
      //       dispatch(handleConsumerTopMeterAlertsData(response.data.data.result.results))
      //     }
      //   }
      // }

      if (props.hierarchy === 'userProfile') {
        const params = {
          meter: HierarchyProgress.meter_serial_number,
          project: HierarchyProgress.project_name,
          is_mdms: true,
        };
        const [statusCode, response] = await fetchData(params);
        if (statusCode) {
          setRefresh(false);
          setFilterOption(undefined);
          if (statusCode === 200) {
            dispatch(
              handleConsumerTopMeterAlertsData(
                response.data.data.result.results
              )
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

  const getDateFunction = (params) => {
    const dateObject = new Date(params);
    return ''.concat(
      dateObject.getDate(),
      '-',
      dateObject.getMonth() + 1,
      '-',
      dateObject.getFullYear()
    );
  };

  const getTimeFunction = (params) => {
    const dateObject = new Date(params);
    return ''.concat(
      dateObject.getHours(),
      ':',
      dateObject.getMinutes(),
      ':',
      dateObject.getSeconds()
    );
  };

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
    if (responseData.length > 0) {
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
              options={props.MGFilterOption}
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
          <Col className={`${props.height} webi_scroller`}>
            {responseData.map((value, index) => {
              return (
                <Row key={index} className="border-top py_10">
                  <Col className="col-3 border-right super-center">
                    <div>
                      <Avatar
                        className="rounded"
                        color="light-primary"
                        icon={<Bell size={18} />}
                      />{' '}
                      <br></br>
                      <p className="super_small m-0">
                        {getDateFunction(value.meter_time)}
                      </p>
                      <p
                        className="super_small m-0"
                        style={{ lineHeight: '1' }}
                      >
                        {getTimeFunction(value.meter_time)}
                      </p>
                    </div>
                  </Col>
                  <Col>
                    {value.event_message.map((val, ind) => {
                      return (
                        <p className="m-0" key={ind}>
                          <small>
                            {ind + 1}. {val.message}
                          </small>
                        </p>
                      );
                    })}
                  </Col>
                </Row>
              );
            })}
          </Col>
          <Col className="text-center border-top pt_7">
            <Button.Ripple size="sm" outline onClick={() => setExplore(true)}>
              Explore more
            </Button.Ripple>
          </Col>

          {explore && (
            <EventHistoryModal
              title={'Event history table'}
              isOpen={explore}
              txtLen={50}
              handleModalState={setExplore}
            />
          )}
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
              </Fragment>
            </Col>
          </Row>
          <div className="super-center alert_dv">
            <div>
              <img src={no_data} style={{ height: '150px', width: '150px' }} />
              <p className="mt-1 ml-3">No data found</p>
              <Button.Ripple
                size="sm"
                color="flat-primary"
                className="ml-3"
                onClick={() => setExplore(true)}
              >
                Explore more
              </Button.Ripple>
              {explore && (
                <EventHistoryModal
                  title={'Event history table'}
                  isOpen={explore}
                  txtLen={50}
                  handleModalState={setExplore}
                />
              )}
            </div>
          </div>
        </div>
      );
    }
  } else if (!response || response.callAPI) {
    return (
      <div className="super-center alert_dv">
        <Loader />
      </div>
    );
  }
};

export default MeterGeneratedAlert;
