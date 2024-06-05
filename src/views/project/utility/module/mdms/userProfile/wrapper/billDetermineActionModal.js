import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import SimpleDataTablePaginated from '@src/views/ui-elements/dtTable/simpleTablePaginated';
import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable';
import { Eye } from 'react-feather';
import { useEffect, useState } from 'react';
import CreateTable from '@src/views/ui-elements/dtTable/createTable';
import useJwt from '@src/auth/jwt/useJwt';
import Loader from '@src/views/project/misc/loader';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import { useSelector, useDispatch } from 'react-redux';

import { useLocation, useHistory } from 'react-router-dom';
import authLogout from '../../../../../../../auth/jwt/logoutlogic';
import { caseInsensitiveSort } from '@src/views/utils.js';

const BillDetermineActionModal = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const [fetchingData, setFetchingData] = useState(true);
  const [histyData, setHistyData] = useState();
  const [centeredModal, setCenteredModal] = useState(false);
  const [response, setResponse] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const projectName =
    location.pathname.split('/')[2] === 'sbpdcl'
      ? 'ipcl'
      : location.pathname.split('/')[2];
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  );

  const fetchEventHistory = async (params) => {
    return await useJwt
      .getPullBasedTamperEvent(params)
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
    const params = {
      page: currentPage,
      meter: HierarchyProgress.meter_serial_number,
      project: projectName,
      start_date: props.eventHistoryStartTime,
      end_date: props.eventHistoryEndTime,
      tamperd: '1',
    };
    const [statusCode, resp] = await fetchEventHistory(params);
    if (statusCode === 200) {
      setResponse(resp.data.data.result.results);
      setFetchingData(false);
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true);
    }
  }, [fetchingData, props.isOpen]);

  const tblColumn1 = () => {
    const column = [];

    for (const i in response.push_data[0]) {
      const col_config = {};
      if (i !== 'data' && i !== 'meter_id') {
        col_config.id = i;
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replace(
          '_',
          ' '
        );
        col_config.serch = i;
        col_config.sortable = true;
        col_config.selector = (row) => row[i];
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);
        // col_config.selector = i
        col_config.style = {
          minHeight: '40px',
          maxHeight: '40px',
        };
        col_config.width =
          i === 'meter_id'
            ? '100px'
            : i === 'event_message'
            ? '400px'
            : i === 'event_code'
            ? '120px'
            : '';

        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              {row[i] ? (
                <span
                  className="d-block font-weight-bold text-truncate cursor-pointer"
                  title={
                    row[i].toString().length >
                    (props.txtLen ? props.txtLen : 10)
                      ? row[i]
                      : ''
                  }
                >
                  {row[i]
                    .toString()
                    .substring(0, props.txtLen ? props.txtLen : 10)}{' '}
                  {row[i].toString().length > (props.txtLen ? props.txtLen : 10)
                    ? '...'
                    : ''}
                </span>
              ) : (
                <span className="d-block font-weight-bold text-truncate cursor-pointer">
                  {' '}
                  -{' '}
                </span>
              )}
            </div>
          );
        };
        column.push(col_config);
      }
    }

    const showData = async (row) => {
      let data = '';
      if (row.data && row.event_code) {
        data = JSON.parse(row.data);
      } else if (row.event_message && !row.event_code) {
        data = JSON.parse(row.event_message);
      }

      if (data) {
        Array.isArray(data) ? setHistyData(data) : setHistyData([data]);
        setCenteredModal(true);
      } else {
        toast.error(<Toast msg="No data found." type="danger" />, {
          hideProgressBar: true,
        });
      }
    };
    // column.push({
    //   name: 'Action',
    //   maxWidth: '100px',
    //   style: {
    //     minHeight: '40px',
    //     maxHeight: '40px'
    //   },
    //   cell: row => {
    //     return <Eye size='20' className={row.data ? 'ml-1 cursor-pointer' : 'd-none'} onClick={() => showData(row)} />
    //   }
    // })

    return column;
  };

  const tblColumn2 = () => {
    const column = [];

    for (const i in response.pull_data[0]) {
      const col_config = {};
      if (i !== 'data') {
        col_config.id = i;
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replace(
          '_',
          ' '
        );
        col_config.serch = i;
        col_config.sortable = true;
        col_config.selector = (row) => row[i];
        // col_config.selector = i
        col_config.style = {
          minHeight: '40px',
          maxHeight: '40px',
        };
        col_config.width =
          i === 'meter_id'
            ? '100px'
            : i === 'event_message'
            ? '400px'
            : i === 'event_code'
            ? '120px'
            : '';

        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              {row[i] ? (
                <span
                  className="d-block font-weight-bold text-truncate cursor-pointer"
                  title={
                    row[i].toString().length >
                    (props.txtLen ? props.txtLen : 10)
                      ? row[i]
                      : ''
                  }
                >
                  {row[i]
                    .toString()
                    .substring(0, props.txtLen ? props.txtLen : 10)}{' '}
                  {row[i].toString().length > (props.txtLen ? props.txtLen : 10)
                    ? '...'
                    : ''}
                </span>
              ) : (
                <span className="d-block font-weight-bold text-truncate cursor-pointer">
                  {' '}
                  -{' '}
                </span>
              )}
            </div>
          );
        };
        column.push(col_config);
      }
    }

    const showData = async (row) => {
      let data = '';
      if (row.data && row.event_code) {
        data = JSON.parse(row.data);
      } else if (row.event_message && !row.event_code) {
        data = JSON.parse(row.event_message);
      }

      if (data) {
        Array.isArray(data) ? setHistyData(data) : setHistyData([data]);
        setCenteredModal(true);
      } else {
        toast.error(<Toast msg="No data found." type="danger" />, {
          hideProgressBar: true,
        });
      }
    };
    column.push({
      name: 'Action',
      maxWidth: '100px',
      style: {
        minHeight: '40px',
        maxHeight: '40px',
      },
      cell: (row) => {
        return (
          <Eye
            size="20"
            className={row.data ? 'ml-1 cursor-pointer' : 'd-none'}
            onClick={() => showData(row)}
          />
        );
      },
    });

    return column;
  };

  const onNextPageClicked = (number) => {
    setCurrentPage(number + 1);
    setFetchingData(true);
  };

  // const reloadData = () => {
  //   setCurrentPage(1)
  //   setFetchingData(true)
  // }

  return (
    <>
      <Modal
        isOpen={props.isOpen}
        toggle={() => props.handleModal(!props.isOpen)}
        className={`modal-xl modal-dialog-centered`}
      >
        <ModalHeader toggle={() => props.handleModal(!props.isOpen)}>
          Tamper events data
        </ModalHeader>
        <ModalBody>
          {fetchingData ? (
            <Loader hight="min-height-600" />
          ) : (
            <>
              <SimpleDataTable
                columns={tblColumn2()}
                tblData={response.pull_data}
                defaultSortFieldId="datetime"
                rowCount={10}
                tableName={'Pull tampered data'}
              />
              <SimpleDataTable
                columns={tblColumn1()}
                tblData={response.push_data}
                additional_columns={['meter_id']}
                defaultSortFieldId="datetime"
                rowCount={10}
                tableName={'Push tampered data'}
              />
            </>
            // <SimpleDataTablePaginated
            //   columns={tblColumn()}
            //   tblData={response}
            //   rowCount={10}
            //   height={props.height ? props.height : false}
            //   tableName={props.title}
            //   // refresh={reloadData}
            //   currentPage={currentPage}
            //   totalCount={totalCount}
            //   onNextPageClicked={onNextPageClicked}
            // />
          )}
        </ModalBody>
      </Modal>

      <Modal
        isOpen={centeredModal}
        toggle={() => setCenteredModal(!centeredModal)}
        className={`modal-xl modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
          Event History data
        </ModalHeader>
        <ModalBody>
          <CreateTable
            data={histyData}
            height="max"
            tableName="Event History data"
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default BillDetermineActionModal;
