import React, { useState, useEffect } from 'react';
import DataTabled from '../../../../ui-elements/dataTableUpdated';
import { caseInsensitiveSort } from '@src/views/utils.js';
import useJwt from '@src/auth/jwt/useJwt';
import { Download } from 'react-feather';
import Loader from '@src/views/project/misc/loader';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import { saveAs } from 'file-saver';
import {
  Col,
  Row,
  Button,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
} from 'reactstrap';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import SimpleTableForDLMSCommandResponse from '@src/views/ui-elements/dtTable/simpleTableForDLMSCommandResponse';
import RequestCommandResponseModal from './requestCommandResponseModal';
import moment from 'moment-timezone';

const SampleTestMetersModal = (props) => {
  const { passingCriteria } = props;
  // console.log(props.rowData.passingCriteria)
  // console.log(props.rowData.sampleSize)
  // console.log(props.rowData.expResTime)

  const [protocol, setProtocol] = useState('dlms');
  const [response, setResponse] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  // Error Handling
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [loader, setLoader] = useState(false);
  const [pdfSrc, setPdfSrc] = useState('');
  const [result, setResult] = useState('');

  const [isLoadingHTML, SetIsLoadingHTML] = useState(false);
  const [isLoadingCSV, setIsLoadingCSV] = useState(false);

  const [centeredModal, setCenteredModal] = useState(false);
  const [tapViewModal, setTapViewModal] = useState(false);
  const [cmdResponseModal, setcmdResponseModal] = useState(false);
  const [histyData, setHistyData] = useState();
  const [tapHistyData, setTapHistyData] = useState(undefined);

  const [logout, setLogout] = useState(false);
  const [rowData, setRowData] = useState([]);

  const [executionStatusCount, setExecutionStatusCount] = useState({});

  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
    // formData.testCycleId = props.row.id
  }, [logout]);
  const [page, setpage] = useState(0);

  const fetchData = async (params) => {
    return await useJwt
      .getTestsbyId(params)
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

  const showData = async (row) => {
    const params = {
      id: row.executionId,
    };
    const [statusCode, response] = await fetchHistoryData(params);
    setCenteredModal(true);
    if (statusCode === 200 || statusCode === 202) {
      let data = response.data.data.result.data;

      if (Array.isArray(data)) {
        data = data.map((item) => {
          for (const key in item) {
            if (
              item[key] === '65535-00-00 00:00:00' ||
              item[key] === '1970-01-01 00:00:00'
            ) {
              item[key] = '--';
            }

            // if (typeof item[key] === "number") {
            //   item[key] = item[key].toFixed(2)
            // }
          }
          return item;
        });
      }
      const cmdDetail = `Meter: ${row.meterSerial}, Command: ${result.cmdName}, Execution: ${row.executionStartTime}`;
      const newData = {
        data,
        cmd_detail: cmdDetail,
      };

      // setCommandSelectedToViewResponse(row.command)
      setHistyData(newData);
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true);
    }
  };

  useEffect(async () => {
    if (fetchingData || retry) {
      setLoader(true);
      let params = {};
      params = {
        id: props.rowData.id,
      };

      const [statusCode, response] = await fetchData(params);
      if (statusCode === 200) {
        try {
          response?.data?.sampleMeters.map((item) => {
            const updateTime = moment(item.updateTime);
            const currentTime = moment();
            // if (updateTime.isSame(item.executionStartTime)) {
            //   // Increment seconds of updateTime by 1
            //   item.updateTime = updateTime.add(1, "seconds").format("YYYY-MM-DD HH:mm:ss")
            //   item.executionTime = `${updateTime.diff(
            //     moment(item.executionStartTime),
            //     "seconds"
            //   )} sec`
            // }
            if (updateTime.isAfter(currentTime)) {
              item.updateTime = item.executionStartTime;
              item.executionStatus = 'IN_PROGRESS';
            }
            // if (item.executionStatus === "IN_PROGRESS") {
            //   response.data.resultCalculations.finalResult = "Processing"
            // }
            // item.updateTime = updateTime
            return item;
          });

          // Render the component based on executionStatus
          const renderedSampleMeters = response?.data?.sampleMeters.map(
            (item) => {
              return {
                ...item,
                executionTime:
                  item.executionStatus === 'IN_PROGRESS'
                    ? undefined
                    : item.executionTime,
              };
            }
          );

          setResponse(renderedSampleMeters);
          setResult(response.data);
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

  const generateReports = async (params) => {
    SetIsLoadingHTML(true);
    try {
      const response = await useJwt.generateTestReports(params);
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      // Open the PDF in a new tab
      window.open(url, '_blank');
    } catch (error) {
      toast.error(<Toast msg="Error fetching PDF" type="danger" />, {
        hideProgressBar: true,
      });
    }
    SetIsLoadingHTML(false);
  };

  const downloadCmdResCSV = async (params) => {
    setIsLoadingCSV(true);
    try {
      const response = await useJwt.generateCmdResCSV(params);
      const blob = new Blob([response.data], { type: 'application/csv' });
      saveAs(blob, 'cmd-response.csv');
      // const url = URL.createObjectURL(blob);
      // window.open(url, '_blank');
    } catch (error) {
      toast.error(<Toast msg="Error fetching CSV" type="danger" />, {
        hideProgressBar: true,
      });
    }
    setIsLoadingCSV(false);
  };

  const onRowClick = (row) => {
    if (
      row.executionStatus === 'IN_PROGRESS' ||
      row.executionStatus === 'INITIATE' ||
      row.executionStatus === 'IN_QUEUE' ||
      row.executionStatus === 'Initate' ||
      row.executionStatus === 'In Queue' ||
      row.executionStatus === 'In Progress' ||
      row.executionStatus === 'In PROGRESS' ||
      row.executionStatus === 'In QUEUE'
    ) {
      toast.error(<Toast msg="Response not available" type="danger" />, {
        hideProgressBar: true,
      });
    } else {
      setRowData(row);
      showData(row);
    }
  };
  const eventsRelated = (info) => {
    if (info === 'CEFV') {
      return 'Current Related Events';
    } else if (info === 'VEFV') {
      return 'Voltage Related Events';
    } else if (info === 'PEFV') {
      return 'Power Related Events';
    } else if (info === 'TEFV') {
      return 'Transaction Related events';
    } else if (info === 'NREFV') {
      return 'Non Rollover Related Event';
    } else if (info === 'DEFV') {
      return 'Control Related events';
    } else if (info === 'OEFV') {
      return 'Other Related events';
    } else {
      return '';
    }
  };

  const isArray = (a) => {
    return !!a && a.constructor === Array;
  };

  const historyData = (historyData) => {
    const data = historyData.data.data
      ? historyData.data.data
      : historyData.data;
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
            Object.keys(tableData).map((info, index) => {
              return (
                <SimpleTableForDLMSCommandResponse
                  key={index}
                  data={tableData[info]}
                  smHeading={true}
                  height="max"
                  tableName={
                    eventsRelated(info)
                      ? ` ${historyData.cmd_detail} {${eventsRelated(info)}}`
                      : `${historyData.cmd_detail}`
                  }
                  rowCount={10}
                  commandName={result.cmdName}
                />
              );
            })
          ) : (
            <h3 className="text-center">No data found</h3>
          )}
        </Col>
      )
    ) : (
      <h3 className="text-center">No data found</h3>
    );
  };

  const fullInfo = () => {
    if (
      histyData &&
      histyData.hasOwnProperty('data') &&
      Array.isArray(histyData.data)
    ) {
      histyData.data.map((item) => {
        if (
          item.hasOwnProperty('avg_current') ||
          item.hasOwnProperty('measured_current')
        ) {
          item.avg_current = Number(item.avg_current).toFixed(2);
          item.measured_current = Number(item.measured_current).toFixed(2);
        }
      });
    }
    return (
      <Row>
        {histyData ? historyData(histyData) : ''}
        {/* {histyData ? execStatus(histyData.arguments) : ''} */}
        {/*   {histyData ? execTimeLine(histyData.execution_timeline) : ''} */}
      </Row>
    );
  };

  const tapViewDetail = () => {
    return (
      <div style={{ fontSize: '12px' }}>
        Meter serial : <b>{tapHistyData.meterSerial}</b>
        <br></br>
        Command : <b>{result.cmdName}</b>
        <br></br>
        Execution time : <b>{tapHistyData.executionStartTime}</b>
        <br></br>
        <br></br>
        Command response: <b>{tapHistyData.cmdRes[0]}</b>
      </div>
    );
  };

  // Sr. No. Meter Serial Meter Address Site Name Start Time Update Time Exec Time Exec Status
  const tblColumn = () => {
    const column = [];
    const custom_width = ['create_time'];
    const columnPosition = {
      meterSerial: 1,
      meterAddress: 2,
      siteName: 3,
      executionStartTime: 4,
      updateTime: 5,
      executionTime: 6,
      executionStatus: 7,
      cmdRes: 8,
      executionId: 9,
    };
    for (const i in response[0]) {
      const col_config = {};
      if (
        i !== 'id' &&
        i !== 'pssId' &&
        i !== 'siteId' &&
        i !== 'feederId' &&
        i !== 'executionId' &&
        i !== 'meterProtocolType' &&
        i !== 'cmdRes' &&
        i !== 'supplyType' &&
        i !== 'pssName' &&
        i !== 'gridId' &&
        i !== 'feederName' &&
        i !== 'meterSwVersion' &&
        i !== 'startTime' &&
        i !== 'blockLoadCount'
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.selector = (row) => row[i];
        col_config.sortFunction =
          i !== 'executionTime'
            ? (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
            : null;
        // console.log(i);
        col_config.sortable = i !== 'executionTime';
        col_config.reorder = true;
        col_config.wrap = true;
        col_config.compact = false;
        col_config.position = columnPosition[i] || 1000;
        col_config.width = '220px';
        if (
          i === 'executionStartTime' ||
          i === 'updateTime' ||
          i === 'siteName'
        ) {
          col_config.width = '220px';
        }

        col_config.cell = (row) => {
          return (
            <div className={`d-flex font-weight-bold `}>
              <span
                className=""
                data-tag="allowRowEvents"
                title={
                  row[i]
                    ? row[i]
                      ? row[i] !== ''
                        ? row[i].toString().length > 20
                          ? row[i]
                          : ''
                        : '-'
                      : '-'
                    : '-'
                }
              >
                {row[i] || row[i] === 0
                  ? (row[i] || row[i] === 0) && row[i] !== ''
                    ? row[i].toString().substring(0, 25)
                    : '-'
                  : '-'}
                {row[i] || row[i] === 0
                  ? (row[i] || row[i] === 0) && row[i] !== ''
                    ? row[i].toString().length > 25
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
    column.sort((a, b) => {
      if (a.position < b.position) {
        return -1;
      } else if (a.position > b.position) {
        return 1;
      }
      return 0;
    });
    column.unshift({
      name: 'Sr No.',
      width: '90px',
      cell: (row, i) => {
        return (
          <div className="d-flex justify-content-center">
            {page * 10 + 1 + i}
          </div>
        );
      },
    });
    return column;
  };

  const refresh = () => {
    setpage(0);
    setError(false);
    setRetry(true);
  };
  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  const resultColor = (resultCalculations) => {
    if (resultCalculations?.finalResult === 'Processing') {
      return 'text-warning';
    } else if (resultCalculations?.finalResult === 'Success') {
      return 'text-success';
    } else if (resultCalculations?.finalResult === 'Failed') {
      return 'text-danger';
    } else {
      return 'text-secondary';
    }
  };

  useEffect(() => {
    const all_status = {};
    all_status['SUCCESS'] = response.filter(
      (item) => item?.executionStatus?.toUpperCase() === 'SUCCESS'
    ).length;
    all_status['INITIATE'] = response.filter(
      (item) => item?.executionStatus?.toUpperCase() === 'INITIATE'
    ).length;

    all_status['IN_QUEUE'] = response.filter(
      (item) => item?.executionStatus?.toUpperCase() === 'IN_QUEUE'
    ).length;

    all_status['IN_PROGRESS'] = response.filter(
      (item) => item?.executionStatus?.toUpperCase() === 'IN_PROGRESS'
    ).length;

    all_status['FAILED'] = response.filter(
      (item) => item?.executionStatus?.toUpperCase() === 'FAILED'
    ).length;

    setExecutionStatusCount(all_status);
  }, [response]);

  const calculateStatusCounts = (status, response, result) => {
    let successCount = 0;
    let notSuccessCount = 0;

    if (response) {
      response.forEach((item) => {
        const expResTimeInSeconds = parseInt(result.expResTime);
        const executionTimeInSeconds = parseInt(item.executionTime);

        if (
          !isNaN(expResTimeInSeconds) &&
          !isNaN(executionTimeInSeconds) &&
          executionTimeInSeconds <= expResTimeInSeconds &&
          item.executionStatus.toUpperCase() === status
        ) {
          successCount++;
        } else if (
          !isNaN(expResTimeInSeconds) &&
          !isNaN(executionTimeInSeconds) &&
          executionTimeInSeconds >= expResTimeInSeconds &&
          item.executionStatus.toUpperCase() === status
        ) {
          notSuccessCount++;
        }
      });
    }

    return { successCount, notSuccessCount };
  };

  const successPercentageCount = (
    (calculateStatusCounts('SUCCESS', response, result).successCount /
      response.length) *
    100
  ).toFixed(2);

  const NotInSuccessCount = calculateStatusCounts(
    'SUCCESS',
    response,
    result
  ).notSuccessCount;

  const failedinExecutionStatus =
    NotInSuccessCount + executionStatusCount['FAILED'];

  const NotInSuccessPercentageCount = (
    (failedinExecutionStatus / response.length) *
    100
  ).toFixed(2);

  const testResultStatus = () => {
    const affordabiltyFailure = 100 - props.rowData.passingCriteria;

    if (NotInSuccessPercentageCount > affordabiltyFailure) {
      return 'Failed';
    } else if (successPercentageCount >= props.rowData.passingCriteria) {
      return 'Success';
    } else {
      return 'Processing';
    }
  };

  const SuccesInExpResTime = calculateStatusCounts(
    'SUCCESS',
    response,
    result
  ).successCount;

  return (
    <>
      <Row>
        <Col lg="8" className="d-flex align-items-center">
          <h5>
            Success Percentage:{' '}
            <Badge pill color="light-success">
              {successPercentageCount}%
            </Badge>
            | Success In Exp. Res. Time:
            <Badge pill color="light-success">
              {SuccesInExpResTime}
            </Badge>
            | Success:
            <Badge pill color="light-success">
              {executionStatusCount['SUCCESS']}
            </Badge>{' '}
            | InQueue:
            <Badge pill color="light-info">
              {executionStatusCount['IN_QUEUE']}
            </Badge>{' '}
            | Inprogress:
            <Badge pill color="light-warning">
              {executionStatusCount['IN_PROGRESS']}
            </Badge>
            | Initiate:
            <Badge pill color="light-secondary">
              {executionStatusCount['INITIATE']}
            </Badge>{' '}
            | Failed:
            <Badge pill color="light-danger">
              {executionStatusCount['FAILED']}
            </Badge>
          </h5>
        </Col>

        <Col className="d-flex gap-1 justify-content-end">
          {testResultStatus() === 'Processing' ? (
            ''
          ) : (
            <>
              <Button.Ripple
                color="primary"
                type=""
                onClick={() => {
                  setcmdResponseModal(!cmdResponseModal);
                  // downloadCmdResCSV({ id: props.rowData.id })
                }}
                className="float-right mb-1"
                disabled={isLoadingCSV}
              >
                {/* {isLoadingCSV ? <Spinner size='sm' /> : <Download size={14} />} */}
                <span className="align-middle ml-25 " id="new_cyclw">
                  Detailed Report
                </span>
              </Button.Ripple>
              <Button.Ripple
                color="success"
                type=""
                onClick={() => generateReports({ id: props.rowData.id })}
                className="float-right mb-1"
                disabled={isLoadingHTML}
              >
                {isLoadingHTML ? <Spinner size="sm" /> : <Download size={14} />}
                <span className="align-middle ml-25 " id="new_cyclw">
                  Summary Report
                </span>
              </Button.Ripple>
            </>
          )}
        </Col>
      </Row>

      {loader ? (
        <Loader hight="min-height-475" />
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
          <DataTabled
            rowCount={10}
            currentpage={page}
            ispagination
            selectedPage={setpage}
            columns={tblColumn()}
            tblData={response}
            tableName={'Meters'}
            handleRowClick={onRowClick}
            pointerOnHover
            refresh={refresh}
            donotShowDownload={true}
            extras={
              <>
                <h5 className=" d-inline inline-block">
                  Test Result:{' '}
                  <span
                    className={resultColor({ finalResult: testResultStatus() })}
                  >
                    {testResultStatus()}
                  </span>
                </h5>
              </>
            }
          />
        )
      )}

      {/* Command History data modal (Protocol 1)*/}

      {(rowData.executionStatus !== 'IN_PROGRESS' ||
        rowData.executionStatus !== 'INITIATE' ||
        rowData.executionStatus !== 'IN_QUEUE') && (
        <Modal
          isOpen={centeredModal}
          toggle={() => setCenteredModal(!centeredModal)}
          className={`modal_size modal-dialog-centered`}
        >
          <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
            Command History data
          </ModalHeader>
          <ModalBody>{fullInfo()}</ModalBody>
        </Modal>
      )}

      {/* Command History data modal (Protocol 2)*/}
      <Modal
        isOpen={tapViewModal}
        toggle={() => setTapViewModal(!tapViewModal)}
        className={`modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setTapViewModal(!tapViewModal)}>
          Command History data
        </ModalHeader>
        <ModalBody>
          <h3>Hlww tap</h3>
          {tapHistyData && tapViewDetail()}
        </ModalBody>
      </Modal>

      <Modal
        isOpen={cmdResponseModal}
        toggle={() => setcmdResponseModal(!cmdResponseModal)}
        className={`modal_size modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setcmdResponseModal(!cmdResponseModal)}>
          {` Test Cycle ID : ${result.testCycleId} | Test ID : ${result.id} | Command Name : ${result.cmdName}`}
        </ModalHeader>
        <ModalBody>
          <RequestCommandResponseModal rowData={props.rowData} />
          {/* <h3>Hlww Command Response</h3> */}
        </ModalBody>
      </Modal>
    </>
  );
};

export default SampleTestMetersModal;
