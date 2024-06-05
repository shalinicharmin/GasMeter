import { useEffect, useState } from "react"
import { Col, Row, Modal, ModalHeader, ModalBody, UncontrolledTooltip } from "reactstrap"
import { Plus, Edit, Trash2, Check, X } from "react-feather"
import DataTable from "@src/views/ui-elements/dataTableUpdated"
import AccessControlForm from "./wrapper/accessControlForm"
import useJwt from "@src/auth/jwt/useJwt"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useHistory } from "react-router-dom"
import { useDispatch } from "react-redux"
import authLogout from "../../../../../auth/jwt/logoutlogic"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"

const MySwal = withReactContent(Swal)

const BillAnalysis = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [userData, setUserData] = useState([])
  const [formPopup, setFormPopup] = useState(false)
  const [editData, setEditData] = useState(undefined)
  const [formType, setFormType] = useState(undefined)
  const [fetchTableResponse, setFetchTableResponse] = useState(true)
  const [deleteData, setDeleteData] = useState(false)
  const [deleteRowID, setDeleteRowID] = useState(undefined)

  // Error Handling
  const [errorMessage, setErrorMessage] = useState("")
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const fetchAccessControlTableData = async (params) => {
    return await useJwt
      .getPropertyOwnerModuleAccessTable(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const deleteAccessControlTableData = async (params) => {
    return await useJwt
      .deletePropertyOwnerModuleAccess(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  useEffect(() => {
    if (!formPopup) {
      setEditData(false)
    }
  }, [formPopup])

  useEffect(async () => {
    if (fetchTableResponse || retry) {
      const params = {}
      const [statusCode, response] = await fetchAccessControlTableData(params)

      if (statusCode === 200) {
        try {
          setUserData(response.data.data.result)
          setFetchTableResponse(false)
          setRetry(false)
        } catch (error) {
          setRetry(false)
          setError(true)
          setErrorMessage("Something went wrong, please retry")
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage("Network Error, please retry")
      }
    }
  }, [fetchTableResponse, retry])

  useEffect(async () => {
    if (deleteData) {
      const params = {}
      const [statusCode, response] = await deleteAccessControlTableData(deleteRowID)

      setDeleteData(false)

      if (statusCode === 200) {
        setFetchTableResponse(true)
        toast.success(
          <Toast msg={"Module access control successfully deleted."} type='success' />,
          { hideProgressBar: true }
        )
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong please retry .' type='danger' />, {
          hideProgressBar: true
        })
      }
    }
  }, [deleteData])

  const tblColumn = (data) => {
    const column = []
    const sizeControl = [
      "assign_deassign",
      "bill_analysis",
      "property_report",
      "alert",
      "recharge_analysis",
      "electricity_charge",
      "health_status_report",
      "command_execution",
      "settlement_report",
      "live_load_status"
    ]

    for (const i in data[0]) {
      const col_config = {}
      if (!["id", "user_name", "email", "site_id"].includes(i)) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
        col_config.serch = i
        col_config.selector = (row) => row[i]
        col_config.sortable = true

        col_config.width = sizeControl.includes(i)
          ? "65px"
          : i === "user" || i === "email"
          ? "170px"
          : ""
        // col_config.width = '180px'

        col_config.cell = (row) => {
          if (sizeControl.includes(i)) {
            return (
              <div className='d-flex'>
                <span className='d-block font-weight-bold text-truncate'>
                  {row[i] === 1 ? (
                    <Check size={15} className='text-success' />
                  ) : (
                    <X size={15} className='text-danger' />
                  )}
                </span>
              </div>
            )
          } else {
            return (
              <div className='d-flex'>
                <span
                  className='d-block font-weight-bold text-truncate'
                  title={
                    row[i]
                      ? row[i] !== ""
                        ? row[i].toString().length > 35
                          ? row[i]
                          : ""
                        : "-"
                      : "-"
                  }
                >
                  {row[i] && row[i] !== "" ? row[i].toString().substring(0, 35) : "-"}
                  {row[i] && row[i] !== "" ? (row[i].toString().length > 35 ? "..." : "") : "-"}
                </span>
              </div>
            )
          }
        }
        column.push(col_config)
      }
    }

    const editData = async (row) => {
      // console.log(row);
      const id = undefined
      for (let i = 0; i < userData.length; i++) {
        if (row["user"] === userData[i]["user"] && row["site_id"] === userData[i]["site_id"]) {
          row["id"] = userData[i]["id"]
        }
      }
      setEditData(row)
      setFormPopup(true)
      setFormType("update")
    }

    const deleteData = async (row) => {
      MySwal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        customClass: {
          confirmButton: "btn btn-primary",
          cancelButton: "btn btn-danger ml-1"
        },
        buttonsStyling: false
      }).then(function (result) {
        if (result.value) {
          let id = undefined
          for (let i = 0; i < userData.length; i++) {
            if (row["user"] === userData[i]["user"] && row["site_id"] === userData[i]["site_id"]) {
              // row['id'] = userData[i]['id']
              id = userData[i]["id"]
            }
          }
          setDeleteRowID(id)
          setDeleteData(true)
        }
      })
    }

    column.push({
      name: "Action",
      width: "70px",
      cell: (row) => {
        return (
          <>
            <Edit size='15' className='ml-1 cursor-pointer' onClick={() => editData(row)} />
            <Trash2 size='15' className='ml-1 cursor-pointer' onClick={() => deleteData(row)} />
          </>
        )
      }
    })

    return column
  }

  const setEditFormType = () => {
    setFormPopup(true)
    setFormType("add")
    setEditData({
      user: "",
      user_name: "",
      site_name: "",
      site_id: "",
      recharge_analysis: 0,
      property_report: 0,
      electricity_charge: 0,
      bill_analysis: 0,
      assign_deassign: 0,
      alert: 0,
      health_status_report: 0,
      command_execution: 0,
      settlement_report: 0,
      live_load_status: 0,
      email: ""
    })
  }

  const formControl = () => {
    return (
      <>
        <Plus
          className='cursor-pointer mx_5 float-right'
          id='add_access_control'
          size={20}
          onClick={setEditFormType}
        />
        <UncontrolledTooltip placement='top' target='add_access_control'>
          Add new user access control
        </UncontrolledTooltip>
      </>
    )
  }

  const reloadTable = () => {
    setFormPopup(!formPopup)
    setFetchTableResponse(true)
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <>
      {hasError ? (
        <Col lg='12' className='p-2'>
          <CardInfo
            props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }}
          />
        </Col>
      ) : (
        <>
          <Row>
            <Col sm='12'>
              <DataTable
                columns={tblColumn(userData)}
                tblData={userData}
                rowCount={10}
                tableName={"Property owner module access control Table"}
                extras={formControl()}
              />
            </Col>
          </Row>
        </>
      )}

      <Modal
        isOpen={formPopup}
        toggle={() => setFormPopup(!formPopup)}
        className={`modal-md modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setFormPopup(!formPopup)}>
          Create property owner module access control
        </ModalHeader>
        <ModalBody className='p-0'>
          <AccessControlForm data={editData} formType={formType} reloadTable={reloadTable} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default BillAnalysis
