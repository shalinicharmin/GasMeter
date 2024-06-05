import React, { useState, useEffect } from 'react'
import { Button, Col, FormGroup, Input, Label, ModalBody, ModalFooter } from 'reactstrap'
import TagsInput from './ReactTagsWrapper/tagsInput'
import Select from 'react-select'
import { selectThemeColors } from '@utils'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'

const ModuleModal = props => {
  // console.log('Project Level Analytics Report ....')
  // console.log(props.projectLevelAnalyticsReportAccess)
  // console.log('Fetched Report List ....')
  // console.log(props.fetchedReportList)
  // console.log('Row Selected to edit ....')
  // console.log(props.rowSelectedToEdit)
  // console.log(props.fetchedReportList.filter(e => e.vertical_name === props.rowSelectedToEdit.vertical))

  const projectLevelAnalyticsAccess_Local = props.projectLevelAnalyticsReportAccess

  const modulesOption = []
  for (let i = 0; i < props.modulesOption.length; i++) {
    const temp = {
      value: props.modulesOption[i],
      label: props.modulesOption[i]
    }
    modulesOption.push(temp)
  }

  const [selectedModuleValue, setSelectedModuleValue] = useState(props.modulesAlreadySelected)

  const handleChange = e => {
    setSelectedModuleValue(e)
  }

  const updateRow = () => {
    if (selectedModuleValue.length >= 1) {
      //check if Analytics Module Previously existed
      const analytics_module_previously_existed = props.rowSelectedToEdit.module.includes('Analytics')
      console.log(analytics_module_previously_existed)
      // console.log('Does Analytics Module Already exists ...')
      // console.log(selectedModuleValue)
      let analytics_module_exists_in_update = false
      if (selectedModuleValue.some(e => e.value === 'Analytics')) {
        analytics_module_exists_in_update = true
      }

      if (analytics_module_previously_existed && analytics_module_exists_in_update) {
        // Do Nothing to props.projectLevelAnalyticsAccess
      } else if (!analytics_module_previously_existed && analytics_module_exists_in_update) {
        // Add All reports to access
        const fetchedReportList_Dummy = props.fetchedReportList.filter(e => e.vertical_name === props.rowSelectedToEdit.vertical)
        const temp = {
          project: props.rowSelectedToEdit.project,
          vertical: props.rowSelectedToEdit.vertical,
          report_access: fetchedReportList_Dummy[0].report_access
        }
        projectLevelAnalyticsAccess_Local.push(temp)
      } else if (!analytics_module_exists_in_update && !analytics_module_previously_existed) {
        // Do Nothing to props.projectLevelAnalyticsAccess
      } else if (!analytics_module_exists_in_update && analytics_module_previously_existed) {
        // Remove ANalytics Report correponding to project from props.projectLevelAnalyticsAccess
        for (let i = 0; i < projectLevelAnalyticsAccess_Local.length; i++) {
          if (
            projectLevelAnalyticsAccess_Local[i].vertical === props.rowSelectedToEdit.vertical &&
            projectLevelAnalyticsAccess_Local[i].project === props.rowSelectedToEdit.project
          ) {
            projectLevelAnalyticsAccess_Local.splice(i, 1)
          }
        }
      }

      props.DeleteAndAddRow(
        props.rowSelectedToEdit,
        {
          vertical: props.rowSelectedToEdit.vertical,
          project: props.rowSelectedToEdit.project,
          module: selectedModuleValue
        },
        projectLevelAnalyticsAccess_Local
      )
    } else {
      toast.warning(<Toast msg={' At least 1 module must exist  .'} type='warning' />, { hideProgressBar: true })
    }
  }

  return (
    <>
      <ModalBody>
        {/* <div className='mb-2'>
          <TagsInput tags={selectedModuleValue} />
        </div> */}
        <div className='mb-2'>
          <FormGroup>
            <Label>Module</Label>
            <Select
              isClearable={false}
              theme={selectThemeColors}
              value={selectedModuleValue}
              //   key={`my_unique_select_key__${selected}`}
              isMulti
              name='colors'
              options={modulesOption}
              className='react-select'
              classNamePrefix='select'
              onChange={handleChange}
              placeholder='Select Module *'
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
            updateRow()
          }}>
          update
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModuleModal
