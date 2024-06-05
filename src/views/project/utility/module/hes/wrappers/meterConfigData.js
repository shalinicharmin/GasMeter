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
import { Edit, X } from 'react-feather'

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'
import MeterConfigDataModal from './meterConfigDataModal'

import MeterConfigurationDownloadWrapper from './dataDownloadWrapper/meterConfigurationDownloadWrapper.js'

const MeterConfigData = () => {
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

  const [editCommunicationProtocolModal, setEditCommunicationProtocolModal] = useState(false)

  const [showReportDownloadModal, setShowReportDownloadModal] = useState(false)

  const [rowData, setRowdata] = useState()
  // const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)

  // let user_name = ''
  // if (HierarchyProgress && HierarchyProgress.user_name) {
  //   user_name = HierarchyProgress.user_name
  // }

  const communicationProtocol = [
    { value: 'MQTT', label: 'MQTT' },
    { value: 'RF', label: 'RF' },
    { value: 'TCP', label: 'TCP' }
  ]

  const fetchData = async params => {
    return await useJwt
      .getMDasMeterConfigurationList(params)
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
        // If No Site Selected, add all sites access available
        // let dtr_list = ' '
        // for (let i = 0; i < responseData.responseData.dtr_list.length; i++) {
        //   dtr_list += `${responseData.responseData.dtr_list[i]['dtr_id']},`
        // }
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
          page_size: 10,
          site_id: filterParams.site
        }

        // params = {
        //   project,
        //   site_id: filterParams.site,
        //   page: currentPage,
        //   page_size: 10
        // }
      }

      const [statusCode, response] = await fetchData(params)

      // console.log('Status Code for Meter Configuration .....')
      // console.log(statusCode)
      // console.log(response)

      if (statusCode === 200) {
        try {
          const meterConfigurationResponse = []
          for (let i = 0; i < response.data.data.result.results.length; i++) {
            const temp = response.data.data.result.results[i]

            const other_config_temp = temp.other_config
            delete temp.other_config

            // Inserting new column Blockload Interval Min
            if (other_config_temp.hasOwnProperty('blockload_interval_min')) {
              temp['Blockload Interval'] = other_config_temp.blockload_interval_min
            } else {
              temp['Blockload Interval'] = '-'
            }

            // Inserting new column Blockload Interval Min
            if (other_config_temp.hasOwnProperty('event_push_ipv6')) {
              temp['Push Event IPV6'] = other_config_temp.event_push_ipv6
            } else {
              temp['Push Event IPV6'] = '-'
            }

            // Inserting new column Blockload Interval Min
            if (other_config_temp.hasOwnProperty('periodic_push_ipv6')) {
              temp['Periodic Push IPV6'] = other_config_temp.periodic_push_ipv6
            } else {
              temp['Periodic Push IPV6'] = '-'
            }

            // Inserting new column Blockload Interval Min
            if (other_config_temp.hasOwnProperty('periodic_push_time')) {
              temp['Periodic Push Time'] = other_config_temp.periodic_push_time
            } else {
              temp['Periodic Push Time'] = '-'
            }

            temp['is_enabled'] = temp.is_enabled.toString().toUpperCase()
            meterConfigurationResponse.push(temp)
          }

          setResponse(meterConfigurationResponse)
          setTotalCount(response.data.data.result.count)
          setFetchingData(false)
          setRetry(false)
        } catch (error) {
          // console.log('Error .....')
          // console.log(error)

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

  const onEditModal = () => {
    setEditCommunicationProtocolModal(!editCommunicationProtocolModal)
  }

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
        // col_config.width = '150px'
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        if (custom_width.includes(i)) {
          col_config.width = '250px'
        }

        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold '
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
      name: 'Action',
      width: '70px',
      cell: row => {
        return (
          <>
            <Edit
              size='15'
              color='blue'
              className='ml-1 cursor-pointer'
              onClick={() => {
                setRowdata(row)
                onEditModal()
              }}
            />
          </>
        )
      }
    })
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
          <CommonMeterDropdown
            tab='block_load'
            set_resp={setResponse}
            onSubmitButtonClicked={onSubmitButtonClicked}
            hideDateRangeSelector={true}
            hideMeterSelector={false}
            hideMeterSearch={false}
          />
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
                tableName={'Meter Configuration Table'}
                refresh={reloadData}
                currentPage={currentPage}
                totalCount={totalCount}
                onNextPageClicked={onNextPageClicked}
                showRequestDownloadModal={true}
                isDownloadModal={'yes'}
                extraTextToShow={<h5 className={`${totalCount ? 'text-success' : 'text-danger'} m-0`}>Total Meter Count: {totalCount}</h5>}
                handleReportDownloadModal={handleReportDownloadModal}
              />
            </div>
          )
        )}
      </Card>

      {/* To Edit communication Protocol Modal */}
      <Modal isOpen={editCommunicationProtocolModal} toggle={() => onEditModal()} className='modal-dialog-centered modal-md mb-0'>
        <ModalHeader toggle={() => onEditModal()}> Edit Communication Protocol </ModalHeader>

        <ModalBody>
          <MeterConfigDataModal onEditModal={onEditModal} row={rowData} setFetchingData={setFetchingData} />
        </ModalBody>
      </Modal>

      {/* Report Download Request History Modal */}
      <Modal
        isOpen={showReportDownloadModal}
        toggle={handleReportDownloadModal}
        style={{ width: '82%' }}
        modalClassName='modal-slide-in'
        contentClassName='pt-0'>
        <ModalHeader className='mb-3' toggle={handleReportDownloadModal} close={CloseBtnForReportDownload} tag='div'>
          <h4 className='modal-title'>Download (Meter Configuration Data)</h4>
        </ModalHeader>
        <ModalBody className='flex-grow-1'>
          <MeterConfigurationDownloadWrapper />
        </ModalBody>
      </Modal>
    </>
  )
}

export default MeterConfigData
