import React, { useState, useEffect } from 'react';
import { Button, Col, Input, Row } from 'reactstrap';
import Select from 'react-select';

import useJwt from '@src/auth/jwt/useJwt';
import authLogout from '@src/auth/jwt/logoutlogic';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

const CommonFilter = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const [selectedDTR, setSelectedDTR] = useState(null);
  const [selectedPss, setSelectedPSS] = useState(null);
  const [selectedFeeder, setSelectedFeeder] = useState(null);

  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(false);

  const [dtr, setDtr] = useState([]);
  const [pss, setPss] = useState([]);
  const [feeder, setfeeder] = useState([]);

  const [isPssSelected, SetIsPssSelected] = useState(false);
  const [isUserInputTyped, setIsUserInputTyped] = useState(false);

  const [userInputParameter, setUserInputParameter] = useState('');
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
      setRetry(true);
      setError(false);
    }
  }

  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

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

  const projectName =
    location.pathname.split('/')[2] === 'sbpdcl'
      ? 'ipcl'
      : location.pathname.split('/')[2];
  const verticalName = location.pathname.split('/')[1];

  // Fetch PSS,Feeder,DTR List for Command Execution
  useEffect(async () => {
    const params = {};
    params['project'] = projectName;
    params['vertical'] = verticalName;

    const [statusCode, response] = await fetchAssetData(params); //Fetch Asset List
    // Create Data for Asset
    const pss_list = [];
    const feeder_list = [];
    const dtr_list = [];
    if (statusCode) {
      if (statusCode === 200) {
        const data = response.data.data.result.stat;

        // Create pss list
        for (const pss of data['pss_list']) {
          const temp = {};
          temp['label'] = pss['pss_name'];
          temp['value'] = pss['pss_id'];
          pss_list.push(temp);
        }
        setPss(pss_list);

        // Create Feeder list
        for (const feeder of data['feeder_list']) {
          const temp = {};
          temp['label'] = feeder['feeder_name'];
          temp['value'] = feeder['feeder_id'];
          temp['pss_id'] = feeder['pss_id'];
          feeder_list.push(temp);
        }
        setfeeder(feeder_list);

        // Create DTR List
        for (const dtr of data['live_dt_list']) {
          const temp = {};
          temp['feeder_id'] = dtr['feeder_id'];
          temp['label'] = dtr['site_name'];
          temp['value'] = dtr['site_id'];
          dtr_list.push(temp);
        }
        setDtr(dtr_list);
        setRetry(false);
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else {
        setRetry(false);
        setError(true);
        setErrorMessage('Network Error, please retry');
      }
    }
  }, []);

  // On Change On PSS selected
  const onPssSelected = (selectedOption) => {
    if (selectedOption) {
      setSelectedPSS(selectedOption);
      setSelectedFeeder(null);
      setSelectedDTR(null);
      setIsUserInputTyped(true);
    } else {
      setSelectedPSS(null);
      setSelectedFeeder(null);
      setSelectedDTR(null);
      setIsUserInputTyped(false);
    }
  };

  // on Change on Feeder Selected
  const onFeederSelected = (selectedOption) => {
    if (selectedOption) {
      setSelectedFeeder(selectedOption);
      setSelectedDTR(null);
      setIsUserInputTyped(true);
    } else {
      setSelectedFeeder(null);
      setSelectedDTR(null);
      setIsUserInputTyped(true);
    }
  };

  //  Dtr on Change function
  const onDtrSelected = (selectedOption) => {
    if (selectedOption) {
      setSelectedDTR(selectedOption);
      setIsUserInputTyped(true);
    } else {
      setSelectedDTR(null);
      setIsUserInputTyped(true);
    }
  };

  // on Input onChange function
  const userInputFun = (event) => {
    if (event.target.value) {
      setUserInputParameter(event.target.value.trim());
      SetIsPssSelected(true);
    } else {
      SetIsPssSelected(false);
      setUserInputParameter('');
    }
  };

  // To render feeder list of selected Pss
  const feederOptionRender = (data) => {
    const temp = [];
    data.map((value) => {
      if (value.pss_id === selectedPss.value) {
        temp.push(value);
      }
    });

    return temp;
  };

  // To render dtr list of selected feeder
  const DtrOptionRender = (data) => {
    const temp = [];
    data.map((value) => {
      if (value.feeder_id === selectedFeeder.value) {
        temp.push(value);
      }
    });
    return temp;
  };

  const Submitresponse = () => {
    const selectedValuesObject = {
      pss_id: selectedPss ? selectedPss.value : null,
      feeder_id: selectedFeeder ? selectedFeeder.value : null,
      site_id: selectedDTR ? selectedDTR.value : null,
      // userInput: userInputParameter
    };
    // console.log(selectedValuesObject)
    props.onSubmitButtonClicked(selectedValuesObject);
  };

  return (
    <>
      <Row>
        {/* PSS */}
        <Col lg="3" sm="6" className="mb-1">
          <Select
            onChange={onPssSelected}
            isClearable={true}
            value={selectedPss}
            isSearchable
            options={pss}
            className="react-select rounded zindex_1009"
            classNamePrefix="select"
            isDisabled={isPssSelected}
            placeholder="Select Pss ..."
          />
        </Col>

        {/* FEEDER */}
        <Col lg="3" sm="6" className="mb-1">
          <Select
            onChange={onFeederSelected}
            isClearable={true}
            value={selectedFeeder}
            isSearchable
            options={selectedPss !== null ? feederOptionRender(feeder) : feeder}
            className="react-select rounded zindex_1003"
            classNamePrefix="select"
            isDisabled={isPssSelected}
            placeholder="Select Feeder ..."
          />
        </Col>

        {/* DTR */}
        <Col lg="3" sm="6" className="mb-1">
          <Select
            onChange={onDtrSelected}
            isClearable={true}
            value={selectedDTR}
            isSearchable
            options={selectedFeeder !== null ? DtrOptionRender(dtr) : dtr}
            className="react-select rounded "
            classNamePrefix="select"
            isDisabled={isPssSelected}
            placeholder="Select site ..."
          />
        </Col>

        {/* Enter meter serial */}
        {/* <Col lg='4' sm='6' className='mb-1'>
          <Input
            name={userInputParameter}
            type='text'
            value={userInputParameter}
            onChange={userInputFun}
            autoFocus={true}
            disabled={isUserInputTyped}
            placeholder='Enter meter Serial No. /  SC No. ...'
          />
        </Col> */}

        {/* Submit Button */}
        <Col lg="2" sm="5">
          <Button
            color="primary"
            className="btn-block "
            onClick={Submitresponse}
          >
            Submit
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default CommonFilter;
