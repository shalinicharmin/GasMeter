import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useState } from 'react'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { toast } from 'react-toastify'
import OldMeterDetail from './oldmeterdetail'
import { Check, Filter, X } from 'react-feather'
import Commonfilter from './commonfilte'
import { caseInsensitiveSort } from '@src/views/utils.js'
import {
  Modal,
  ModalBody,
  ModalHeader,
  Card,
  CardHeader,
  UncontrolledTooltip,
  CardTitle,
  CardBody,
  Row,
  Col,
  Input,
  Form,
  Button,
  Label
} from 'reactstrap'

const ApprovalDashboard = props => {
  const [centeredModal, setCenteredModal] = useState(false)
  const [selectedRows, setSelectedRows] = useState(false)
  const [filterModal, setFilterModal] = useState(false)
  const data = [
    {
      id: '1',
      Consumer_Name: 'xyz',
      Site_detail: 2214,
      Meter_No: 120,
      VeNdor_Id: '12345',
      Status: 'Approve/Reject',
      Last_Timestamp: ' 05:02 PM, Feb 09, 2022'
    },
    {
      id: '2',
      Consumer_Name: 'abc',
      Site_detail: 2212,
      Meter_No: 120,
      VeNdor_Id: '12345',
      Status: 'Approve/Reject',
      Last_Timestamp: ' 05:02 PM, Feb 09, 2022'
    },
    {
      id: '3',
      Consumer_Name: 'def',
      Site_detail: 2212,
      Meter_No: 120,
      VeNdor_Id: '12345',
      Status: 'Approve/Reject',
      Last_Timestamp: ' 05:01 PM, Feb 09, 2022'
    },
    {
      id: '4',
      Consumer_Name: 'ghi',
      Site_detail: 2212,
      Meter_No: 120,
      VeNdor_Id: '12345',
      Status: 'Approve/Reject',
      Last_Timestamp: '02:31 PM, Feb 09, 2022'
    },
    {
      id: '5',
      Consumer_Name: 'jkl',
      Site_detail: 2212,
      Meter_No: 120,
      VeNdor_Id: '12345',
      Status: 'Approve/Reject',
      Last_Timestamp: ' 02:30 PM, Feb 09, 2022'
    },
    {
      id: '6',
      Consumer_Name: 'mno',
      Site_detail: 2212,
      Meter_No: 120,
      VeNdor_Id: '12345',
      Status: 'Approve/Reject',
      Last_Timestamp: ' 02:30 PM, Feb 09, 2022'
    },
    {
      id: '7',
      Consumer_Name: 'pqr',
      Site_detail: 2212,
      Meter_No: 120,
      VeNdor_Id: '12345',
      Status: 'Approve/Reject',
      Last_Timestamp: ' 02:30 PM, Feb 09, 2022'
    },
    {
      id: '8',
      Consumer_Name: 'xyz',
      Site_detail: 2212,
      Meter_No: 120,
      VeNdor_Id: '12345',
      Status: 'Approve/Reject',
      Last_Timestamp: ' 02:30 PM, Feb 09, 2022'
    },
    {
      id: '9',
      Consumer_Name: 'xyz',
      Site_detail: 2212,
      Meter_No: 120,
      VeNdor_Id: '12345',
      Status: 'Approve/Reject',
      Last_Timestamp: ' 02:30 PM, Feb 09, 2022'
    }
  ]

  const tblColumn = () => {
    const column = []

    for (const i in data[0]) {
      const col_config = {}
      if (i !== 'id') {
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
                className='d-block font-weight-bold '
                // style={{ width: '18vh' }}
                onClick={() => setCenteredModal(true)}>
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
  const submitdata = filterdata => {
    // const data = {
    //   ...filterdata
    // }
    // console.log('props passed')
    // console.log(filterdata)
  }
  // function to selectrows
  const onSelectedRowsChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows)
    // console.log('Rows Selected ....')
    // console.log(selectedRows)
  }

  const submitRows = selectedRows => {
    // toast.success(<Toast msg='Successfuly Meter Approved' type='success' />, { hideProgressBar: true })
    if (selectedRows) {
      toast.success(<Toast msg='Successfuly Meter Approved' type='success' />, { hideProgressBar: true })
    } else {
      toast.error(<Toast msg='Please select meter' type='danger' />, { hideProgressBar: true })
    }

    // console.log(selectedRows)
  }

  return (
    <>
      {/* {oldMeterDetailState ? (
        <OldMeterDetail />
      ) : (
        <SimpleDataTable columns={tblColumn()} tblData={data} tableName={'venderWise old meter data'} />
      )} */}

      <SimpleDataTable
        columns={tblColumn()}
        selectable={true}
        tblData={data}
        onSelectedRowsChange={onSelectedRowsChange}
        tableName={'Approval Dashboard'}
        extras={
          <>
            <Button.Ripple className='btn-icon rounded-circle float-right' onClick={handleFilter} id='filter' color='flat-secondary'>
              <Filter size={16} />
            </Button.Ripple>
            <UncontrolledTooltip placement='top' target='filter'>
              Filter
            </UncontrolledTooltip>
            <Button.Ripple
              className='btn-icon rounded-circle float-right'
              id='submit'
              color='flat-secondary'
              onClick={() => {
                submitRows(selectedRows)
              }}>
              <Check size={20} />
            </Button.Ripple>
            <UncontrolledTooltip placement='top' target='submit'>
              Submit
            </UncontrolledTooltip>
          </>
        }
      />

      <Modal isOpen={filterModal} toggle={handleFilter} className='sidebar-md' modalClassName='modal-slide-in-left' contentClassName='pt-0'>
        <ModalHeader className='mb-3' toggle={handleFilter} close={CloseBtn} tag='div'>
          <h4 className='modal-title'>Command history - Filter</h4>
        </ModalHeader>
        <ModalBody className='flex-grow-1'>
          {/* <FilterForm
            handleFilter={handleFilter}
            protocol={protocol}
            AppliedFilterparams={AppliedFilterparams}
            filterAppliedParams={filterAppliedParams}
          /> */}
          <Commonfilter handleFilter={handleFilter} onsubmitdata={submitdata} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default ApprovalDashboard
