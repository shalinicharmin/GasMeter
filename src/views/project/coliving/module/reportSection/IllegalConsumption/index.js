import React, { useState } from 'react'
import DataTable from '@src/views/ui-elements/dataTableUpdated'
import { Eye, Trash2 } from 'react-feather'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { caseInsensitiveSort } from '@src/views/utils.js'

const IllegalConsumption = () => {
  const [meterDetailModal, setMeterDetailModal] = useState(false)

  const data = [
    {
      id: '1',
      site_name: 'xyz',
      substation: 2214,
      dt_installed: 'Yes',
      start_time: ' 05:01 PM, Feb 09, 2022',
      update_time: ' 05:02 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '2',
      site_name: 'abc',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 05:01 PM, Feb 09, 2022',
      update_time: ' 05:02 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '3',
      site_name: 'def',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 05:00 PM, Feb 09, 2022',
      update_time: ' 05:01 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '4',
      site_name: 'ghi',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: '02:31 PM, Feb 09, 2022',
      update_time: '02:31 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '5',
      site_name: 'jkl',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 02:29 PM, Feb 09, 2022',
      update_time: ' 02:30 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '6',
      site_name: 'mno',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 06:40 PM, Feb 08, 2022',
      update_time: ' 06:40 PM, Feb 08, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '7',
      site_name: 'pqr',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: '06:39 PM, Feb 08, 2022',
      update_time: '06:39 PM, Feb 08, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '8',
      site_name: 'xyz',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: '06:40 PM, Feb 08, 2022',
      update_time: '06:40 PM, Feb 08, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '9',
      site_name: 'xyz',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 06:39 PM, Feb 08, 2022',
      update_time: ' 06:39 PM, Feb 08, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '10',
      site_name: 'xyz',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 06:39 PM, Feb 08, 2022',
      update_time: ' 06:39 PM, Feb 08, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    }
  ]
  const tblColumn = () => {
    const column = []
    for (const i in data[0]) {
      const col_config = {}
      if (i !== 'meters') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold '
                title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 20 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 30) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 30 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    // column.push({
    //   name: 'Action',
    //   width: '120px',
    //   cell: (row, index) => {
    //     return (
    //       <>
    //         <Eye size='15' className='mx-1 cursor-pointer' onClick={() => setMeterDetailModal(!meterDetailModal)} />
    //       </>
    //     )
    //   }
    // })
    return column
  }
  return (
    <>
      <DataTable height={true} columns={tblColumn()} tblData={data} tableName={'Illegal Consumption Report '} rowCount={10} />

      {/* Meter Modal */}
      {/* <Modal isOpen={meterDetailModal} toggle={() => setMeterDetailModal(!meterDetailModal)} className={`modal-xl modal-dialog-centered`}>
        <ModalHeader toggle={() => setMeterDetailModal(!meterDetailModal)}>Meter Report</ModalHeader>
        <ModalBody>
          <MeterModalTableReport />
        </ModalBody>
      </Modal> */}
    </>
  )
}

export default IllegalConsumption
