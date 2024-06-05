import React, { useState } from 'react'
import { Download, X } from 'react-feather'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import Flatpickr from 'react-flatpickr'
import { Button, Col, FormGroup, Input, Modal, ModalBody, ModalHeader, Row, UncontrolledTooltip } from 'reactstrap'
import DataTable from '@src/views/ui-elements/dataTableUpdated'
import { caseInsensitiveSort } from '@src/views/utils.js'

const DownoadModal = () => {
  const [basicModal, setBasicModal] = useState(false)
  const handleModal = () => {
    // console.log('click.....')
    setBasicModal(!basicModal)
  }

  const CloseBtn = <X className='cursor-pointer mt_5' size={15} onClick={handleModal} />
  let className = 'sidebar-xl'
  let style = { width: '82%' }

  if (window.innerWidth < 800) {
    className = ''
    style = { width: '100%' }
  }

  const tableData = [
    { id: 1, name: 'John Doe', age: 25, city: 'New York' },
    { id: 2, name: 'Jane Smith', age: 30, city: 'London' },
    { id: 3, name: 'Bob Johnson', age: 35, city: 'Sydney' }
    // Add more objects as needed
  ]

  const tblColumn = () => {
    const column = []

    for (const i in tableData[0]) {
      const col_config = {}

      col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
      col_config.serch = i
      col_config.sortable = true
      col_config.selector = row => row[i]
      col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
      // col_config.style = {
      //   width: '400px'
      // }
      col_config.width = '200px'

      col_config.cell = row => {
        return (
          <div className='d-flex'>
            <span
              className='d-block font-weight-bold  cursor-pointer'
              title={row[i]}
              onClick={() => {
                // setData(row)
                // setCenteredModal(true)
              }}>
              {row[i] && row[i] !== '' ? row[i].toString().substring(0, 25) : '-'}
              {row[i] && row[i] !== '' ? (row[i].toString().length > 25 ? '...' : '') : '-'}
            </span>
          </div>
        )
      }
      column.push(col_config)
    }
    return column
  }

  return (
    <>
      <Download size='17' className='float-right mt_7 cursor-pointer' onClick={handleModal} id='downloadModal' />
      <UncontrolledTooltip placement='top' target='downloadModal'>
        Download Modal
      </UncontrolledTooltip>
      <Modal isOpen={basicModal} toggle={handleModal} style={style} modalClassName='modal-slide-in' contentClassName='pt-0'>
        <ModalHeader className='mb-3' toggle={handleModal} close={CloseBtn} tag='div'>
          <h4 className='modal-title'>Download</h4>
        </ModalHeader>
        <ModalBody className='flex-grow-1'>
          <Row className='mb-2'>
            <Col className='mb-1' xl='3' md='6' sm='12'>
              {/* {!props.report_types && ( */}
              <Flatpickr
                placeholder='Select date ...'
                //   onChange={onDateRangeSelected}
                className='form-control'
                //   options={{ mode: 'range', dateFormat: 'Y-m-d', defaultDate: [endDateSelected, startDateSelected] }}
              />
              {/* )} */}
              {/* {props.report_types && ( */}
              {/* <Select
                id='selectreporttype'
                name='reporttype'
                //   key={`my_unique_select_key__${reportSelected}`}
                theme={selectThemeColors}
                className='react-select zindex_1001'
                classNamePrefix='select'
                //   value={reportSelected}
                closeMenuOnSelect={true}
                //   onChange={onReportTypeSelected}
                //   options={reportsList}
                isClearable={false}
                placeholder='Select Report Type'
              /> */}
              {/* )} */}
            </Col>

            {/* Select PSS ID */}
            <Col className='mb-1' xl='3' md='6' sm='12'>
              <Select
                id='selectpss'
                name='pss'
                // key={`my_unique_select_key__${pssSelected}`}
                theme={selectThemeColors}
                className='react-select zindex_1001'
                classNamePrefix='select'
                // value={pssSelected}
                closeMenuOnSelect={true}
                // onChange={onPssSelected}
                // options={pssList}
                isClearable={true}
                // isDisabled={isPssSelected}
                placeholder='Select PSS ID'
              />
            </Col>

            {/* Select FEEDER ID */}
            <Col className='mb-1' xl='3' md='6' sm='12'>
              <Select
                id='selectfeeder'
                name='feeder'
                // key={`my_unique_select_key__${feederSelected}`}
                isClearable={true}
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                // value={feederSelected}
                // onChange={onFeederSelected}
                closeMenuOnSelect={true}
                // options={feederList}
                // isDisabled={isPssSelected}
                placeholder='Select Feeder ID'
              />
            </Col>

            {/* Select SITE ID */}
            <Col className='' xl='3' md='6' sm='12'>
              <Select
                id='selectdtr'
                name='dtr'
                // key={`my_unique_select_key__${dtrSelected}`}
                isClearable={true}
                closeMenuOnSelect={true}
                theme={selectThemeColors}
                // value={dtrSelected}
                // onChange={onDTRSelected}
                // options={dtrList}
                // isDisabled={isPssSelected}
                className='react-select zindex_1000'
                classNamePrefix='select'
                placeholder='Select Site'
              />
            </Col>

            {/*select subdiv id */}
            <Col className='mb-1' lg='3' md='6' sm='12'>
              <Select
                theme={selectThemeColors}
                // key={`my_unique_select_key__${subdiv_id}`}
                className='react-select'
                classNamePrefix='select'
                // value={subdiv_id}
                name='clear'
                // onChange={onSubdivId}
                // options={subDivIdList}
                isClearable
                // isDisabled={isSubDivSelected}
                placeholder='Select Subdiv ID'
              />
            </Col>

            {/* select section Id  */}
            <Col className='mb-1' lg='3' md='6' sm='12'>
              <Select
                theme={selectThemeColors}
                // key={`my_unique_select_key__${section_id}`}
                className='react-select'
                classNamePrefix='select'
                // value={section_id}
                name='clear'
                // onChange={onSectionId}
                // options={sectionIdList}
                // isClearable
                // isDisabled={isSubDivSelected}
                placeholder='Select Section ID'
              />
            </Col>

            <Col className='' xl='3' md='6' sm='12'>
              <FormGroup>
                <Input
                  type='text'
                  id='Consumer Serial No.'
                  placeholder='Consumer Number...'
                  //   onChange={onConsumerIdTyped}
                  //   disabled={isConsumerSerialSelected}
                />
              </FormGroup>
            </Col>
            <Col lg='2' md='4' xs='6'>
              <Button
                color='primary'
                className='btn-block'
                //    onClick={onSearchButtonClicked}
              >
                Search
              </Button>
            </Col>
          </Row>

          <DataTable columns={tblColumn(tableData)} tblData={tableData} rowCount={10} tableName={'Download Table'} donotShowDownload={true} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default DownoadModal
