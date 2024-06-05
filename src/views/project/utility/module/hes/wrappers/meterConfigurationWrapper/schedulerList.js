import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'

import { Col, Row, Modal, ModalHeader, ModalBody, Tooltip, Button } from 'reactstrap'
import React, { useState } from 'react'
import { Plus, Edit } from 'react-feather'

import AddSchedulerData from './addSchedulerdata'
import { caseInsensitiveSort } from '@src/views/utils.js'
const SchedulerList = props => {
  const [addScheduler, setAddScheduler] = useState(false)
  const [addcenteredSchedulerModal, setAddCenteredSchedulerModal] = useState(false)
  const [showdataEdit, setShowDataEdit] = useState(false)
  const data = [
    {
      Name: 'xyz',
      id: '1',
      Task: 'Blocck_load',
      Last_Run_Time: '5:00:01 a.m.',
      Schedule_Time: '6:00:09 a.m.',
      Enable: 'On',
      Arguments: '-'
    },
    {
      Name: 'xyz',
      id: '2',
      Task: 'Blocck_load',
      Last_Run_Time: '5:00:01 a.m.',
      Schedule_Time: '6:00:09 a.m.',
      Enable: 'On',
      Arguments: '-'
    },
    {
      Name: 'xyz',
      id: '3',
      Task: 'Blocck_load',
      Last_Run_Time: '5:00:01 a.m.',
      Schedule_Time: '6:00:09 a.m.',
      Enable: 'On',
      Arguments: '-'
    },
    {
      Name: 'xyz',
      id: '4',
      Task: 'Blocck_load',
      Last_Run_Time: '5:00:01 a.m.',
      Schedule_Time: '6:00:09 a.m.',
      Enable: 'On',
      Arguments: '-'
    },
    {
      Name: 'xyz',
      id: '5',
      Task: 'Blocck_load',
      Last_Run_Time: '5:00:01 a.m.',
      Schedule_Time: '6:00:09 a.m.',
      Enable: 'On',
      Arguments: '-'
    },
    {
      Name: 'xyz',
      id: '6',
      Task: 'Blocck_load',
      Last_Run_Time: '5:00:01 a.m.',
      Schedule_Time: '6:00:09 a.m.',
      Enable: 'On',
      Arguments: '-'
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
                // onClick={() => handleRowClick(row.id, row.feeder_id, row.pss_id)}
              >
                {row[i]}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }

    column.push({
      name: 'Edit',
      maxWidth: '100px',
      style: {
        minHeight: '40px',
        maxHeight: '40px'
      },
      cell: row => {
        return <Edit size='20' className='ml-1 cursor-pointer' onClick={() => setShowDataEdit(true)} />
      }
    })

    return column
  }
  const AddScheduler = () => {
    return (
      <>
        <Plus className='cursor-pointer float-right mt_7   ' id='addScheduler' size={17} onClick={() => setAddCenteredSchedulerModal(true)} />
        <Tooltip placement='top' isOpen={addScheduler} target='addScheduler' toggle={() => setAddScheduler(!addScheduler)}>
          Add Scheduler !
        </Tooltip>
      </>
    )
  }

  return (
    <>
      <SimpleDataTable columns={tblColumn()} tblData={data} scheduler={[]} extras={AddScheduler()} />

      <Modal
        isOpen={addcenteredSchedulerModal}
        toggle={() => setAddCenteredSchedulerModal(!addcenteredSchedulerModal)}
        className={`modal-lg modal-dialog-centered`}>
        <ModalHeader toggle={() => setAddCenteredSchedulerModal(!addcenteredSchedulerModal)}>Add Scheduler</ModalHeader>
        <ModalBody className='p-0'>
          <AddSchedulerData />
        </ModalBody>
      </Modal>

      <Modal isOpen={showdataEdit} toggle={() => setShowDataEdit(!showdataEdit)} className={`modal-lg modal-dialog-centered`}>
        <ModalHeader toggle={() => setShowDataEdit(!showdataEdit)}>Data</ModalHeader>
        <ModalBody className='p-0'>
          <h1>Hlw</h1>
        </ModalBody>
      </Modal>
    </>
  )
}

export default SchedulerList
