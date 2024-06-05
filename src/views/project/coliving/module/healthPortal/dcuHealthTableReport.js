import React, { useEffect, useState } from 'react'
import DataTable from '@src/views/ui-elements/dataTableUpdated'
import { Eye, Trash2 } from 'react-feather'

import useJwt from '@src/auth/jwt/useJwt'
import jwt_decode from 'jwt-decode'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import { useDispatch } from 'react-redux'

import { Badge, Modal, ModalBody, ModalHeader } from 'reactstrap'
import { useLocation, useHistory } from 'react-router-dom'
import Loader from '@src/views/project/misc/loader'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import DcuMeterTableReport from './dcuMeterTableReport'
import { caseInsensitiveSort } from '@src/views/utils.js'
const DcuhealthTableReport = props => {
  const { siteList, downFactor } = props

  const [dcuMetreslist, setdcuMetreslist] = useState('')
  const [dcuMeterModal, setDcuMeterModal] = useState(false)
  const [siteName, setsiteName] = useState('')
  const [page, setpage] = useState(0)

  // Logout User
  const [logout, setLogout] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [loader, setLoader] = useState(false)
  const [retry, setRetry] = useState(false)
  const [resp, setResp] = useState('')

  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // Api to call fetch dcus up down
  const fetchDCUS = async params => {
    return await useJwt
      .postDcusUpDown(params)
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
    if (retry || downFactor) {
      setLoader(true)
      if (siteList.length > 0) {
        let param = {}
        param = {
          siteId: siteList,
          downFactor: downFactor.value
        }

        const [statusCode, response] = await fetchDCUS(param)

        if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else if (statusCode === 200) {
          try {
            // Set Response Data
            // console.log(response.data.data.result)
            setResp(response.data.data.result)
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }
      } else {
        setRetry(false)
        setResp([])
      }
      setLoader(false)
    }
  }, [retry, downFactor, siteList])

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const refresh = () => {
    setError(false)
    setRetry(true)
  }

  const dcuMeterDataModal = () => {
    setDcuMeterModal(!dcuMeterModal)
  }

  const onHandleRowClick = row => {
    setdcuMetreslist(row.meters)
    setsiteName(row.siteName)
    dcuMeterDataModal()
  }
  const tblColumn = () => {
    const column = []
    if (resp.length > 0) {
      for (const i in resp[0]) {
        const col_config = {}
        if (i !== 'meters' && i !== 'status' && i !== 'siteId') {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
          col_config.serch = i
          col_config.sortable = true
          col_config.selector = row => row[i]
          col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

          if (i === 'siteId') {
            col_config.width = '200px'
          }
          if (i === 'siteName') {
            col_config.width = '200px'
          }
          if (i === 'ldp') {
            col_config.width = '200px'
          }
          col_config.cell = row => {
            return (
              <div className='d-flex'>
                <span
                  className='d-block font-weight-bold cursor-pointer '
                  onClick={() => {
                    onHandleRowClick(row)
                  }}
                  title={row[i] ? (row[i] ? (row[i] !== '' ? (row[i].toString().length > 20 ? row[i] : '') : '-') : '-') : '-'}>
                  {row[i] ? (row[i] && row[i] !== '' ? row[i].toString().substring(0, 25) : '-') : '-'}
                  {row[i] ? (row[i] && row[i] !== '' ? (row[i].toString().length > 25 ? '...' : '') : '-') : '-'}
                </span>
              </div>
            )
          }
          column.push(col_config)
        }
      }
      column.push({
        name: 'Status',
        width: '120px',
        cell: row => {
          if (row.status === 'up') {
            return (
              <>
                <Badge pill color='success' className='mx_7' id='success'>
                  {row.status}
                </Badge>
              </>
            )
          } else if (row.status === 'down') {
            return (
              <>
                <Badge pill color='danger' className='' id='processing'>
                  {row.status}
                </Badge>
              </>
            )
          }
        }
      })
      // column.push({
      //   name: "Action",
      //   width: "120px",
      //   cell: (row, index) => {
      //     return (
      //       <>
      //         <Eye
      //           size='15'
      //           className=' cursor-pointer mx-2'
      //           onClick={() => {
      //             setdcuMetreslist(row.meters)
      //             setsiteName(row.siteName)
      //             dcuMeterDataModal()
      //           }}
      //         />
      //       </>
      //     )
      //   }
      // })
      column.unshift({
        name: 'Sr No.',
        width: '70px',
        cell: (row, i) => {
          return <div className='d-flex  justify-content-center'>{page * 10 + 1 + i}</div>
        }
      })
    }
    return column
  }

  // console.log('loader to show .........', loader)
  return (
    <>
      {loader ? (
        <Loader hight='min-height-330' />
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
            tblData={resp}
            tableName={'DCU Health Report '}
            rowCount={10}
            currentpage={page}
            ispagination
            selectedPage={setpage}
            refresh={refresh}
            pointerOnHover
            handleRowClick={onHandleRowClick}
          />
        )
      )}

      {/* modal to show dcu meters data  */}
      <Modal isOpen={dcuMeterModal} toggle={dcuMeterDataModal} className='modal-dialog-centered modal-xl'>
        <ModalHeader toggle={dcuMeterDataModal}>{`Meter Details  `}</ModalHeader>
        <ModalBody>
          <DcuMeterTableReport downFactor={downFactor} dcuMetreslist={dcuMetreslist} RowSiteName={siteName} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default DcuhealthTableReport
