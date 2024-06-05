import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useState, useEffect, useContext } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { toast } from 'react-toastify'
import { VendorContext } from '../oldAsset'
import Commonfilter from '../commonfilte'
import { RowCountContext } from '../oldmeterdetail'
import { Check, Filter, X, Plus } from 'react-feather'
import {
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledButtonDropdown,
  UncontrolledTooltip,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Tooltip,
  Button,
  Label,
  FormGroup,
  ModalFooter,
  Input,
  Form
} from 'reactstrap'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '../../../../../../auth/jwt/logoutlogic'
import { caseInsensitiveSort } from '@src/views/utils.js'

const Returntostore = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [filterModal, setFilterModal] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [data, setData] = useState([])
  const [filterParams, setFilterParams] = useState({})
  const [formModal, setFormModal] = useState(false)
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [inputValue, setInputValue] = useState('')

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
  //  To get vendor detail from parent to child
  const vendor = useContext(VendorContext)
  const RowCount = useContext(RowCountContext)
  const MySwal = withReactContent(Swal)
  //  To render the table from parent to child
  const forceUpdate = props.forceUpdate
  const setForceUpdate = props.setForceUpdate

  //  To get gp meter api Response
  const fetchData = async params => {
    try {
      const res = await useJwt.getStoreMeters(params)
      const data = await res.data
      setData(data)
      const newRowCountArr = RowCount.rowCountValue
      newRowCountArr[2] = data.length
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

  const onSelectedRowsChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows)
  }

  // post request to return the meter to store
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
            title: 'Return to store!',
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

  // post request to return meters back to old asset
  const sendBackToOldAsset = async (data, remarks) => {
    const params = {
      data,
      remarks
    }
    if (data.length > 0) {
      try {
        const res = await useJwt.postMeterToOldAsset(params)
        if (res.status === 201) {
          // console.log('success')
          MySwal.fire({
            icon: 'success',
            title: 'Return to store!',
            text: `Your Meter has been returned back to Old Assets.`,
            customClass: {
              confirmButton: 'btn btn-success'
            }
          })
          handleClearRows()
          setInputValue('')
          setFormModal(!formModal)
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
        col_config.style = {
          width: '180px'
        }
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

  const handleConfirmText = storeName => {
    return MySwal.fire({
      text: `Are you sure want to send ${selectedRows.length} meter(s) to ${storeName} ?`,
      title: 'Are you sure!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Return it!',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ml-1'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.value) {
        sendToGPHQorOtherStore(selectedRows, storeName)
      }
    })
  }

  const handleConfirmSendToOldAssets = () => {
    return MySwal.fire({
      text: `You want to send ${selectedRows.length} meter(s) back to Old Assets ?`,
      title: 'Are you sure!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Return it!',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ml-1'
      },
      buttonsStyling: false
    }).then(function (result) {
      if (result.value) {
        sendBackToOldAsset(selectedRows, inputValue)
      }
    })
  }

  const handleChange = e => {
    setInputValue(e.target.value)
  }

  return (
    <>
      {/* {data.length > 0 && ( */}
      <SimpleDataTable
        component_name='Return to store called'
        columns={tblColumn()}
        selectable={true}
        tblData={data}
        tableName={`Return to Store ( Vendor Name :  ${vendor.vendor_name})`}
        onSelectedRowsChange={onSelectedRowsChange}
        toggledClearRows={toggledClearRows}
        extras={
          <>
            {/* filter */}
            <Button.Ripple className='btn-icon rounded-circle float-right' onClick={handleFilter} id='filter' color='flat-secondary'>
              <Filter size={16} className='mt_3' />
            </Button.Ripple>
            <UncontrolledTooltip placement='top' target='filter'>
              Filter
            </UncontrolledTooltip>

            {/* Action to move meter to store */}
            <UncontrolledButtonDropdown className='float-right'>
              <DropdownToggle color='flat' id='dropdown' className='px_7'>
                <Plus size={18} id='actionhover' className='cursor-pointer' />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem
                  dropdownvalue='Move To GP Store'
                  onClick={() => {
                    if (selectedRows.length > 0) {
                      handleConfirmText('GP-HQ')
                    } else {
                      MySwal.fire({
                        icon: 'warning',
                        // title: 'Select the rows first',
                        text: 'Select the rows first',
                        customClass: {
                          confirmButton: 'btn btn-danger'
                        }
                      })
                    }
                  }}>
                  Send To GP HQ
                </DropdownItem>
                <DropdownItem
                  dropdownvalue='Move to Discom'
                  onClick={() => {
                    if (selectedRows.length > 0) {
                      handleConfirmText('Discom')
                    } else {
                      MySwal.fire({
                        icon: 'warning',
                        text: 'Select the rows first',
                        customClass: {
                          confirmButton: 'btn btn-danger'
                        }
                      })
                    }
                  }}>
                  Send to Discom
                </DropdownItem>

                <DropdownItem
                  dropdownvalue='Move to Discom'
                  onClick={() => {
                    if (selectedRows.length > 0) {
                      setFormModal(!formModal)
                    } else {
                      MySwal.fire({
                        icon: 'warning',
                        text: 'Select the rows first',
                        customClass: {
                          confirmButton: 'btn btn-danger'
                        }
                      })
                    }
                  }}>
                  Back to Old Assets
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
            <UncontrolledTooltip placement='top' target='dropdown'>
              Send to
            </UncontrolledTooltip>
          </>
        }
      />
      {/* )} */}

      <Modal isOpen={filterModal} toggle={handleFilter} className='sidebar-md' modalClassName='modal-slide-in-left' contentClassName='pt-0'>
        <ModalHeader className='mb-3' toggle={handleFilter} close={CloseBtn} tag='div'>
          <h4 className='modal-title'>Filter</h4>
        </ModalHeader>
        <ModalBody className='flex-grow-1'>
          <Commonfilter handleFilter={handleFilter} onsubmitdata={submitdata} />
        </ModalBody>
      </Modal>

      {/* back to old assets modal */}
      <Modal isOpen={formModal} toggle={() => setFormModal(!formModal)} className='modal-dialog-centered'>
        <ModalHeader toggle={() => setFormModal(!formModal)}>Back to Old Asset </ModalHeader>
        <Form
          onSubmit={event => {
            event.preventDefault()
            handleConfirmSendToOldAssets()
          }}>
          <FormGroup>
            <ModalBody>
              <Label for='Text'>Reason:</Label>
              <Input type='Text' id='Text' placeholder='Enter Reason' value={inputValue} onChange={handleChange} required autoFocus={true} />
            </ModalBody>
            <ModalFooter>
              <Button color='primary' type='submit'>
                Send
              </Button>
            </ModalFooter>
          </FormGroup>
        </Form>
      </Modal>
    </>
  )
}

export default Returntostore
