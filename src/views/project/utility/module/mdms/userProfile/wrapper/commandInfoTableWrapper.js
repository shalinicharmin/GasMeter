import React, { useEffect, useState, Fragment } from 'react';
import { Col, Row, Modal, ModalHeader, ModalBody, Tooltip } from 'reactstrap';
import useJwt from '@src/auth/jwt/useJwt';
// import { useLocation } from 'react-router-dom'
import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDAS';
import { Eye, X, FileText } from 'react-feather';
import CreateTable from '@src/views/ui-elements/dtTable/createTable';
import { useSelector, useDispatch } from 'react-redux';

import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';

import { useLocation, useHistory } from 'react-router-dom';
import authLogout from '../../../../../../../auth/jwt/logoutlogic';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

import Loader from '@src/views/project/misc/loader';
import { caseInsensitiveSort } from '@src/views/utils.js';
import SimpleTableForDLMSCommandResponse from '@src/views/ui-elements/dtTable/simpleTableForDLMSCommandResponse';
import moment from 'moment';

const CommandInfoTableWrapper = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(undefined);

  const [tapHistyData, setTapHistyData] = useState(undefined);
  const [tapViewModal, setTapViewModal] = useState(false);

  const [commandSelectedToViewResponse, setCommandSelectedToViewResponse] =
    useState('');
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

  // console.log('Hierarchy Progres .....')
  // console.log(HierarchyProgress)

  let user_name = '';
  let meter_serial = '';
  if (HierarchyProgress && HierarchyProgress.user_name) {
    user_name = HierarchyProgress.user_name;
    meter_serial = HierarchyProgress.meter_serial_number;
  }

  const [histyData, setHistyData] = useState();
  const [centeredModal, setCenteredModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // const [filterModal, setFilterModal] = useState(false)
  // const [filterAppliedParams, setFilterAppliedParams] = useState(undefined)

  // TotalCount,response Local State
  const [response, setResponse] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  // const [getInstantBilling, setGetInstantBilling] = useState(false)
  // const [fetchingData, setFetchingData] = useState(true)

  // const [billTooltipOpen, setBillTooltipOpen] = useState(false)

  // const fetchData = async params => {
  //   return await useJwt
  //     .getMDMSUserInstantBillingDeterminantHistory(params)
  //     .then(res => {
  //       const status = res.status
  //       return [status, res]
  //     })
  //     .catch(err => {
  //       const status = 0
  //       return [status, err]
  //     })
  // }

  // Local State to manage command history based on protocol type
  const [protocol, setProtocol] = useState('dlms');

  if (
    HierarchyProgress &&
    HierarchyProgress.meter_protocol_type &&
    protocol === ''
  ) {
    setProtocol(HierarchyProgress.meter_protocol_type);
  }

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

  const fetchCommandHistoryData = async (params) => {
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

  const fetchHistoryDataDetail = async (params) => {
    return await useJwt
      .commandHistoryTAPDetail(params)
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

  // const doNotReload = () => setReloadCommandHistory(false)

  useEffect(async () => {
    if (
      reloadCommandHistory ||
      props.reloadCommandHistory1 ||
      HierarchyProgress ||
      retry
    ) {
      let params = {};

      if (protocol === 'tap') {
        params = {
          project: HierarchyProgress.project_name,
          meter: HierarchyProgress.meter_address,
          page: currentPage,
          asset_type: 'meter',
          page_size: 8,
        };
      } else {
        params = {
          project: HierarchyProgress.project_name,
          meter: HierarchyProgress.meter_serial_number,
          page: currentPage,
          asset_type: 'meter',
          page_size: 8,
        };
      }

      // console.log('Command History API Call')
      // console.log(protocol)

      if (protocol === 'tap') {
        // params['command'] = 'turn_relay_on,turn_relay_off,relay_manual_control,relay_auto_control'
        const [statusCode, response] = await fetchCommandHistoryTAP(params);
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true);
        } else if (statusCode === 200) {
          try {
            setResponse(response.data.data.result.results);
            setTotalCount(response.data.data.result.count);
            setReloadCommandHistory(false);
            setRetry(false);
          } catch (error) {
            setRetry(false);
            setError(true);
            setReloadCommandHistory(false);
            setErrorMessage('Something went wrong, please retry');
          }
        } else {
          setRetry(false);
          setError(true);
          setReloadCommandHistory(false);
          setErrorMessage('Network Error, please retry');
        }
      } else if (protocol === 'dlms') {
        const [statusCode, response] = await fetchCommandHistoryDLMS(params);
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true);
        } else if (statusCode === 200) {
          try {
            setResponse(response.data.data.result.results);
            setTotalCount(response.data.data.result.count);
            setReloadCommandHistory(false);
            setRetry(false);
          } catch (error) {
            setRetry(false);
            setError(true);
            setReloadCommandHistory(false);
            setErrorMessage('Something went wrong, please retry');
          }
        } else {
          setRetry(false);
          setError(true);
          setReloadCommandHistory(false);
          setErrorMessage('Network Error, please retry');
        }
      }
    }
  }, [reloadCommandHistory, HierarchyProgress, retry]);

  const tblColumn = () => {
    const column = [];
    const custom_width = [
      'command',
      'params',
      'update_time',
      'start_time',
      'timestamp',
      'execution_time',
      'user',
    ];

    for (const i in response[0]) {
      const col_config = {};
      if (i !== 'id' && i !== 'meter' && i !== 'meter_serial') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.reorder = true;
        col_config.selector = (row) => row[i];
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);
        // col_config.format = row => `${row[i].slice(0, 10)}...`
        // col_config.style = {
        //   minHeight: '40px',
        //   maxHeight: '40px'
        // }
        if (custom_width.includes(i)) {
          col_config.width = '190px';
        }

        // if (i==meter.length > 5) {
        //   col_config.width = '380px'
        // }

        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              <span
                className="d-block font-weight-bold"
                title={
                  row[i]
                    ? row[i]
                      ? row[i] !== ''
                        ? row[i].toString().length > 23
                          ? row[i]
                          : ''
                        : '-'
                      : '-'
                    : '-'
                }
              >
                {row[i]
                  ? row[i] && row[i] !== ''
                    ? row[i].toString().substring(0, 23)
                    : '-'
                  : '-'}
                {row[i]
                  ? row[i] && row[i] !== ''
                    ? row[i].toString().length > 23
                      ? '...'
                      : ''
                    : '-'
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
      const [statusCode, response] = await fetchCommandHistoryData(params);
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else if (statusCode === 200 || statusCode === 202) {
        let data = response?.data?.data?.result?.data;
        if (Array.isArray(data)) {
          const filteredData = data.filter(
            (obj) => !obj.hasOwnProperty('MD_W_TOD_1')
          );

          if (Array.isArray(filteredData)) {
            data = filteredData.map((item) => {
              for (const key in item) {
                if (item[key] === '65535-00-00 00:00:00') {
                  item[key] = '--';
                }
              }

              return item;
            });
          }
        }

        const cmdDetail = `${row.meter_number}_${row.command}_${row.start_time}`;
        const newData = {
          data,
          cmd_detail: cmdDetail,
        };

        setCommandSelectedToViewResponse(row.command);
        setHistyData(newData);

        setCenteredModal(true);
      } else {
        toast.error(<Toast msg="No data Available ." type="danger" />, {
          hideProgressBar: true,
        });
      }
    };

    const showTapData = async (row) => {
      const params = {
        id: row.id,
        project: projectName,
      };
      const [statusCode, response] = await fetchHistoryDataDetail(params);
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else if (statusCode === 200) {
        const data = response.data.data.result;

        data['cmd_detail'] = {
          meter_serial: row.meter_number,
          command: row.command,
          execution: row.execution_time,
        };

        setTapHistyData(data);

        setTapViewModal(true);
      } else {
        toast.error(<Toast msg="No data Available ." type="danger" />, {
          hideProgressBar: true,
        });
      }
    };

    column.push({
      name: 'Response Time',
      cell: (row) => {
        // console.log(row)

        const timeDifferenceInSeconds = moment(row.update_time).diff(
          row.start_time,
          'seconds'
        );
        const hours = Math.floor(timeDifferenceInSeconds / 3600);
        const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
        const seconds = timeDifferenceInSeconds % 60;

        return `${
          hours ? hours.toString().concat(hours === 1 ? ' hr' : ' hrs') : ''
        } ${minutes ? minutes.toString().concat(' min') : ''} ${seconds
          .toString()
          .concat(' sec')}`;
      },
    });

    if (protocol === 'dlms') {
      column.push({
        name: 'View',
        maxWidth: '100px',
        // style: {
        //   minHeight: '40px',
        //   maxHeight: '40px'
        // },
        cell: (row) => {
          return (
            <Eye
              size="20"
              className="ml_6 cursor-pointer text-primary "
              onClick={() => showData(row)}
            />
          );
        },
      });
    }

    if (protocol === 'tap') {
      column.push({
        name: 'View',
        maxWidth: '100px',
        // style: {
        //   minHeight: '40px',
        //   maxHeight: '40px'
        // },
        cell: (row) => {
          return (
            <Eye
              size="20"
              className="ml_6 cursor-pointer text-primary "
              onClick={() => showTapData(row)}
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
            {i + 1 + 8 * (currentPage - 1)}
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
    // console.log(historyData)
    const data = historyData.data.data
      ? historyData.data.data
      : historyData.data;
    // console.log(data)
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
              <SimpleTableForDLMSCommandResponse
                key={index}
                data={tableData[info]}
                smHeading={true}
                height="max"
                tableName={`${historyData.cmd_detail}`}
                rowCount={10}
                commandName={commandSelectedToViewResponse}
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

  // ** Function to handle Modal toggle
  const handleFilter = () => setFilterModal(!filterModal);
  // ** Custom close btn
  // const CloseBtn = <X className='cursor-pointer mt_5' size={15} onClick={handleFilter} />

  // useEffect(async () => {
  //   if (fetchingData) {
  //     const params = {
  //       project: HierarchyProgress.project_name,
  //       meter: HierarchyProgress.meter_serial_number,
  //       page: currentPage,
  //       asset_type: 'meter',
  //       command: 'BILLING',
  //       page_size: 8
  //     }

  //     const [statusCode, response] = await fetchData(params)
  //     if (statusCode) {
  //       if (statusCode === 200) {
  //         setResponse(response.data.data.result.results)
  //         setFetchingData(false)
  //         setTotalCount(response.data.data.result.count)
  //       }
  //     }
  //   }
  // }, [fetchingData])

  // useEffect(async () => {
  //   if (getInstantBilling) {
  //     const params = {
  //       data: [
  //         {
  //           name: 'meter',
  //           meter_serial: HierarchyProgress.meter_serial_number,
  //           value: {
  //             pss_name: '',
  //             pss_id: HierarchyProgress.pss_name,
  //             feeder_id: HierarchyProgress.feeder_name,
  //             feeder_name: '',
  //             site_id: HierarchyProgress.dtr_name,
  //             protocol: 'DLMS',
  //             meter_serial: HierarchyProgress.meter_serial_number,
  //             meter_address: '',
  //             sc_no: HierarchyProgress.user_name,
  //             project: HierarchyProgress.project_name,
  //             grid_id: '',
  //             site_name: '',
  //             meter_sw_version: 'NA'
  //           },
  //           command: 'BILLING',
  //           args: {
  //             value: {
  //               from: 0,
  //               to: 1
  //             },
  //             input_type: 'number',
  //             mode: 'range'
  //           }
  //         }
  //       ]
  //     }
  //     const [statusCode, response] = await executeCommand(params)
  //     if (statusCode === 201) {
  //       toast.success(<Toast msg='Command sent to meter successfully.' type='success' />, { hideProgressBar: true })

  //       setCurrentPage(1)
  //       setFetchingData(true)
  //     } else {
  //       toast.error(<Toast msg='Error occurred while executing command.' type='danger' />, { hideProgressBar: true })
  //     }
  //   }
  // }, [getInstantBilling])

  // const getInstantBillingDeterminant = () => {
  //   setGetInstantBilling(true)
  // }

  // const generateBill = (
  //   <Fragment>
  //     <FileText size='14' className='float-right cursor-pointer mt_9 mr_10' id='generate_bill' onClick={getInstantBillingDeterminant} />
  //     <Tooltip placement='top' isOpen={billTooltipOpen} target='generate_bill' toggle={() => setBillTooltipOpen(!billTooltipOpen)}>
  //       Generate bill !
  //     </Tooltip>
  //   </Fragment>
  // )

  const protocolSelected = (value) => {
    // console.log('Protocol Selected .....')
    // console.log(value)
    setProtocol(value);
    setReloadCommandHistory(true);
    setCurrentPage(1);
    setResponse([]);
    setTotalCount(0);
    // setFilterAppliedParams(undefined)
  };

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  const tapViewDetail = () => {
    return (
      <div style={{ fontSize: '12px' }}>
        Meter serial : <b>{tapHistyData.cmd_detail.meter_serial}</b>
        <br></br>
        Command : <b>{tapHistyData.cmd_detail.command}</b>
        <br></br>
        Exetution time : <b>{tapHistyData.cmd_detail.execution}</b>
        <br></br>
        <br></br>
        Command response: <b>{tapHistyData.data}</b>
      </div>
    );
  };

  return (
    <div>
      {hasError ? (
        <CardInfo
          props={{
            message: { errorMessage },
            retryFun: { retryAgain },
            retry: { retry },
          }}
        />
      ) : (
        <>
          {!retry && !reloadCommandHistory && (
            <div className="table-wrapper">
              <SimpleDataTableMDAS
                columns={tblColumn()}
                tblData={response}
                rowCount={8}
                tableName={'Command History Table '.concat(
                  '(',
                  meter_serial,
                  ')'
                )}
                refresh={updateCommandHistoryStatus}
                status={reloadCommandHistory}
                currentPage={currentPage}
                totalCount={totalCount}
                onNextPageClicked={onNextPageClicked}
                protocolSelected={protocolSelected}
                protocol={protocol}

                // extras={generateBill}
              />
            </div>
          )}
          {(retry || reloadCommandHistory) && <Loader hight="min-height-475" />}
        </>
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

      {/* Command History data modal */}
      <Modal
        isOpen={tapViewModal}
        toggle={() => setTapViewModal(!tapViewModal)}
        className={`modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setTapViewModal(!tapViewModal)}>
          Tap command response detail
        </ModalHeader>
        <ModalBody>{tapHistyData && tapViewDetail()}</ModalBody>
      </Modal>
    </div>
  );
};

export default CommandInfoTableWrapper;
