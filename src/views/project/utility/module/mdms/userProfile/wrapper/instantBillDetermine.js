import React, { useEffect, useState, Fragment } from 'react';
import {
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Tooltip,
  InputGroup,
  Button,
} from 'reactstrap';
import moment from 'moment';
import useJwt from '@src/auth/jwt/useJwt';
import { useLocation, useHistory } from 'react-router-dom';
import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDAS';
import { Eye, X, FileText, Watch } from 'react-feather';
import CreateTableInstantBilling from '@src/views/ui-elements/dtTable/createTableInstantBilling';
import Timeline from '@components/timeline';
import FilterForm from '@src/views/project/utility/module/hes/wrappers/commandFilterWrapper/filterForm';
import { useSelector, useDispatch } from 'react-redux';

import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import { caseInsensitiveSort } from '@src/views/utils.js';
import Loader from '@src/views/project/misc/loader';

const InstantBillDetermineModal = (props) => {
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

  const location = useLocation();
  const projectName =
    location.pathname.split('/')[2] === 'sbpdcl'
      ? 'ipcl'
      : location.pathname.split('/')[2];

  const [reloadCommandHistory, setReloadCommandHistory] = useState(true);
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  );
  const [histyData, setHistyData] = useState();
  const [centeredModal, setCenteredModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterModal, setFilterModal] = useState(false);
  const [filterAppliedParams, setFilterAppliedParams] = useState(undefined);

  // TotalCount,response Local State
  const [response, setResponse] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [getInstantBilling, setGetInstantBilling] = useState(false);
  const [setBillingActionSchedule, setSetBillingActionSchedule] =
    useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [billTooltipOpen, setBillTooltipOpen] = useState(false);
  const [billingActionScheduleOpen, setBillingActionScheduleOpen] =
    useState(false);

  const [dateTimePopup, setDateTimePopup] = useState(false);
  const [onDateTimeSelect, setOnDateTimeSelect] = useState();
  const [rowCount, setRowCount] = useState(8);
  const [loader, setLoader] = useState(false);
  // console.log('Date Time Selected ....')
  // console.log(onDateTimeSelect)

  let user_name = '';
  let meter_serial = '';
  if (HierarchyProgress && HierarchyProgress.user_name) {
    user_name = HierarchyProgress.user_name;
    meter_serial = HierarchyProgress.meter_serial_number;
  }

  const fetchData = async (params) => {
    return await useJwt
      .getMDMSUserInstantBillingDeterminantHistory(params)
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

  const executeCommand = async (params) => {
    return await useJwt
      .postMdasDlmsCommandExecution(params)
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

  // Local State to manage command history based on protocol type
  const [protocol, setProtocol] = useState('dlms');
  const protocolSelected = (value) => {
    setProtocol(value);
    setReloadCommandHistory(true);
    setCurrentPage(1);
    setResponse([]);
    setTotalCount(0);
    setFilterAppliedParams(undefined);
  };

  const AppliedFilterparams = (params, resetcalled) => {
    if (resetcalled) {
      setFilterAppliedParams(params);
      setReloadCommandHistory(true);
      setCurrentPage(1);
      setResponse([]);
      setTotalCount(0);
    } else {
      if (params) {
        setFilterAppliedParams(params);
        setReloadCommandHistory(true);
        setCurrentPage(1);
        setResponse([]);
        setTotalCount(0);
      }
    }
  };

  const fetchCommandHistoryDLMS = async (params) => {
    return await useJwt
      .getMdasDlmsCommandHistory(params)
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

  const fetchCommandHistoryTAP = async (params) => {
    return await useJwt
      .getMdasTapCommandHistory(params)
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

  const fetchHistoryData = async (params) => {
    return await useJwt
      .getMdasDlmsHistoryData(params)
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

  const doNotReload = () => setReloadCommandHistory(false);

  useEffect(async () => {
    if (reloadCommandHistory || props.reloadCommandHistory1) {
      setLoader(true);
      let params = {};
      if (filterAppliedParams) {
        params = {
          page: currentPage,
          page_size: 8,
          project: projectName,
          ...filterAppliedParams, //Add Filter params
        };
      } else {
        params = {
          project: HierarchyProgress.project_name,
          meter: HierarchyProgress.meter_serial_number,
          page: currentPage,
          asset_type: 'meter',
          command: 'BILLING,US_SET_BILLING_SCHEDULE',
          page_size: 8,
        };
      }

      if (protocol === 'dlms') {
        const [statusCode, response] = await fetchCommandHistoryDLMS(params);
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true);
        } else if (statusCode === 200 || statusCode === 204) {
          try {
            setResponse(response.data.data.result.results);
            setTotalCount(response.data.data.result.count);
            setReloadCommandHistory(false);
            setRetry(false);
            setError(false);
          } catch (error) {
            setRetry(false);
            setError(true);
            setErrorMessage('Something went wrong, please retry');
          }
        } else {
          setRetry(false);
          setError(true);
          setErrorMessage('Network Error, please retry');
        }
      } else if (protocol === 'tap') {
        const [statusCode, response] = await fetchCommandHistoryTAP(params);

        if (statusCode === 401 || statusCode === 403) {
          setLogout(true);
        } else if (statusCode === 200 || statusCode === 204) {
          try {
            setResponse(response.data.data.result.results);
            setTotalCount(response.data.data.result.count);
            setReloadCommandHistory(false);
            props.doNotRefreshCommandHistory();
          } catch (error) {
            setRetry(false);
            setError(true);
            setErrorMessage('Something went wrong, please retry');
          }
        } else {
          setRetry(false);
          setError(true);
          setErrorMessage('Network Error, please retry');
        }
      }
      setLoader(false);
    }
  }, [reloadCommandHistory, props.reloadCommandHistory1]);

  const tblColumn = () => {
    const column = [];
    const custom_width = ['command', 'start_time', 'update_time', 'params'];

    for (const i in response[0]) {
      const col_config = {};
      if (i !== 'id' && i !== 'meter') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.wrap = true;
        // col_config.selector = i
        col_config.selector = (row) => row[i];
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);
        col_config.style = {
          minHeight: '40px',
          maxHeight: '40px',
        };
        col_config.width = '220px';

        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              <span
                className="d-block font-weight-bold text-truncate"
                title={
                  row[i]
                    ? row[i] !== ''
                      ? row[i].toString().length > 20
                        ? row[i]
                        : ''
                      : '-'
                    : '-'
                }
              >
                {row[i] && row[i] !== ''
                  ? row[i].toString().substring(0, 20)
                  : '-'}
                {row[i] && row[i] !== ''
                  ? row[i].toString().length > 20
                    ? '...'
                    : ''
                  : '-'}
              </span>
            </div>
          );
        };
        column.push(col_config);
      }
    }

    const showData = async (row) => {
      const params = {
        id: row.id,
      };
      const [statusCode, response] = await fetchHistoryData(params);
      if (statusCode === 200 || statusCode === 202) {
        const data = response.data.data.result;

        data[
          'cmd_detail'
        ] = `${row.meter_number}_${row.command}_${row.start_time}`;

        setHistyData(response.data.data.result);

        setCenteredModal(true);
      }
    };
    if (protocol === 'dlms') {
      column.push({
        name: 'View',
        maxWidth: '100px',
        style: {
          minHeight: '40px',
          maxHeight: '40px',
        },
        cell: (row) => {
          return (
            <Eye
              size="20"
              className="ml_8 cursor-pointer text-primary "
              onClick={() => showData(row)}
            />
          );
        },
      });
    }
    column.unshift({
      name: 'Sr No.',
      width: '90px',
      sortable: false,
      cell: (row, i) => {
        return (
          <div className="d-flex justify-content-center">
            {i + 1 + rowCount * (currentPage - 1)}
          </div>
        );
      },
    });
    return column;
  };

  const isArray = (a) => {
    return !!a && a.constructor === Array;
  };

  const historyData = (historyData) => {
    const data = historyData.data;
    const tableData = {};

    try {
      for (const i of data) {
        if (i['data_type'] in tableData) {
          tableData[i['data_type']].push(i);
        } else {
          tableData[i['data_type']] = [i];
        }
      }
    } catch (err) {}

    return data ? (
      !isArray(data) ? (
        <Col sm="12">
          {Object.keys(data).length !== 0 ? (
            Object.keys(data).map((info, index) => (
              <Row key={index}>
                <Col sm="4" className="text-right border py-1">
                  {`${info.charAt(0).toUpperCase()}${info.slice(1)}`.replaceAll(
                    '_',
                    ' '
                  )}
                </Col>
                <Col sm="8" className="border py-1">
                  <h5 className="m-0">{data[info]}</h5>
                </Col>
              </Row>
            ))
          ) : (
            <h3 className="text-center">No data found</h3>
          )}
        </Col>
      ) : (
        <Col sm="12" className="mb-3">
          {data.length > 0 ? (
            Object.keys(tableData).map((info, index) => (
              <CreateTableInstantBilling
                key={index}
                data={tableData[info]}
                height="max"
                tableName={`${historyData.cmd_detail}_${info}`}
              />
            ))
          ) : (
            <h3 className="text-center">No data found</h3>
          )}
        </Col>
      )
    ) : (
      ''
    );
  };

  const execStatus = (data) => {
    return data ? (
      <Col sm="6" className="mt-2">
        <h3 className="mb-2">Arguments</h3>
        {Object.keys(data).length !== 0 ? (
          Object.keys(data).map((info, index) => (
            <Row key={index}>
              <Col sm="4" className="text-right border py-1">
                {`${info.charAt(0).toUpperCase()}${info.slice(1)}`.replaceAll(
                  '_',
                  ' '
                )}
              </Col>
              <Col sm="8" className="border py-1">
                <h5 className="m-0">{JSON.stringify(data[info])}</h5>
              </Col>
            </Row>
          ))
        ) : (
          <h3 className="text-center">No data found</h3>
        )}
      </Col>
    ) : (
      ''
    );
  };

  const execTimeLine = (data) => {
    const resp_data = [];
    for (const i of data) {
      resp_data.push({
        title: i['execution_status'],
        meta: i['timestamp'],
      });
    }

    return data ? (
      <Col sm="6" className="mt-2">
        <h3 className="mb-2">Execution timeline</h3>
        <Timeline data={resp_data} />
      </Col>
    ) : (
      ''
    );
  };

  const fullInfo = () => {
    return (
      <Row>
        {histyData ? historyData(histyData) : ''}
        {/* {histyData ? execStatus(histyData.arguments) : ''} */}
        {/*   {histyData ? execTimeLine(histyData.execution_timeline) : ''} */}
      </Row>
    );
  };

  const updateCommandHistoryStatus = () => {
    setReloadCommandHistory(true);
  };

  const onNextPageClicked = (page) => {
    setCurrentPage(page + 1);
    setReloadCommandHistory(true);
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

  // ** Function to handle Modal toggle
  const handleFilter = () => setFilterModal(!filterModal);
  // ** Custom close btn
  const CloseBtn = (
    <X className="cursor-pointer mt_5" size={15} onClick={handleFilter} />
  );

  useEffect(async () => {
    if (fetchingData || retry) {
      const params = {
        project: HierarchyProgress.project_name,
        meter: HierarchyProgress.meter_serial_number,
        page: currentPage,
        asset_type: 'meter',
        command: 'BILLING,US_SET_BILLING_SCHEDULE',
        page_size: 8,
      };

      const [statusCode, response] = await fetchData(params);
      if (statusCode === 200) {
        setResponse(response.data.data.result.results);
        setFetchingData(false);
        setTotalCount(response.data.data.result.count);
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

  useEffect(async () => {
    if (getInstantBilling) {
      const params = {
        data: [
          {
            name: 'meter',
            meter_serial: HierarchyProgress.meter_serial_number,
            value: {
              pss_name: '',
              pss_id: HierarchyProgress.pss_name,
              feeder_id: HierarchyProgress.feeder_name,
              feeder_name: '',
              site_id: HierarchyProgress.dtr_name,
              protocol: 'DLMS',
              meter_serial: HierarchyProgress.meter_serial_number,
              meter_address: '',
              sc_no: HierarchyProgress.user_name,
              project: HierarchyProgress.project_name,
              grid_id: '',
              site_name: '',
              meter_sw_version: 'NA',
            },
            command: 'BILLING',
            args: {
              value: {
                from: 0,
                to: 1,
              },
              input_type: 'number',
              mode: 'range',
            },
          },
        ],
      };
      const [statusCode, response] = await executeCommand(params);

      setGetInstantBilling(false);

      if (statusCode === 201) {
        toast.success(
          <Toast msg="Command sent to meter successfully." type="success" />,
          {
            hideProgressBar: true,
          }
        );

        setCurrentPage(1);
        setFetchingData(true);
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else {
        if (typeof response === 'string') {
          toast.error(<Toast msg={response} type="danger" />, {
            hideProgressBar: true,
          });
        } else {
          toast.error(
            <Toast msg="Command sent to meter failed." type="danger" />,
            {
              hideProgressBar: true,
            }
          );
        }
      }
    }
  }, [getInstantBilling]);

  useEffect(async () => {
    if (setBillingActionSchedule) {
      const params = {
        data: [
          {
            name: 'meter',
            meter_serial: HierarchyProgress.meter_serial_number,
            value: {
              pss_name: '',
              pss_id: HierarchyProgress.pss_name,
              feeder_id: HierarchyProgress.feeder_name,
              feeder_name: '',
              site_id: HierarchyProgress.dtr_name,
              protocol: 'DLMS',
              meter_serial: HierarchyProgress.meter_serial_number,
              meter_address: '',
              sc_no: HierarchyProgress.user_name,
              project: HierarchyProgress.project_name,
              grid_id: '',
              site_name: '',
              meter_sw_version: 'NA',
            },
            command: 'US_SET_BILLING_SCHEDULE',
            args: {
              // Update value as per date time selected from calendar
              value: dateTimeFormat(onDateTimeSelect[0]),
              input_type: 'date',
              mode: '',
            },
          },
        ],
      };
      const [statusCode, response] = await executeCommand(params);

      setSetBillingActionSchedule(false);

      if (statusCode === 201) {
        toast.success(
          <Toast msg="Command sent to meter successfully." type="success" />,
          {
            hideProgressBar: true,
          }
        );

        setCurrentPage(1);
        setFetchingData(true);
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else {
        if (typeof response === 'string') {
          toast.error(<Toast msg={response} type="danger" />, {
            hideProgressBar: true,
          });
        } else {
          toast.error(
            <Toast msg="Command sent to meter failed." type="danger" />,
            {
              hideProgressBar: true,
            }
          );
        }
      }
    }
  }, [setBillingActionSchedule]);

  const getInstantBillingDeterminant = () => {
    // alert('Hello')
    setGetInstantBilling(true);
  };

  const getBillingActionSchedule = () => {
    setSetBillingActionSchedule(true);
    setDateTimePopup(false);
  };

  const generateBill = (
    <Fragment>
      <FileText
        size="14"
        className="float-right cursor-pointer mt_9 mr_10"
        id="generate_bill"
        onClick={getInstantBillingDeterminant}
      />
      <Tooltip
        placement="top"
        isOpen={billTooltipOpen}
        target="generate_bill"
        toggle={() => setBillTooltipOpen(!billTooltipOpen)}
      >
        Generate bill !
      </Tooltip>
    </Fragment>
  );

  const billingActionSchedule = (
    <>
      <Fragment>
        <Watch
          size="14"
          className="float-right cursor-pointer mt_9 mr_10"
          id="billing_action_schedule"
          onClick={setDateTimePopup}
        />
        <Tooltip
          placement="top"
          isOpen={billingActionScheduleOpen}
          target="billing_action_schedule"
          toggle={() =>
            setBillingActionScheduleOpen(!billingActionScheduleOpen)
          }
        >
          Billing Action Schedule !
        </Tooltip>
      </Fragment>

      <Modal
        isOpen={dateTimePopup}
        toggle={() => setDateTimePopup(!dateTimePopup)}
        backdrop={false}
        className={`modal-sm modal-dialog-top`}
      >
        <ModalHeader
          style={{ background: '#ccc' }}
          toggle={() => setDateTimePopup(!dateTimePopup)}
        >
          Select datetime
        </ModalHeader>
        <ModalBody style={{ background: '#777' }} className="py-2">
          {' '}
          <InputGroup>
            <Flatpickr
              placeholder="Select date ..."
              onChange={setOnDateTimeSelect}
              className="form-control"
              style={{ color: 'white' }}
              options={{ enableTime: true }}
            />
            <Button
              className="btn btn-secondary"
              outline
              onClick={getBillingActionSchedule}
            >
              Go
            </Button>
          </InputGroup>
        </ModalBody>
      </Modal>
    </>
  );

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };
  return (
    <div>
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
        <SimpleDataTableMDAS
          columns={tblColumn()}
          tblData={response.map((item) => {
            const timeDifferenceInSeconds = moment(item.update_time).diff(
              item.start_time,
              'seconds'
            );
            const hours = Math.floor(timeDifferenceInSeconds / 3600);
            const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
            const seconds = timeDifferenceInSeconds % 60;

            item.response_time = `${
              hours ? hours.toString().concat(hours === 1 ? ' hr' : ' hrs') : ''
            } ${minutes ? minutes.toString().concat(' min') : ''} ${seconds
              .toString()
              .concat(' sec')}`;

            return item;
          })}
          rowCount={rowCount}
          tableName={'Billing related command history'.concat(
            '(',
            meter_serial,
            ')'
          )}
          additional_columns={['meter']}
          refresh={updateCommandHistoryStatus}
          filter={handleFilter}
          status={reloadCommandHistory}
          currentPage={currentPage}
          totalCount={totalCount}
          onNextPageClicked={onNextPageClicked}
          // protocolSelected={protocolSelected}
          // protocol={protocol}
          // extras={generateBill}
          newextras={billingActionSchedule}
        />
      )}

      {/* Command History data modal */}
      <Modal
        isOpen={centeredModal}
        toggle={() => setCenteredModal(!centeredModal)}
        className={`modal-xl modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
          Command History data
        </ModalHeader>
        <ModalBody>{fullInfo()}</ModalBody>
      </Modal>

      {/* Command filter modal */}
      <Modal
        isOpen={filterModal}
        toggle={handleFilter}
        className="sidebar-md"
        modalClassName="modal-slide-in-left"
        contentClassName="pt-0"
      >
        <ModalHeader
          className="mb-3"
          toggle={handleFilter}
          close={CloseBtn}
          tag="div"
        >
          <h4 className="modal-title">Command history - Filter</h4>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          <FilterForm
            handleFilter={handleFilter}
            protocol={protocol}
            AppliedFilterparams={AppliedFilterparams}
          />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default InstantBillDetermineModal;
