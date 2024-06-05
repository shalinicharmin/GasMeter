import {
  Button,
  Col,
  InputGroup,
  InputGroupAddon,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from 'reactstrap';
import DataTabled from '../../../../../../ui-elements/dataTableUpdated';
import { useState, useEffect } from 'react';
import useJwt from '@src/auth/jwt/useJwt';
import { toast } from 'react-toastify';
import Loader from '@src/views/project/misc/loader';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import MeterLevelBloackloadSla from './meterLevelBloackloadSla';
import { caseInsensitiveSort } from '@src/views/utils.js';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';

const Blockload = () => {
  const location = useLocation();
  const [page, setpage] = useState(0);
  const [respose, setResponse] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [centeredModal, setCenteredModal] = useState(false);
  const [rowData, setRowData] = useState();

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

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  // const defaultdate = `${currentYear}-${currentMonth}`
  const date = new Date(currentYear, parseInt(currentMonth, 10) - 1); // Month is 0-indexed
  // Format the date as "Month Year" (e.g., "August 2023")
  const formattedMonth = date.toLocaleString('default', { month: 'long' });
  const defaultdate = {
    year: currentYear,
    month: formattedMonth,
  };
  const [selectedDate, setSelectedDate] = useState(
    `${currentYear}-${currentMonth}`
  );
  const [submittedValues, setSubmittedtValues] = useState(defaultdate);

  const [selected_project, set_selected_project] = useState(undefined);
  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  );
  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !==
        currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project);
      setSelectedDate(`${currentYear}-${currentMonth}`);
      setSubmittedtValues(defaultdate);
      setFetchingData(true);
      setRetry(true);
      setError(false);
    }
  }

  // to fetch site level Blocload Sla
  const fetchData = async (params) => {
    return await useJwt
      .getBlockLoadSla(params)
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
    if (fetchingData || retry) {
      setLoader(true);
      let params = undefined;
      if (!selectedDate) {
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
        };
      } else {
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
          ...submittedValues,
        };
      }
      //   console.log(params)
      const [statusCode, response] = await fetchData(params);
      if (statusCode === 200) {
        try {
          const DataResponse = [];
          for (let i = 0; i < response.data.data.result.length; i++) {
            const site = response.data.data.result[i];
            const slaData = site.sla_data.data;
            const values = {
              Site_Name: site.site_name,
              site_id: site.site_id,
              Total_Meters: site.total_meter,
              year: submittedValues.year,
            };
            //to create the days according to selected month
            for (let day = 1; day <= slaData.length; day++) {
              values[`${submittedValues.month} ${day}`] = slaData[day - 1];
            }
            DataResponse.push(values);
          }
          setResponse(DataResponse);
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
    setLoader(false);
  }, [fetchingData, retry, selectedDate]);

  // To open modal
  const rowModalData = () => {
    setCenteredModal(!centeredModal);
  };

  //on cell click function
  const onCellClick = (row, columnName) => {
    // console.log(row, columnName)
    setRowData({ row, columnName });
    const cellValue = row[columnName];
    rowModalData();
    // console.log(columnName, cellValue)
  };

  const tblColumn = () => {
    const column = [];
    const custom_width = ['create_time'];
    for (const i in respose[0]) {
      const col_config = {};
      if (i !== 'id' && i !== 'site_id' && i !== 'year') {
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
          col_config.width = '150px';
        }
        col_config.cell = (row) => {
          return (
            <div
              className={`d-flex font-weight-bold w-100 ${
                i !== 'Site_Name'
                  ? 'align-items-center justify-content-start h-100'
                  : '  '
              }`}
              onClick={() => {
                if (i !== 'Total_Meters' && i !== 'Site_Name') {
                  if (row[i] !== 'NA') {
                    onCellClick(row, i);
                  } else {
                    toast.warning(
                      <Toast msg="No Data Available" type="warning" />,
                      {
                        hideProgressBar: true,
                      }
                    );
                  }
                }
              }}
            >
              {row[i]}
            </div>
          );
        };
        column.push(col_config);
      }
    }
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

  // on month selection
  const handleMonthChange = (event) => {
    setSelectedDate(event.target.value);
    // console.log(event.target.value)
  };

  // on Submit function
  const onSubmitMonth = (e) => {
    e.preventDefault();
    if (selectedDate) {
      const [year, month] = selectedDate.split('-');
      // Create a new Date object with the extracted values
      const date = new Date(year, parseInt(month, 10) - 1); // Month is 0-indexed
      // Format the date as "Month Year" (e.g., "August 2023")
      const formattedMonth = date.toLocaleString('default', { month: 'long' });
      const formattedYear = date.getFullYear();
      const formattedDateString = {
        year: formattedYear,
        month: formattedMonth,
      };
      setSubmittedtValues(formattedDateString);
      setRetry(true);
      setFetchingData(true);
    } else {
      toast.error(<Toast msg="Please select month and year" type="danger" />, {
        hideProgressBar: true,
      });
    }
  };

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  const refresh = () => {
    setpage(0);
    setError(false);
    setRetry(true);
  };

  return (
    <>
      <Row>
        <Col lg="4">
          {/*To select month  */}
          <InputGroup>
            <input
              type="month"
              id="monthInput"
              value={selectedDate}
              onChange={handleMonthChange}
              className="px-3 form-control border-primary rounded cursor-pointer"
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
        </Col>
      </Row>

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
              tblData={respose}
              tableName={'Site Level | BlockLoad SLA Report'}
              // handleRowClick={onCellClick}
              pointerOnHover
              refresh={refresh}
            />
          </div>
        )
      )}

      <Modal
        isOpen={centeredModal}
        toggle={rowModalData}
        className={`modal-xl modal-dialog-centered`}
      >
        <ModalHeader toggle={rowModalData}>
          {rowData && rowData.columnName && rowData.row.Site_Name
            ? `${rowData.columnName} , ${rowData.row.Site_Name}`
            : ''}
        </ModalHeader>
        <ModalBody>
          <MeterLevelBloackloadSla rowData={rowData} />
        </ModalBody>
      </Modal>
    </>
  );
};

export default Blockload;
