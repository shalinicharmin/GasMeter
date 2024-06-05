import CreateTable from '@src/views/ui-elements/dtTable/createTable';

import { CardBody, Card, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { useContext, useState, useEffect } from 'react';
import useJwt from '@src/auth/jwt/useJwt';
// import { useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import authLogout from '../../../../../../auth/jwt/logoutlogic';

// import { useLocation } from 'react-router-dom'
import CommonMeterDropdown from './commonMeterDropdown';

import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDASUpdated';
import SimpleDataTablePaginated from '@src/views/ui-elements/dtTable/simpleTablePaginated';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

import Loader from '@src/views/project/misc/loader';
import { caseInsensitiveSort } from '@src/views/utils.js';

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus';

import PushDataDownloadWrapper from './dataDownloadWrapper/pushDataDownloadWrapper';

import { Eye, X, Layers } from 'react-feather';

import { getDefaultDateTimeRange } from '../../../../../../utility/Utils';
import moment from 'moment';

const Blockloaddata = (props) => {
  const defaultDateTime = getDefaultDateTimeRange();
  const defaultStartDate = moment()
    .subtract(1, 'days')
    .startOf('day')
    .format('YYYY-MM-DD 00:00:00'); // Yesterday, start of day
  const defaultEndDate = moment().format('YYYY-MM-DD HH:mm:ss');
  // console.log('Date Time Range ...........')
  // console.log(defaultStartDate)
  // console.log(defaultEndDate)

  const { setActive } = props;
  const dispatch = useDispatch();
  const history = useHistory();

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

  const [fetchingData, setFetchingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(120);
  const [startDateTime, setStartDateTime] = useState(undefined);
  const [endDateTime, setEndDateTime] = useState(undefined);
  const [response, setResponse] = useState([]);
  const [filterParams, setFilterParams] = useState({
    start_date: defaultStartDate,
    end_date: defaultEndDate,
  });
  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(false);

  const [loader, setLoader] = useState(false);

  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  );

  const [selected_project, set_selected_project] = useState(undefined);

  const [showReportDownloadModal, setShowReportDownloadModal] = useState(false);

  const fetchData = async (params) => {
    return await useJwt
      .getMDMSUserBlockLoadData(params)
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
    // console.log('Filter Params Selected .........')
    // console.log(filterParams)

    if (fetchingData || retry) {
      setLoader(true);
      let params = undefined;

      // console.log('Filter Params ....')
      // console.log(filterParams)

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

      if (statusCode === 200) {
        try {
          const blockLoadResponse = [];

          for (let i = 0; i < response.data.data.result.results.length; i++) {
            const temp_blockload = response.data.data.result.results[i]['data'];

            if (temp_blockload.meter_number === 'not') {
              temp_blockload.meter_number = '--';
            }

            if (temp_blockload.hasOwnProperty('avg_voltage')) {
              temp_blockload['avg_voltage'] = Number(
                temp_blockload['avg_voltage']
              ).toFixed(2);
            }

            if (temp_blockload.hasOwnProperty('avg_current')) {
              temp_blockload['avg_current'] = Number(
                temp_blockload['avg_current']
              ).toFixed(2);
            }

            if (temp_blockload.hasOwnProperty('temperature')) {
              blockLoadResponse.push(temp_blockload);
            }
          }

          // console.log("Block Load Data Response ....")
          // console.log(blockLoadResponse)

          // console.log("Raw Data Response ....")
          // console.log(response.data.data.result.results)

          setResponse(blockLoadResponse);
          setTotalCount(response.data.data.result.count);
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
  }, [retry]);

  const tblColumn = () => {
    const column = [];
    const custom_width = ['blockload_datetime'];

    for (const i in response[0]) {
      const col_config = {};
      if (i !== 'id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.reorder = true;
        col_config.width = '180px';
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
        // col_config.width = '110px'

        if (custom_width.includes(i)) {
          col_config.width = '190px';
        }

        col_config.cell = (row) => {
          // console.log('Block Load Row .....')
          // console.log(row)
          return (
            // <div className='d-flex'>
            //   <span
            //     className='d-block font-weight-bold text-truncate'
            //     title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 20 ? row[i] : '') : '-') : '-'}>
            //     {row[i] && row[i] !== '' ? row[i].toString().substring(0, 20) : '-'}
            //     {row[i] && row[i] !== '' ? (row[i].toString().length > 20 ? '...' : '') : '-'}
            //   </span>
            // </div>

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
    return column;
  };

  const onNextPageClicked = (number) => {
    setCurrentPage(number + 1);
    setRetry(true);
  };
  const reloadData = () => {
    setCurrentPage(1);
    setRetry(true);
  };

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !==
        currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project);
      setActive('1');
      setError(false);
      setFilterParams({
        start_date: defaultStartDate,
        end_date: defaultEndDate,
      });
      reloadData();
    }
  }

  const onSubmitButtonClicked = (filterParams) => {
    // console.log('Value passed from child to parent ....')
    // console.log(dummy)

    // console.log('Filter Parameters .....')
    // console.log(filterParams)

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
                tableName={'Block Load Table'}
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
                    Total Block Load Count: {totalCount}
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
          <h4 className="modal-title">Download (Blockload Data)</h4>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          <PushDataDownloadWrapper
            report_name={'block_load'}
            table_name={'Blockload Data Table'}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default Blockloaddata;
