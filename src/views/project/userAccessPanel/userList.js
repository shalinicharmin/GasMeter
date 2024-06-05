import React, { useState, useEffect } from 'react';
import { Eye, Minus, Trash2, User } from 'react-feather';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row
} from 'reactstrap';
import DataTable from '@src/views/ui-elements/dataTableUpdated';
import CreateUser from './createUser';
import useJwt from '@src/auth/jwt/useJwt';
import EditUser from './editUser';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import authLogout from '../../../auth/jwt/logoutlogic';
import { caseInsensitiveSort } from '@src/views/utils.js';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import Loader from '@src/views/project/misc/loader';

const UserList = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [centeredModal, setCenteredModal] = useState(false);
  const [createUserModal, setcreateUserModal] = useState(false);
  const [formValue, setFormValue] = useState();
  const [userData, setUserData] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retry, setRetry] = useState(false);
  const [loader, setLoader] = useState(false);

  const MySwal = withReactContent(Swal);

  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  // To fetch user list in a table
  const fetchData = async () => {
    return await useJwt
      .usersAcessList()
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
    if (fetchingData) {
      setLoader(true);
      let params = undefined;
      params = {};
      const [statusCode, responseData] = await fetchData();

      if (statusCode === 200) {
        setUserData(responseData.data.data.result);
        // setTotalCount(responseData.data.length)
        setFetchingData(false);
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      }
      setLoader(false);
    }
  }, [fetchingData]);

  //  To delete a user
  const deleteUserData = async (params) => {
    try {
      const res = await useJwt.deleteUserData(params.id);
      if (res.status === 200) {
        MySwal.fire({
          icon: 'success',
          title: 'User Deleted',
          text: `Successfully ! User ${params.name} Deleted`,
          customClass: {
            confirmButton: 'btn btn-success'
          }
        });

        setFetchingData(true);
      } else if (res.status === 401 || res.status === 403) {
        setLogout(true);
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        setLogout(true);
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'User has not be deleted',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        });
      }
    }
  };

  //
  const handleConfirmDeleteuser = (row) => {
    return MySwal.fire({
      text: "You won't be able to revert this! ",
      title: 'Are you sure!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it!',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ml-1'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.value) {
        deleteUserData(row);
      }
    });
  };

  const tblColumn = () => {
    const column = [];
    if (userData.length > 0) {
      for (const i in userData[0]) {
        // console.log(i)
        const col_config = {};
        if (
          i !== 'id' &&
          i !== 'site_access' &&
          i !== 'avatar' &&
          i !== 'command_access' &&
          i !== 'access' &&
          i !== 'report_access' &&
          i !== 'tag_access'
        ) {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
            1
          )}`.replaceAll('_', ' ');
          col_config.serch = i;
          col_config.sortable = true;
          col_config.selector = (row) => row[i];
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
                >
                  {row[i]}
                </span>
              </div>
            );
          };
          column.push(col_config);
          // console.log(col_config)
        }
      }
    }
    column.push({
      name: 'Action',
      width: '120px',
      cell: (row) => {
        return (
          <>
            <Eye
              size="16"
              className="cursor-pointer"
              onClick={() => {
                setFormValue(row);
                setCenteredModal(!centeredModal);
              }}
            />
            {row.role !== 'superadmin' ? (
              <Trash2
                size="15"
                className="mx-1 cursor-pointer"
                onClick={() => {
                  handleConfirmDeleteuser(row);
                }}
              />
            ) : (
              <Minus size="15" className="mx-1 cursor-pointer" />
            )}
          </>
        );
      }
    });

    return column;
  };

  const handleCreateUserFormModal = () => setcreateUserModal(!createUserModal);
  const updateFormModal = () => setCenteredModal(!centeredModal);

  return (
    <>
      <Row className="mb-2">
        <Col>
          <h2>User Access Panel</h2>
        </Col>
        <Col>
          <Button.Ripple
            color="danger"
            className="float-right p_8"
            onClick={() => {
              handleCreateUserFormModal();
            }}
          >
            <User size={16} />
            <span className="align-middle ml-25"> Create User</span>
          </Button.Ripple>
        </Col>
      </Row>
      {loader ? (
        <Loader hight="min-height-330" />
      ) : hasError ? (
        <CardInfo
          props={{
            message: { errorMessage },
            retryFun: { retryAgain },
            retry: { retry }
          }}
        />
      ) : (
        !retry && (
          <DataTable
            columns={tblColumn()}
            tblData={userData}
            tableName={'User Access List '}
            rowCount={10}
            donotShowDownload={true}
            // filterCaseInsensitive={filterCaseInsensitive}
          />
        )
      )}
      {/* Edit User form  */}
      <Modal
        isOpen={centeredModal}
        toggle={updateFormModal}
        className="modal-dialog-centered modal-xl mb-0"
      >
        <ModalHeader toggle={updateFormModal}>Update Form </ModalHeader>
        <ModalBody className="">
          <EditUser
            editdata={formValue}
            setFetchingData={setFetchingData}
            updateFormModal={updateFormModal}
            isCenteredModalOpen={centeredModal}
          />
        </ModalBody>
      </Modal>

      {/* create user form  */}
      <Modal
        isOpen={createUserModal}
        toggle={handleCreateUserFormModal}
        className="modal-dialog-centered modal-xl mb-0"
      >
        <ModalHeader toggle={handleCreateUserFormModal}>
          Create User Form{' '}
        </ModalHeader>
        <ModalBody className="">
          <CreateUser
            userData={userData}
            updtTbl={setFetchingData}
            handleCreateUserFormModal={handleCreateUserFormModal}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default UserList;
