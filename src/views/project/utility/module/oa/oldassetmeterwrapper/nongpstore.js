import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useState, useContext, useEffect } from 'react'
import Commonfilter from '../commonfilte'
import useJwt from '@src/auth/jwt/useJwt'
import { Check, CheckCircle, FileText, Filter, Home, Plus, X } from 'react-feather'
import { VendorContext } from '../oldAsset'
import { RowCountContext } from '../oldmeterdetail'
import { caseInsensitiveSort } from '@src/views/utils.js'
import {
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledTooltip,
  Button,
  Label,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

const NonGPStore = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [filterModal, setFilterModal] = useState(false)
  const [filterParams, setFilterParams] = useState({})
  const [selectedRows, setSelectedRows] = useState([])
  const [data, setData] = useState([])
  const [toggledClearRows, setToggleClearRows] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  //  To render the table from parent to child
  const setForceUpdate = props.setForceUpdate
  const forceUpdate = props.forceUpdate

  //  To get vendor detail from parent to child
  const vendor = useContext(VendorContext)
  const RowCount = useContext(RowCountContext)
  const MySwal = withReactContent(Swal)

  // Toggle the state so React Data Table changes to clearSelectedRows are triggered
  const handleClearRows = () => {
    setToggleClearRows(!toggledClearRows)
  }
  //  To get gp meter api Response
  const fetchData = async params => {
    try {
      const res = await useJwt.getNonGPMeters(params)
      const data = await res.data
      setData(data)
      const newRowCountArr = RowCount.rowCountValue
      newRowCountArr[1] = data.length
      RowCount.setRowCountFn(newRowCountArr)
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        setLogout(true)
      }
    }
  }

  useEffect(async () => {
    const params = {
      ...filterParams,
      vendorId: vendor.vendor_id
    }
    fetchData(params)
  }, [forceUpdate])

  // function to select the rows
  const onSelectedRowsChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows)
    // console.log(selectedRows)
  }

  // post request to return the meter to store
  const sendToStore = async jsonBody => {
    if (jsonBody.length > 0) {
      try {
        const res = await useJwt.postMeterToStore({ data: jsonBody })
        if (res.status === 201) {
          MySwal.fire({
            icon: 'success',
            title: 'Return to store!',
            text: 'Your Meter has been Returned.',
            customClass: {
              confirmButton: 'btn btn-success'
            }
          })
          handleClearRows()
          setForceUpdate(!forceUpdate)
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
            text: 'Your Meter has not been Returned.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          })
        }
      }
    }
    setSelectedRows([])
  }

  const tblColumn = () => {
    const column = []

    for (const i in data[0]) {
      const col_config = {}
      if (i !== 'id' && i !== 'vendor_id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        // col_config.style = {
        //   width: '200px'
        // }
        if (i === 'site_id' || i === 'updatedAt' || i === 'vendor_name' || i === 'sc_no' || i === 'remarks') {
          col_config.width = '200px'
        }

        col_config.selector = row => row[i]
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span className='d-block font-weight-bold text-truncate ' title={row[i]}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 20) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 20 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }

    return column
  }

  // To handle filter modal
  const handleFilter = () => setFilterModal(!filterModal)
  const CloseBtn = <X className='cursor-pointer mt_5' size={15} onClick={handleFilter} />

  //   To handle filter data on submit
  const submitdata = filterParams => {
    setFilterParams(filterParams)
    setForceUpdate(!forceUpdate)
  }

  const sendToGPHQorOtherStore = async (data, storeName) => {
    const params = {
      data,
      storeName
    }
    if (data.length > 0) {
      try {
        const res = await useJwt.postMeterToAnotherStore(params)
        if (res.status === 201) {
          MySwal.fire({
            icon: 'success',
            title: 'Return!',
            text: `Your Meter has been Returned ${storeName}.`,
            customClass: {
              confirmButton: 'btn btn-success'
            }
          })
          handleClearRows()
          setForceUpdate(!forceUpdate)
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
            text: 'Your Meter has not been Returned.',
            customClass: {
              confirmButton: 'btn btn-danger'
            }
          })
        }
      }
    }
    setSelectedRows([])
  }

  const handleConfirmText = storeName => {
    return MySwal.fire({
      text: `Are you sure want to send ${selectedRows.length} meter to ${storeName} ?`,
      title: 'Are you sure!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes , Return it!',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ml-1'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.value) {
        if (storeName === 'Store') {
          sendToStore(selectedRows)
        } else {
          sendToGPHQorOtherStore(selectedRows, storeName)
        }
      }
    })
  }

  return (
    <>
      <SimpleDataTable
        columns={tblColumn()}
        selectable={true}
        tblData={data}
        tableName={`Non Smart Meter ( Vendor Name :  ${vendor.vendor_name})`}
        onSelectedRowsChange={onSelectedRowsChange}
        toggledClearRows={toggledClearRows}
        extras={
          <>
            {/* filter */}
            <Button.Ripple className='btn-icon rounded-circle float-right' onClick={handleFilter} id='filter' color='flat-secondary'>
              <Filter size={16} />
            </Button.Ripple>
            <UncontrolledTooltip placement='top' target='filter'>
              Filter
            </UncontrolledTooltip>

            {/* submit button */}
            <UncontrolledButtonDropdown className='float-right'>
              <DropdownToggle color='flat' id='dropdown' className='px_7'>
                <Plus size={18} id='actionhover' className='cursor-pointer' />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem
                  className='w-100'
                  dropdownvalue='Move To GP Store'
                  onClick={() => {
                    if (selectedRows.length > 0) {
                      handleConfirmText('Store')
                    } else {
                      MySwal.fire({
                        icon: 'warning',
                        text: 'Select the Rows first',
                        customClass: {
                          confirmButton: 'btn btn-danger'
                        }
                      })
                    }
                  }}>
                  <Home size={15} />
                  <span className='align-middle'> Store </span>
                </DropdownItem>
                <DropdownItem
                  className='w-100'
                  dropdownvalue='Move to Discom'
                  onClick={() => {
                    if (selectedRows.length > 0) {
                      handleConfirmText('FIR')
                    } else {
                      MySwal.fire({
                        icon: 'warning',
                        text: 'Select the Rows first',
                        customClass: {
                          confirmButton: 'btn btn-danger'
                        }
                      })
                    }
                  }}>
                  <FileText size={15} />
                  <span className='align-middle'> FIR</span>
                </DropdownItem>

                <DropdownItem
                  className='w-100'
                  dropdownvalue='Move to Discom'
                  onClick={() => {
                    if (selectedRows.length > 0) {
                      handleConfirmText('Discom MRT')
                    } else {
                      MySwal.fire({
                        icon: 'warning',
                        text: 'Select the Rows first',
                        customClass: {
                          confirmButton: 'btn btn-danger'
                        }
                      })
                    }
                  }}>
                  <CheckCircle size={15} />
                  <span className='align-middle'> Discom MRT</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
            <UncontrolledTooltip placement='top' target='dropdown'>
              Return to
            </UncontrolledTooltip>
          </>
        }
      />

      <Modal isOpen={filterModal} toggle={handleFilter} className='sidebar-md' modalClassName='modal-slide-in-left' contentClassName='pt-0'>
        <ModalHeader className='mb-3' toggle={handleFilter} close={CloseBtn} tag='div'>
          <h4 className='modal-title'>Filter</h4>
        </ModalHeader>
        <ModalBody className='flex-grow-1'>
          <Commonfilter handleFilter={handleFilter} set_resp={setData} onsubmitdata={submitdata} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default NonGPStore
