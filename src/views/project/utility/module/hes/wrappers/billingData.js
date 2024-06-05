import CreateTable from '@src/views/ui-elements/dtTable/createTable';

import { CardBody, Card, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { useContext, useState, useEffect } from 'react';
import useJwt from '@src/auth/jwt/useJwt';
// import { useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import authLogout from '../../../../../../auth/jwt/logoutlogic';
import moment from 'moment';
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

const BillingData = (props) => {
  const defaultDateTime = getDefaultDateTimeRange();

  // console.log('Date Time Range ...........')
  // console.log(defaultDateTime.startDateTime)
  // console.log(defaultDateTime.endDateTime)

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
    start_date: defaultDateTime.startDateTime,
    end_date: defaultDateTime.endDateTime,
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
      .getMDMSUserBillingData(params)
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
          const billingDataResponse = [];
          const results = response.data.data.result.results; // Assuming this is an array of objects

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

          for (let i = 0; i < results.length; i++) {
            const item = results[i].data;
            item.reporting_timestamp = results[i].report_timestamp;

            // Check if item is an object (not an array)
            if (typeof item === 'object' && item !== null) {
              if (item.hasOwnProperty('total_poweron_duraion_min')) {
                item['Total power on duration'] =
                  item['total_poweron_duraion_min'];
                delete item['total_poweron_duraion_min'];
              }
              for (const key in item) {
                if (command_sequence.hasOwnProperty(key)) {
                  const commandSequence = command_sequence[key];

                  if (
                    keysToConvertWh &&
                    keysToConvertWh.includes(commandSequence)
                  ) {
                    // Convert from Wh to kWh
                    item[commandSequence] = item[key] / 1000;
                    if (item[key] !== 0) {
                      item[commandSequence] = item[commandSequence]?.toFixed(4);
                    }
                  } else if (
                    keysToConvertVAh &&
                    keysToConvertVAh.includes(commandSequence)
                  ) {
                    // Convert from VAh to kVAh
                    item[commandSequence] = item[key] / 1000;
                    if (item[key] !== 0) {
                      item[commandSequence] = item[commandSequence]?.toFixed(4);
                    }
                  } else {
                    item[commandSequence] = item[key];
                  }
                  // If the key is different from the mapped key, delete it
                  if (commandSequence !== key) {
                    delete item[key];
                  }
                }
                if (item[key] === '65535-00-00 00:00:00') {
                  item[key] = '--';
                }
              }
              billingDataResponse.push(item);
            }
          }

          setResponse(billingDataResponse);
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
  }, [fetchingData, retry]);

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

    // column.push({
    //   name: 'Response Time',
    //   width: '140px',
    //   position: 5,
    //   cell: (row) => {
    //     console.log(row);
    //     if (row.reporting_timestamp && row.data_timestamp) {
    //       const timeDifferenceInSeconds = moment(row.reporting_timestamp).diff(
    //         row.data_timestamp,
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
      //   setActive("1")
      setError(false);
      setFilterParams({
        start_date: defaultDateTime.startDateTime,
        end_date: defaultDateTime.endDateTime,
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
    // setRetry(true)
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
            billingData={true}
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
                tableName={'Billing Data Table'}
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
                    Total Billing Count: {totalCount}
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
          <h4 className="modal-title">Download (Billing Data)</h4>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          <PushDataDownloadWrapper
            report_name={'billing_data'}
            table_name={'Billing Data Table'}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default BillingData;
