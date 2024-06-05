import CreateTable from '@src/views/ui-elements/dtTable/createTable'

import { CardBody, Card, Modal, Form, ModalHeader, ModalBody, ModalFooter, Button, Col, FormGroup, Label, Input } from 'reactstrap'
import { useContext, useState, useEffect } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
// import { useSelector } from 'react-redux'

import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

// import { useLocation } from 'react-router-dom'
import CommonMeterDropdown from './commonMeterDropdown'
import SimpleDataTablePaginated from '@src/views/ui-elements/dtTable/simpleTablePaginated'
import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDASUpdated'

import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

import Loader from '@src/views/project/misc/loader'
import { caseInsensitiveSort } from '@src/views/utils.js'
// import { Edit } from 'react-feather'

// import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'
import MeterConfigDataModal from './meterConfigDataModal'

import MeterProfileDownloadWrapper from './dataDownloadWrapper/meterProfileDownloadWrapper.js'

import { Edit, Eye, X, Layers } from 'react-feather'

const MeterProfileData = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // const responseData = useSelector(state => state.UtilityMdmsFlowReducer)
  const responseData = useSelector(state => state.UtilityMDASAssetListReducer)
  const currentSelectedModuleStatus = useSelector(state => state.CurrentSelectedModuleStatusReducer.responseData)

  const [fetchingData, setFetchingData] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(120)
  const [startDateTime, setStartDateTime] = useState(undefined)
  const [endDateTime, setEndDateTime] = useState(undefined)
  const [response, setResponse] = useState([])
  const [filterParams, setFilterParams] = useState({})
  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [retry, setRetry] = useState(false)

  const [loader, setLoader] = useState(false)
  const [selected_project, set_selected_project] = useState(undefined)

  const [showReportDownloadModal, setShowReportDownloadModal] = useState(false)

  const fetchData = async params => {
    return await useJwt
      .getMDasMeterProfile(params)
      .then(res => {
        const status = res.status
        // console.log(res)

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

  const location = useLocation()

  let project = ''
  if (location.pathname.split('/')[2] === 'sbpdcl') {
    project = 'ipcl'
  } else {
    project = location.pathname.split('/')[2]
  }

  useEffect(async () => {
    if (fetchingData || retry) {
      setLoader(true)
      let params = undefined

      // console.log('Filter Params ....')
      // console.log(filterParams)

      if (!filterParams.hasOwnProperty('site')) {
        params = {
          project,
          ...filterParams,
          page: currentPage,
          page_size: 10
        }
        // params['site'] = dtr_list
      } else {
        params = {
          project,
          ...filterParams,
          page: currentPage,
          page_size: 10
        }
      }

      const [statusCode, response] = await fetchData(params)

      if (statusCode === 200) {
        try {
          setResponse(response.data.data.result.results)
          setTotalCount(response.data.data.result.count)
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
      setLoader(false)
    }
  }, [fetchingData, retry])

  const tblColumn = () => {
    const column = []
    const custom_width = ['create_time']

    for (const i in response[0]) {
      const col_config = {}
      if (i !== 'id' || i !== 'other_config') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.reorder = true
        // col_config.width = '100px'
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        if (custom_width.includes(i)) {
          col_config.width = '250px'
        }

        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold text-truncate'
                title={row[i] ? (row[i] !== '' && row[i] !== 'NaT' && row[i] !== 'nan' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' && row[i] !== 'NaT' && row[i] !== 'nan' ? row[i].toString().substring(0, 10) : '-'}
                {row[i] && row[i] !== '' && row[i] !== 'NaT' && row[i] !== 'nan' ? (row[i].toString().length > 10 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    column.unshift({
      name: 'Sr No.',
      width: '90px',
      sortable: false,
      cell: (row, i) => {
        return <div className='d-flex justify-content-center'>{i + 1 + 10 * (currentPage - 1)}</div>
      }
    })
    return column
  }

  const onNextPageClicked = number => {
    setCurrentPage(number + 1)
    setFetchingData(true)
  }
  const reloadData = () => {
    setCurrentPage(1)
    setFetchingData(true)
  }

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      setFilterParams({})
      setError(false)
      reloadData()
    }
  }

  const onSubmitButtonClicked = filterParams => {
    // console.log('Value passed from child to parent ....')
    // console.log(dummy)
    setFilterParams(filterParams)
    setCurrentPage(1)
    setFetchingData(true)
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const handleReportDownloadModal = () => {
    setShowReportDownloadModal(!showReportDownloadModal)
  }

  // custom Close Button for Report Download Modal
  const CloseBtnForReportDownload = <X className='cursor-pointer mt_5' size={15} onClick={handleReportDownloadModal} />

  return (
    <>
      <Card>
        <CardBody>
          <CommonMeterDropdown tab='block_load' set_resp={setResponse} onSubmitButtonClicked={onSubmitButtonClicked} hideDateRangeSelector={true} />
        </CardBody>
        {loader ? (
          <Loader hight='min-height-330' />
        ) : hasError ? (
          <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
        ) : (
          !retry && (
            <div className='table-wrapper'>
              <SimpleDataTableMDAS
                columns={tblColumn()}
                tblData={response}
                rowCount={10}
                tableName={'Meter Profile'}
                refresh={reloadData}
                currentPage={currentPage}
                totalCount={totalCount}
                onNextPageClicked={onNextPageClicked}
                showRequestDownloadModal={true}
                isDownloadModal={'yes'}
                handleReportDownloadModal={handleReportDownloadModal}
                extraTextToShow={<h5 className={`${totalCount ? 'text-success' : 'text-danger'} m-0`}>Total Meter Count: {totalCount}</h5>}
              />
            </div>
          )
        )}
      </Card>

      {/* Report Download Request History Modal */}
      <Modal
        isOpen={showReportDownloadModal}
        toggle={handleReportDownloadModal}
        style={{ width: '82%' }}
        modalClassName='modal-slide-in'
        contentClassName='pt-0'>
        <ModalHeader className='mb-3' toggle={handleReportDownloadModal} close={CloseBtnForReportDownload} tag='div'>
          <h4 className='modal-title'>Download (Meter Profile Data)</h4>
        </ModalHeader>
        <ModalBody className='flex-grow-1'>
          <MeterProfileDownloadWrapper />
        </ModalBody>
      </Modal>
    </>
  )
}

export default MeterProfileData
