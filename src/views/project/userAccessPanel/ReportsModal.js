import React, { useState, useEffect } from 'react'
import { Button, Col, FormGroup, Input, Label, ModalBody, ModalFooter } from 'reactstrap'
import TagsInput from './ReactTagsWrapper/tagsInput'
import Select from 'react-select'
import { selectThemeColors } from '@utils'

const ReportsModal = props => {
  // console.log('Fetched Report List')
  // console.log(props.fetchedReportList)
  // console.log('Porject Level Report Access')
  // console.log(props.projectLevelAnalyticsReportAccess)
  // console.log('Row Selected to edit')
  // console.log(props.rowSelectedToEdit)

  const createReportsDropdown = row => {
    // console.log(row)
    return row.vertical_name === props.rowSelectedToEdit.vertical
  }

  const createReportsDropdown_New = () => {
    // 1.Filter reports list based on vertical
    let report_dropdown = []
    for (let i = 0; i < props.fetchedReportList.length; i++) {
      if (props.rowSelectedToEdit.vertical === props.fetchedReportList[i].vertical_name) {
        report_dropdown = props.fetchedReportList[i].report_access
        break
      }
    }
    // 2.Modify report_access to include label and value key
    for (let i = 0; i < report_dropdown.length; i++) {
      report_dropdown[i]['label'] = `${report_dropdown[i]['report_type']}-${report_dropdown[i]['report_name']}`
      report_dropdown[i]['value'] = report_dropdown[i]['report_id']
    }

    return report_dropdown
  }

  const createAlreadySelectedValues = row => {
    return row.vertical === props.rowSelectedToEdit.vertical
  }

  const [alreadySelectedReport, setAlreadySelectedProject] = useState(
    props.projectLevelAnalyticsReportAccess.filter(createAlreadySelectedValues)[0].report_access
  )

  // const [reportsOption, setReportsOption] = useState(props.fetchedReportList.filter(createReportsDropdown)[0].report_access)
  const [reportsOption, setReportsOption] = useState(createReportsDropdown_New())

  // to select report on handle change function
  const handleChange = val => {
    // console.log(val)
    setAlreadySelectedProject(val)
  }

  // update report list
  const update = () => {
    const report_dummy = props.projectLevelAnalyticsReportAccess
    for (let i = 0; i < report_dummy.length; i++) {
      if (report_dummy[i].project === props.rowSelectedToEdit.project && report_dummy[i].vertical === props.rowSelectedToEdit.vertical) {
        report_dummy.splice(i, 1)
      }
    }

    if (alreadySelectedReport.length === 0) {
      const newTemp = {
        vertical: props.rowSelectedToEdit.vertical,
        project: props.rowSelectedToEdit.project,
        report_access: reportsOption
      }
      report_dummy.push(newTemp)
    } else {
      const newTemp = {
        vertical: props.rowSelectedToEdit.vertical,
        project: props.rowSelectedToEdit.project,
        report_access: alreadySelectedReport
      }

      report_dummy.push(newTemp)
    }

    props.updateProjectLevelAnalyticsAccessData(report_dummy)
  }

  return (
    <>
      <ModalBody>
        {/* <div className='mb-2'>
          <TagsInput tags={selectedModuleValue} />
        </div> */}
        <div className='mb-2'>
          <FormGroup>
            <Label>Reports</Label>
            <Select
              isClearable={false}
              theme={selectThemeColors}
              value={alreadySelectedReport}
              //   key={`my_unique_select_key__${selected}`}
              isMulti
              name='colors'
              options={reportsOption}
              className='react-select'
              classNamePrefix='select'
              onChange={handleChange}
              placeholder='Select Reports *'
              required
            />
          </FormGroup>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='primary'
          onClick={e => {
            e.preventDefault()
            update()
          }}>
          update
        </Button>
      </ModalFooter>
    </>
  )
}

export default ReportsModal
