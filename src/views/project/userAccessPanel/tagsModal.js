import React, { useState, useEffect } from "react"
import { Button, Col, FormGroup, Input, Label, ModalBody, ModalFooter, Spinner } from "reactstrap"
import TagsInput from "./ReactTagsWrapper/tagsInput"
import Select from "react-select"
import { selectThemeColors } from "@utils"
import useJwt from "@src/auth/jwt/useJwt"
import { useDispatch, useSelector } from "react-redux"
import { useHistory } from "react-router-dom"
import authLogout from "../../../auth/jwt/logoutlogic"

const TagsModal = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [loader, setLoader] = useState(false)

  const vertical = props.rowSelectedToEdit.vertical
  const project = props.rowSelectedToEdit.project
  const projectLevelTagsAccess = props.projectLevelTagsAccess

  const [tagsSelectionOptions, setTagsSelectionOptions] = useState()

  // To fetch dropdown list for tags
  const fetchTagsList = async (params) => {
    return await useJwt
      .getTagList(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }
  useEffect(async () => {
    setLoader(true)
    const params = {}

    params["project"] = project

    // params['vertical'] = props.rowSelectedToEdit.vertical

    const [statusCode, response] = await fetchTagsList(params) //Fetch Asset List
    // Create Data for Asset

    if (statusCode === 200) {
      const data = response.data.data.result
        .filter((ele) => ele.project === project)
        .map((ele) => ({
          value: ele.tag,
          label: ele.tag
        }))

      setTagsSelectionOptions(data)
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    }

    setLoader(false)
  }, [])

  const filterTags = (tags) => {
    if (tags.project) {
      return (
        tags.project === props.rowSelectedToEdit.project &&
        tags.vertical === props.rowSelectedToEdit.vertical
      )
    } else {
      return []
    }
  }

  const [tagsSelected, setTagsSelected] = useState(
    projectLevelTagsAccess?.filter(filterTags)[0]?.tag_access
  )

  const onTagsSelectionUpdation = (data) => {
    if (data) {
      setTagsSelected(data)
    } else {
      setTagsSelected([])
    }
  }

  const onUpdate = () => {
    for (let i = 0; i < projectLevelTagsAccess.length; i++) {
      if (
        projectLevelTagsAccess[i].vertical === vertical &&
        projectLevelTagsAccess[i].project === project
      ) {
        projectLevelTagsAccess.splice(i, 1)
      }
    }
    const newTemp = {
      vertical,
      project,
      tag_access: tagsSelected
    }

    projectLevelTagsAccess.push(newTemp)
    props.updateTagsAccessData(projectLevelTagsAccess)
  }

  return (
    <>
      <ModalBody>
        {/* <div className='mb-2'>
              <TagsInput tags={selectedModuleValue} />
            </div> */}
        <div className='mx-1'>
          {(tagsSelected && tagsSelected.length === 0) || typeof tagsSelected === "undefined" ? (
            <span className='text-danger '> *All Tags are selected</span>
          ) : (
            ""
          )}
          <FormGroup className='mt-1'>
            <Label>Tags</Label>
            {!loader ? (
              <Select
                isClearable={false}
                theme={selectThemeColors}
                value={tagsSelected}
                //   key={`my_unique_select_key__${selected}`}
                isMulti
                name='colors'
                options={tagsSelectionOptions}
                className='react-select'
                classNamePrefix='select'
                closeMenuOnSelect={false}
                onChange={onTagsSelectionUpdation}
                placeholder={"Select Tags *"}
                required
              />
            ) : (
              <div className='d-flex justify-content-center my-1'>
                <Spinner />
              </div>
            )}
          </FormGroup>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='primary'
          onClick={(e) => {
            e.preventDefault()
            onUpdate()
          }}
        >
          Update
        </Button>
      </ModalFooter>
    </>
  )
}

export default TagsModal
