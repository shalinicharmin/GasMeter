import {
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  InputGroup,
  Label,
  Card,
  CardBody,
} from 'reactstrap';
import moment from 'moment';
import Loader from '@src/views/project/misc/loader';
import CreateTable from '@src/views/ui-elements/dtTable/createTable';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import { useContext, useState, useEffect } from 'react';
import useJwt from '@src/auth/jwt/useJwt';
import { useSelector, useDispatch } from 'react-redux';
import SimpleDataTablePaginated from '@src/views/ui-elements/dtTable/simpleTablePaginated';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { selectThemeColors } from '@utils';

import { useLocation, useHistory } from 'react-router-dom';
import authLogout from '../../../../../../../auth/jwt/logoutlogic';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

const BillingHistoryDataModal = (props) => {
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

  const [fetchingData, setFetchingData] = useState(true);
  const [response, setResponse] = useState([]);
  const [totalCount, setTotalCount] = useState(120);
  const [currentPage, setCurrentPage] = useState(1);
  // const [startDateTime, setStartDateTime] = useState(undefined)
  // const [endDateTime, setEndDateTime] = useState(undefined)

  const selected_month = useSelector((state) => state.calendarReducer.month);
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  );

  const [startDateTime, setStartDateTime] = useState(undefined);
  const [startDateTimeAsPerFormat, setStartDateTimeAsPerFormat] =
    useState(undefined);

  const [endDateTime, setEndDateTime] = useState(undefined);
  const [endDateTimeAsPerFormat, setEndDateTimeAsPerFormat] =
    useState(undefined);

  const [selectDataPosition, setSelectDataPosition] = useState(1);

  //   console.log("Hierarchy Progress ....")
  //   console.log(HierarchyProgress)

  let project = '';
  let site = '';
  let site_real_name = '';
  if (HierarchyProgress && HierarchyProgress.project_name) {
    project = HierarchyProgress.project_name;
  }
  if (HierarchyProgress && HierarchyProgress.dtr_name) {
    site = HierarchyProgress.dtr_name;
  }
  if (HierarchyProgress && HierarchyProgress.dtr_real_name) {
    site_real_name = HierarchyProgress.dtr_real_name;
  }

  // console.log('Periodic Push Data .....')
  // console.log(response)

  const fetchData = async (params) => {
    return await useJwt
      // .getMDMSGroupMeterNamePlateData(params)
      .getMDMSGroupMeterBillingHistoryData(params)
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
    if (fetchingData || retry) {
      let params = undefined;

      if (startDateTimeAsPerFormat && endDateTimeAsPerFormat) {
        params = {
          project,
          site,
          page: currentPage,
          page_size: 10,
          data_state: selectDataPosition,
          start_date: startDateTime,
          end_date: endDateTime,
        };
      } else {
        params = {
          project,
          site,
          page: currentPage,
          page_size: 10,
          data_state: selectDataPosition,
        };
      }
      const [statusCode, response] = await fetchData(params);

      if (statusCode === 200) {
        const command_sequence = {
          billing_datetime: 'Billing_Date',
          systemPF: 'Average_Power_Factor_For_Billing_Period',
          kwhSnap: 'Cum._Active_Imp._Energy_(kWh)',
          import_Wh_TOD_1: 'Cum._Active_Imp._Energy_(kWh)_T1',
          import_Wh_TOD_2: 'Cum._Active_Imp._Energy_(kWh)_T2',
          import_Wh_TOD_3: 'Cum._Active_Imp._Energy_(kWh)_T3',
          import_Wh_TOD_4: 'Cum._Active_Imp._Energy_(kWh)_T4',
          kvahSnap: 'Cum._Apparent_Imp._Energy_(kVAh)',
          import_VAh_TOD_1: 'Cum._Apparent_Imp._Energy_(kVAh)_T1',
          import_VAh_TOD_2: 'Cum._Apparent_Imp._Energy_(kVAh)_T2',
          import_VAh_TOD_3: 'Cum._Apparent_Imp._Energy_(kVAh)_T3',
          import_VAh_TOD_4: 'Cum._Apparent_Imp._Energy_(kVAh)_T4',
          MDKwh: 'MD_kW',
          MDKwhTS: 'MD_kW_with_Date/Time',
          MDKvah: 'MD_kVA',
          MDKvahTS: 'MD_kVA_with_Date/Time',
          billingDuration: 'Billing_Power_ON_Duration_(Minutes)',
          kwhSnapExport: 'Cum._Active_Exp._Energy_(kWh)',
          kvahSnapExport: 'Cum._Apparent_Exp._Energy_(kVAh)',
          reporting_timestamp: 'report_timestamp',
        };

        const keysToConvertWh = [
          'MD_kW',
          'Average_Power_Factor_For_Billing_Period',
          'Cum._Active_Imp._Energy_(kWh)',
          'Cum._Active_Imp._Energy_(kWh)_T1',
          'Cum._Active_Imp._Energy_(kWh)_T2',
          'Cum._Active_Imp._Energy_(kWh)_T3',
          'Cum._Active_Imp._Energy_(kWh)_T4',
          'Cum._Active_Exp._Energy_(kWh)',
        ];
        const keysToConvertVAh = [
          'MD_kVA',
          'Cum._Apparent_Imp._Energy_(kVAh)',
          'Cum._Apparent_Imp._Energy_(kVAh)_T1',
          'Cum._Apparent_Imp._Energy_(kVAh)_T2',
          'Cum._Apparent_Imp._Energy_(kVAh)_T3',
          'Cum._Apparent_Imp._Energy_(kVAh)_T4',
          'Cum._Apparent_Exp._Energy_(kVAh)',
        ];

        const billingDataResponse = [];
        const results = response?.data?.data?.result?.GP;
        for (let i = 0; i < results?.length; i++) {
          const item = results[i];

          // Check if item is an object (not an array)
          if (typeof item === 'object' && item !== null) {
            // Update keys according to the mapping
            for (const key in item) {
              if (command_sequence.hasOwnProperty(key)) {
                const commandSequence = command_sequence[key];

                if (keysToConvertWh.includes(commandSequence)) {
                  // Convert from Wh to kWh
                  item[commandSequence] = item[key] / 1000;
                  if (item[key] !== 0) {
                    item[commandSequence] = item[commandSequence]?.toFixed(4);
                  }
                } else if (keysToConvertVAh.includes(commandSequence)) {
                  // Convert from VAh to kVAh
                  item[commandSequence] = item[key] / 1000;
                  if (item[key] !== 0) {
                    item[commandSequence] = item[commandSequence]?.toFixed(4);
                  }
                } else {
                  // If not conversion needed, keep the original value
                  item[commandSequence] = item[key];
                }
                // If the key is different from the mapped key, delete it
                if (commandSequence !== key) {
                  delete item[key];
                }
              }
              // Replace placeholder value "--" with empty string
              if (item[key] === '65535-00-00 00:00:00') {
                item[key] = '--';
              }
            }
            // console.log(billingDataResponse)
            billingDataResponse.push(item);
          }
        }
        setResponse(billingDataResponse);
        setFetchingData(false);
        setRetry(false);
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else {
        setRetry(false);
        setError(true);
        setErrorMessage('Network Error, please retry');
      }
    }
  }, [fetchingData, retry]);

  const onNextPageClicked = (number) => {
    setCurrentPage(number + 1);
    setFetchingData(true);
  };

  const reloadData = () => {
    setCurrentPage(1);
    setFetchingData(true);
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

  const onStartTimeSelected = (time) => {
    // console.log("Start Time Selected ...")
    // console.log(time[0])
    // console.log("As per date time format ....")
    // console.log(dateTimeFormat(time[0]))
    setStartDateTime(time[0]);
    setStartDateTimeAsPerFormat(dateTimeFormat(time[0]));
  };

  const onEndTimeSelected = (time) => {
    // console.log("End Time Selected ...")
    // console.log(time[0])
    // console.log("As per date time format ....")
    // console.log(dateTimeFormat(time[0]))
    setEndDateTime(time[0]);
    setEndDateTimeAsPerFormat(dateTimeFormat(time[0]));
  };

  const onDataPositionSelected = (position) => {
    // console.log("Position Selected ...")
    // console.log(position['value'])
    setSelectDataPosition(position['value']);
  };

  const onSubmitButtonClicked = () => {
    // console.log("On Submit Button Clicked ...")

    if (startDateTimeAsPerFormat && !endDateTimeAsPerFormat) {
      // Set End Time Error
      toast.error(<Toast msg="Please Select End Time" type="danger" />, {
        hideProgressBar: true,
      });
    } else if (!startDateTimeAsPerFormat && endDateTimeAsPerFormat) {
      // Set Start Time Error
      toast.error(<Toast msg="Please Select Start Time" type="danger" />, {
        hideProgressBar: true,
      });
    } else if (startDateTimeAsPerFormat && endDateTimeAsPerFormat) {
      // Both Time are set Compare
      if (startDateTimeAsPerFormat > endDateTimeAsPerFormat) {
        toast.error(
          <Toast
            msg="Start Date Time should be smaller than End Date Time"
            type="danger"
          />,
          { hideProgressBar: true }
        );
      } else {
        reloadData();
      }
      // toast.error(<Toast msg='Please enter meter serial.' type='danger' />, { hideProgressBar: true })
    } else {
      // Both the time are not set look for only data position value
      // toast.error(<Toast msg='Please enter meter serial.' type='danger' />, { hideProgressBar: true })
      reloadData();
    }
  };

  const showData = () => {
    if (Object.keys(response).length > 0) {
      //   return Object.keys(response).map((key, index) => {
      //     response[key].map((item) => {
      //       const timeDifferenceInSeconds = moment(item.reporting_timestamp).diff(
      //         item.billing_datetime,
      //         "seconds"
      //       )
      //       const hours = Math.floor(timeDifferenceInSeconds / 3600)
      //       const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60)
      //       const seconds = timeDifferenceInSeconds % 60

      //       // item.response_time = `${
      //       //   hours ? hours.toString().concat(hours === 1 ? ' hr' : ' hrs') : ''
      //       // } ${minutes ? minutes.toString().concat(' min') : ''} ${seconds
      //       //   .toString()
      //       //   .concat(' sec')}`;
      //       return item
      //     })
      return (
        <div className="table-wrapper">
          <CreateTable
            data={response}
            height="max"
            rowCount={10}
            tableName={`Billing History Data`}
          />
        </div>
      );
    } else {
      return (
        <CreateTable
          data={[]}
          height="max"
          rowCount={10}
          tableName={`Billing History Data`}
        />
      );
    }
  };

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={() => props.handleModalState(!props.isOpen)}
      scrollable
      className="modal_size"
    >
      <ModalHeader toggle={() => props.handleModalState(!props.isOpen)}>
        {props.title}
      </ModalHeader>
      <ModalBody>
        {fetchingData ? (
          <Loader hight="min-height-484" />
        ) : (
          <div>
            <Row className="mb-2">
              <Col lg="3" xs="6">
                <Label className="form-label" for="date-time-picker">
                  Start Time
                </Label>
                <Flatpickr
                  placeholder="Start Datetime"
                  data-enable-time
                  id="date-time-picker"
                  className="form-control"
                  onChange={onStartTimeSelected}
                />
              </Col>

              <Col lg="3" xs="6">
                <Label className="form-label" for="date-time-picker">
                  End Time
                </Label>
                <Flatpickr
                  placeholder="End Datetime"
                  data-enable-time
                  id="date-time-picker"
                  className="form-control"
                  onChange={onEndTimeSelected}
                />
              </Col>

              <Col lg="4" xs="8">
                <Label className="form-label">Select</Label>
                <Select
                  closeMenuOnSelect={true}
                  theme={selectThemeColors}
                  // components={animatedComponents}
                  onChange={onDataPositionSelected}
                  options={[
                    {
                      label: '1',
                      value: '1',
                    },
                    {
                      label: '2',
                      value: '2',
                    },
                    {
                      label: '3',
                      value: '3',
                    },
                    {
                      label: '4',
                      value: '4',
                    },
                    {
                      label: '5',
                      value: '5',
                    },
                  ]}
                  className="react-select zindex_1000"
                  classNamePrefix="Select Data Position"
                  placeholder="Select Data Position"
                />
              </Col>
              <Col lg="2" xs="4">
                <Button
                  color="primary"
                  className="btn-block mt-2"
                  onClick={onSubmitButtonClicked}
                >
                  Submit
                </Button>
              </Col>
            </Row>
            {/* <SimpleDataTablePaginated
              columns={tblColumn()}
              tblData={response}
              rowCount={100}
              tableName={'Site : '.concat(site_real_name)}
              refresh={reloadData}
              currentPage={currentPage}
              totalCount={totalCount}
              onNextPageClicked={onNextPageClicked}
            /> */}
            {hasError ? (
              <CardInfo
                props={{
                  message: { errorMessage },
                  retryFun: { retryAgain },
                  retry: { retry },
                }}
              />
            ) : (
              <>{showData()}</>
            )}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default BillingHistoryDataModal;
