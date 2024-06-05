import { useState, useEffect } from 'react';
import Loader from '@src/views/project/misc/loader';
import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable';
import BillDetermineActionModal from '@src/views/project/utility/module/mdms/userProfile/wrapper/billDetermineActionModal';
import { Eye } from 'react-feather';

import useJwt from '@src/auth/jwt/useJwt';

import { useSelector, useDispatch } from 'react-redux';

import { useLocation, useHistory } from 'react-router-dom';
import authLogout from '@src/auth/jwt/logoutlogic';
import { caseInsensitiveSort } from '@src/views/utils.js';
import BillDetermineModal from './billDetermineModal';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

const BillDetermine = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const selected_month = useSelector((state) => state.calendarReducer.month);

  const [centeredModal, setCenteredModal] = useState(false);
  const [eventHistoryStartTime, setEventHistoryStartTime] = useState(undefined);
  const [eventHistoryEndTime, setEventHistoryEndTime] = useState(undefined);

  // Local State to manage Billing Determinant History
  const [BillingDeterminantHistory, setBillingDeterminantHistory] = useState(
    []
  );
  const [fetchingData, setFetchingData] = useState(true);
  const [rowCount, setRowCount] = useState(6);
  const [page, setPage] = useState(0);

  const [loader, setLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(false);

  const { row, title } = props;

  // console.log(row)

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const fetchData = async (params) => {
    return await useJwt
      .getMDMSUserBillingHistoryDeterminant(params)
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
    if (!BillingDeterminantHistory || BillingDeterminantHistory.length <= 0) {
      // Fetch Billing Determinant History
      setLoader(true);
      const params = {
        project:
          location.pathname.split('/')[2] === 'sbpdcl'
            ? 'ipcl'
            : location.pathname.split('/')[2],
        sc_no: row.sc_no,
      };

      const [statusCode, response] = await fetchData(params);

      if (statusCode === 200) {
        // setFetchDailyData(false)
        setBillingDeterminantHistory(response.data.data.result.stat);
        setRetry(false);
        setFetchingData(false);
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
    const custom_width = [
      'BD_GENERATED_TIME',
      'from_datetime',
      'to_datetime',
      'MR_SCHEDULE_DATE',
      'READ_DATE',
      'actual_read_date',
      'MRU',
    ];

    if (BillingDeterminantHistory && BillingDeterminantHistory.length > 0) {
      for (const i in BillingDeterminantHistory[0]) {
        const col_config = {};
        if (i !== 'id' && i !== 'METER_NUMBER') {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
            1
          )}`.replaceAll('_', ' ');
          col_config.serch = i;
          col_config.sortable = true;
          col_config.wrap = true;
          col_config.selector = (row) => row[i];
          col_config.sortFunction = (rowA, rowB) =>
            caseInsensitiveSort(rowA, rowB, i);
          // col_config.selector = i
          col_config.style = {
            minHeight: '40px',
            maxHeight: '40px',
          };
          col_config.width = '100px';

          if (custom_width.includes(i)) {
            col_config.width = '210px';
          }

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
        setEventHistoryStartTime(row['from_datetime']);
        setEventHistoryEndTime(row['to_datetime']);
        setCenteredModal(true);
      };

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
              className="ml_8 cursor-pointer text-primary"
              onClick={() => showData(row)}
            />
          );
        },
      });
      column.unshift({
        name: 'Sr',
        width: '90px',
        cell: (row, i) => {
          return (
            <div className="d-flex  justify-content-center">
              {page * rowCount + 1 + i}
            </div>
          );
        },
      });
      return column;
    }
  };

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  return (
    <div>
      {loader ? (
        <Loader hight="min-height-484" />
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
            columns={tblColumn()}
            tblData={BillingDeterminantHistory}
            rowCount={rowCount}
            currentpage={page}
            ispagination
            selectedPage={setPage}
            additional_columns={['METER_NUMBER']}
            tableName={title.concat('(', row.meter_number, ')')}
            height={true}
          />
        )
      )}
      {/* {fetchingData && <Loader hight='min-height-484' />}
      {!fetchingData && (
        <SimpleDataTable
          columns={tblColumn()}
          tblData={BillingDeterminantHistory}
          rowCount={rowCount}
          currentpage={page}
          ispagination
          selectedPage={setPage}
          additional_columns={['METER_NUMBER']}
          tableName={title.concat('(', row.meter_number, ')')}
          height={true}
        />
      )} */}
      {/* Show All the events for Billing determinants generated for time interval */}
      {centeredModal && (
        <BillDetermineModal
          isOpen={centeredModal}
          handleModal={setCenteredModal}
          eventHistoryStartTime={eventHistoryStartTime}
          eventHistoryEndTime={eventHistoryEndTime}
          row={row}
          txtLen={50}
        />
      )}
    </div>
  );
};

export default BillDetermine;
