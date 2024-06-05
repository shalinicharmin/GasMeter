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
import moment from 'moment';
import { useLocation, useHistory } from 'react-router-dom';
import authLogout from '../../../../../../../auth/jwt/logoutlogic';

import { caseInsensitiveSort } from '@src/views/utils.js';

const EventHistoryModal = (props) => {
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

  const [page1, setpage1] = useState(0);
  const [page2, setpage2] = useState(0);

  const projectName =
    location.pathname.split('/')[2] === 'sbpdcl'
      ? 'ipcl'
      : location.pathname.split('/')[2];
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  );

  let user_name = '';
  let meter_serial = '';
  if (HierarchyProgress && HierarchyProgress.user_name) {
    user_name = HierarchyProgress.user_name;
    meter_serial = HierarchyProgress.meter_serial_number;
  }

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
      start_date: '',
      end_date: '',
      tamperd: '',
    };
    // console.log(params)
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
    //   name: "Response Time",
    //   cell: (row) => {
    //     console.log(row)

    //     const timeDifferenceInSeconds = moment(row.reporting_timestamp).diff(
    //       row.datetime,
    //       "seconds"
    //     )
    //     const hours = Math.floor(timeDifferenceInSeconds / 3600)
    //     const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60)
    //     const seconds = timeDifferenceInSeconds % 60

    //     return `${hours ? hours.toString().concat(hours === 1 ? " hr" : " hrs") : ""} ${
    //       minutes ? minutes.toString().concat(" min") : ""
    //     } ${seconds.toString().concat(" sec")}`
    //   }
    // })
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
    column.unshift({
      name: 'Sr',
      width: '90px',
      cell: (row, i) => {
        return (
          <div className="d-flex  justify-content-center">
            {page1 * 10 + 1 + i}
          </div>
        );
      },
    });

    return column;
  };

  const tblColumn2 = () => {
    const column = [];

    for (const i in response.pull_data[0]) {
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
    //   name: "Response Time",
    //   cell: (row) => {
    //     console.log(row)

    //     const timeDifferenceInSeconds = moment(row.reporting_timestamp).diff(
    //       row.datetime,
    //       "seconds"
    //     )
    //     const hours = Math.floor(timeDifferenceInSeconds / 3600)
    //     const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60)
    //     const seconds = timeDifferenceInSeconds % 60

    //     return `${hours ? hours.toString().concat(hours === 1 ? " hr" : " hrs") : ""} ${
    //       minutes ? minutes.toString().concat(" min") : ""
    //     } ${seconds.toString().concat(" sec")}`
    //   }
    // })

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
            className={row.data ? 'ml_9 cursor-pointer text-primary' : 'd-none'}
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
            {page2 * 10 + 1 + i}
          </div>
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
        toggle={() => props.handleModalState(!props.isOpen)}
        scrollable
        className="modal_size"
      >
        <ModalHeader toggle={() => props.handleModalState(!props.isOpen)}>
          {props.title}
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
                currentpage={page2}
                ispagination
                selectedPage={setpage2}
                tableName={'Pull data'.concat('(', meter_serial, ')')}
              />
              <SimpleDataTable
                columns={tblColumn1()}
                tblData={response.push_data}
                additional_columns={['meter_id']}
                defaultSortFieldId="datetime"
                rowCount={10}
                currentpage={page1}
                ispagination
                selectedPage={setpage1}
                tableName={'Push data'.concat('(', meter_serial, ')')}
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

export default EventHistoryModal;

// // ************************************** Old code ***********************************************
// // This is commented because this was showing only pull event data

// import { Modal, ModalHeader, ModalBody } from 'reactstrap'
// import SimpleDataTablePaginated from '@src/views/ui-elements/dtTable/simpleTablePaginated'
// import { Eye } from 'react-feather'
// import { useEffect, useState } from 'react'
// import CreateTable from '@src/views/ui-elements/dtTable/createTable'
// import useJwt from '@src/auth/jwt/useJwt'
// import Loader from '@src/views/project/misc/loader'
// import { toast } from 'react-toastify'
// import Toast from '@src/views/ui-elements/cards/actions/createToast'
// import { useSelector } from 'react-redux'

// const EventHistoryModal = props => {
//   const [fetchingData, setFetchingData] = useState(true)
//   const [histyData, setHistyData] = useState()
//   const [centeredModal, setCenteredModal] = useState(false)
//   const [response, setResponse] = useState([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalCount, setTotalCount] = useState(120)

//   const projectName = location.pathname.split('/')[2] === 'sbpdcl' ? 'ipcl' : location.pathname.split('/')[2]
//   const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)

//   const fetchEventHistory = async params => {
//     return await useJwt
//       .getPullBasedEvent(params)
//       .then(res => {
//         const status = res.status
//         return [status, res]
//       })
//       .catch(err => {
//         const status = 0
//         return [status, err]
//       })
//   }

//   useEffect(async () => {
//     const params = {
//       page: currentPage,
//       meter: HierarchyProgress.meter_serial_number,
//       project: projectName
//     }
//     const [statusCode, resp] = await fetchEventHistory(params)
//     if (statusCode === 200) {
//       // if (resp.data.data.result.results.length > 0) {
//       //   setResponse(resp.data.data.result.results)
//       //   setTotalCount(resp.data.data.result.count)
//       // } else {
//       //   toast.error(<Toast msg='No data found.' type='danger' />, { hideProgressBar: true })
//       //   props.handleModalState(!props.isOpen)
//       // }
//       setResponse(resp.data.data.result.results)
//       setTotalCount(resp.data.data.result.count)
//       setFetchingData(false)
//     }
//   }, [fetchingData, props.isOpen])

//   const tblColumn = () => {
//     const column = []

//     for (const i in response[0]) {
//       const col_config = {}
//       if (i !== 'data') {
//         col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replace('_', ' ')
//         col_config.serch = i
//         col_config.sortable = true
//         col_config.selector = row => row[i]
//         col_config.style = {
//           minHeight: '40px',
//           maxHeight: '40px'
//         }
//         col_config.width = i === 'meter_id' ? '100px' : i === 'event_message' ? '400px' : i === 'event_code' ? '120px' : ''

//         col_config.cell = row => {
//           return (
//             <div className='d-flex'>
//               <span
//                 className='d-block font-weight-bold text-truncate cursor-pointer'
//                 onClick={() => handleRowClick(row.id, row.connection_type, row.meter_serial, 'pss')}
//                 title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
//                 {row[i] && row[i] !== '' ? row[i].toString().substring(0, 10) : '-'}
//                 {row[i] && row[i] !== '' ? (row[i].toString().length > 10 ? '...' : '') : '-'}
//               </span>
//             </div>
//           )
//         }
//         column.push(col_config)
//       }
//     }

//     const showData = async row => {
//       if (Object.keys(row.data).length > 0) {
//         setHistyData([row.data])
//         setCenteredModal(true)
//       } else {
//         toast.error(<Toast msg='No data found.' type='danger' />, { hideProgressBar: true })
//       }
//     }
//     column.push({
//       name: 'Action',
//       maxWidth: '100px',
//       style: {
//         minHeight: '40px',
//         maxHeight: '40px'
//       },
//       cell: row => {
//         return <Eye size='20' className='ml-1 cursor-pointer' onClick={() => showData(row)} />
//       }
//     })

//     return column
//   }

//   const onNextPageClicked = number => {
//     setCurrentPage(number + 1)
//     setFetchingData(true)
//   }

//   // const reloadData = () => {
//   //   setCurrentPage(1)
//   //   setFetchingData(true)
//   // }

//   return (
//     <>
//       <Modal isOpen={props.isOpen} toggle={() => props.handleModalState(!props.isOpen)} scrollable className='modal_size'>
//         <ModalHeader toggle={() => props.handleModalState(!props.isOpen)}>{props.title}</ModalHeader>
//         <ModalBody>
//           {fetchingData ? (
//             <Loader hight='min-height-600' />
//           ) : (
//             <SimpleDataTablePaginated
//               columns={tblColumn()}
//               tblData={response}
//               rowCount={10}
//               height={props.height ? props.height : false}
//               tableName={props.title}
//               // refresh={reloadData}
//               currentPage={currentPage}
//               totalCount={totalCount}
//               onNextPageClicked={onNextPageClicked}
//             />
//           )}
//         </ModalBody>
//       </Modal>

//       <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal-xl modal-dialog-centered`}>
//         <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Event History data</ModalHeader>
//         <ModalBody>
//           <CreateTable data={histyData} height='max' tableName='Event History data' />
//         </ModalBody>
//       </Modal>
//     </>
//   )
// }

// export default EventHistoryModal
