import '@styles/react/libs/flatpickr/flatpickr.scss';
import { useContext, useState, useEffect } from 'react';
import useJwt from '@src/auth/jwt/useJwt';

import { useLocation, useHistory } from 'react-router-dom';
// import { useSelector } from 'react-redux'
import SimpleDataTablePaginated from '@src/views/ui-elements/dtTable/simpleTablePaginated';
import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDASUpdated';
import moment from 'moment';
import {
  Col,
  CardBody,
  Card,
  Button,
  Row,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';

import CommonMeterDropdown from './commonMeterDropdown';

// import { useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic';

import { useDispatch, useSelector } from 'react-redux';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import { caseInsensitiveSort } from '@src/views/utils.js';

import Loader from '@src/views/project/misc/loader';

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus';

import { Eye, X, Layers } from 'react-feather';

import PushDataDownloadWrapper from './dataDownloadWrapper/pushDataDownloadWrapper';

import { getDefaultDateTimeRange } from '../../../../../../utility/Utils';

const Periodicdatatable = (props) => {
  const defaultDateTime = getDefaultDateTimeRange();

  const dispatch = useDispatch();
  const history = useHistory();

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const responseData = useSelector(
    (state) => state.UtilityMDASAssetListReducer
  );
  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  );

  // const responseData = useSelector(state => state.UtilityMdmsFlowReducer)

  const [fetchingData, setFetchingData] = useState(true);
  const [response, setResponse] = useState([]);
  const [totalCount, setTotalCount] = useState(120);
  const [filterParams, setFilterParams] = useState({
    start_date: defaultDateTime.startDateTime,
    end_date: defaultDateTime.endDateTime,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [startDateTime, setStartDateTime] = useState(undefined);
  const [endDateTime, setEndDateTime] = useState(undefined);

  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(false);
  const [loader, setLoader] = useState(false);
  const selected_month = useSelector((state) => state.calendarReducer.month);

  const [selected_project, set_selected_project] = useState(undefined);
  // console.log('Periodic Push Data .....')
  // console.log(response)

  const [showReportDownloadModal, setShowReportDownloadModal] = useState(false);

  const fetchData = async (params) => {
    return await useJwt
      .getMDMSUserPeriodicPushData(params)
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

  const location = useLocation();

  let project = '';
  if (location.pathname.split('/')[2] === 'sbpdcl') {
    project = 'ipcl';
  } else {
    project = location.pathname.split('/')[2];
  }

  useEffect(async () => {
    if (fetchingData || retry) {
      setLoader(true);
      let params = undefined;

      if (!filterParams.hasOwnProperty('site')) {
        // If No Site Selected, add all sites access available
        // let dtr_list = ' '
        // for (let i = 0; i < responseData.responseData.dtr_list.length; i++) {
        //   dtr_list += `${responseData.responseData.dtr_list[i]['dtr_id']},`
        // }
        params = {
          project,
          ...filterParams,
          page: currentPage,
          page_size: 10,
        };
        // params['site'] = dtr_list
      } else {
        params = {
          project,
          ...filterParams,
          page: currentPage,
          page_size: 10,
        };
      }

      const [statusCode, response] = await fetchData(params);
      if (statusCode === 200 || statusCode === 204) {
        try {
          setTotalCount(response.data.data.result.count);
          const _temp = response.data.data.result.results;
          const _response_temp = [];
          for (let i = 0; i < _temp.length; i++) {
            if (
              _temp[i]['data'] &&
              _temp[i]['data'].hasOwnProperty('phase_current') &&
              !isNaN(_temp[i]['data']['neutral_current'])
            ) {
              _temp[i]['data']['phase_current'] = Number(
                _temp[i]['data']['phase_current']
              ).toFixed(2);
            }

            if (
              _temp[i]['data'] &&
              _temp[i]['data'].hasOwnProperty('neutral_current') &&
              !isNaN(_temp[i]['data']['neutral_current'])
            ) {
              _temp[i]['data']['neutral_current'] = Number(
                _temp[i]['data']['neutral_current']
              ).toFixed(2);
            }

            const _temp_ = {
              ..._temp[i]['data'],
              meter_number: _temp[i]['meter_number'],
              reporting_timestamp: _temp[i]['reporting_timestamp'],
            };

            _response_temp.push(_temp_);
          }
          setResponse(_response_temp);
          setFetchingData(false);
          setRetry(false);
        } catch (error) {
          setRetry(false);
          setError(true);
          setErrorMessage('Something went wrong, please retry');
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else {
        setRetry(false);
        setError(true);
        setErrorMessage('Network Error, please retry');
      }
      setLoader(false);
    }
  }, [fetchingData, retry]);

  const tblColumn = () => {
    const column = [];

    for (const i in response[0]) {
      const col_config = {};
      if (
        i !== 'id' &&
        i !== 'push_obis' &&
        i !== 'push_counter' &&
        i !== 'avon_obis_1' &&
        i !== 'avon_obis_2' &&
        i !== 'avon_obis_3' &&
        i !== 'avon_obis_4'
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.reorder = true;
        col_config.selector = (row) => row[i];
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);

        // col_config.selector = i
        // col_config.minWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = i === 'feeder' ? '100px' : ''
        // col_config.style = {
        //   minHeight: '40px',
        //   maxHeight: '40px'
        // }
        col_config.width = '150px';
        if (i === 'meter_time' || i === 'push_triggered_time') {
          col_config.width = '150px';
        }

        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              <span className="d-block font-weight-bold ">
                {row[i]}
                {/* title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 10) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 10 ? '...' : '') : '-'} */}
              </span>
            </div>
          );
        };
        column.push(col_config);
      }
    }
    column.unshift({
      name: 'Sr No.',
      width: '90px',
      sortable: false,
      cell: (row, i) => {
        return (
          <div className="d-flex justify-content-center">
            {i + 1 + 10 * (currentPage - 1)}
          </div>
        );
      },
    });
    // column.push({
    //   name: 'Response Time',
    //   width: '140px',
    //   position: 5,
    //   cell: (row) => {
    //     if (row.reporting_timestamp && row.meter_time) {
    //       const timeDifferenceInSeconds = moment(row.reporting_timestamp).diff(
    //         row.meter_time,
    //         'seconds'
    //       );
    //       const hours = Math.floor(timeDifferenceInSeconds / 3600);
    //       const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
    //       const seconds = timeDifferenceInSeconds % 60;
    //       return (
    //         <>
    //           {hours ? `${hours} ${hours === 1 ? 'hr' : 'hrs'}` : ''}{' '}
    //           {minutes ? `${minutes} min` : ''} {`${seconds} sec`}
    //         </>
    //       );
    //     } else {
    //       return <>N/A</>;
    //     }
    //   }
    // });
    return column;
  };

  const onNextPageClicked = (number) => {
    setCurrentPage(number + 1);
    setFetchingData(true);
  };

  const reloadData = () => {
    setCurrentPage(1);
    setFetchingData(true);
  };

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !==
        currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project);
      setFilterParams({
        start_date: defaultDateTime.startDateTime,
        end_date: defaultDateTime.endDateTime,
      });
      setError(false);
      reloadData();
    }
  }

  const onSubmitButtonClicked = (filterParams) => {
    setFilterParams(filterParams);
    setCurrentPage(1);
    setFetchingData(true);
    setError(false);
    setRetry(true);
  };

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  const handleReportDownloadModal = () => {
    setShowReportDownloadModal(!showReportDownloadModal);
  };

  // custom Close Button for Report Download Modal
  const CloseBtnForReportDownload = (
    <X
      className="cursor-pointer mt_5"
      size={15}
      onClick={handleReportDownloadModal}
    />
  );

  return (
    <>
      <Card>
        <CardBody>
          <CommonMeterDropdown
            tab="block_load"
            set_resp={setResponse}
            onSubmitButtonClicked={onSubmitButtonClicked}
          />
        </CardBody>
        {loader ? (
          <Loader hight="min-height-330" />
        ) : hasError ? (
          <CardInfo
            props={{
              message: { errorMessage },
              retryFun: { retryAgain },
              retry: { retry },
            }}
          />
        ) : (
          !retry && (
            <div className="table-wrapper">
              <SimpleDataTableMDAS
                columns={tblColumn()}
                tblData={response}
                rowCount={10}
                tableName={'Periodic Push Data'}
                refresh={reloadData}
                currentPage={currentPage}
                totalCount={totalCount}
                onNextPageClicked={onNextPageClicked}
                showRequestDownloadModal={true}
                isDownloadModal={'yes'}
                extraTextToShow={
                  <h5
                    className={`${
                      totalCount ? 'text-success' : 'text-danger'
                    } m-0`}
                  >
                    Total Periodic Push Count: {totalCount}
                  </h5>
                }
                handleReportDownloadModal={handleReportDownloadModal}
              />
            </div>
          )
        )}
      </Card>

      {/* Report Download Request History Modal */}
      <Modal
        isOpen={showReportDownloadModal}
        toggle={handleReportDownloadModal}
        style={{ width: '82%' }}
        modalClassName="modal-slide-in"
        contentClassName="pt-0"
      >
        <ModalHeader
          className="mb-3"
          toggle={handleReportDownloadModal}
          close={CloseBtnForReportDownload}
          tag="div"
        >
          <h4 className="modal-title">Download (Periodic Push Data)</h4>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          <PushDataDownloadWrapper
            report_name={'periodic_push'}
            table_name={'Periodic Push Data Table'}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default Periodicdatatable;
