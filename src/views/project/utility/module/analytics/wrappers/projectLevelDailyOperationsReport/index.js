import { Button, Col, Label, Row, UncontrolledTooltip } from 'reactstrap';
import { selectThemeColors } from '@utils';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import { useEffect, useState } from 'react';
import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable';
import {
  formattedDate,
  formattedDateTime,
  timetoIst,
} from '@src/utility/Utils';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import { useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { caseInsensitiveSort } from '@src/views/utils.js';
import authLogout from '../../../../../../../auth/jwt/logoutlogic';
import useJwt from '@src/auth/jwt/useJwt';
import { Download } from 'react-feather';
import Loader from '@src/views/project/misc/loader';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
const DailyReport = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(true);
  const [retryReportRequest, setRetryReportRequest] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  //   const [totalCount, setTotalCount] = useState(0)
  const option = [
    { value: '001', label: 'Daily Data Analysis' },
    { value: '002', label: 'RTC Time Drift' },
    { value: '003', label: 'Communication Report' },
  ];

  const currentDate = formattedDate(new Date());
  const [picker, setPicker] = useState(currentDate);
  const [selectedOption, setSelectedOption] = useState(option[0]);
  const [filterValues, setFilterValues] = useState({
    report_type: option[0].value,
    report_date: currentDate,
  });
  const [response, setResponse] = useState([]);

  const fetchDailyOperationReport = async (params) => {
    return await useJwt
      .getdailyoperationReport(params)
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
  const requestDailyOperationReport = async (params) => {
    return await useJwt
      .getdailyoperationReportRequest(params)
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
    if (retry) {
      let params = {};

      params = {
        project:
          location.pathname.split('/')[2] === 'sbpdcl'
            ? 'ipcl'
            : location.pathname.split('/')[2],
      };

      const [statusCode, response] = await fetchDailyOperationReport(params);
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else if (statusCode === 200) {
        // Set Response Data
        const modifiedResponseData = response.data.data.result.map((item) => {
          const { datetime, ...rest } = item; // Remove "datetime" from the object
          return {
            ...rest,
            report_type:
              rest.report_type === '001'
                ? 'Daily Data Analysis'
                : rest.report_type === '002'
                ? 'RTC Time Drift'
                : rest.report_type === '003'
                ? 'Communication Report'
                : rest.report_type,
            'date time': datetime, // Set "date time" to the value of the removed "datetime"
            request_time: timetoIst(rest.request_time),
          };
        });

        // Set Response Data
        setResponse(modifiedResponseData);
        // setResponse(response.data.data.result)
        // setTotalCount(response.data.data.result.count)
        setRetry(false);
        setError(false);
      } else {
        setRetry(false);
        setError(true);
        setErrorMessage('Network Error, please retry');
      }
    }
  }, [retry]);

  useEffect(async () => {
    if (retryReportRequest) {
      let params = {};
      if (filterValues) {
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
          ...filterValues,
        };
      } else {
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
        };
      }

      const [statusCode, response] = await requestDailyOperationReport(params);
      setRetryReportRequest(false);
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else if (statusCode === 200) {
        setRetry(true);
        toast.success(
          <Toast msg={'Report request accepted.'} type="success" />,
          {
            hideProgressBar: true,
          }
        );
      } else if (statusCode === 406) {
        toast.warning(<Toast msg={'Data not available'} type="warning" />, {
          hideProgressBar: true,
        });
      } else {
        toast.error(
          <Toast msg={'Something went wrong please retry'} type="danger" />,
          {
            hideProgressBar: true,
          }
        );
      }
    }
  }, [retryReportRequest]);

  const onselectionchange = (selected) => {
    setSelectedOption(selected);
  };

  const dateTimeFormat = (inputDate) => {
    return ''.concat(
      inputDate.getFullYear(),
      '-',
      (inputDate.getMonth() + 1).toString().padStart(2, '0'),
      '-',
      inputDate.getDate().toString().padStart(2, '0')
    );
  };

  const onDateRangeSelected = (dateRange) => {
    if (dateRange.length > 0 && dateRange[0]) {
      const formattedDate = dateTimeFormat(dateRange[0]);
      setPicker(formattedDate);
    } else {
      setPicker(currentDate);
    }
  };

  const onSubmit = (e) => {
    // console.log("helllo")
    e.preventDefault();
    if (selectedOption && picker) {
      const formData = {
        report_type: selectedOption.value,
        report_date: picker,
      };
      setFilterValues(formData);
      setRetryReportRequest(true);
      // setRetry(true)
    }
  };

  const tblColumn = () => {
    const column = [];

    if (response) {
      // console.log('REsponse ....')
      // console.log(response)

      for (const i in response[0]) {
        const col_config = {};
        if (
          i !== '_id' &&
          i !== '__v' &&
          i !== 'username' &&
          i !== 'report_url' &&
          i !== 'status'
        ) {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
            1
          )}`.replaceAll('_', ' ');
          col_config.serch = i;
          // col_config.selector = i
          col_config.selector = (row) => row[i];
          col_config.sortFunction = (rowA, rowB) =>
            caseInsensitiveSort(rowA, rowB, i);
          col_config.sortable = true;
          col_config.reorder = true;
          col_config.wrap = true;
          //   col_config.width = "180px"
          col_config.cell = (row) => {
            // console.log('Printing Row ....')
            // console.log(row)

            return (
              <div className="d-flex">
                <span
                  className="d-block font-weight-bold"
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

      column.push({
        name: 'Download ',
        width: '120px',
        cell: (row) => {
          return (
            <>
              <a href={row.report_url}>
                {/* <Badge pill color='light-success' className='' id='success'>
                    {row.status}
                  </Badge> */}
                <Download size={20} className="mx-2 primary" id="success" />
              </a>
              <UncontrolledTooltip placement="top" target="success">
                File is ready to Download
              </UncontrolledTooltip>
            </>
          );
        },
      });
    }
    return column;
  };
  const refresh = () => {
    setCurrentPage(0);
    // setLoadCommandHistory(true)
    setRetry(true);
  };
  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  return (
    <>
      <Row className="mb-1">
        {/*to select report type  */}
        <Col md="3" className="mb-1" sm="12">
          {/* <Label>Clearable</Label> */}
          <Select
            theme={selectThemeColors}
            className="react-select"
            classNamePrefix="select"
            // defaultValue={[1]}
            value={selectedOption}
            name="clear"
            options={option}
            onChange={onselectionchange}
          />
        </Col>
        {/* to select date */}
        <Col md="3" className="mb-1" sm="12">
          <Flatpickr
            value={picker}
            placeholder="Select date ..."
            className="form-control"
            onChange={onDateRangeSelected}
            options={{
              dateFormat: 'Y-m-d',
              maxDate: new Date(),
              defaultDate: new Date(),
            }}
          />
        </Col>
        <Col md="3" className="mb-1">
          <Button
            type="submit"
            color="primary"
            className="px-4"
            onClick={onSubmit}
          >
            Submit
          </Button>
        </Col>
      </Row>
      {retry ? (
        <Loader hight="min-height-400" />
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
          <SimpleDataTable
            columns={tblColumn(response)}
            tblData={response}
            rowCount={10}
            tableName={'Daily Operation Report Request History'}
            refresh={refresh}
            currentPage={currentPage}
            // totalCount={totalCount}
            donotShowDownload={true}
          />
        )
      )}
    </>
  );
};

export default DailyReport;
