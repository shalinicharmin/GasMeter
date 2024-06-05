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
// import authLogout from '../../../../../../../../auth/jwt/logoutlogic'
import useJwt from '@src/auth/jwt/useJwt';
import GeneratedBillsWrapper from '../mdms/userProfile/wrapper/generatedBillsWrapper';
import TotalRechargesWrapper from '../mdms/userProfile/wrapper/totalRechargesWrapper';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
// import RechargeMeter from './rechargeMeter'
// import PrepaidRechargeHistory from './prepaidRechargeHistory'
import { Award, FileText, Link, MoreVertical, Zap } from 'react-feather';
import Loader from '@src/views/project/misc/loader';
import authLogout from '@src/auth/jwt/logoutlogic';
import BillDetermine from './BillingCommandHistoryWrapper/billdetermine';
// import InstantBillDetermine from './BillingCommandHistoryWrapper/instantBillDetermine'

// import Billdetermine from './BillingCommandHistoryWrapper/billdetermine'
import InstantBillDetermine from './BillingCommandHistoryWrapper/instantBillDetermine';

const Billing_Engine = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  // Logout User
  const [logout, setLogout] = useState(false);
  const [billingDataModal, setBillingDtataModal] = useState(false);
  const [rechargeMeterModal, setRechargeMeterModal] = useState(false);
  const [billingCommandModal, setBillingCommandModal] = useState(false);
  const [rowDetail, setRowDetail] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(false);

  const [loader, setLoader] = useState(false);
  const [filterParams, setFilterparams] = useState({});

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
      setRetry(true);
      setFilterparams({});
      setError(false);
    }
  }
  // const [basicModal, setBasicModal] = useState(false)
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
                <DropdownItem
                  tag="a"
                  href="/"
                  className="w-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setRowDetail(row);
                    setBillingDtataModal(!billingDataModal);
                  }}
                >
                  <FileText size={15} />
                  <span className="align-middle ml-50">Billing Data</span>
                </DropdownItem>
                <DropdownItem
                  tag="a"
                  href="/"
                  className="w-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setRowDetail(row);
                    setBillingCommandModal(!billingCommandModal);
                  }}
                >
                  <Link size={15} />
                  <span className="align-middle ml-50">
                    Billing Command history{' '}
                  </span>
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
      <h2>Billing Engine</h2>

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
        isOpen={billingDataModal}
        toggle={() => setBillingDtataModal(!billingDataModal)}
        className="modal-dialog-centered modal-lg"
      >
        <ModalHeader toggle={() => setBillingDtataModal(!billingDataModal)}>
          Billing Data
        </ModalHeader>
        <ModalBody>
          {/* <PrepaidRechargeHistory row={rowDetail} billingDataModal={rechargeHistoryModal} setBillingDtataModal={setRechargeHistoryModal} /> */}
        </ModalBody>
      </Modal>

      {/* Rc/dc Command history  */}
      <Modal
        isOpen={billingCommandModal}
        toggle={() => setBillingCommandModal(!billingCommandModal)}
        className="modal-dialog-centered modal-xl"
      >
        <ModalHeader
          toggle={() => setBillingCommandModal(!billingCommandModal)}
        >
          Billing Command history
        </ModalHeader>
        <ModalBody>
          <BillDetermine
            row={rowDetail}
            title="Monthly billing determinant"
            txtLen={10}
          />
          <InstantBillDetermine row={rowDetail} txtLen={12} />
        </ModalBody>
      </Modal>
    </>
  );
};

export default Billing_Engine;
