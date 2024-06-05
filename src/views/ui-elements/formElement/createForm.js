import { Col, FormGroup, Input, Label } from "reactstrap"
import Flatpickr from 'react-flatpickr'
import Select from 'react-select'
import { selectThemeColors } from '@utils'

const CreateFormField = props => {
  const field = props.fields

  return Object.keys(field).map((v, i) => {
    const _select_data = []
    const extras = field[v]['extras'] ? field[v]['extras'] : {}
    const _default_val = []

    if (v.split('#')[0] === 'select') {
      for (const i in field[v]['options']) {
        _select_data.push({ label: field[v]['options'][i], value: i })
        if (field[v]['selected']) {
          for (const j of field[v]['selected']) {
            if (i === j) {
              _default_val.push({ label: field[v]['options'][i], value: i })
            }
          }
        }
      }
    }

    return (
      v.split('#')[0] === 'select' ? (
        <Col md={field.row ? field.row : '12'} key={i}
          style={{ display: field[v]['display'] ? 'none' : '' }}>
          <FormGroup>
            <Label for={`id_${v.split('#')[1]}`}>
              {field[v]['label']}
            </Label>
            <Select
              id={`id_${v.split('#')[1]}`}
              name={v.split('#')[1]}
              // isClearable={true}
              theme={selectThemeColors}
              isMulti={field[v]['multiple'] ? field[v]['multiple'] : false}
              closeMenuOnSelect={true}
              options={_select_data}
              isDisabled={field[v]['disable'] && true}
              className='react-select'
              classNamePrefix='select'
              placeholder={field[v]['label']}
              onChange={e => field[v]['onchange'] && field[v]['onchange'](e)}
              {...extras}
            />
          </FormGroup>
        </Col>
      ) : v.split('#')[0] === 'date' ? (
        <Col md={field.row ? field.row : '12'} key={i}
          style={{ display: field[v]['display'] ? 'none' : '' }}>
          <FormGroup>
            <Label for={`id_${v.split('#')[1]}`}>
              {field[v]['label']}
            </Label>
            <Flatpickr
              id={`id_${v.split('#')[1]}`}
              name={v.split('#')[1]}
              placeholder='Select date ...'
              defaultValue={['update', 'view'].includes(props.type) ? props.values[v.split('#')[1]] : Object.keys(field[v]).includes('value') ? field[v]['value'] : ''}
              className='form-control'
              options={field[v]['options'] && field[v]['options']}
            />
          </FormGroup>
        </Col>
      ) : v === 'row' ? '' : (
        <Col md={field.row ? field.row : '12'} key={i}
          style={{ display: field[v]['display'] ? 'none' : '' }}>
          <FormGroup>
            <Label for={`id_${v.split('#')[1]}`}>
              {field[v]['label']}
            </Label>
            {
              field[v]['changable'] ? <Input
                type={v.split('#')[0]}
                id={`id_${v.split('#')[1]}`}
                name={v.split('#')[1]}
                readOnly={field[v]['disable'] && true}
                value={['update', 'view'].includes(props.type) ? props.values[v.split('#')[1]] : Object.keys(field[v]).includes('changable') ? field[v]['changable'] : ''}
                onChange={e => Object.keys(field[v]).includes('changable') && field[v]['onKeyUp'] && field[v]['onKeyUp'](e.target.value)}
              /> : <Input
                type={v.split('#')[0]}
                id={`id_${v.split('#')[1]}`}
                name={v.split('#')[1]}
                readOnly={field[v]['disable'] && true}
                defaultValue={['update', 'view'].includes(props.type) ? props.values[v.split('#')[1]] : Object.keys(field[v]).includes('value') ? field[v]['value'] : ''}
                onChange={e => Object.keys(field[v]).includes('value') && field[v]['onKeyUp'] && field[v]['onKeyUp'](e.target.value)}
              />
            }
          </FormGroup>
        </Col>
      )
    )
  })
}

export default CreateFormField