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

const DailyLoadDataModal = (props) => {
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
      .getMDMSGroupMeterDailyLoadData(params)
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
        // setTotalCount(response.data.data.result.count)

        // const _temp = response.data.data.result.results
        // const _response_temp = []
        // for (let i = 0; i < _temp.length; i++) {
        //   const temp = _temp[i]['data']
        //   temp['data_reporting_time'] = _temp[i]['report_timestamp']
        //   _response_temp.push(temp)
        // }
        // setResponse(_response_temp)
        setResponse(response.data.data.result);
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
      return Object.keys(response).map((key, index) => {
        response[key].map((item) => {
          const timeDifferenceInSeconds = moment(item.reporting_timestamp).diff(
            item.dailyload_datetime,
            'seconds'
          );
          const hours = Math.floor(timeDifferenceInSeconds / 3600);
          const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
          const seconds = timeDifferenceInSeconds % 60;

          // item.response_time = `${
          //   hours ? hours.toString().concat(hours === 1 ? ' hr' : ' hrs') : ''
          // } ${minutes ? minutes.toString().concat(' min') : ''} ${seconds
          //   .toString()
          //   .concat(' sec')}`;
          return item;
        });

        return (
          <div className="table-wrapper" key={index}>
            <CreateTable
              data={response[key]}
              height="max"
              rowCount={10}
              tableName={`DailyLoad Data`}
            />
          </div>
        );
      });
    } else {
      return (
        <CreateTable
          data={[]}
          height="max"
          rowCount={10}
          tableName={`DailyLoad Data`}
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

export default DailyLoadDataModal;
