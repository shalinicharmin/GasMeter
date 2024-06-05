import { useEffect, useState } from 'react'
import DataTable from '@src/views/ui-elements/dataTableUpdated'
import { Card, CardBody, CardText, CardTitle, Col, Row, Button, CardHeader, CardFooter, Modal, ModalHeader, ModalBody } from 'reactstrap'
import useJwt from '@src/auth/jwt/useJwt'
import { Edit, Edit3, Eye, Trash2 } from 'react-feather'
import NewIssueCategory from './newIssueCategory'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import EditIssueCategory from './editIssueCategory'

import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

const Issuecategoylist = () => {
  const [fetchingData, setFetchingData] = useState(true)
  const [response, setResponse] = useState([])
  const [formPopup, setFormPopup] = useState(false)
  const [formUpadte, setFormUpdate] = useState(false)
  const [editFormData, setEditFormData] = useState()

  const dispatch = useDispatch()
  const history = useHistory()

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

  const MySwal = withReactContent(Swal)
  // Api to fetch  coliving issue category list

  const fetchData = async () => {
    return await useJwt
      .getColivingIssueCategories()
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
      let params = undefined
      params = {}
      const [statusCode, responseData] = await fetchData(params)

      if (statusCode === 200) {
        try {
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
  }, [fetchingData, retry])

  // delete request
  const deleteColivingIssueCategories = async params => {
    try {
      const res = await useJwt.deleteColivingIssueCategories(params.id)
      if (res.status === 200) {
        MySwal.fire({
          icon: 'success',
          title: 'Issue Category Deleted',
          text: `Successfully !  ${params.CategoryTitle} Deleted`,
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
          text: 'Issue Category has not be deleted',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        })
      }
    }
  }

  const handleConfirmDeleteuser = row => {
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
        deleteColivingIssueCategories(row)
      }
    })
  }

  const tblColumn = () => {
    const column = []

    for (const i in response[0]) {
      const col_config = {}
      if (i !== 'id' && i !== 'requiredInputFields' && i !== 'issuesCount' && i !== 'isActive' && i !== 'categoryDescription') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        // col_config.style = {
        //   width: '400px'
        // }
        if (i === 'createdAt' || i === 'updatedAt') {
          col_config.width = '200px'
        }
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span className='d-block font-weight-bold '>
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
      name: 'Sr',
      width: '80px',
      cell: (row, index) => {
        return ++index
      }
    })
    column.push({
      name: 'Action',
      width: '120px',
      cell: row => {
        return (
          <>
            <Edit
              size='15'
              className='mx_6 cursor-pointer'
              onClick={() => {
                setEditFormData(row)
                setFormUpdate(!formUpadte)
              }}
            />

            <Trash2
              size='16'
              className='cursor-pointer'
              onClick={() => {
                handleConfirmDeleteuser(row)
              }}
            />
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
      if (column[i].name === 'CategoryTitle') {
        column[i].width = '150px'
        const temp = column[i]
        column[i] = column[1]
        column[1] = temp
      }

      if (column[i].name === 'CreatedBy') {
        column[i].width = '200px'
        const temp = column[i]
        column[i] = column[2]
        column[2] = temp
      }
      if (column[i].name === 'UpdatedBy') {
        column[i].width = '200px'
        const temp = column[i]
        column[i] = column[3]
        column[3] = temp
      }
      if (column[i].name === 'CreatedAt') {
        const temp = column[i]
        column[i] = column[4]
        column[4] = temp
      }
    }
    return column
  }

  const handleformpopup = () => setFormPopup(!formPopup)
  const handleformUpdate = () => setFormUpdate(!formUpadte)

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }
  return (
    <>
      <Row className='mb-2'>
        <Col>
          <h2>Issue Category Creation</h2>
        </Col>
        <Col>
          <Button.Ripple
            color='danger'
            className='float-right p_8'
            onClick={() => {
              handleformpopup()
            }}>
            <Edit3 size={16} />
            <span className='align-middle ml-25'> New Issue Category</span>
          </Button.Ripple>
        </Col>
      </Row>
      {hasError ? (
        <Col lg='12' className='p-2'>
          <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
        </Col>
      ) : (
        <>
          <DataTable columns={tblColumn()} tblData={response} tableName={'Issue Category List  '} rowCount={10} donotShowDownload={true} />
        </>
      )}
      <Modal isOpen={formPopup} toggle={handleformpopup} className={`modal_size modal-dialog-centered`}>
        <ModalHeader toggle={handleformpopup}> New Issue Category</ModalHeader>
        <ModalBody className=''>
          <NewIssueCategory data={response} updtTbl={setFetchingData} handleformpopup={handleformpopup} />
        </ModalBody>
      </Modal>
      <Modal isOpen={formUpadte} toggle={handleformUpdate} className={`modal_size modal-dialog-centered`}>
        <ModalHeader toggle={handleformUpdate}> Update Issue Category</ModalHeader>
        <ModalBody className=''>
          <EditIssueCategory editData={editFormData} updtTbl={setFetchingData} handleformUpdate={handleformUpdate} />
        </ModalBody>
      </Modal>{' '}
    </>
  )
}

export default Issuecategoylist
