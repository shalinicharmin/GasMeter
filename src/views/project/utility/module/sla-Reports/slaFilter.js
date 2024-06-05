import React, { useState, useEffect } from 'react';
import { Col, Row, Button } from 'reactstrap';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import { selectThemeColors } from '@utils';
import useJwt from '@src/auth/jwt/useJwt';
import {
  getDefaultDateTimeRange,
  formattedDateTime,
} from '../../../../../utility/Utils';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

const SlaFilter = (props) => {
  const { filterParams } = props;

  const [dtrList, setDtrList] = useState([]);
  const [dtrSelected, setDtrSelected] = useState(undefined);
  const [dtrLoader, setdtrLoader] = useState(false);

  const Options = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const [selectedOption, setSelectedOption] = useState(Options[0]);

  const defaultStartDate = moment()
    .subtract(1, 'days')
    .startOf('day')
    .format('YYYY-MM-DD'); // Yesterday, start of day
  const defaultEndDate = moment().startOf('day').format('YYYY-MM-DD'); // Today, start of day

  const [logout, setLogout] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(true);
  const [resp, setResp] = useState('');
  const [startDateTimeSelected, setStartDateTimeSelected] =
    useState(defaultStartDate);
  const [endDateTimeSelected, setEndDateTimeSelected] =
    useState(defaultEndDate);

  const [isStartendDateSelected, setIsStartendDateSelected] = useState(true);

  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  // API Call to fetch DTR asset list
  // const fetchAssetData = async (params) => {
  //   return await useJwt
  //     .getGISAssetsTillDTR(params)
  //     .then((res) => {
  //       const status = res.status
  //       return [status, res]
  //     })
  //     .catch((err) => {
  //       if (err.response) {
  //         const status = err.response.status
  //         return [status, err]
  //       } else {
  //         return [0, err]
  //       }
  //     })
  // }
  // useEffect(async () => {
  //   if (retry) {
  //     setdtrLoader(true)
  //     // Fetch Asset List
  //     const params = {}
  //     let project = ""
  //     if (location.pathname.split('/')[2] === "sbpdcl") {
  //       project = "ipcl"
  //     } else {
  //       project = location.pathname.split('/')[2]
  //     }

  //     const vertical = location.pathname.split('/')[1]
  //     params["project"] = project
  //     params["vertical"] = vertical
  //     const [statusCode1, response] = await fetchAssetData(params) //Fetch Asset List
  //     const data = response?.data?.data?.result?.stat?.live_dt_list
  //     // Create DTR List
  //     const siteOptions = data.map((site) => ({
  //       value: site.site_id,
  //       label: site.site_name
  //     }))
  //     setDtrList(siteOptions)
  //   } else if (statusCode1 === 401 || statusCode1 === 403) {
  //     setLogout(true)
  //   } else {
  //     setRetry(false)
  //     setError(true)
  //     setErrorMessage("Network Error, please retry")
  //   }
  //   setdtrLoader(false)
  // }, [retry])

  const onDTRSelected = (val) => {
    if (val) {
      const site_List = [];
      for (let i = 0; i < val.length; i++) {
        site_List.push(val[i]);
      }

      setDtrSelected(site_List);
    } else {
      setDtrSelected(undefined);
    }
  };

  const onHandleChange = (val) => {
    if (val) {
      setSelectedOption(val);
    } else {
      setSelectedOption(null);
    }
  };

  const onDateRangeSelected = (selectedDates) => {
    const [startDate, endDate] = selectedDates;
    if (selectedDates && selectedDates.length === 2) {
      setStartDateTimeSelected(moment(startDate).format('YYYY-MM-DD'));
      setEndDateTimeSelected(moment(endDate).format('YYYY-MM-DD'));
      setIsStartendDateSelected(true);
    } else {
      setStartDateTimeSelected(moment(startDate).format('YYYY-MM-DD'));
      setEndDateTimeSelected(undefined);
      if (endDate === undefined) {
        setIsStartendDateSelected(false);
      } else {
        setIsStartendDateSelected(true);
      }
    }
  };

  const onSubmitButtonClicked = () => {
    if (!isStartendDateSelected) {
      // Show toast warning for selecting end date
      toast.error(<Toast msg={'Please select End Date .'} type="danger" />, {
        hideProgressBar: true,
      });
      return false; // Prevent further execution
    }
    // const dtrValues = dtrSelected && dtrSelected.map((item) => item.value)
    const params = {};
    params['startDate'] = startDateTimeSelected;
    params['endDate'] = endDateTimeSelected;
    filterParams(params);
    console.log(params);
  };

  return (
    <Row className="mb-2">
      {/* Select SITE ID */}
      {/* <Col xl='3' md='6' sm='12'>
        <Select
          isClearable={true}
          theme={selectThemeColors}
          closeMenuOnSelect={false}
          value={dtrSelected}
          onChange={onDTRSelected}
          isSearchable
          isMulti
          options={dtrList}
          isDisabled={dtrLoader}
          className='react-select border-secondary rounded zindex_1000'
          classNamePrefix='select'
          placeholder={dtrLoader ? "Loading...." : "Select DTR"}
        />
      </Col>

      <Col lg='3'>
        {/* Select Options */}
      {/* <Select
          theme={selectThemeColors}
          className='react-select zindex_1000'
          classNamePrefix='select  '
          value={selectedOption}
          name='clear'
          onChange={onHandleChange}
          options={Options}
          isClearable
        /> */}
      {/* </Col>  */}

      <Col lg="3" md="3" className="mb-2">
        <Flatpickr
          placeholder="Select date ..."
          onChange={onDateRangeSelected}
          className="form-control"
          value={[startDateTimeSelected, endDateTimeSelected]}
          options={{
            mode: 'range',
            dateFormat: 'Y-m-d',
            allowInput: false,
          }}
        />
      </Col>
      <Col lg="1" sm="3" md="3" className="">
        <Button
          color="primary"
          className="btn "
          onClick={onSubmitButtonClicked}
        >
          Submit
        </Button>
      </Col>
    </Row>
  );
};

export default SlaFilter;
