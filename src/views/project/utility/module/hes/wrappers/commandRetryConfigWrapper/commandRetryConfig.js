import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable';

import {
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  Tooltip,
  Button,
} from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { Plus, Edit } from 'react-feather';

import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// import AddSchedulerData from './addSchedulerdata'
import AddSchedulerData from '../meterConfigurationWrapper/addSchedulerdata';
import { caseInsensitiveSort } from '@src/views/utils.js';

import authLogout from '../../../../../../../auth/jwt/logoutlogic';

import useJwt from '@src/auth/jwt/useJwt';

import Loader from '@src/views/project/misc/loader';

import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';

import CommandRetryUpDateForm from './commandRetryUpdateForm';

const CommandRetryConfig = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();
  let project = '';
  if (location.pathname.split('/')[2] === 'sbpdcl') {
    project = 'ipcl';
  } else {
    project = location.pathname.split('/')[2];
  }

  const [fetchingData, setFetchingData] = useState(true);
  const [loader, setLoader] = useState(false);
  const [retry, setRetry] = useState(true);

  const [commandRetryResponse, setCommandRetryResponse] = useState([]);

  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Logout User
  const [logout, setLogout] = useState(false);

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const fetchData = async (params) => {
    return await useJwt
      .getDLMSCommandRetryConfiguration(params)
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
      setLoader(true);
      const params = {
        project,
      };

      const [statusCode, response] = await fetchData(params);
      // console.log('Status Code ....')
      // console.log(statusCode)
      // console.log('Response ......')
      // console.log(response)
      // console.log(response.data.data.result)

      if (statusCode === 200) {
        try {
          const resp = response.data.data.result;
          setCommandRetryResponse(resp);
          setRetry(false);
        } catch (error) {
          setRetry(false);
          setError(true);
          setErrorMessage('Network Error, please retry');
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
  }, [retry]);

  const [addScheduler, setAddScheduler] = useState(false);
  const [addcenteredSchedulerModal, setAddCenteredSchedulerModal] =
    useState(false);
  const [showdataEdit, setShowDataEdit] = useState(false);
  const [commandSelectedForUpdate, setCommandSelectedForUpdate] =
    useState(undefined);

  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };

  const reloadData = () => {
    setRetry(!retry);
  };

  const rowSelected = (row) => {
    // console.log('Row Selected for updatation ............')
    // console.log(row)

    setCommandSelectedForUpdate(row);
    setShowDataEdit(true);
  };

  const reloadTableAfterUpdate = () => {
    setShowDataEdit(false);
    setFetchingData(true);
  };

  const tblColumn = () => {
    const column = [];

    if (commandRetryResponse && commandRetryResponse.length > 0) {
      for (const i in commandRetryResponse[0]) {
        const col_config = {};
        if (i !== 'id') {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
            1
          )}`.replaceAll('_', ' ');
          col_config.serch = i;
          col_config.sortable = true;
          col_config.sortFunction = (rowA, rowB) =>
            caseInsensitiveSort(rowA, rowB, i);
          // col_config.style = {
          //   width: '400px'
          // }
          col_config.cell = (row) => {
            return (
              <div className="d-flex">
                <span
                  className="d-block font-weight-bold "
                  // style={{ width: '18vh' }}
                  // onClick={() => handleRowClick(row.id, row.feeder_id, row.pss_id)}
                >
                  {row[i]}
                </span>
              </div>
            );
          };
          column.push(col_config);
        }
      }
    }

    column.push({
      name: 'Edit Retry Count',
      maxWidth: '100px',
      style: {
        minHeight: '40px',
        maxHeight: '40px',
      },
      cell: (row) => {
        return (
          <Edit
            size="20"
            className="ml-1 cursor-pointer"
            onClick={() => rowSelected(row)}
          />
        );
      },
    });

    return column;
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
          <SimpleDataTable
            columns={tblColumn()}
            tblData={commandRetryResponse}
            rowCount={10}
            tableName={'Command Retry Configuration'}
            refresh={reloadData}
            // totalCount={totalCount}
            // onNextPageClicked={onNextPageClicked}
          />
        )
      )}

      <Modal
        isOpen={showdataEdit}
        toggle={() => setShowDataEdit(!showdataEdit)}
        className={`modal-lg modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setShowDataEdit(!showdataEdit)}>
          {commandSelectedForUpdate
            ? commandSelectedForUpdate.command_name
            : ''}
        </ModalHeader>
        <ModalBody className="p-0">
          <CommandRetryUpDateForm
            rowSelected={commandSelectedForUpdate}
            reloadTableAfterUpdate={reloadTableAfterUpdate}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default CommandRetryConfig;
