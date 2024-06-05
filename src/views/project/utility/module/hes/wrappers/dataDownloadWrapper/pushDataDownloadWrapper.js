import { CardBody, Card, Badge, UncontrolledTooltip } from 'reactstrap';
import { useState, useEffect } from 'react';
import useJwt from '@src/auth/jwt/useJwt';

import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authLogout from '../../../../../../../auth/jwt/logoutlogic';

// import CommonMeterDropdown from '../commonMeterDropdown'
import SimpleDataTablePaginated from '@src/views/ui-elements/dtTable/simpleTablePaginated';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

import Loader from '@src/views/project/misc/loader';
import { caseInsensitiveSort } from '@src/views/utils.js';

import { Download } from 'react-feather';

import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';

import PushDataFilterWrapper from './pushDataFilterWrapper';
import CommonMeterDropdown from '../commonMeterDropdown';

const PushDataDownloadWrapper = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const location = useLocation();
  let project = '';
  if (location.pathname.split('/')[2] === 'sbpdcl') {
    project = 'ipcl';
  } else {
    project = location.pathname.split('/')[2];
  }

  const [loader, setLoader] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [retry, setRetry] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(120);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [response, setResponse] = useState([]);

  const fetchData = async (params) => {
    if (params.report_name === 'block_load') {
      return await useJwt
        .getPushDataDLMSDownloadRequestHistoryBlockLoadPush(params)
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
    } else if (params.report_name === 'periodic_push') {
      return await useJwt
        .getPushDataDLMSDownloadRequestHistoryPeriodicPush(params)
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
    } else if (params.report_name === 'event_push') {
      return await useJwt
        .getPushDataDLMSDownloadRequestHistoryEventPush(params)
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
    } else if (params.report_name === 'billing_data') {
      return await useJwt
        .getBillingDataDLMSDownloadRequestHistory(params)
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
    }
  };

  const requestReport = async (params) => {
    if (params.report_name === 'block_load') {
      return await useJwt
        .postPushDataDLMSDownloadRequestBlockLoadPush(params)
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
    } else if (params.report_name === 'periodic_push') {
      return await useJwt
        .postPushDataDLMSDownloadRequestPeriodicPush(params)
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
    } else if (params.report_name === 'event_push') {
      return await useJwt
        .postPushDataDLMSDownloadRequestEventPush(params)
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
    } else if (params.report_name === 'billing_data') {
      return await useJwt
        .postBillingDataDLMSDownloadRequest(params)
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
    }
  };

  useEffect(async () => {
    if (fetchingData || retry) {
      setLoader(true);
      setFetchingData(false);

      const params = {};
      params['page'] = currentPage;
      params['page_size'] = pageSize;
      params['project'] = project;
      params['report_name'] = props.report_name;

      const [statusCode, response] = await fetchData(params);

      if (statusCode === 200) {
        setTotalCount(response.data.data.result.count);
        setResponse(response.data.data.result.results);
        setFetchingData(false);
        setRetry(false);
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

    if (response) {
      for (const i in response[0]) {
        const col_config = {};

        if (i !== 'project' && i !== 'csv_url') {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
            1
          )}`.replaceAll('_', ' ');
          col_config.serch = i;
          col_config.sortable = true;
          col_config.selector = (row) => row[i];
          col_config.sortFunction = (rowA, rowB) =>
            caseInsensitiveSort(rowA, rowB, i);
          // col_config.style = {
          //   width: '400px'
          // }
          col_config.width = '200px';

          col_config.cell = (row) => {
            let cellValue = row[i] || '--'; // Get the cell value or an empty string
            if (i === 'execution_status' && cellValue === 'No Data') {
              // If the column is "execution_status" and the value is "No Data", replace with "--"
              cellValue = '--';
            }
            return (
              <div className="d-flex">
                <span
                  className="d-block font-weight-bold cursor-pointer"
                  title={cellValue}
                  onClick={() => {
                    // setData(row)
                    // setCenteredModal(true)
                  }}
                >
                  {cellValue.toString().substring(0, 25)}
                  {cellValue.toString().length > 25 ? '...' : ''}
                </span>
              </div>
            );
          };
          column.push(col_config);
        }
      }

      column.push({
        name: 'Status',
        width: '120px',
        cell: (row) => {
          if (row.execution_status === 'Success') {
            return (
              <>
                <Badge pill color="light-success" className="">
                  {row.execution_status}
                </Badge>
              </>
            );
          } else if (row.execution_status === 'In_Progress') {
            return (
              <>
                <Badge pill color="light-warning" className="">
                  {row.execution_status}
                </Badge>
              </>
            );
          } else if (row.execution_status === 'Failed') {
            return (
              <>
                <Badge pill color="light-danger" className="">
                  {row.execution_status}
                </Badge>
              </>
            );

          } else {
            return <div style={{ width: '45px', textAlign: 'center' }}>--</div>;

          }
        },
      });
      column.push({
        name: 'Download ',
        width: '120px',
        cell: (row) => {
          if (row.execution_status === 'Success') {
            return (
              <>
                <a href={row.csv_url}>
                  {/* <Badge pill color='light-success' className='' id='success'>
                    {row.status}
                  </Badge> */}
                  <Download size={20} className=" primary mx-2 " id="success" />
                </a>
                <UncontrolledTooltip
                  placement="top"
                  target="success"
                  modifiers={{
                    preventOverflow: { boundariesElement: 'window' },
                  }}
                  autohide={false}
                  delay={{ show: 200, hide: 5 }}
                >
                  File is ready to Download
                </UncontrolledTooltip>
              </>
            );
          } else if (row.execution_status === 'In_Progress') {
            return (
              <>
                <Download
                  size={20}
                  className="mx-2 text-secondary not_allowed "
                  id="processing"
                />
                <UncontrolledTooltip
                  placement="top"
                  target="processing"
                  modifiers={{
                    preventOverflow: { boundariesElement: 'window' },
                  }}
                  autohide={false}
                  delay={{ show: 200, hide: 5 }}
                >
                  In {row.execution_status} Can't Download
                </UncontrolledTooltip>
              </>
            );
          } else if (row.execution_status === 'Failed') {
            return (
              <>
                <Download
                  size={20}
                  className="mx-2 text-secondary not_allowed "
                  id="failed"
                />
                <UncontrolledTooltip
                  placement="top"
                  target="failed"
                  modifiers={{
                    preventOverflow: { boundariesElement: 'window' },
                  }}
                  autohide={false}
                  delay={{ show: 200, hide: 5 }}
                >
                  {row.execution_status} Can't Download
                </UncontrolledTooltip>
              </>
            );

          } else {
            return <div style={{ width: '65px', textAlign: 'center' }}>--</div>;

          }
        },
      });
    }

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

  const onSubmitButtonClicked = async (filterParams) => {
    // console.log('Filter Params .....')
    // console.log(filterParams)
    // console.log(props.report_name)

    const params = {};
    params['project'] = project;
    params['report_name'] = props.report_name;

    if (
      filterParams.hasOwnProperty('site') &&
      filterParams['site'] &&
      filterParams['site'] !== ''
    ) {
      params['site'] = filterParams['site'];
    } else {
      params['site'] = '';
    }

    if (
      filterParams.hasOwnProperty('meter') &&
      filterParams['meter'] &&
      filterParams['meter'] !== ''
    ) {
      params['meter'] = filterParams['meter'];
    } else {
      params['meter'] = '';
    }

    if (
      filterParams.hasOwnProperty('start_date') &&
      filterParams['start_date'] &&
      filterParams['start_date'] !== ''
    ) {
      params['start_date'] = filterParams['start_date'];
    } else {
      params['start_date'] = '';
    }

    if (
      filterParams.hasOwnProperty('end_date') &&
      filterParams['end_date'] &&
      filterParams['end_date'] !== ''
    ) {
      params['end_date'] = filterParams['end_date'];
    } else {
      params['end_date'] = '';
    }

    const [statusCode, response] = await requestReport(params);

    if (statusCode === 200) {
      toast.success(
        <Toast msg={'Request submitted successfully ....'} type="success" />,
        {
          hideProgressBar: true,
        }
      );
      reloadData();
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true);
    } else {
      toast.warning(
        <Toast
          msg={'Something went wrong please retry .....'}
          type="warning"
        />,
        {
          hideProgressBar: true,
        }
      );
    }
  };

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

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
            <SimpleDataTablePaginated
              columns={tblColumn()}
              tblData={response}
              rowCount={pageSize}
              tableName={props.table_name}
              refresh={reloadData}
              currentPage={currentPage}
              totalCount={totalCount}
              onNextPageClicked={onNextPageClicked}
            />
          )
        )}
      </Card>
    </>
  );
};

export default PushDataDownloadWrapper;
