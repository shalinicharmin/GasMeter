import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  UserCheck,
  Info,
  AlignLeft,
  Check,
  Edit3,
  Share2,
  Share,
  CheckSquare,
  Filter,
  Home,
  FileText,
  RefreshCcw
} from 'react-feather'
import useJwt from '@src/auth/jwt/useJwt'
import Avatar from '@components/avatar'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import Timeline from '@src/views/project/utility/module/oa/wrapper/oaTimeline'
import jwt_decode from 'jwt-decode'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import DataTable from '@src/views/ui-elements/dataTableUpdated'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledTooltip,
  Media,
  Form,
  ModalFooter,
  Button,
  Input,
  Label,
  UncontrolledDropdown,
  DropdownToggle,
  Badge,
  DropdownMenu,
  DropdownItem,
  Col,
  Row,
  UncontrolledButtonDropdown
} from 'reactstrap'
import NewIssueForm from './newIssueForm'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import { caseInsensitiveSort } from '@src/views/utils.js'

const IssuesTable = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [response, setResponse] = useState([])
  const [editIssueModal, setEditIssueModal] = useState(false)
  const [data, setData] = useState({ inputs: '' })

  const [centeredModal, setCenteredModal] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [formData, setFormData] = useState({})

  const [statusIssueModal, setStatusIssueModal] = useState(false)
  const [allRowsstatusIssueModal, setAllRowsStatusIssueModal] = useState(false)

  const [rowIdForResolvedStatus, setRowIdForResolvedStatus] = useState(undefined)

  const [resolverDetails, setResolverDetails] = useState({})

  const [bulkRemarkStatus, setBulkRemarkStatus] = useState('')

  // to select Rows
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // Toggle the state so React Data Table changes to clearSelectedRows are triggered
  const handleClearRows = () => {
    setToggleClearRows(!toggledClearRows)
  }

  const MySwal = withReactContent(Swal)

  const fetchData = async params => {
    return await useJwt
      .getColivingTableIssue(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  useEffect(async () => {
    if (fetchingData || retry) {
      const params = { categoryId: props.categoryId, page: 1 }
      const [statusCode, responseData] = await fetchData(params)

      if (statusCode) {
        if (statusCode === 200) {
          try {
            responseData.data.map(item => {
              item.title = item.category.categoryTitle
              return item
            })
            setResponse(responseData.data)
            setFetchingData(false)
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }
      }
    }
  }, [fetchingData, retry])

  // put request
  const updateFormData = async params => {
    formData.updatedBy = jwt_decode(localStorage.getItem('accessToken')).userData.name
    try {
      const res = await useJwt.putUpdateIssue(formData.id, formData)

      if (res.status === 200) {
        toast.success(<Toast msg={'Form Data Updated Succesfully.'} type='success' />, { hideProgressBar: true })
        setFetchingData(true)
      } else if (res.status === 401 || res.status === 403) {
        setLogout(true)
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong please retry .' type='danger' />, { hideProgressBar: true })
      }
    }
  }

  //  update Status
  const handleUpdateStatus = async (id, status, resolvedBy, remarks) => {
    const params = {
      id,
      status,
      resolvedBy: jwt_decode(localStorage.getItem('accessToken')).userData.name,
      remarks,
      updatedBy: jwt_decode(localStorage.getItem('accessToken')).userData.name
    }
    try {
      const res = await useJwt.updateIssueStatus(id, params)
      // console.log(res)
      if (res.status === 200) {
        toast.success(<Toast msg={` Issue ${status} .`} type='success' />, {
          hideProgressBar: true
        })
        setFetchingData(true)
      } else if (res.status === 401 || res.status === 403) {
        setLogout(true)
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong please retry .' type='danger' />, { hideProgressBar: true })
      }
    }
  }
  //  update Status
  const handleBulkUpdateStatus = async (rows, status, remarks) => {
    const newRows = rows.map(row => {
      const newRow = {
        id: row.id,
        status,
        resolvedBy: jwt_decode(localStorage.getItem('accessToken')).userData.name,
        remarks: remarks || row.remarks,
        updatedBy: jwt_decode(localStorage.getItem('accessToken')).userData.name
      }
      return newRow
    })

    try {
      const res = await useJwt.updateBulkIssueStatus(newRows)

      if (res.status === 202) {
        toast.success(<Toast msg={`Request Accepted.`} type='success' />, {
          hideProgressBar: true
        })
        setFetchingData(true)
        handleClearRows()
      } else if (res.status === 401 || res.status === 403) {
        setLogout(true)
      }
    } catch (error) {
      if (error.res.status === 401 || error.res.status === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong please retry .' type='danger' />, { hideProgressBar: true })
      }
    }
  }

  // Delete Issue
  const deleteData = async params => {
    try {
      const res = await useJwt.deleteIssue(params.id)

      if (res.status === 200) {
        MySwal.fire({
          icon: 'success',
          title: 'Issue Deleted',
          text: 'Issue Deleted Successfully!',
          customClass: {
            confirmButton: 'btn btn-success'
          }
        })
        setFetchingData(true)
      } else if (res.status === 401 || res.status === 403) {
        setLogout(true)
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        setLogout(true)
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Your Issue has not be deleted',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        })
      }
    }
  }

  const handleConfirmDelete = async row => {
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
        deleteData(row)
      }
    })
  }

  const onSelectedRowsChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows)
  }

  function StatusPending(props) {
    return (
      <UncontrolledDropdown>
        <DropdownToggle className='icon-btn hide-arrow pl-0 pr-0' color='transparent' size='sm' caret>
          <Badge pill color='light-warning' className=''>
            Pending
          </Badge>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem
            href='/'
            onClick={e => {
              e.preventDefault()
              handleUpdateStatus(props.issue.id, 'in_progress', props.issue.resolvedBy, props.issue.remarks)
            }}>
            <Badge pill color='light-info' className=''>
              In Progress
            </Badge>
          </DropdownItem>
          <DropdownItem
            href='/'
            onClick={e => {
              e.preventDefault()
              setResolverDetails(props.issue)
              setRowIdForResolvedStatus(props.issue.id)
              setStatusIssueModal(!statusIssueModal)
            }}>
            <Badge pill color='light-success' className=''>
              Resolved
            </Badge>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }
  function StatusInProgress(props) {
    return (
      <UncontrolledDropdown>
        <DropdownToggle className='icon-btn hide-arrow pl-0 pr-0' color='transparent' size='sm' caret>
          <Badge pill color='light-info' className=''>
            In Progress
          </Badge>
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem
            href='/'
            onClick={e => {
              e.preventDefault()
              setRowIdForResolvedStatus(props.issue.id)
              setResolverDetails(props.issue)
              setStatusIssueModal(!statusIssueModal)
            }}>
            <Badge pill color='light-success' className=''>
              Resolved
            </Badge>
          </DropdownItem>
          <DropdownItem
            href='/'
            onClick={e => {
              e.preventDefault()

              handleUpdateStatus(props.issue.id, 'pending', props.issue.resolvedBy, props.issue.remarks)
            }}>
            <Badge pill color='light-warning' className=''>
              Pending
            </Badge>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }
  function StatusResolved(props) {
    return (
      <UncontrolledDropdown>
        <DropdownToggle className='icon-btn hide-arrow pl-0 pr-0' color='transparent' size='sm' caret>
          <Badge pill color='light-success' className=''>
            Resolved
          </Badge>
        </DropdownToggle>
        {/* <DropdownMenu right>
          <DropdownItem
            href='/'
            onClick={e => {
              e.preventDefault()
              handleUpdateStatus(props.issue.id, 'in_progress', props.issue.resolvedBy, props.issue.remarks)
            }}>
            <Badge pill color='light-info' className=''>
              In Progress
            </Badge>
          </DropdownItem>
          <DropdownItem
            href='/'
            onClick={e => {
              e.preventDefault()
              handleUpdateStatus(props.issue.id, 'pending', props.issue.resolvedBy, props.issue.remarks)
            }}>
            <Badge pill color='light-warning' className=''>
              Pending
            </Badge>
          </DropdownItem>
        </DropdownMenu> */}
      </UncontrolledDropdown>
    )
  }

  const tblColumn = () => {
    const column = []

    for (const i in response[0]) {
      const col_config = {}
      if (
        i !== 'id' &&
        i !== 'resolvedAt' &&
        i !== 'resolvedBy' &&
        i !== 'updatedAt' &&
        i !== 'updatedBy' &&
        i !== 'createdBy' &&
        i !== 'lifeCycle' &&
        i !== 'category' &&
        i !== 'categoryId' &&
        i !== 'inputs' &&
        i !== 'phone' &&
        i !== 'issueDescription' &&
        i !== 'resolvedBy' &&
        i !== 'remarks'
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        // col_config.style = {
        //   width: '400px'
        // }
        col_config.width = '200px'

        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold  cursor-pointer'
                title={row[i]}
                onClick={() => {
                  setData(row)
                  setCenteredModal(true)
                }}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 25) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 25 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    column.push({
      name: 'Update Status',
      width: '120px',
      cell: row => {
        if (row.status === 'pending') {
          return <StatusPending issue={row} />
        } else if (row.status === 'in_progress') {
          return <StatusInProgress issue={row} />
        } else if (row.status === 'resolved') {
          return <StatusResolved issue={row} />
        }
      }
    })

    column.push({
      name: 'Sr',
      width: '80px',
      cell: (row, index) => {
        return ++index
      }
    })

    column.push({
      name: 'Action',
      width: '70px',
      cell: row => {
        return (
          <>
            {row.status !== 'resolved' ? (
              <Edit
                size='20'
                className='ml-1 cursor-pointer'
                onClick={() => {
                  setFormData(row)

                  setEditIssueModal(!editIssueModal)
                }}
              />
            ) : (
              <Trash2
                size='15'
                className='ml-1 cursor-pointer'
                onClick={() => {
                  handleConfirmDelete(row)
                }}
              />
            )}
            {row.status !== 'resolved' ? (
              <Trash2
                size='20'
                className='ml-1 cursor-pointer'
                onClick={() => {
                  handleConfirmDelete(row)
                }}
              />
            ) : (
              ''
            )}
          </>
        )
      }
    })

    for (let i = 0; i < column.length; i++) {
      if (column[i].name === 'Sr') {
        const temp = column[i]
        column[i] = column[0]
        column[0] = temp
      }
      if (column[i].name === 'Title') {
        column[i].width = '150px'
        const temp = column[i]
        column[i] = column[1]
        column[1] = temp
      }

      if (column[i].name === 'CreatedAt') {
        column[i].width = '200px'
      }
    }

    return column
  }

  const extraDetails = data => {
    let inputs = ''
    inputs = JSON.stringify(data.inputs)
    inputs = inputs.replace(/\{/g, '')
    inputs = inputs.replace(/\}/g, '')
    inputs = inputs.replace(/\"/g, '')
    inputs = inputs.replace(/\'/g, '')
    inputs = inputs.replace(/\,/g, ' | ')
    inputs = inputs.replace(/\:/g, ' : ')
    return inputs
  }

  const issues = [
    {
      title: 'Email',
      color: 'light-primary',
      subtitle: data.email,
      Icon: <Mail size={15} />,
      down: true
    },
    {
      title: 'Mobile',
      color: 'light-success',
      subtitle: data.phone,
      Icon: <Phone size={15} />
    },
    {
      title: 'TimeStamp',
      color: 'light-danger',
      subtitle: data.createdAt,
      Icon: <Clock size={15} />
    },
    {
      title: 'Status',
      color: 'light-info',
      subtitle: data.status,
      Icon: <CheckCircle size={15} />
    },
    {
      title: 'Resolved by',
      color: 'light-info',
      subtitle: data.resolvedBy,
      Icon: <UserCheck size={15} />
    },
    {
      title: 'Remarks',
      color: 'light-danger',
      subtitle: data.remarks,
      Icon: <UserCheck size={15} />
    },
    {
      title: 'Inputs',
      color: 'light-primary',
      subtitle: extraDetails(data),
      Icon: <Info size={15} />
    },
    {
      title: 'Description',
      color: 'light-info',
      subtitle: data.issueDescription,
      Icon: <AlignLeft size={15} />
    }
  ]

  const renderIssueDetails = () => {
    return issues.map(item => {
      if (item.subtitle) {
        return (
          <div key={item.title} className='transaction-item'>
            <Media>
              <Avatar className='rounded' color={item.color} icon={item.Icon} />
              <Media body>
                <h6 className='transaction-title'>{item.title}</h6>
                <small>{item.subtitle}</small>
              </Media>
            </Media>
          </div>
        )
      }
    })
  }

  const issueLifeCycle = () => {
    const lifeCycleObjs = data.lifeCycle
      ? data.lifeCycle.map(item => {
          return {
            title: item.status,
            content: item.remarks,
            date_time: item.timestamp,
            color: item.status === 'resolved' ? 'success' : 'primary',
            icon: <Check size={14} />,
            customContent: (
              <div className='d-flex justify-content-between flex-wrap flex-sm-row flex-column  '>
                {item.createdBy && (
                  <div className='d-flex justify-content-between flex-wrap flex-sm-row flex-column'>
                    <Badge color='light-primary' className='badge-glow mb-50'>
                      <Edit3 size={12} className='align-middle me-25 mx_4' />
                      CreatedBy :
                    </Badge>
                    <p className='mb-0 mx-1 font-weight-bold'>{item.createdBy}</p>
                  </div>
                )}
                {item.updatedBy && (
                  <div className='mt-sm-0 mt-1 d-flex justify-content-between flex-wrap flex-sm-row flex-column'>
                    <Badge color='light-warning' className='badge-glow mb-50'>
                      <Share size={12} className='align-middle me-25 mx_4' />
                      UpdatedBy :
                    </Badge>
                    <p className='mb-0 mx-1 font-weight-bold'>{item.updatedBy}</p>
                  </div>
                )}
                {item.resolvedBy && (
                  <div className='mt-sm-0 mt-1 d-flex justify-content-between flex-wrap flex-sm-row flex-column'>
                    <Badge color='light-success' className='badge-glow mb-50'>
                      <CheckSquare size={12} className='align-middle me-25 mx_4' />
                      ResolvedBy :
                    </Badge>
                    <p className='mb-0 mx-1 font-weight-bold'>{item.resolvedBy}</p>
                  </div>
                )}
              </div>
            )
          }
        })
      : []
    return lifeCycleObjs
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }
  const refresh = () => {
    setFetchingData(true)
  }

  return (
    <div>
      <h5 className='cursor-pointer'>
        <ArrowLeft size={21} className='anim_left' onClick={() => props.back(false)} />
        Back to Coliving Issue
      </h5>

      {hasError ? (
        <Col lg='12' className='p-2'>
          <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
        </Col>
      ) : (
        <DataTable
          columns={tblColumn()}
          tblData={response}
          tableName={'Coliving issue Table'}
          rowCount={10}
          selectable={true}
          onSelectedRowsChange={onSelectedRowsChange}
          toggledClearRows={toggledClearRows}
          extras={
            <>
              <RefreshCcw size={16} id='actionhover' className='cursor-pointer float-right mx-1 refresh_table' onClick={refresh} />
              {/* Update all Rows status */}

              <UncontrolledButtonDropdown className='float-right'>
                <DropdownToggle color='flat' id='dropdown' className='my-0 p-0'>
                  <Edit3 size={18} id='actionhover' className='cursor-pointer ' />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem
                    className='w-100'
                    dropdownvalue='pending'
                    onClick={() => {
                      if (selectedRows.length < 1) {
                        toast.warning(<Toast msg='Select Rows first.' type='warning' />, { hideProgressBar: true })
                      } else {
                        handleBulkUpdateStatus(selectedRows, 'pending')
                      }
                    }}>
                    <Badge pill color='light-warning' className=''>
                      Pending
                    </Badge>
                  </DropdownItem>
                  <DropdownItem
                    className='w-100'
                    dropdownvalue='in_progress'
                    onClick={() => {
                      if (selectedRows.length < 1) {
                        toast.warning(<Toast msg='Select Rows first.' type='warning' />, { hideProgressBar: true })
                      } else {
                        handleBulkUpdateStatus(selectedRows, 'in_progress')
                      }
                    }}>
                    <Badge pill color='light-info' className=''>
                      Progress
                    </Badge>
                  </DropdownItem>

                  <DropdownItem
                    className='w-100'
                    dropdownvalue='resolved'
                    onClick={() => {
                      if (selectedRows.length < 1) {
                        toast.warning(<Toast msg='Select Rows first.' type='warning' />, { hideProgressBar: true })
                      } else {
                        setAllRowsStatusIssueModal(!allRowsstatusIssueModal)
                      }
                    }}>
                    <Badge pill color='light-success' className=''>
                      Resolved
                    </Badge>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledButtonDropdown>
              <UncontrolledTooltip placement='top' target='dropdown'>
                Update Status
              </UncontrolledTooltip>
            </>
          }
        />
      )}

      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal_size mb-0 '>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>{data.title} </ModalHeader>
        <ModalBody className=''>
          <Row>
            <Col md='6'>
              <Card className='card-transaction'>
                <CardHeader>
                  <CardTitle tag='h4'>Issue Details</CardTitle>
                </CardHeader>
                <CardBody className=' height-485 webi_scroller'>{renderIssueDetails()}</CardBody>
              </Card>
            </Col>
            <Col md='6'>
              <Card>
                <CardHeader>
                  <CardTitle tag='h4'>Issue Life Cycle</CardTitle>
                </CardHeader>
                <CardBody className=' height-485 webi_scroller'>
                  <Timeline data={issueLifeCycle()} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </ModalBody>
      </Modal>

      <Modal isOpen={editIssueModal} toggle={() => setEditIssueModal(!editIssueModal)} className='modal-dialog-centered modal-md mb-0'>
        <Form
          onSubmit={event => {
            event.preventDefault()
            updateFormData()
            setEditIssueModal(!editIssueModal)
          }}>
          <ModalHeader toggle={() => setEditIssueModal(!editIssueModal)}>{formData.title} </ModalHeader>

          <ModalBody>
            {Object.keys(formData).length !== 0 &&
              formData.inputs &&
              Object.keys(formData.inputs).map(field => {
                return (
                  <div className='mb-2' key={field}>
                    <Label>{field}</Label>
                    <Input
                      type='text'
                      id={field}
                      name={field}
                      placeholder={`${field} *`}
                      onChange={event => {
                        formData.inputs[`${field}`] = event.target.value
                        setFormData({
                          id: formData.id,
                          inputs: {
                            ...formData.inputs
                          },
                          issueDescription: formData.issueDescription,
                          remarks: formData.remarks
                        })
                      }}
                      value={formData.inputs[`${field}`]}
                      required
                    />
                  </div>
                )
              })}
            <div className='mb-2'>
              <Label>Issue Description</Label>
              <Input
                type='textarea'
                name='issueDescription'
                id='issueDescription'
                rows='3'
                value={formData.issueDescription}
                placeholder='Issue Description'
                onChange={event => {
                  setFormData({
                    id: formData.id,
                    inputs: formData.inputs,
                    issueDescription: event.target.value,
                    remarks: formData.remarks
                  })
                }}
              />
            </div>
            <div className='mb-2'>
              <Label>Remarks</Label>
              <Input
                type='textarea'
                name='remarks'
                id='remarks'
                rows='3'
                value={formData.remarks}
                placeholder='Remarks'
                onChange={event => {
                  setFormData({
                    id: formData.id,
                    inputs: formData.inputs,
                    issueDescription: formData.issueDescription,
                    remarks: event.target.value
                  })
                }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' type='submit'>
              Update
            </Button>
            <Button
              color='danger'
              onClick={() => {
                setEditIssueModal(!editIssueModal)
              }}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* status Issue Modal */}
      <Modal isOpen={statusIssueModal} toggle={() => setStatusIssueModal(!statusIssueModal)} className='modal-dialog-centered modal-md mb-0'>
        <Form
          onSubmit={event => {
            event.preventDefault()
            handleUpdateStatus(rowIdForResolvedStatus, 'resolved', resolverDetails.name, resolverDetails.remarks)
            setStatusIssueModal(!statusIssueModal)
          }}>
          <ModalHeader toggle={() => setStatusIssueModal(!statusIssueModal)}>Resolve Issue</ModalHeader>
          <ModalBody>
            <div className='mb-2'>
              <Label className='form-label' for='remarks'>
                Remarks *
              </Label>
              <Input
                type='text'
                id='remarks'
                placeholder='Remarks'
                onChange={event => {
                  setResolverDetails({
                    name: resolverDetails.name,
                    remarks: event.target.value
                  })
                }}
                value={resolverDetails.remarks}
                required
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' type='submit'>
              Update
            </Button>
            <Button
              color='danger'
              onClick={() => {
                setStatusIssueModal(!statusIssueModal)
              }}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/*to update all rows  status */}
      <Modal
        isOpen={allRowsstatusIssueModal}
        toggle={() => setAllRowsStatusIssueModal(!allRowsstatusIssueModal)}
        className='modal-dialog-centered modal-md mb-0'>
        <Form
          onSubmit={event => {
            event.preventDefault()
            handleBulkUpdateStatus(selectedRows, 'resolved', bulkRemarkStatus)
            setAllRowsStatusIssueModal(!allRowsstatusIssueModal)
          }}>
          <ModalHeader toggle={() => setAllRowsStatusIssueModal(!allRowsstatusIssueModal)}>Resolve Issue</ModalHeader>
          <ModalBody>
            <div className='mb-2'>
              <Label className='form-label' for='remarks'>
                Remarks *
              </Label>
              <Input
                type='text'
                name='bulkRemarkStatus'
                value={bulkRemarkStatus}
                placeholder='Remarks'
                onChange={e => {
                  setBulkRemarkStatus(e.target.value)
                }}
                required
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' type='submit'>
              Update
            </Button>
            <Button
              color='danger'
              onClick={() => {
                setAllRowsStatusIssueModal(!allRowsstatusIssueModal)
              }}>
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  )
}

export default IssuesTable
