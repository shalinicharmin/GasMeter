import React, { useEffect, useState } from 'react'
import DataTable from '@src/views/ui-elements/dataTableUpdated'
import { Eye, Trash2 } from 'react-feather'

import useJwt from '@src/auth/jwt/useJwt'
import jwt_decode from 'jwt-decode'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import { useDispatch } from 'react-redux'
import Loader from '@src/views/project/misc/loader'
import { useLocation, useHistory } from 'react-router-dom'
import { Modal, ModalBody, ModalHeader, Badge } from 'reactstrap'
import MeterModalTableReport from './meterModalTableReport'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import { caseInsensitiveSort } from '@src/views/utils.js'

const SiteHealthTableReport = props => {
  const { siteList, downFactor } = props

  // Logout User
  const [logout, setLogout] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)
  const [resp, setResp] = useState([])
  const [meterModal, setMeterModal] = useState(false)
  const [rowSiteMeters, setRowSiteMeters] = useState('')
  const [rowSiteName, setRowSiteName] = useState('')

  const [loader, setLoader] = useState(false)
  const [page, setpage] = useState(0)
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // Api to call fetch dcus up down
  const fetchSites = async params => {
    return await useJwt
      .postSitesUpDown(params)
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
      // setRetry(true)

      if (siteList.length > 0) {
        let param = {}
        param = {
          siteId: siteList,
          downFactor: downFactor.value
        }

        const [statusCode, response] = await fetchSites(param)

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

  // Meter modal
  const MeterDataModal = () => {
    setMeterModal(!meterModal)
  }

  const onHandleRowClick = row => {
    setRowSiteMeters(row.meters)
    setRowSiteName(row.siteName)
    MeterDataModal()
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
            col_config.width = '250px'
          }
          if (i === 'siteName') {
            col_config.width = '250px'
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
                    // console.log(row.meters)
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
      //         {row["siteName"] && (
      //           <Eye
      //             size='15'
      //             className=' cursor-pointer mx-1'
      //             onClick={() => {
      //               // console.log(row.meters)
      //               setRowSiteMeters(row.meters)
      //               setRowSiteName(row.siteName)
      //               MeterDataModal()
      //             }}
      //           />
      //         )}
      //       </>
      //     )
      //   }
      // })
      column.unshift({
        name: 'Sr No',
        width: '70px',
        cell: (row, i) => {
          return <div className='d-flex  justify-content-center'>{page * 10 + 1 + i}</div>
        }
      })
    }
    return column
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const refresh = () => {
    setError(false)
    setRetry(true)
  }
  return (
    <>
      {loader ? (
        <Loader hight='min-height-330' />
      ) : hasError ? (
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      ) : (
        !retry && (
          <DataTable
            columns={tblColumn()}
            tblData={resp}
            tableName={'Sites Health Report '}
            rowCount={10}
            currentpage={page}
            ispagination
            selectedPage={setpage}
            refresh={refresh}
            handleRowClick={onHandleRowClick}
            pointerOnHover
          />
        )
      )}

      {/* modal to show meter data  */}
      <Modal isOpen={meterModal} toggle={MeterDataModal} className='modal-dialog-centered modal-xl'>
        <ModalHeader toggle={MeterDataModal}>{`Meter Details  `}</ModalHeader>
        <ModalBody>
          <MeterModalTableReport downFactor={downFactor} rowSiteMeters={rowSiteMeters} RowSiteName={rowSiteName} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default SiteHealthTableReport
