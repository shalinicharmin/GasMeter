import {
  Row,
  Col,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalHeader,
  Badge,
  CardHeader,
  Spinner,
  Button,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';
// String to icon tag
import { useRef, useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '@src/views/project/misc/loader';
import useJwt from '@src/auth/jwt/useJwt';
import DataTable from '@src/views/ui-elements/dataTableUpdated';
import { useLocation, useHistory } from 'react-router-dom';
import authLogout from '@src/auth/jwt/logoutlogic';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import { DollarSign, TrendingUp } from 'react-feather';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';

const PrepaidRechargeHistory = (props) => {
  const location = useLocation();
  const { row } = props;

  // console.log('Row Data ......')
  // console.log(props.row)
  const dispatch = useDispatch();
  const history = useHistory();

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [rechargeData, setRechargeData] = useState([]);

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [rechargeReceipt, setRechargeReceipt] = useState({});
  const [fetchingData, setFetchingData] = useState(true);
  const [page, setpage] = useState(0);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  // const defaultdate = `${currentYear}-${currentMonth}`
  const defaultdate = {
    year: currentYear,
    month: currentMonth,
  };
  const [selectedDate, setSelectedDate] = useState(
    `${currentYear}-${currentMonth}`
  );
  const [submittedValues, setSubmittedtValues] = useState(defaultdate);

  const inputRef = useRef(null);
  // const dispatch = useDispatch()
  const response = useSelector(
    (state) => state.UtilityMdmsConsumerTotalRechargeReducer
  );
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  );
  const selected_month = useSelector((state) => state.calendarReducer.month);

  const fetchData = async (params) => {
    return await useJwt
      .getUserWalletInformationMDMSModule(params)
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

  const fetchRechargeHistoryData = async (params) => {
    return await useJwt
      .getUserRechargeHistoryMDMSModule(params)
      .then((res) => {
        const status = res.status;
        // console.log(res)
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
    if (!response || response.callAPI || retry) {
      let params = undefined;
      if (!selectedDate) {
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
          substation: row.pss_name,
          feeder: row.feeder_name,
          dtr: row.site_name,
          sc_no: row.sc_no,
          year: selected_month.year,
          month: selected_month.month,
        };
      } else {
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
          substation: row.pss_name,
          feeder: row.feeder_name,
          dtr: row.site_name,
          sc_no: row.sc_no,
          year: submittedValues.year,
          month: submittedValues.month,
        };
      }

      const [statusCode, response] = await fetchData(params);
      if (statusCode) {
        if (statusCode === 200) {
          setRechargeData(response.data.data.result.stat);
          setRetry(false);
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true);
        } else {
          setRetry(false);
          setError(true);
          setErrorMessage('Network Error, please retry');
        }
      }
    }
  }, [response, retry]);

  useEffect(async () => {
    if (fetchingData || retry) {
      let params = undefined;
      if (!submittedValues && !selectedDate) {
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
          substation: row.pss_name,
          feeder: row.feeder_name,
          dtr: row.site_name,
          sc_no: row.sc_no,
          year: selected_month.year,
          month: selected_month.month,
        };
      } else {
        console.log(submittedValues, 'gft5dgters');
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
          substation: row.pss_name,
          feeder: row.feeder_name,
          dtr: row.site_name,
          sc_no: row.sc_no,
          year: submittedValues.year,
          month: submittedValues.month,
        };
      }
      const [statusCode, response] = await fetchRechargeHistoryData(params);
      if (statusCode === 200) {
        try {
          setRechargeHistory(response.data.data.result.stat);
          setRechargeReceipt(response.data.data.result.stat[0]);
          // setFetchRechargeHistory(false)
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
    }
  }, [fetchingData, retry, selectedDate]);

  // const handleRechargeItemClicked = position => {
  //   setRechargeReceipt(rechargeHistory[position])
  // }

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  const tblColumn = () => {
    const column = [];
    if (rechargeHistory.length > 0) {
      for (const i in rechargeHistory[0]) {
        const col_config = {};
        if (i !== 'id' && i !== 'status') {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
            1
          )}`.replaceAll('_', ' ');
          col_config.serch = i;
          col_config.sortable = true;
          col_config.selector = (row) => row[i];
          col_config.sortFunction = (rowA, rowB) =>
            caseInsensitiveSort(rowA, rowB, i);
          col_config.cell = (row) => {
            return (
              <div className="d-flex">
                <span
                  className="d-block font-weight-bold cursor-pointer "
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
                  {row[i]
                    ? row[i] && row[i] !== ''
                      ? row[i].toString().substring(0, 25)
                      : '-'
                    : '-'}
                  {row[i]
                    ? row[i] && row[i] !== ''
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
      column.push({
        name: 'Status',
        width: '120px',
        cell: (row) => {
          if (row.status === 'success') {
            return (
              <>
                <Badge pill color="light-success" className="">
                  {row.status}
                </Badge>
              </>
            );
          } else if (row.status === 'In_Progress') {
            return (
              <>
                <Badge pill color="light-warning" className="">
                  {row.status}
                </Badge>
              </>
            );
          } else if (row.status === 'Failed') {
            return (
              <>
                <Badge pill color="light-danger" className="">
                  {row.status}
                </Badge>
              </>
            );
          }
        },
      });
      column.unshift({
        name: 'Sr No.',
        width: '70px',
        cell: (row, i) => {
          return (
            <div className="d-flex  justify-content-center">
              {page * 10 + 1 + i}
            </div>
          );
        },
      });
    }
    return column;
  };

  const handleMonthChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const onSubmitMonth = (e) => {
    e.preventDefault();
    if (selectedDate) {
      const selectedMonth =
        selectedDate &&
        selectedDate.toLocaleString('default', {
          year: 'numeric',
          month: 'numeric',
        });
      const [year, month] = selectedMonth.split('-');
      const values = {
        year,
        month,
      };
      setSubmittedtValues(values);
      setRetry(true);
      setFetchingData(true);
    } else {
      toast.error(<Toast msg="Please select month" type="danger" />, {
        hideProgressBar: true,
      });
    }
  };

  return (
    <>
      <Row>
        {rechargeData &&
          rechargeData.map((ele) => {
            if (ele.value) {
              return (
                <>
                  <Col lg="3" key={ele.id}>
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
                        {fetchingData ? (
                          <Loader />
                        ) : (
                          <Card className="p-0">
                            <CardBody className="p-0 m-0">
                              <div className="d-flex justify-content-between align-items-center px-2 ">
                                <div className="m_5">
                                  <h2 className="font-weight-bolder mb-0">
                                    {ele.value}
                                  </h2>
                                  <p className="card-text ">{ele.title}</p>
                                </div>
                                {ele.title === 'Recharge Amount' ? (
                                  <TrendingUp
                                    size={25}
                                    className="text-success"
                                  />
                                ) : (
                                  <DollarSign
                                    size={25}
                                    className="text-primary"
                                  />
                                )}
                              </div>
                            </CardBody>
                          </Card>
                        )}
                      </>
                    )}
                  </Col>
                </>
              );
            }
          })}

        <Col>
          <div className="float-right ">
            <InputGroup>
              <input
                type="month"
                id="monthInput"
                value={selectedDate}
                onChange={handleMonthChange}
                className="px-2 border-primary rounded cursor-pointer d-block-none"
                placeholder="select Month..."
                min={`2000-01`} // Minimum year and month
                max={`${currentYear}-${currentMonth}`}
              />
              <InputGroupAddon addonType="append">
                <Button
                  type="submit"
                  color="primary"
                  outline
                  onClick={onSubmitMonth}
                >
                  Submit
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </Col>
      </Row>

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
          {fetchingData ? (
            <Loader hight="min-height-484" />
          ) : (
            <DataTable
              columns={tblColumn(rechargeHistory)}
              tblData={rechargeHistory}
              rowCount={10}
              tableName={'Recharge history'}
              currentpage={page}
              ispagination
              selectedPage={setpage}
              // extras={formControl()}
            />
          )}
        </>
      )}
    </>
  );
};

export default PrepaidRechargeHistory;
