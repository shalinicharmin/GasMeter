import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useState, useEffect, createContext } from 'react'
import OldMeterDetail from './oldmeterdetail'
import useJwt from '@src/auth/jwt/useJwt'
import Commonfilter from './commonfilte'
import { Check, Filter, X } from 'react-feather'
import { Modal, ModalBody, ModalHeader, Card, CardHeader, CardTitle, CardBody, Row, Col, Input, Form, Button, Label } from 'reactstrap'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import { caseInsensitiveSort } from '@src/views/utils.js'

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'

import { useDispatch, useSelector, batch } from 'react-redux'

const VendorContext = createContext()
const oldAsset = props => {
  const dispatch = useDispatch()

  const [response, setResponse] = useState([])
  const [totalCount, setTotalCount] = useState(120)
  const [fetchingData, setFetchingData] = useState(true)
  const [filterModal, setFilterModal] = useState(false)
  const [centeredModal, setCenteredModal] = useState(false)
  const [vendor, SetVendor] = useState('')
  const [status, setStatus] = useState(false)

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)

  const [selected_project, set_selected_project] = useState(undefined)
  const currentSelectedModuleStatus = useSelector(state => state.CurrentSelectedModuleStatusReducer.responseData)

  //  Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      setRetry(true)
      setError(false)
      props.setActive('1')
      props.back(false)
    }
  }
  //  To get old meter api response
  const fetchData = async params => {
    return await useJwt
      .getVendors(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        const status = 0
        return [status, err]
      })
  }

  useEffect(async () => {
    if (fetchingData || retry) {
      setStatus(true)
      let params = undefined
      params = {}
      const [statusCode, responseData] = await fetchData(params)

      if (statusCode === 200) {
        try {
          setResponse(responseData.data)
          setTotalCount(responseData.data.length)
          setFetchingData(false)
          setRetry(false)
          setError(false)
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

      setStatus(false)
    }
  }, [fetchingData, retry])

  const tblColumn = () => {
    const column = []

    for (const i in response[0]) {
      const col_config = {}
      if (i !== 'vendor_id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        // col_config.style = {
        //   width: '400px'
        // }
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold cursor-pointer   '
                // style={{ width: '18vh' }}
                onClick={() => {
                  SetVendor(row)
                  setCenteredModal(true)
                }}>
                {row[i]}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }

    return column
  }

  const handleFilter = () => setFilterModal(!filterModal)
  const CloseBtn = <X className='cursor-pointer mt_5' size={15} onClick={handleFilter} />

  const reloadData = () => {
    // setCurrentPage(1)
    setFetchingData(true)
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <>
      {hasError ? (
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      ) : (
        <SimpleDataTable
          columns={tblColumn()}
          refresh={reloadData}
          status={status}
          tblData={response}
          totalCount={totalCount}
          tableName={'VendorWise old meter data'}
        />
      )}
      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal-xl mb-0'>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Vendor Old Smart meter and Non smart meter detail </ModalHeader>
        <ModalBody className=''>
          <VendorContext.Provider value={vendor}>
            <OldMeterDetail />
          </VendorContext.Provider>
        </ModalBody>
      </Modal>
    </>
  )
}

export default oldAsset
export { VendorContext }
