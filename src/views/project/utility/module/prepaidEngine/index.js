import React, { useState, useEffect } from 'react';
import CommonFilter from './FilterWrapper/commonFilter';
import {
  Button,
  Card,
  CardBody,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledDropdown,
} from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import DataTable from '@src/views/ui-elements/dataTableUpdated';
import { useHistory, useLocation } from 'react-router-dom';
import useJwt from '@src/auth/jwt/useJwt';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import RechargeMeter from './rechargeMeter';
import PrepaidRechargeHistory from './rechargeHistory';
import PrepaidLedger from './prepaidLedger';
import CommandHistory from './commandHistory';
import { Award, FileText, Link, MoreVertical, Zap } from 'react-feather';
import Loader from '@src/views/project/misc/loader';
import authLogout from '@src/auth/jwt/logoutlogic';
import { caseInsensitiveSort } from '@src/views/utils.js';

import Toast from '@src/views/ui-elements/cards/actions/createToast';
import { toast } from 'react-toastify';

const Prepaid_Engine = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  // Logout User
  const [logout, setLogout] = useState(false);
  const [rechargeHistoryModal, setRechargeHistoryModal] = useState(false);
  const [rechargeMeterModal, setRechargeMeterModal] = useState(false);
  const [Rc_DcConnectionModal, setRc_DcConnectionModal] = useState(false);
  const [prepaidLedgerModal, setPrepaidLedgerModal] = useState(false);
  const [rowDetail, setRowDetail] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(false);
  const [loader, setLoader] = useState(false);
  const [selected_project, set_selected_project] = useState(undefined);
  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  );
  const [filterParams, setFilterparams] = useState({});

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !==
        currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project);
      setRetry(true);
      setFilterparams({});
      setError(false);
    }
  }

  const [page, setpage] = useState(0);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const [response, setResponse] = useState([]);

  // API Call to fetch Prepaid Engine list
  const fetchPrepaidEngineList = async (params) => {
    return await useJwt
      .getGISDTRMeterList(params)
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
  // UseEffect to fetch Prepaid List
  useEffect(async () => {
    if (fetchingData || retry) {
      setLoader(true);
      let params = undefined;
      if (!filterParams) {
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
          // site_id: selectedDTR[0]['value']
        };
      } else {
        params = {
          project:
            location.pathname.split('/')[2] === 'sbpdcl'
              ? 'ipcl'
              : location.pathname.split('/')[2],
          ...filterParams,
        };
      }

      // Fetch Prepaid Engine List
      const [statusCode, response] = await fetchPrepaidEngineList(params);
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else if (statusCode === 200) {
        try {
          setResponse(response.data.data.result.stat.meters);
          setRetry(false);
          setFetchingData(false);
          // console.log(response.data.data.result.stat.meters)
        } catch (error) {
          setRetry(false);
          setError(true);
          setErrorMessage('Something went wrong, please retry');
        }
      } else {
        setRetry(false);
        setError(true);
        setErrorMessage('Network Error, please retry');
      }
      setLoader(false);
    }
  }, [fetchingData, retry]);

  // table columns
  const tblColumn = () => {
    const column = [];
    for (const i in response[0]) {
      const col_config = {};
      if (
        i !== 'house_id' &&
        i !== 'site_id' &&
        i !== 'supply_type' &&
        i !== 'name_bill' &&
        i !== 'latitude' &&
        i !== 'longitude' &&
        i !== 'pole_id' &&
        i !== 'meter_protocol_type' &&
        i !== 'feeder_id' &&
        i !== 'pss_id' &&
        i !== 'value' &&
        i !== 'label' &&
        i !== 'isFixed'
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.selector = (row) => row[i];
        col_config.width = '200px';
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);
        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              <span
                className="d-block font-weight-bold "
                title={
                  row[i]
                    ? row[i] !== ''
                      ? row[i].toString().length > 10
                        ? row[i]
                        : ''
                      : '-'
                    : '-'
                }
              >
                {row[i] && row[i] !== ''
                  ? row[i].toString().substring(0, 15)
                  : '-'}
                {row[i] && row[i] !== ''
                  ? row[i].toString().length > 15
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
      name: 'Action',
      width: '120px',
      allowOverflow: true,
      cell: (row) => {
        return (
          <div className="d-flex">
            <UncontrolledDropdown>
              <DropdownToggle className="pr-1" tag="span">
                <MoreVertical
                  size={20}
                  className="ml-1 text-primary cursor-pointer"
                />
              </DropdownToggle>
              <DropdownMenu positionFixed={true}>
                {/* Recharge History Modal */}
                <DropdownItem
                  tag="a"
                  href="/"
                  className="w-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setRowDetail(row);
                    setRechargeHistoryModal(!rechargeHistoryModal);
                  }}
                >
                  <FileText size={15} />
                  <span className="align-middle ml-50">Recharge History</span>
                </DropdownItem>

                {/* Command History Modal */}
                <DropdownItem
                  tag="a"
                  href="/"
                  className="w-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setRowDetail(row);
                    setRc_DcConnectionModal(!Rc_DcConnectionModal);
                  }}
                >
                  <Link size={15} />
                  <span className="align-middle ml-50">
                    Rc/Dc Command history{' '}
                  </span>
                </DropdownItem>

                {/* Recharge Meter */}
                <DropdownItem
                  tag="a"
                  href="/"
                  className="w-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setRowDetail(row);
                    setRechargeMeterModal(!rechargeMeterModal);
                  }}
                >
                  <Zap size={15} />
                  <span className="align-middle ml-50">Recharge Meter</span>
                </DropdownItem>

                {/* Prepaid Ledger */}
                <DropdownItem
                  tag="a"
                  href="/"
                  className="w-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setRowDetail(row);
                    setPrepaidLedgerModal(!prepaidLedgerModal);
                  }}
                >
                  <Award size={15} />
                  <span className="align-middle ml-50">Prepaid Ledger </span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            {/* <Edit size={15} /> */}
          </div>
        );
      },
    });
    column.unshift({
      name: 'Sr No.',
      width: '90px',
      cell: (row, i) => {
        return (
          <div className="d-flex  justify-content-center">
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

  const onSubmitButtonClicked = (filterParams) => {
    // console.log(filterParams)
    setFilterparams(filterParams);
    setFetchingData(true);
    setError(false);
    setRetry(true);
  };

  return (
    <>
      <h2>Meter List</h2>

      <Card className="mt-2">
        <CardBody>
          <CommonFilter onSubmitButtonClicked={onSubmitButtonClicked} />
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
              <DataTable
                columns={tblColumn()}
                tblData={response}
                // rowCount={10}
                currentpage={page}
                ispagination
                selectedPage={setpage}
                tableName={'Meter List'}
                rowCount={10}
              />
            )
          )}
        </CardBody>
      </Card>

      {/* Recharge History Modal */}
      <Modal
        isOpen={rechargeHistoryModal}
        toggle={() => setRechargeHistoryModal(!rechargeHistoryModal)}
        className=" modal-xl"
      >
        <ModalHeader
          toggle={() => setRechargeHistoryModal(!rechargeHistoryModal)}
        >
          Recharge History
        </ModalHeader>
        <ModalBody>
          <PrepaidRechargeHistory
            row={rowDetail}
            rechargeHistoryModal={rechargeHistoryModal}
            setRechargeHistoryModal={setRechargeHistoryModal}
          />
        </ModalBody>
      </Modal>

      {/* Rc/dc Command history  */}
      <Modal
        isOpen={Rc_DcConnectionModal}
        toggle={() => setRc_DcConnectionModal(!Rc_DcConnectionModal)}
        className="modal-xl"
      >
        <ModalHeader
          toggle={() => setRc_DcConnectionModal(!Rc_DcConnectionModal)}
        >
          Rc/Dc Command history
        </ModalHeader>
        <ModalBody>
          <CommandHistory
            row={rowDetail}
            Rc_DcConnectionModal={Rc_DcConnectionModal}
            setRc_DcConnectionModal={setRc_DcConnectionModal}
          />
        </ModalBody>
      </Modal>

      {/* Recharge Meter */}
      <Modal
        isOpen={rechargeMeterModal}
        toggle={() => setRechargeMeterModal(!rechargeMeterModal)}
        className="modal-dialog-centered modal-lg"
      >
        <ModalHeader toggle={() => setRechargeMeterModal(!rechargeMeterModal)}>
          Recharge Meter
        </ModalHeader>
        <ModalBody>
          <RechargeMeter
            row={rowDetail}
            rechargeMeterModal={rechargeMeterModal}
            setRechargeMeterModal={setRechargeMeterModal}
          />
        </ModalBody>
      </Modal>

      {/* Prepaid Ledger  */}
      <Modal
        isOpen={prepaidLedgerModal}
        toggle={() => setPrepaidLedgerModal(!prepaidLedgerModal)}
        className="modal-dialog-centered modal-xl"
      >
        <ModalHeader toggle={() => setPrepaidLedgerModal(!prepaidLedgerModal)}>
          Prepaid Ledger
        </ModalHeader>
        <ModalBody>
          <PrepaidLedger
            row={rowDetail}
            prepaidLedgerModal={prepaidLedgerModal}
            setPrepaidLedgerModal={setPrepaidLedgerModal}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default Prepaid_Engine;
