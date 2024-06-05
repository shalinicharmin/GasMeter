import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useState, useEffect, useContext } from 'react'
import Commonfilter from '../commonfilte'
import useJwt from '@src/auth/jwt/useJwt'
import { VendorContext } from '../oldAsset'
import { Check, Filter, Plus, X } from 'react-feather'
import { RowCountContext } from '../oldmeterdetail'
import { caseInsensitiveSort } from '@src/views/utils.js'
import {
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledTooltip,
  Button,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
  Label,
  Input,
  ModalFooter
} from 'reactstrap'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

const Discom_gp = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  const [filterModal, setFilterModal] = useState(false)
  const [filterParams, setFilterParams] = useState({})
  const [formModal, setFormModal] = useState(false)
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [data, setData] = useState([])
  const [inputValue, setInputValue] = useState('')

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

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  //  To get gp meter api Response
  const fetchData = async params => {
    try {
      const res = await useJwt.getAnotherStoreMeters(params)
      const data = await res.data
      setData(data)
      const newRowCountArr = RowCount.rowCountValue
      newRowCountArr[3] = data.length
      RowCount.setRowCountFn(newRowCountArr)
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        setLogout(true)
      }
    }
  }

  const onSelectedRowsChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows)
  }

  useEffect(async () => {
    const params = {
      ...filterParams,
      vendorId: vendor.vendor_id
    }
    fetchData(params)
  }, [forceUpdate])

  // post request to return meters back to old asset
  const sendBackToOldAsset = async (data, remarks) => {
    const params = {
      data,
      remarks
    }
    if (data.length > 0) {
      try {
        const res = await useJwt.postAnotherMeterToOldAsset(params)
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
        // col_config.style = {
        //   width: '200px'
        // }
        col_config.selector = row => row[i]
        if (i === 'site_id' || i === 'updatedAt' || i === 'vendor_name' || i === 'sc_no' || i === 'remarks') {
          col_config.width = '200px'
        }

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
    // console.log(e.target.value)
    setInputValue(e.target.value)
  }
  return (
    <>
      {/* {data.length > 0 && ( */}
      <SimpleDataTable
        columns={tblColumn()}
        tblData={data}
        selectable={true}
        tableName={`Discom/GP HQ ( Vendor Name :  ${vendor.vendor_name})`}
        onSelectedRowsChange={onSelectedRowsChange}
        toggledClearRows={toggledClearRows}
        extras={
          <>
            {/* filter */}
            <Button.Ripple className='btn-icon rounded-circle float-right' id='filter' onClick={handleFilter} color='flat-secondary'>
              <Filter size={16} />
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
                  Return back
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
            <UncontrolledTooltip placement='top' target='dropdown'>
              Send to
            </UncontrolledTooltip>
          </>
        }
      />
      {/* filter */}
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

export default Discom_gp
