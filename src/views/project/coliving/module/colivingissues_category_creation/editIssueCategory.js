import React, { useState, useEffect } from 'react'
import { Col, Form, FormGroup, Input, Label, Row, Button, CardBody, Badge, Card, Spinner } from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import DataTable from '@src/views/ui-elements/dataTableUpdated'
import { Edit, Trash2 } from 'react-feather'
import ReactJson from 'react-json-view'
import { toast } from 'react-toastify'
import useJwt from '@src/auth/jwt/useJwt'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import '@src/assets/css/my.scss'
import jwt_decode from 'jwt-decode'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import { caseInsensitiveSort } from '@src/views/utils.js'

const EditIssueCategory = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { editData } = props
  const [field_Name, setfieldName] = useState('')
  const [formValue, setFormValue] = useState({
    categoryTitle: editData.categoryTitle,
    categoryDescription: editData.categoryDescription,
    createdBy: jwt_decode(localStorage.getItem('accessToken')).userData.name,
    requiredInputFields: editData.requiredInputFields
  })
  const [checked, setChecked] = useState(editData.isActive)
  const [selected, setSelected] = useState(false)
  const [columns, setColumns] = useState([])
  const [selectDropdownValues, setSelectDropdownValues] = useState({})

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // To handle checkbox
  const handleCheck = event => {
    const name = event.target.name
    const value = event.target.checked
    setChecked(value)
  }

  // Api for put request to create new issue category
  const putColivingIssueCategories = async () => {
    try {
      const params = {
        ...formValue,
        id: editData.id,
        updatedBy: jwt_decode(localStorage.getItem('accessToken')).userData.name,
        isActive: checked
      }
      const res = await useJwt.putColivingIssueCategories(params)
      if (res.status === 200) {
        // console.log(formValue)
        setFormValue(formValue)
        toast.success(<Toast msg={' Issue Updated Succesfully.'} type='success' />, { hideProgressBar: true })
        props.updtTbl(true)
        props.handleformUpdate()
      } else if (res.status === 401 || res.status === 403) {
        setLogout(true)
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong please retry .' type='danger' />, { hideProgressBar: true })
      }
    }
  }

  const onDelete = deletable => {
    const response = columns.filter(i => i !== deletable)
    setColumns(response)
    const array = response.map(obj => {
      let newObj = {}
      const { FieldName, InputType } = obj
      newObj = { name: FieldName, type: InputType }
      return newObj
    })
    setFormValue({ ...formValue, requiredInputFields: array })
  }

  // table columns
  const tblColumn = () => {
    const column = []
    for (const i in columns[0]) {
      const col_config = {}
      if (i !== 'id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        col_config.cell = row => {
          let val = ''
          if (i === 'module') {
            val = row[i].map(mod_val => {
              return (
                <Badge pill color='light-success' className='p_4 m_1 me-1' key={mod_val}>
                  {mod_val}
                </Badge>
              )
            })
          } else {
            val = row[i]
          }
          return (
            <div className='d-flex'>
              <span className='d-block font-weight-bold '>{val}</span>
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
            <Trash2 size='15' className='ml-1 cursor-pointer' onClick={i => onDelete(row)} />
          </>
        )
      }
    })
    return column
  }

  //  formvalues to handle change form Values
  const handlechange = event => {
    const name = event.target.name
    const value = event.target.value
    setFormValue(values => ({ ...values, [name]: value }))
  }

  // dropdown options
  const Options = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' }
  ]
  // onChange Dropdpown function
  const dropdownoption = e => {
    const obj = {
      ...selectDropdownValues,
      input_type: e.value
    }
    setSelectDropdownValues(obj)
  }

  // Add function to form the Json
  const Add = async () => {
    if (field_Name === '') {
      toast.warning(<Toast msg={'Enter field name.'} type='warning' />, { hideProgressBar: true })
      return false
    } else if (!Object.keys(selectDropdownValues).includes('input_type')) {
      toast.warning(<Toast msg={'Please Select input type.'} type='warning' />, { hideProgressBar: true })
      return false
    } else {
      const obj = {
        name: field_Name,
        type: selectDropdownValues.input_type
      }
      const array = [...formValue.requiredInputFields]
      array.push(obj)
      const finalObj = { ...formValue, requiredInputFields: array }
      setFormValue(finalObj)
      setfieldName('')
      setSelected(!selected)
      //  To insert the data in a table
      const UpdateTableData = []
      finalObj.requiredInputFields.forEach(ele => {
        const row = {
          FieldName: ele.name,
          InputType: ele.type
        }
        UpdateTableData.push(row)
      })
      setColumns(UpdateTableData)
    }
  }

  useEffect(() => {
    setColumns(editData.requiredInputFields)
  }, [])

  //  form handleSubmit function
  const handleSubmit = () => {
    setFormValue({ categoryTitle: '', categoryDescription: '' })
  }

  // On submit
  const onSubmit = event => {
    event.preventDefault()
    if (formValue.requiredInputFields.length < 1) {
      toast.warning(<Toast msg={'Can not add. Enter Input Field name and Select Input type'} type='warning' />, { hideProgressBar: true })
      return false
    }
    putColivingIssueCategories()
  }
  return (
    <>
      <Form
        onSubmit={event => {
          onSubmit(event)
        }}>
        <Row>
          <Col md='4'>
            <FormGroup>
              <Label for='Issue Title'>Issue Title</Label>
              <Input
                type='text'
                name='categoryTitle'
                id='Issue Title'
                placeholder='Issue Title*'
                value={formValue.categoryTitle}
                onChange={handlechange}
                disabled
                required
              />
            </FormGroup>
          </Col>
          <Col md='4'>
            <FormGroup>
              <Label for='Issue Description'>Issue Description</Label>
              <Input
                type='text'
                name='categoryDescription'
                id='Issue Description'
                placeholder='Issue Description*'
                value={formValue.categoryDescription}
                onChange={handlechange}
                disabled
                required
              />
            </FormGroup>
          </Col>
          <Col md='4'>
            <FormGroup>
              <Label for='Created by'>Created by</Label>
              <Input
                type='text'
                name='createdBy'
                id='Created by'
                placeholder='Created by *'
                value={formValue.createdBy}
                onChange={handlechange}
                disabled
                required
              />
            </FormGroup>
          </Col>
          <Col md='4'>
            <FormGroup>
              <Label for='Field Name'>Input Field Name</Label>
              <Input
                type='text'
                name='field_Name'
                id='Field Name'
                placeholder='Input Field Name*'
                value={field_Name}
                onChange={e => setfieldName(e.target.value)}
              />
            </FormGroup>
          </Col>
          <Col md='4'>
            <FormGroup>
              <Label for='Input Type'>Input Type</Label>
              <Select
                // id='Input Type'
                // name='input_Type'
                key={`my_unique_select_key__${selected}`}
                theme={selectThemeColors}
                // className=''
                classNamePrefix='select'
                options={Options}
                isClearable={false}
                onChange={dropdownoption}
                placeholder='Input Type *'
                required
              />
            </FormGroup>
          </Col>

          <Col md='4'>
            <Button.Ripple
              className='mt-2 px-5'
              color='primary'
              type='submit'
              onClick={e => {
                e.preventDefault()
                Add()
              }}>
              Add
            </Button.Ripple>
          </Col>
        </Row>
        <FormGroup check inline>
          <Input type='checkbox' id='basic-cb-unchecked' name='enable' onChange={handleCheck} checked={checked} className='' />
          <Label for='basic-cb-unchecked' check className='h6'>
            Issue Category Is_Active
          </Label>
        </FormGroup>
        <Row className='mt-1'>
          <Col lg='7'>
            <DataTable
              columns={tblColumn()}
              tblData={columns}
              tableName={'Added Input Fields '}
              donotShowDownload={true}
              auto_height={true}
              rowCount={10}
              className='p-0'
            />
          </Col>

          <Col lg='5'>
            <Card className=''>
              <h4 className='my-1 mx-1'>Json Viewer</h4>
              <div className=' px-1 height-425 webi_scroller'>
                <ReactJson src={formValue.requiredInputFields} />
              </div>
            </Card>
          </Col>
        </Row>

        <Col>
          <FormGroup className='d-flex float-right '>
            <Button.Ripple className='mr-1' color='primary' type='submit'>
              Update
            </Button.Ripple>
            <Button.Ripple
              outline
              color='primary'
              type='reset'
              onClick={() => {
                props.handleformUpdate()
              }}>
              Cancel
            </Button.Ripple>
          </FormGroup>
        </Col>
      </Form>
    </>
  )
}

export default EditIssueCategory
