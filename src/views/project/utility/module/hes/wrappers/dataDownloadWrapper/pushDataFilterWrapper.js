import {
  Col,
  CardHeader,
  CardBody,
  CardTitle,
  Card,
  Button,
  Row,
  Label,
  Input,
} from 'reactstrap';
import Select from 'react-select';
import useJwt from '@src/auth/jwt/useJwt';
import { selectThemeColors } from '@utils';

import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import Flatpickr from 'react-flatpickr';
// import { useSelector } from 'react-redux'
import { useState, useEffect, useRef } from 'react';

import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import authLogout from '../../../../../../../auth/jwt/logoutlogic';

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus';

const PushDataFilterWrapper = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  // const responseData = useSelector(state => state.UtilityMdmsFlowReducer)
  const responseData = useSelector(
    (state) => state.UtilityMDASAssetListReducer
  );

  const [dtr, setDtr] = useState(undefined);
  const [meter, setMeter] = useState(undefined);
  const [meterSearch, setMeterSearch] = useState(undefined);
  const [params, setParams] = useState({});
  const [showDTRDropDown, setShowDTRDropDown] = useState(false);
  const [meterList, setMeterList] = useState(undefined);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [selectedDTR, setSelectedDTR] = useState([]);
  const [inputType, setInputType] = useState();
  const [dtrCount, setDTRCount] = useState(undefined);
  const [startDateTime, setStartDateTime] = useState(undefined);
  const [endDateTime, setEndDateTime] = useState(undefined);

  const [selected_project, set_selected_project] = useState(undefined);
  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  );

  const [disableDTRDropdown, setDisableDTRDropdown] = useState(false);
  const [disableMeterDropDown, setDisableMeterDropDown] = useState(false);
  const [disableMeterSearch, setDisableMeterSearch] = useState(false);

  const fetchMeterListForSelectedDTR = async (params) => {
    // API Call to fetch Meter List
    return await useJwt
      .getGISDTRMeterList(params)
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

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !==
        currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project);
      setSelectedDTR([]);
      setSelectedMeter(null);
      setStartDateTime();
    }
  }

  const metersList = [];
  for (let i = 0; i < selectedDTR.length; i++) {
    metersList.push({
      name: 'meter',
      meter_serial: meter,
      value: {
        pss_id: selectedDTR[i]['pss_id'],
        feeder_id: selectedDTR[i]['feeder_id'],
        site_id: selectedDTR[i]['value'],
        meter_serial: meter,
        protocol: 'dlms',
        project:
          location.pathname.split('/')[2] === 'sbpdcl'
            ? 'ipcl'
            : location.pathname.split('/')[2],
        protocol_type: 'dlms',
      },
      // command: commandName,
      // args: {
      //   value: val,
      //   input_type: inpt,
      //   mode: mod
      // }
    });
  }

  useEffect(() => {
    // Condition to check whether to show DTR DropDown or not
    // if (dtrCount && dtrCount === 1) {
    //   // Donot Show DTR DropDown
    //   setShowDTRDropDown(false)

    //   // Set only dtr as selected DTR
    //   const temp_dtr = responseData.responseData.dtr_list
    //   // console.log(temp_dtr)
    //   const temp = {}
    //   temp['value'] = temp_dtr[0]['dtr_id']
    //   temp['label'] = temp_dtr[0]['dtr_name']
    //   temp['pss_id'] = temp_dtr[0]['pss_id']
    //   temp['feeder_id'] = temp_dtr[0]['feeder_id']
    //   temp['isFixed'] = 'true'

    //   const temp_selected_dtr = []
    //   temp_selected_dtr.push(temp)
    //   setSelectedDTR(temp_selected_dtr)
    // } else if (dtrCount && !dtr) {
    //   // Show DTR DropDown
    //   setShowDTRDropDown(true)

    //   const temp_dtr = []
    //   const dtr_list = responseData.responseData.dtr_list

    //   if (dtr_list.length > 0) {
    //     for (const ele of dtr_list) {
    //       const temp = {}
    //       temp['value'] = ele['dtr_id']
    //       temp['label'] = ele['dtr_name']
    //       temp['pss_id'] = ele['pss_id']
    //       temp['feeder_id'] = ele['feeder_id']
    //       temp['isFixed'] = 'true'
    //       temp_dtr.push(temp)
    //     }
    //     setDtr(temp_dtr)
    //   }
    // }

    setShowDTRDropDown(true);

    const temp_dtr = [];
    const dtr_list = responseData.responseData.dtr_list;

    if (dtr_list.length > 0) {
      for (const ele of dtr_list) {
        const temp = {};
        temp['value'] = ele['dtr_id'];
        temp['label'] = ele['dtr_name'];
        temp['pss_id'] = ele['pss_id'];
        temp['feeder_id'] = ele['feeder_id'];
        temp['isFixed'] = 'true';
        temp_dtr.push(temp);
      }
      setDtr(temp_dtr);
    }
  }, [responseData]);

  // UseEffect to fetch Meter List for Selected DTR from Dropdown
  useEffect(async () => {
    if (selectedDTR.length > 0) {
      const params = {
        project:
          location.pathname.split('/')[2] === 'sbpdcl'
            ? 'ipcl'
            : location.pathname.split('/')[2],
        site_id: selectedDTR[0]['value'],
      };

      // Fetch Meter List
      const [statusCode, response] = await fetchMeterListForSelectedDTR(params);

      if (statusCode) {
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true);
        } else {
          // Construct Meter List for DropDown
          const temp_meter_list = response.data.data.result.stat.meters;

          const meter_list = [];
          for (let i = 0; i < temp_meter_list.length; i++) {
            const temp_meter = {};
            temp_meter['value'] = temp_meter_list[i]['meter_number'];
            temp_meter['label'] = temp_meter_list[i]['meter_number'];
            temp_meter['isFixed'] = 'true';
            meter_list.push(temp_meter);
          }

          setMeterList(meter_list);
        }
      }
    } else {
      setMeter(undefined);
      setMeterList(undefined);
    }
  }, [selectedDTR]);

  const onDtrSelected = (selectedOption) => {
    if (selectedOption) {
      const temp_selected_dtr = [];
      temp_selected_dtr.push(selectedOption);
      setSelectedDTR(temp_selected_dtr);
      setSelectedMeter(null);
      setStartDateTime(undefined);
      setEndDateTime(undefined);

      // Clear Meter Search useState and disable Meter Search option
      // setMeterSearch(undefined)
      setDisableMeterSearch(true);
    } else {
      setStartDateTime(undefined);
      setEndDateTime(undefined);
      setSelectedDTR([]);
      setSelectedMeter(null);

      // Clear Meter Search UseState and enable Meter Search option
      // setMeterSearch(undefined)
      setDisableMeterSearch(false);
    }
  };

  const onMeterSelected = (selectedOption) => {
    if (selectedOption) {
      setMeter(selectedOption['value']);
      setInputType(null);
      setParams({});
      setSelectedMeter(selectedOption);
      setStartDateTime(undefined);
      setEndDateTime(undefined);
    } else {
      setMeter(undefined);
      setStartDateTime(undefined);
      setEndDateTime(undefined);
      setInputType(null);
      setParams({});
      setSelectedMeter(null);
    }
  };

  const handleMeterSearchChange = (event) => {
    if (event.target.value) {
      // console.log('text available ....')
      setMeterSearch(event.target.value);
      // Disable Meter and DTR Dropdown
      if (!disableMeterDropDown) {
        setDisableDTRDropdown(true);
        setDisableMeterDropDown(true);
      }
    } else {
      setMeterSearch(undefined);
      setDisableDTRDropdown(false);
      setDisableMeterDropDown(false);

      // console.log('No Text Available .....')
    }
  };

  const dateTimeFormat = (inputDate) => {
    return ''.concat(
      inputDate.getFullYear(),
      '-',
      (inputDate.getMonth() + 1).toString().padStart(2, '0'),
      '-',
      inputDate.getDate().toString().padStart(2, '0'),
      ' ',
      inputDate.getHours().toString().padStart(2, '0'),
      ':',
      inputDate.getMinutes().toString().padStart(2, '0'),
      ':',
      inputDate.getSeconds().toString().padStart(2, '0')
    );
  };
  const onDateRangeSelected = (dateRange) => {
    // console.log('Date Range Selected ...')
    // console.log(dateRange)

    if (dateRange.length === 1) {
      // setStartDateTime(undefined)
      setStartDateTime(dateTimeFormat(dateRange[0]));
      setEndDateTime(undefined);
    } else if (dateRange.length === 2) {
      setStartDateTime(dateTimeFormat(dateRange[0]));
      setEndDateTime(dateTimeFormat(dateRange[1]));
    } else {
      setStartDateTime('');
      setEndDateTime('');
    }
  };

  const Submitresponse = () => {
    // console.log('On Submit Button clicked...')
    const params = {};
    if (selectedDTR.length > 0) {
      params['site'] = selectedDTR[0].value;
    } else {
      // If No Site Selected, add all sites access available
      const dtr_list = ' ';
      // for (let i = 0; i < responseData.responseData.dtr_list.length; i++) {
      //   dtr_list += `${responseData.responseData.dtr_list[i]['id']},`
      // }
      params['site'] = dtr_list;
    }

    if (meter) {
      params['meter'] = meter;
    }

    if (meterSearch) {
      params['meter'] = meterSearch;
    }

    // console.log('End DateTime ....')
    // console.log(endDateTime)
    // console.log('Start DateTime ....')
    // console.log(startDateTime)

    if (!endDateTime && !startDateTime) {
      setStartDateTime('');
      setEndDateTime('');
    } else if (!endDateTime && startDateTime) {
      toast.error(<Toast msg="Please select End Date Time" type="danger" />, {
        hideProgressBar: true,
      });
    } else if (endDateTime && startDateTime) {
      params['start_date'] = startDateTime;
      params['end_date'] = endDateTime;
    }
    props.onSubmitButtonClicked(params);

    //   props.onSubmitButtonClicked({ site_id: selectedDTR[0].value, meter_address: meter, start_time: startDateTime, end_time: endDateTime })
  };

  return (
    <>
      <Row>
        {showDTRDropDown && (
          <Col lg="3" sm="6" className="mb-1">
            <Select
              isClearable={true}
              onChange={onDtrSelected}
              isSearchable
              options={dtr}
              value={selectedDTR}
              isDisabled={disableDTRDropdown}
              className="react-select rounded zindex_1003"
              classNamePrefix="select"
              placeholder="Select site ..."
            />
          </Col>
        )}

        {!props.hideMeterSelector && (
          <Col lg="3" sm="6" className="mb-1">
            <Select
              isClearable={true}
              onChange={onMeterSelected}
              options={meterList}
              value={selectedMeter}
              isDisabled={disableMeterDropDown}
              isSearchable
              className="react-select zindex_1002"
              classNamePrefix="select"
              placeholder="Select meter ..."
            />
          </Col>
        )}

        {!props.hideMeterSearch && (
          <Col lg="3" sm="6" className="mb-1">
            <Input
              type="text"
              onChange={handleMeterSearchChange}
              disabled={disableMeterSearch}
              placeholder="Search for meter number"
            />
          </Col>
        )}

        {!props.hideDateRangeSelector && (
          <Col lg="3" sm="6" className="mb-1">
            <Flatpickr
              placeholder="Select date ..."
              onChange={onDateRangeSelected}
              className="form-control"
              value={startDateTime}
              options={{ mode: 'range', enableTime: true }}
            />
          </Col>
        )}

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

export default PushDataFilterWrapper;
