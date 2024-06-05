import Select from 'react-select';
import { selectThemeColors } from '@utils';
import Flatpickr from 'react-flatpickr';
import { useState, useEffect } from 'react';

import { Col, Button, Row, Label, FormGroup, Input } from 'reactstrap';
// import { formattedDate } from '../../../../../../utility/Utils'
import {
  formattedDate,
  getDefaultDateRange,
} from '../../../../../../../utility/Utils';

import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';

import useJwt from '@src/auth/jwt/useJwt';
import { useLocation } from 'react-router-dom';

const RequestReportCommonSelector = (props) => {
  const defaultDates = getDefaultDateRange();
  const location = useLocation();

  const [startDateSelected, setStartDateSelected] = useState('');
  const [endDateSelected, setEndDateSelected] = useState('');

  // console.log({ startDateSelected, endDateSelected })
  const [pssSelected, setPssSelected] = useState(undefined);
  const [pssList, setPssList] = useState(props.pss_list);

  const [feederSelected, setFeederSelected] = useState(undefined);
  const [feederList, setFeederList] = useState(props.feeder_list);

  const [dtrSelected, setDtrSelected] = useState(undefined);
  const [dtrList, setDtrList] = useState(props.dtr_list);

  const [consumerMeterSerialNumber, setConsumerMeterSerialNumber] =
    useState(undefined);

  const [reportSelected, setReportSelected] = useState(
    props.default_report_type
  );
  const [reportsList, setReportList] = useState(props.report_types);

  const [subdiv_id, SetSubdiv_id] = useState(undefined);
  const [section_id, setSection_id] = useState(undefined);

  const [isPssSelected, SetIsPssSelected] = useState(false);
  const [isSubDivSelected, SetIsSubDivSelcted] = useState(false);
  const [isConsumerSerialSelected, setIsConsumerSerialSelected] =
    useState(false);

  const [response, setResponse] = useState([]);
  const [subDivIdList, setSubDivIdList] = useState([]);
  const [sectionIdList, setSectionIdLiSt] = useState([]);

  const [pssName, setPssName] = useState(undefined);
  const [feederName, setfeederName] = useState(undefined);
  const [dtrName, setDtrName] = useState(undefined);

  // To get section and subdiv id list
  const fetchSection_subdiv_id = async (params) => {
    return await useJwt
      .getSection_Subdiv_id(params)
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
    let params = {};
    params = {
      project:
        location.pathname.split('/')[2] === 'sbpdcl'
          ? 'ipcl'
          : location.pathname.split('/')[2],
    };
    const [statusCode, response] = await fetchSection_subdiv_id(params);
    if (statusCode === 401 || statusCode === 403) {
      setLogout(true);
    } else if (statusCode === 200) {
      // Set Response Data
      const result = response.data.data.result.stat.sub_div_list;
      setResponse(result);
    }
  }, []);

  const dropdownoptions = () => {
    if (response) {
      const subDivList = [],
        sectionList = [];
      //In  Sub div list filtering out duplicates
      const uniqueIds = [];
      const unique = response.filter((element) => {
        const isDuplicate = uniqueIds.includes(element.subdivision_id);
        if (!isDuplicate) {
          uniqueIds.push(element.subdivision_id);
          return true;
        }
        return false;
      });

      // subdivlist
      for (const i of unique) {
        subDivList.push({
          value: i['subdivision_id'],
          label: i['subdivision_id'],
        });
      }
      setSubDivIdList(subDivList);

      // sectionlist
      for (const i of response) {
        sectionList.push({ value: i['section_id'], label: i['section_id'] });
      }
      setSectionIdLiSt(sectionList);
    }
  };

  useEffect(() => {
    dropdownoptions();
  }, [response]);

  const onDateRangeSelected = (val) => {
    if (val && val.length >= 2) {
      const start_date = val[0];
      const end_date = val[1];
      const Difference_In_Time = end_date.getTime() - start_date.getTime();
      const difference_in_days = Difference_In_Time / (1000 * 3600 * 24);
      setStartDateSelected(formattedDate(val[0]));
      setEndDateSelected(formattedDate(val[1]));
      //   if (difference_in_days <= 30) {
      //   } else {
      //     toast.error(<Toast msg={'Date range cannot be more than 30 days'} type='danger' />, { hideProgressBar: true })
      //   }
    } else {
      setStartDateSelected('');
      setEndDateSelected('');
    }
  };

  const onPssSelected = (val) => {
    if (val) {
      // console.log(val)
      setPssSelected(val);
      setPssName(val);

      // Set Feeder DropDown as per pss selected
      const feeder_list_dummy = [];
      for (let i = 0; i < props.feeder_list.length; i++) {
        if (val.pss_id === props.feeder_list[i].pss_id) {
          feeder_list_dummy.push(props.feeder_list[i]);
        }
      }
      setFeederList(feeder_list_dummy);
      setDtrList([]);
      setFeederSelected(undefined);
      setDtrSelected(undefined);
      SetIsSubDivSelcted(true);
      setIsConsumerSerialSelected(true);
    } else {
      // console.log('PSS Selected in null ....')
      setPssList(props.pss_list);
      setDtrList(props.dtr_list);
      setFeederList(props.feeder_list);
      setPssSelected(undefined);
      setFeederSelected(undefined);
      setDtrSelected(undefined);
      SetIsSubDivSelcted(false);
      setIsConsumerSerialSelected(false);
    }
  };

  const onFeederSelected = (val) => {
    if (val) {
      // console.log(val)
      setFeederSelected(val);
      setfeederName(val);
      const dtr_list_dummy = [];
      // Set DTR Dropdown as per feeder selected
      for (let i = 0; i < props.dtr_list.length; i++) {
        if (val.feeder_id === props.dtr_list[i].feeder_id) {
          dtr_list_dummy.push(props.dtr_list[i]);
        }
      }
      setDtrList(dtr_list_dummy);
      setDtrSelected(undefined);
      SetIsSubDivSelcted(true);
      setIsConsumerSerialSelected(true);
    } else {
      setFeederSelected(undefined);
      if (pssSelected) {
        setDtrList([]);
        setDtrSelected(undefined);
        SetIsSubDivSelcted(true);
        setIsConsumerSerialSelected(true);
      } else {
        setPssList(props.pss_list);
        setFeederList(props.feeder_list);
        setDtrList(props.dtr_list);
        setPssSelected(undefined);
        setFeederSelected(undefined);
        setDtrSelected(undefined);
        SetIsSubDivSelcted(false);
        setIsConsumerSerialSelected(false);
      }
    }
  };

  const onDTRSelected = (val) => {
    // console.log(val)
    if (val) {
      setDtrSelected(val);
      setDtrName(val);
      SetIsSubDivSelcted(true);
      setIsConsumerSerialSelected(true);
    } else {
      setDtrSelected(undefined);
      if (pssSelected && feederSelected) {
        SetIsSubDivSelcted(true);
        setIsConsumerSerialSelected(true);
      } else {
        setDtrSelected(undefined);
        setSection_id(undefined);
        SetSubdiv_id(undefined);
        SetIsSubDivSelcted(false);
        setIsConsumerSerialSelected(false);
      }
    }
  };

  const onConsumerIdTyped = (e) => {
    // console.log('Consumer Meter Serial Number Typed ....')
    // console.log(e.target.value)

    if (e.target.value) {
      setConsumerMeterSerialNumber(e.target.value);
      setPssList([]);
      setFeederList([]);
      setDtrList([]);
      setPssSelected(undefined);
      setDtrSelected(undefined);
      setFeederSelected(undefined);
      SetIsPssSelected(true);
      SetIsSubDivSelcted(true);
    } else {
      setPssList(props.pss_list);
      setFeederList(props.feeder_list);
      setDtrList(props.dtr_list);
      setPssSelected(undefined);
      setDtrSelected(undefined);
      setFeederSelected(undefined);
      setConsumerMeterSerialNumber(undefined);
      SetIsPssSelected(false);
      SetIsSubDivSelcted(false);
    }
  };
  const onSubdivId = (val) => {
    if (val) {
      SetSubdiv_id(val);
      const selectedSectionIdList = [];
      for (const i of response) {
        if (val.value === i['subdivision_id']) {
          selectedSectionIdList.push({
            value: i['section_id'],
            label: i['section_id'],
          });
        }
      }
      setSectionIdLiSt(selectedSectionIdList);
      setSection_id(undefined);
      setIsConsumerSerialSelected(true);
      SetIsPssSelected(true);
    } else {
      const sectionList = [];
      for (const i of response) {
        sectionList.push({ value: i['section_id'], label: i['section_id'] });
      }
      setSectionIdLiSt(sectionList);
      setSection_id(undefined);
      SetSubdiv_id(undefined);
      SetIsPssSelected(false);
      setIsConsumerSerialSelected(false);
    }
  };

  const onSectionId = (val) => {
    // console.log(val)
    if (val) {
      setSection_id(val);
      SetIsPssSelected(true);
      setIsConsumerSerialSelected(true);
    } else {
      const sectionList = [];
      for (const i of response) {
        sectionList.push({ value: i['section_id'], label: i['section_id'] });
      }
      setSectionIdLiSt(sectionList);
      SetSubdiv_id(undefined);
      setSection_id(undefined);
      SetIsPssSelected(false);
      setIsConsumerSerialSelected(false);
    }
  };
  const onSearchButtonClicked = () => {
    props.onSearchButtonClicked(
      !props.report_types
        ? {
            startDate: startDateSelected ? startDateSelected : '',
            endDate: endDateSelected ? endDateSelected : '',
            pssId: pssSelected ? pssSelected.pss_id : '',
            feederId: feederSelected ? feederSelected.feeder_id : '',
            siteId: dtrSelected ? dtrSelected.dtr_id : undefined,
            scNo: consumerMeterSerialNumber ? consumerMeterSerialNumber : '',
            subDivId: subdiv_id ? subdiv_id.value : '',
            sectionId: section_id ? section_id.value : '',
          }
        : {
            reportId: reportSelected.value,
            intervalDays: reportSelected.numberOfDays
              ? reportSelected.numberOfDays
              : '',
            pssId: pssSelected ? pssSelected.pss_id : '',
            feederId: feederSelected ? feederSelected.feeder_id : '',
            siteId: dtrSelected ? dtrSelected.dtr_id : undefined,
            scNo: consumerMeterSerialNumber ? consumerMeterSerialNumber : '',
            subDivId: subdiv_id ? subdiv_id.value : '',
            sectionId: section_id ? section_id.value : '',
          }
    );
  };

  // useEffect(() => {
  //   console.log('<<<<<<<<<<<<<<', { startDateSelected, endDateSelected })
  // }, [startDateSelected, endDateSelected])

  const onReportRequestButtonClicked = () => {
    // if (startDateSelected || endDateSelected) {
    setStartDateSelected('');
    setEndDateSelected('');
    setPssSelected(undefined);
    setFeederSelected(undefined);
    setDtrSelected(undefined);
    setConsumerMeterSerialNumber(undefined);
    SetSubdiv_id(undefined);
    setSection_id(undefined);
    // }
    props.onRequestReportButtonClicked(
      !props.report_types
        ? {
            startDate: startDateSelected ? startDateSelected : '',
            endDate: endDateSelected ? endDateSelected : '',
            pssId: pssSelected ? pssSelected.pss_id : '',
            pssName: pssName ? pssName.pss_name : '',
            feederId: feederSelected ? feederSelected.feeder_id : '',
            feederName: feederName ? feederName.feeder_name : '',
            siteId: dtrSelected ? [dtrSelected.dtr_id] : '',
            siteName: dtrName ? [dtrName.dtr_name] : '',
            scNo: consumerMeterSerialNumber ? consumerMeterSerialNumber : '',
            subDivId: subdiv_id ? subdiv_id.value : '',
            sectionId: section_id ? section_id.value : '',
          }
        : {
            reportId: reportSelected.value,
            balance: -1,
            intervalDays: reportSelected.numberOfDays
              ? reportSelected.numberOfDays
              : '',
            pssId: pssSelected ? pssSelected.pss_id : '',
            feederId: feederSelected ? feederSelected.feeder_id : '',
            siteId: dtrSelected ? [dtrSelected.dtr_id] : '',
            scNo: consumerMeterSerialNumber ? consumerMeterSerialNumber : '',
            subDivId: subdiv_id ? subdiv_id.value : '',
            sectionId: section_id ? section_id.value : '',
          }
    );
  };

  const onReportTypeSelected = (val) => {
    setReportSelected(val);
  };

  return (
    <Row className="mb-2">
      <Col className="mb-1" xl="3" md="6" sm="12">
        {!props.report_types && (
          <Flatpickr
            placeholder="Select date ..."
            onChange={onDateRangeSelected}
            className="form-control"
            value={[startDateSelected, endDateSelected]}
            options={{ mode: 'range', dateFormat: 'Y-m-d' }}
          />
        )}
        {props.report_types && (
          <Select
            id="selectreporttype"
            name="reporttype"
            key={`my_unique_select_key__${reportSelected}`}
            isOptionSelected={(reportsList, reportSelected) =>
              reportSelected.some((i) => i === reportsList)
            }
            theme={selectThemeColors}
            className="react-select zindex_1001"
            classNamePrefix="select"
            value={reportSelected}
            closeMenuOnSelect={true}
            onChange={onReportTypeSelected}
            options={reportsList}
            isClearable={true}
            placeholder="Select Report Type"
          />
        )}
      </Col>

      {/* Select PSS ID */}
      <Col className="mb-1" xl="3" md="6" sm="12">
        <Select
          id="selectpss"
          name="pss"
          key={`my_unique_select_key__${pssSelected}`}
          theme={selectThemeColors}
          className="react-select zindex_1001"
          classNamePrefix="select"
          value={pssSelected}
          closeMenuOnSelect={true}
          onChange={onPssSelected}
          options={pssList}
          isClearable={true}
          isDisabled={isPssSelected}
          placeholder="Select PSS"
        />
      </Col>

      {/* Select FEEDER ID */}
      <Col className="mb-1" xl="3" md="6" sm="12">
        <Select
          id="selectfeeder"
          name="feeder"
          key={`my_unique_select_key__${feederSelected}`}
          isClearable={true}
          theme={selectThemeColors}
          className="react-select"
          classNamePrefix="select"
          value={feederSelected}
          onChange={onFeederSelected}
          closeMenuOnSelect={true}
          options={feederList}
          isDisabled={isPssSelected}
          placeholder="Select Feeder"
        />
      </Col>

      {/* Select SITE ID */}
      <Col className="mb-1" xl="3" md="6" sm="12">
        <Select
          id="selectdtr"
          name="dtr"
          key={`my_unique_select_key__${dtrSelected}`}
          isClearable={true}
          closeMenuOnSelect={true}
          theme={selectThemeColors}
          value={dtrSelected}
          onChange={onDTRSelected}
          options={dtrList}
          className="react-select zindex_1000"
          classNamePrefix="select"
          isDisabled={isPssSelected}
          placeholder="Select Site"
        />
      </Col>

      {/*select subdiv id */}
      <Col className="mb-1" lg="3" md="6" sm="12">
        <Select
          theme={selectThemeColors}
          key={`my_unique_select_key__${subdiv_id}`}
          className="react-select"
          classNamePrefix="select"
          value={subdiv_id}
          name="clear"
          onChange={onSubdivId}
          options={subDivIdList}
          isClearable
          isDisabled={isSubDivSelected}
          placeholder="Select Subdiv ID"
        />
      </Col>

      {/* select section Id  */}
      <Col className="mb-1" lg="3" md="6" sm="12">
        <Select
          theme={selectThemeColors}
          key={`my_unique_select_key__${section_id}`}
          className="react-select"
          classNamePrefix="select"
          value={section_id}
          name="clear"
          onChange={onSectionId}
          options={sectionIdList}
          isClearable
          isDisabled={isSubDivSelected}
          placeholder="Select Section ID"
        />
      </Col>

      <Col className="" xl="2" md="4" sm="12">
        <FormGroup>
          <Input
            type="text"
            id="Consumer Serial No."
            placeholder="Consumer Number..."
            onChange={onConsumerIdTyped}
            disabled={isConsumerSerialSelected}
          />
        </FormGroup>
      </Col>
      <Col lg="2" sm="12" md="4" className="mb-1">
        <Button
          color="primary"
          className="btn-block "
          onClick={onReportRequestButtonClicked}
        >
          Request Report
        </Button>
      </Col>
      <Col lg="2" sm="12" md="4" className="">
        <Button
          color="primary"
          className="btn-block "
          onClick={onSearchButtonClicked}
        >
          Search Report
        </Button>
      </Col>
    </Row>
  );
};

export default RequestReportCommonSelector;
