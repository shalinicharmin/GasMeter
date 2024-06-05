import React, { useState, useEffect } from 'react';
import useJwt from '@src/auth/jwt/useJwt';
import DataTabled from '../../../../../../ui-elements/dataTableUpdated';
import { caseInsensitiveSort } from '@src/views/utils.js';
import Loader from '@src/views/project/misc/loader';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import moment from 'moment';
import { useLocation } from 'react-router-dom';

const MeterLevelBloackloadSla = (props) => {
  const location = useLocation();
  const { rowData } = props;
  // console.log(props)
  const [page, setpage] = useState(0);
  const [response, setResponse] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [loader, setLoader] = useState(false);

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  //to get meter level blockload sla
  const fetchData = async (params) => {
    return await useJwt
      .getMeterLevelBlockLoadSla(params)
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

  // to get month number function
  function getMonthNumber(monthName) {
    const monthNames = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };

    return monthNames[monthName];
  }

  // to get date in year-month-day format function
  function formatDate(year, month, day) {
    const date = new Date(year, month - 1, day);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  const inputDate = rowData.columnName;
  const year = rowData.row.year;
  const [monthName, day] = inputDate.split(' ');
  const month = getMonthNumber(monthName);
  const formattedDate = formatDate(year, month, parseInt(day));
  // console.log(formattedDate)

  // function to generate  15 min time intervals
  function generateTimeIntervals(startString, endString) {
    const start = moment(startString, 'YYYY-MM-DD HH:mm:ss');
    const end = moment(endString, 'YYYY-MM-DD HH:mm:ss');

    // Round starting minutes up to nearest 15 (12 --> 15, 17 --> 30)
    start.minutes(Math.ceil(start.minutes() / 15) * 15);

    // hash map to create key values pair of time intervals
    const intervalMap = new Map();
    const current = moment(start);

    while (current <= end) {
      intervalMap.set(current.format('YYYY-MM-DD HH:mm:ss'), 1);
      current.add(15, 'minutes');
    }

    return intervalMap;
  }

  useEffect(async () => {
    if (fetchingData || retry) {
      setLoader(true);
      let params = undefined;
      params = {
        project:
          location.pathname.split('/')[2] === 'sbpdcl'
            ? 'ipcl'
            : location.pathname.split('/')[2],
        site: rowData.row.site_id,
        date_month: formattedDate,
      };

      const [statusCode, response] = await fetchData(params);

      if (statusCode === 200) {
        const updatedResponse = response.data.data.result.map((item) => {
          const startDatetime = `${formattedDate} 00:00:00`;
          const endDatetime = `${formattedDate} 23:45:00`;
          const intervalMap = generateTimeIntervals(startDatetime, endDatetime);
          const updatedItem = { ...item };
          // console.log(updatedItem)

          intervalMap.forEach((value, timestamp) => {
            if (
              updatedItem.missed_timestamp.timestamp &&
              updatedItem.missed_timestamp.timestamp.includes(timestamp)
            ) {
              updatedItem[timestamp] = 0; // Set value to 0 if timestamp is in missed_timestamp
            } else {
              updatedItem[timestamp] = 1; // Set value to 1 if timestamp is not in missed_timestamp
            }
          });
          return updatedItem;
        });
        // console.log(updatedResponse)
        setResponse(updatedResponse);
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
    const custom_width = ['create_time'];

    for (const i in response[0]) {
      const col_config = {};
      if (
        i !== 'id' &&
        i !== 'missed_timestamp' &&
        i !== 'project' &&
        i !== 'pss_id' &&
        i !== 'site_id' &&
        i !== 'feeder_id' &&
        i !== 'site_name' &&
        i !== 'date_month' &&
        i !== 'date_timestamp'
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.reorder = true;
        // col_config.width = '150px'
        col_config.selector = (row) => row[i];
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);
        if (custom_width.includes(i)) {
          col_config.width = '250px';
        }
        if (i === 'Site_Name') {
          col_config.width = '240px';
        } else {
          col_config.width = '130px';
        }
        if (i !== 'total_miss_count') {
          col_config.conditionalCellStyles = [
            {
              when: (row) => parseInt(row[i]) === 0,
              style: {
                textAlign: 'center',
                color: 'black',
                backgroundColor: '#ff6666',
                textAlign: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                border: '0.5px solid black',
              },
            },
            {
              when: (row) => parseInt(row[i]) === 1,
              style: {
                textAlign: 'center',
                color: 'white',
                backgroundColor: '#95b94e',
                textAlign: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                border: '0.5px solid black',
              },
            },
          ];
        }
        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              <span
                className="d-block font-weight-bold "
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
                {row[i]}
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
            {page * 10 + 1 + i}
          </div>
        );
      },
    });
    return column;
  };

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  return (
    <>
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
            <DataTabled
              rowCount={10}
              currentpage={page}
              ispagination
              selectedPage={setpage}
              columns={tblColumn()}
              tblData={response}
              tableName={'Meter Level | BlockLoad SLA Report'}
              // handleRowClick={onCellClick}
              poiterOnHover
            />
          </div>
        )
      )}
    </>
  );
};

export default MeterLevelBloackloadSla;
