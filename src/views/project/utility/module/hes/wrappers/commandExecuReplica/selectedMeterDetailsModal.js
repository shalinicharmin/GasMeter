import React, { useState } from 'react'
import DataTable from '@src/views/ui-elements/dataTableUpdated'
import { Trash2 } from 'react-feather'
import { Button, Row, Col } from 'reactstrap'
import { caseInsensitiveSort } from '@src/views/utils.js'

const MeterDetailsModal = props => {
  const { MeterTblData, rowIndex, selectedPssRow, selectedDtrRow, selectedFeederRow, assetType } = props

  const SelectedPssMeterList = (MeterTblDataParam, selectedPssRowParam, selectedDtrRowParam, selectedFeederRowParam) => {
    for (let i = 0; i < MeterTblDataParam.length; i++) {
      if (assetType === 'pss') {
        if (selectedPssRowParam.pss_id === MeterTblDataParam[i].pss_id) {
          return MeterTblDataParam[i].meters
        }
      } else if (assetType === 'feeder') {
        if (selectedFeederRowParam.feeder_id === MeterTblDataParam[i].feeder_id) {
          return MeterTblDataParam[i].meters
        }
      } else if (assetType === 'dtr') {
        if (selectedDtrRowParam.site_id === MeterTblDataParam[i].site_id) {
          return MeterTblDataParam[i].meters
        }
      }
    }
    return []
  }

  const [data, setData] = useState(SelectedPssMeterList(MeterTblData, selectedPssRow, selectedDtrRow, selectedFeederRow, assetType))

  // on delete function to delete a row
  const onDelete = deletable => {
    const response = data.filter(i => i !== deletable)
    setData(response)
  }

  // on click function  for update
  const confirmUpdate = () => {
    if (data.length === 0) {
      const newData = [...MeterTblData.slice(0, rowIndex), ...MeterTblData.slice(rowIndex + 1)]
      props.updateMeterList(newData)
    } else {
      MeterTblData[rowIndex].meters = data
      MeterTblData[rowIndex].total_Meters_Count = data.length
      props.updateMeterList(MeterTblData)
    }
    // props.updateMeterList(MeterTblData)
  }

  // table columns
  const tblColumn = () => {
    const column = []
    for (const i in data[0]) {
      const col_config = {}
      if (
        i !== 'house_id' &&
        i !== 'site_id' &&
        i !== 'supply_type' &&
        i !== 'name_bill' &&
        i !== 'latitude' &&
        i !== 'longitude' &&
        i !== 'pole_id' &&
        i !== 'meter_protocol_type' &&
        i !== 'feeder_id' &&
        i !== 'pss_id' &&
        i !== 'value' &&
        i !== 'label' &&
        i !== 'isFixed'
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.width = '200px'
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold '
                title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 15) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 15 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    column.push({
      name: 'Action',
      width: '120px',
      cell: row => {
        return (
          <>
            <Trash2 size='15' className=' ml-1 cursor-pointer' onClick={i => onDelete(row)} />
          </>
        )
      }
    })
    return column
  }
  return (
    <>
      <DataTable columns={tblColumn()} tblData={data} tableName={'Added  Meter  Details'} donotShowDownload={true} rowCount={10} />
      {/* Update button */}
      <Button.Ripple color='primary' className='float-right' onClick={confirmUpdate}>
        Update
      </Button.Ripple>
    </>
  )
}

export default MeterDetailsModal
