import {
  Badge,
  Button,
  Col,
  InputGroup,
  InputGroupAddon,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';

import { useState, useEffect } from 'react';
import useJwt from '@src/auth/jwt/useJwt';
import { toast } from 'react-toastify';
import Loader from '@src/views/project/misc/loader';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
// import MeterLevelBloackloadSla from "./meterLevelBloackloadSla"
import { caseInsensitiveSort } from '@src/views/utils.js';
import { useSelector, useDispatch } from 'react-redux';
import DataTabled from '../../../../ui-elements/dataTableUpdated';
import { Download, Eye, Plus } from 'react-feather';
import CreateSatProjectModal from './createSatProjectModal';
import UploadedCsvMetersModal from './uploadedCsvMetersModal';
import authLogout from '../../../../../auth/jwt/logoutlogic';
import { useHistory } from 'react-router-dom';

const CreateSatProject = (props) => {
  const [page, setpage] = useState(0);
  const [respose, setResponse] = useState([]);

  const [fetchingData, setFetchingData] = useState(true);
  const [centeredModal, setCenteredModal] = useState(false);
  const [meterModal, setMeterModal] = useState(false);
  const [rowData, setRowData] = useState();
  const [rowId, setrowId] = useState(null);

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [loader, setLoader] = useState(false);
  // Logout User
  const [logout, setLogout] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

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
      setpage(0);
      setFetchingData(true);
      setRetry(true);
      setError(false);
    }
  }

  // to fetch Sat test cycles data
  const fetchData = async (params) => {
    return await useJwt
      .getTestcycles(params)
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
      const params = undefined;

      //   console.log(params)
      const [statusCode, response] = await fetchData(params);
      if (statusCode === 200) {
        try {
          const res = response.data;
          setResponse(res);
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

  // To open modal
  const testCycleModal = () => {
    setCenteredModal(!centeredModal);
  };
  const rowModalData = () => {
    setMeterModal(!meterModal);
  };

  const tblColumn = () => {
    const column = [];
    const customWidths = {
      fileName: '180px',
      createdAt: '180px',
      updatedAt: '180px',
    };
    const customPositions = {
      projectName: 2,
      id: 1,
      fileName: 4,
      createdAt: 6,
      updatedAt: 7,
      metersCount: 3,
      Meters: 5,
    };
    for (const i in respose[0]) {
      const col_config = {};
      {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.reorder = true;
        col_config.position = customPositions[i] || 1000;
        col_config.width = customWidths[i];
        col_config.minWidth = customWidths[i] || '130px';
        col_config.selector = (row) => row[i];
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);

        col_config.cell = (row) => {
          if (i === 'fileName') {
            return (
              <div className="font-weight-bold w-100">
                {row[i]
                  ? `${row[i].slice(0, 10)}...'${row[i].slice(-10)}`
                  : '--'}
              </div>
            );
          }
          return (
            <div
              className={`d-flex font-weight-bold w-100 `}
              data-tag="allowRowEvents"
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

    column.splice(4, 0, {
      name: 'Meters',
      width: '120px',
      cell: (row) => {
        return (
          <Badge
            pill
            color="light-primary"
            className=" cursor-pointer"
            onClick={() => {
              setRowData(row);
              rowModalData();
            }}
          >
            Preview
          </Badge>
        );
      },
    });
    const sortedColumns = column.sort((a, b) => {
      if (a.position < b.position) {
        return -1;
      } else if (a.position > b.position) {
        return 1;
      }
      return 0;
    });
    return sortedColumns;
  };

  const onRowClicked = (row) => {
    props.setRow(row);
    props.stepper.next();
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
        <Col>
          <Button.Ripple
            color="primary"
            type=""
            onClick={() => testCycleModal()}
            className="float-right mb-1"
          >
            {/* <Plus size={14} /> */}
            <span className="align-middle ml-25 " id="new_cyclw">
              New Test Cycle
            </span>
          </Button.Ripple>
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
            tblData={respose}
            tableName={'Test Cycles'}
            // handleRowClick={onCellClick}
            pointerOnHover
            refresh={refresh}
            donotShowDownload={true}
            handleRowClick={onRowClicked}
          />
        )
      )}
      <Modal
        isOpen={centeredModal}
        toggle={testCycleModal}
        className={`modal-lg modal-dialog-centered`}
      >
        <ModalHeader toggle={testCycleModal}>Test Cycle Creation</ModalHeader>
        <ModalBody>
          <CreateSatProjectModal
            setCenteredModal={setCenteredModal}
            setRetry={setRetry}
          />
          {/* <MeterLevelBloackloadSla rowData={rowData} /> */}
        </ModalBody>
      </Modal>

      <Modal
        isOpen={meterModal}
        toggle={rowModalData}
        className={`modal-lg modal-dialog-centered`}
      >
        <ModalHeader toggle={rowModalData}>
          Uploaded Meters From CSV
        </ModalHeader>
        <ModalBody>
          <UploadedCsvMetersModal
            rowModalData={rowModalData}
            rowData={rowData}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default CreateSatProject;
