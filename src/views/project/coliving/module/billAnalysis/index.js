import React, { useEffect, useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, CardBody, Modal, ModalBody, ModalHeader, Col } from 'reactstrap'
import DataTable from '@src/views/ui-elements/dataTableUpdated'
import { ArrowUpCircle, CheckCircle, Eye, XCircle } from 'react-feather'
import CardBillAnalysis from '@src/views/project/coliving/module/billAnalysis/wrapper/billAnalyseCard'
import BillDetailModal from './wrapper/viewBillDetail'
import UpdateAnalysis from './wrapper/analyzeReport'
import useJwt from '@src/auth/jwt/useJwt'
import { useSelector, useDispatch } from 'react-redux'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import { useHistory } from 'react-router-dom'
// import { useDispatch } from 'react-redux'
import authLogout from '../../../../../auth/jwt/logoutlogic'

const BillAnalysis = () => {
  const [pendingData, setPendingData] = useState([])
  const [userData, setUserData] = useState([])
  const [billData, setBillData] = useState(false)
  const [centeredModal, setCenteredModal] = useState(false)
  const [active, setActive] = useState('1')
  const responseSelector = useSelector(state => state.BillAnalysisReducer)

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

  const getBillAnalysisDataList = async params => {
    return await useJwt
      .getBillAnalysisDataList(params)
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

  const getBillAnalysisDetail = async id => {
    return await useJwt
      .getBillAnalysisDetail(id)
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
    if (responseSelector || retry) {
      const [statusCode, response] = await getBillAnalysisDataList({ stats: 'Pending' })
      if (statusCode === 200) {
        try {
          setPendingData(response.data.data.result)
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
      const [successStatusCode, successResponse] = await getBillAnalysisDataList({ stats: 'Success' })

      if (successStatusCode === 200) {
        try {
          setUserData(successResponse.data.data.result)
          setRetry(false)
        } catch (error) {
          setRetry(false)
          setError(true)
          setErrorMessage('Something went wrong, please retry')
        }
      } else if (successStatusCode === 401 || successStatusCode === 403) {
        setLogout(true)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage('Network Error, please retry')
      }
    }
  }, [responseSelector, retry])

  const tblColumn = data => {
    const column = []

    for (const i in data[0]) {
      const col_config = {}
      if (!['id', 'analysis_status', 'bill_url', 'report_detail'].includes(i)) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.selector = row => row[i]
        col_config.sortable = true
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold text-truncate'
                title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 10) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 10 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }

    const getBill = async row => {
      const [statusCode, response] = await getBillAnalysisDetail(row['id'])

      if (statusCode) {
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          setBillData(response.data.data.result)
          setCenteredModal(true)
        }
      }
    }

    const analyzeBill = () => {
      setBillData(false)
      setCenteredModal(true)
    }

    column.push({
      name: 'Action',
      width: '80px',
      cell: row => {
        return (
          <>
            {/* <div className={`circle ${row['analysis_status'] === 'Pending' ? 'bg-danger' : 'bg-success'}`}></div>
            <ArrowUpCircle size='15' className=' ml_5 cursor-pointer' onClick={analyzeBill} /> */}
            <Eye size='15' className=' ml_5 cursor-pointer' onClick={() => getBill(row)} />
          </>
        )
      }
    })

    return column
  }

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <>
      <Nav className='justify-content-center' tabs>
        <NavItem>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1')
            }}>
            Bill pending for analysis
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            Analysed bill history
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          {hasError ? (
            <Col lg='12' className=''>
              <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
            </Col>
          ) : (
            <CardBillAnalysis data={pendingData} />
          )}
        </TabPane>
        <TabPane tabId='2'>
          {hasError ? (
            <Col lg='12' className=''>
              <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
            </Col>
          ) : (
            <>
              <DataTable columns={tblColumn(userData)} tblData={userData} rowCount={10} tableName={'Analysed bill history'} />
            </>
          )}
        </TabPane>
      </TabContent>

      <Modal
        isOpen={centeredModal}
        toggle={() => setCenteredModal(!centeredModal)}
        scrollable
        className={billData ? 'modal_size h-100' : 'modal-md modal-dialog-centered'}>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>{billData ? 'Bill issue report' : 'Update analysis report'}</ModalHeader>
        <ModalBody>{billData ? <BillDetailModal data={billData} /> : <UpdateAnalysis />}</ModalBody>
      </Modal>
    </>
  )
}
export default BillAnalysis
