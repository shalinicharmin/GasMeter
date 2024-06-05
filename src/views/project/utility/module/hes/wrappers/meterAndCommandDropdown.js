import React, { useEffect, useState, Fragment } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  UncontrolledTooltip,
  Button,
} from 'reactstrap';
import useJwt from '@src/auth/jwt/useJwt';

import { ChevronDown, Command, X } from 'react-feather';

import '@styles/react/libs/flatpickr/flatpickr.scss';

import '@styles/react/libs/noui-slider/noui-slider.scss';

import { useLocation, useHistory } from 'react-router-dom';
import { useSelector, useDispatch, batch } from 'react-redux';

import MeterCommandExecution from './commandExecutionWrapper';

import {
  handleMDASAssetList,
  handleMDASDlmsCommandList,
  handleMDASTapCommandList,
} from '@store/actions/UtilityProject/MDAS/CommandExecution';

// import { useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import CommandTab from './commandExecuReplica';

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus';

const MeterAndCommandDropDown = (props) => {
  // const responseAssetList = useSelector(state => state.UtilityMDASAssetListReducer)
  const responseDLSMCommandList = useSelector(
    (state) => state.UtilityMDASDlmsCommandReducer
  );

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  // Logout User
  const [logout, setLogout] = useState(false);
  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(false);
  const [selected_project, set_selected_project] = useState(undefined);

  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  );

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !==
        currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project);

      batch(() => {
        const assets = {
          pss_list: [],
          feeder_list: [],
          dtr_list: [],
        };

        dispatch(handleMDASAssetList(assets));
        dispatch(handleMDASDlmsCommandList([]));
        dispatch(handleMDASTapCommandList([]));
      });
      setRetry(true);
    }
  }

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const projectName =
    location.pathname.split('/')[2] === 'sbpdcl'
      ? 'ipcl'
      : location.pathname.split('/')[2];
  const verticalName = location.pathname.split('/')[1];

  const [dropDownStyle, setDropDownStyle] = useState('translateY(-100%)');
  const [tabActive, setTabActive] = useState('1');
  const [icoToggle, setIcoToggle] = useState(true);

  const toggleCommandExecutionModal = (val) => {
    setIcoToggle(!icoToggle);
    dropDownStyle === 'translateY(0)'
      ? setDropDownStyle('translateY(-100%)')
      : setDropDownStyle('translateY(0)');
    if (icoToggle) {
      document.getElementById('notch').firstChild.innerHTML =
        '<polyline points="18 15 12 9 6 15"></polyline>';
    } else {
      document.getElementById('notch').firstChild.innerHTML =
        '<polyline points="6 9 12 15 18 9"></polyline>';
    }
  };

  const toggle = (tab) => {
    if (tabActive !== tab) {
      setTabActive(tab);
      // resetDefault()
    }
  };

  // API call to fetch DLMS Command List
  const fetchDLMSCommandData = async () => {
    return await useJwt
      .getMdasDlmsCommandsList()
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

  // API call to fetch TAP Command List
  const fetchTAPCommandData = async () => {
    return await useJwt
      .getMdasTapCommandsList()
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

  // API Call to fetch asset list
  const fetchAssetData = async (params) => {
    return await useJwt
      .getGISAssetsTillDTR(params)
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

  // Fetch PSS,Feeder,DTR List for Command Execution
  useEffect(async () => {
    if (!responseDLSMCommandList || responseDLSMCommandList.callAPI || retry) {
      const params = {};
      params['project'] = projectName;
      params['vertical'] = verticalName;

      const [statusCode, response] = await fetchAssetData(params); //Fetch Asset List
      const [statusCodeDLMS, responseDLMS] = await fetchDLMSCommandData(); //Fetch DLMS Command List
      const [statusCodeTAP, responseTAP] = await fetchTAPCommandData(); //Fetch TAP Command List

      // Create Data for DLMS Command List
      let dlmsCommandList = [];
      if (statusCodeDLMS) {
        if (statusCodeDLMS === 200) {
          dlmsCommandList = responseDLMS.data.data.result;
          setRetry(false);
        } else if (statusCodeDLMS === 401 || statusCodeDLMS === 403) {
          setLogout(true);
        } else {
          setRetry(false);
          setError(true);
          setErrorMessage('Network Error, please retry');
        }
      }

      // Fetch TAP Command List
      let tapCommandList = [];
      if (statusCodeTAP) {
        if (statusCodeTAP === 200) {
          tapCommandList = responseTAP.data.data.result;
          setRetry(false);
        } else if (statusCodeTAP === 401 || statusCodeTAP === 403) {
          setLogout(true);
        } else {
          setRetry(false);
          setError(true);
          setErrorMessage('Network Error, please retry');
        }
      }

      // Create Data for Asset
      const pss_list = [];
      const feeder_list = [];
      const dtr_list = [];
      if (statusCode) {
        if (statusCode === 200) {
          const data = response.data.data.result.stat;

          // console.log('Assert List .......')
          // console.log(data)

          // Create pss list
          // const pss_list = []
          for (const pss of data['pss_list']) {
            const temp = {};
            temp['pss_name'] = pss['pss_name'];
            temp['pss_id'] = pss['pss_id'];

            pss_list.push(temp);
          }

          // Create Feeder list
          // const feeder_list = []
          for (const feeder of data['feeder_list']) {
            const temp = {};
            const parent_pss = feeder['pss_id'];
            for (const pss of pss_list) {
              if (pss['pss_id'] === parent_pss) {
                temp['feeder_name'] = feeder['feeder_name'];
                temp['feeder_id'] = feeder['feeder_id'];
                temp['pss_name'] = pss['pss_name'];
                temp['pss_id'] = pss['pss_id'];
                feeder_list.push(temp);
              }
            }
          }

          // Create DTR List
          // const dtr_list = []
          for (const dtr of data['live_dt_list']) {
            const temp = {};
            const parent_feeder = dtr['feeder_id'];
            for (const feeder of feeder_list) {
              if (feeder['feeder_id'] === parent_feeder) {
                temp['feeder_name'] = feeder['feeder_name'];
                temp['feeder_id'] = feeder['feeder_id'];
                temp['pss_name'] = feeder['pss_name'];
                temp['pss_id'] = feeder['pss_id'];
                temp['dtr_name'] = dtr['site_name'];
                temp['dtr_id'] = dtr['site_id'];
                dtr_list.push(temp);
              }
            }
          }
          setRetry(false);
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true);
        } else {
          setRetry(false);
          setError(true);
          setErrorMessage('Network Error, please retry');
        }
      }

      // console.log('PSS List .....')
      // console.log(pss_list)
      // console.log('Feeder List .....')
      // console.log(feeder_list)
      // console.log('DTR List .....')
      // console.log(dtr_list)

      batch(() => {
        const assets = {
          pss_list,
          feeder_list,
          dtr_list,
        };
        dispatch(handleMDASAssetList(assets));
        dispatch(handleMDASDlmsCommandList(dlmsCommandList));
        dispatch(handleMDASTapCommandList(tapCommandList));
      });
    }
  }, [responseDLSMCommandList, retry]);

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  return (
    <Col
      className="meter_command_floating p-0"
      style={{ transform: dropDownStyle }}
    >
      <Card className="mb-0">
        <CardHeader className="p-1">
          <Row className="w-100">
            <Col lg="11" md="10" xs="9">
              <h3 className="mt_12">Command Execution</h3>
            </Col>
            <Col lg="1" md="2" xs="3">
              <Button.Ripple
                className="btn-icon px_1 py_1 mt_12 mx-1"
                id="positionTop"
                outline
                color="danger"
                onClick={(e) => toggleCommandExecutionModal(e)}
              >
                <X size={16} />
              </Button.Ripple>
              <UncontrolledTooltip placement="top" target="positionTop">
                Close
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          {hasError ? (
            <CardInfo
              props={{
                message: { errorMessage },
                retryFun: { retryAgain },
                retry: { retry },
              }}
            />
          ) : (
            !retry && (
              <>
                {responseDLSMCommandList && (
                  <>
                    {/* <MeterCommandExecution
                      // pss_list={responseAssetList.responseData.pss_list}
                      // dlms_command_list={responseDLSMCommandList.responseData}
                      // tap_command_list={repsonseTAPCommandList.responseData}
                      refreshCommandHistory={props.refreshCommandHistory}
                      projectName={projectName}
                      toggleCommandExecutionModal={toggleCommandExecutionModal}
                      protocolSelectedForCommandExecution={props.protocolSelectedForCommandExecution}
                    /> */}
                    <CommandTab
                      refreshCommandHistory={props.refreshCommandHistory}
                      projectName={projectName}
                      toggleCommandExecutionModal={toggleCommandExecutionModal}
                      protocolSelectedForCommandExecution={
                        props.protocolSelectedForCommandExecution
                      }
                    />
                  </>
                )}
              </>
            )
          )}
        </CardBody>
      </Card>
      <div
        className="notch"
        id="notch"
        onClick={(e) => toggleCommandExecutionModal(e)}
      >
        <ChevronDown className="ChevronDown_ico" size={20} />
      </div>
    </Col>
  );
};

export default MeterAndCommandDropDown;
