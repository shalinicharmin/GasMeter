import { useEffect, useState } from 'react';
import {
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  ModalBody,
  ModalHeader,
  Row,
  Button,
  Modal,
  Badge,
} from 'reactstrap';

import useJwt from '@src/auth/jwt/useJwt';

import { ArrowLeft, Copy, Eye } from 'react-feather';
import Loader from '@src/views/project/misc/loader';

import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

import ConfigreTestSatModal from './configreTestSatModal';
import DataTabled from '../../../../ui-elements/dataTableUpdated';
import { caseInsensitiveSort } from '@src/views/utils.js';
import SampleTestMetersModal from './sampleTestMetersModal';
import CommandExecutionSat from './commandExecutionSat';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import authLogout from '../../../../../auth/jwt/logoutlogic';

import CopyTestConfig from './copyTestConfig';
import TestConfigSampleMeters from './testConfigSampleMeters';

const ConfigureSat = (props) => {
  const [page, setpage] = useState(0);
  const [respose, setResponse] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [rowData, setRowData] = useState([]);
  const [testRowData, setTestRowData] = useState([]);
  const [meterId, setMeterId] = useState('');

  const [testSatModal, setTestSatModal] = useState(false);
  const [updatedTestSatModal, setUpdatedTestSatModal] = useState(false);
  const [sampleMetersTestModal, setSampleMetersTestModal] = useState(false);
  const [commandExecutionModal, setCommandExecutionModal] = useState(false);
  const [testConfigSampleMeters, setTestConfigSampleMeters] = useState([]);
  const [testConfigSampleMetersModal, setTestConfigSampleMetersModal] =
    useState(false);

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [loader, setLoader] = useState(false);

  const [logout, setLogout] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  // to fetch Sat config  data

  const fetchData = async (params) => {
    return await useJwt
      .getTests(params)
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
    if (fetchingData || retry || props.row.id) {
      setLoader(true);
      let params = {};
      params = {};
      if (props.row?.id) {
        params.id = props.row.id;
      } else {
        return;
      }
      //   console.log(params)
      const [statusCode, response] = await fetchData(params);
      if (statusCode === 200) {
        try {
          setResponse(response.data);
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
  }, [fetchingData, retry, props.row?.id]);

  const testConfigModal = () => {
    setTestSatModal(!testSatModal);
  };

  const updatedTestConfigModal = () => {
    setUpdatedTestSatModal(!updatedTestSatModal);
  };

  const sampleMetersModal = () => {
    setSampleMetersTestModal(!sampleMetersTestModal);
  };
  const commandExecution = () => {
    setCommandExecutionModal(!commandExecutionModal);
  };

  const testConfigSampleMeterModal = (row) => {
    setTestConfigSampleMetersModal(!testConfigSampleMetersModal);
  };
  const onRowClicked = (row) => {
    setRowData(row);
    if (row.resultCalculations?.finalResult === 'Not Initiated') {
      setCommandExecutionModal(true);
    } else {
      setSampleMetersTestModal(true);
    }
  };

  const tblColumn = () => {
    const column = [];
    const custom_width = ['create_time'];
    for (const i in respose[0]) {
      const col_config = {};
      if (
        i !== 'sampleCount' &&
        i !== 'testCycleId' &&
        i !== 'sampleMeters' &&
        i !== 'cmdArgs' &&
        i !== 'result' &&
        i !== 'resultCalculations'
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.reorder = true;

        col_config.selector = (row) => row[i];
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);

        if (i === 'createdBy') {
          col_config.width = '250px';
        }
        col_config.cell = (row) => {
          // if (i === 'result') {
          //   if (row[i] === 'Success') {
          //     return (
          //       <Badge pill color="light-success" data-tag="allowRowEvents">
          //         {row[i]}
          //       </Badge>
          //     );
          //   } else if (row[i] === 'Processing') {
          //     return (
          //       <Badge pill color="light-warning" data-tag="allowRowEvents">
          //         {row[i]}
          //       </Badge>
          //     );
          //   } else if (row[i] === 'Failed') {
          //     return (
          //       <Badge pill color="light-danger" data-tag="allowRowEvents">
          //         {row[i]}
          //       </Badge>
          //     );
          //   } else {
          //     return (
          //       <Badge pill color="light-secondary" data-tag="allowRowEvents">
          //         {row[i]}
          //       </Badge>
          //     );
          //   }
          // }
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

    column.push({
      name: 'Result',
      width: '80px',
      cell: (row, i) => {
        return (
          <Badge pill color="light-primary" data-tag="allowRowEvents">
            View
          </Badge>
        );
      },
    });

    column.push({
      name: 'Meters',
      width: '100px',
      cell: (row, i) => {
        return (
          <Badge
            pill
            color="light-primary"
            className=" cursor-pointer"
            onClick={() => {
              setMeterId(row.id);
              testConfigSampleMeterModal(row);
            }}
          >
            Preview
          </Badge>
        );
      },
    });
    column.push({
      name: 'Copy Test',
      width: '100px',
      cell: (row, i) => {
        const [disabled, setDisabled] = useState(false);
        return (
          <Button
            data-tag="allowRowEvents"
            color="transparent"
            size="sm"
            disabled={disabled}
            onClick={() => {
              setTestRowData(row);
              updatedTestConfigModal();
            }}
          >
            <Copy size="20" color="black" className="ml-1 cursor-pointer" />
          </Button>
        );
      },
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

  const retryAgain = () => {
    setError(false);

    setRetry((prevRetry) => !prevRetry);
  };

  const refresh = () => {
    setpage(0);
    setError(false);

    setRetry((prevRetry) => !prevRetry);
  };

  return (
    <>
      <h5 className="mb-1">Test Configuration</h5>
      <Row>
        <Col>
          <Button.Ripple
            color="primary"
            type=""
            onClick={() => testConfigModal()}
            className="float-right mb-1"
          >
            {/* <Plus size={14} /> */}
            <span className="align-middle ml-25 " id="new_cyclw">
              Test Configuration
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
        <DataTabled
          rowCount={10}
          currentpage={page}
          ispagination
          selectedPage={setpage}
          columns={tblColumn()}
          tblData={respose}
          tableName={'Tests'}
          // handleRowClick={onCellClick}
          pointerOnHover
          refresh={refresh}
          donotShowDownload={true}
          handleRowClick={onRowClicked}
        />
      )}

      <Modal
        isOpen={testSatModal}
        toggle={testConfigModal}
        className={`modal-lg modal-dialog-centered`}
      >
        <ModalHeader toggle={testConfigModal}>Test Configuration </ModalHeader>
        <ModalBody>
          <ConfigreTestSatModal
            setRetry={setRetry}
            rowData={props.row}
            setTestSatModal={setTestSatModal}
          />
        </ModalBody>
      </Modal>

      <Modal
        isOpen={updatedTestSatModal}
        toggle={updatedTestConfigModal}
        className={`modal-lg modal-dialog-centered`}
      >
        <ModalHeader toggle={updatedTestConfigModal}>
          Test Configuration{' '}
        </ModalHeader>
        <ModalBody>
          <CopyTestConfig
            setRetry={setRetry}
            rowData={props.row}
            testsRowsData={testRowData}
            updatedTestConfigModal={updatedTestConfigModal}
          />
        </ModalBody>
      </Modal>

      <Modal
        isOpen={commandExecutionModal}
        // toggle={commandExecution}
        toggle={() => {}}
        className={`modal-lg modal-dialog-centered`}
      >
        <ModalHeader toggle={commandExecution}>Test Execution</ModalHeader>
        <ModalBody>
          <CommandExecutionSat
            rowData={rowData}
            commandExecutionModal={commandExecutionModal}
            setCommandExecutionModal={setCommandExecutionModal}
            setRetry={setRetry}
          />
        </ModalBody>
      </Modal>

      <Modal
        isOpen={sampleMetersTestModal}
        toggle={sampleMetersModal}
        className={`modal-xl modal-dialog-centered`}
      >
        <ModalHeader
          toggle={sampleMetersModal}
        >{`Test Cycle Id : ${rowData.testCycleId} | Test Id : ${rowData.id} | Command Name : ${rowData.cmdName} | ExpResTime : ${rowData.expResTime} | Sample Size : ${rowData?.sampleSize}`}</ModalHeader>
        <ModalBody>
          <SampleTestMetersModal rowData={rowData} />
        </ModalBody>
      </Modal>

      <Modal
        isOpen={testConfigSampleMetersModal}
        toggle={testConfigSampleMeterModal}
        className={`modal-lg modal-dialog-centered`}
      >
        <ModalHeader toggle={testConfigSampleMeterModal}>Meters</ModalHeader>
        <ModalBody>
          <TestConfigSampleMeters
            testConfigSampleMeters={testConfigSampleMeters}
            id={meterId}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default ConfigureSat;
