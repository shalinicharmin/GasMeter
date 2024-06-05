import React, { useContext, useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import { useSelector, useDispatch } from 'react-redux'

import MeterGeneratedAlert from '@src/views/ui-elements/cards/gpCards/wrapper/meterGeneratedAlert'
import SystemGeneratedAlert from '@src/views/ui-elements/cards/gpCards/wrapper/systemGeneratedAlert'

import { handleAlertsFilter } from '../../../../redux/actions/UtilityProject/MDMS/alertsFilter'

const AlertCard = props => {
  // Alerts Tab Selected
  const [active, setActive] = useState('1')

  // Meter Generated Alerts Filter option
  const [MGFilterOption, setMGFilterOption] = useState([])

  // System Generated Alerts Filter option
  const [SGFilterOption, setSGFilterOption] = useState([])

  const dispatch = useDispatch()
  const responseData = useSelector(state => state.UtilityMdmsAlertsFilterReducer.responseData)

  // API Call to get Meter Generated and System Generated Filter options
  const fetchData = () => {}

  useEffect(() => {
    if (responseData) {
      // Do Nothing

      setMGFilterOption(responseData['meter_generated_filter_option'])
      setSGFilterOption(responseData['system_generated_filter_option'])
    } else {
      // Make API call to fetch data

      const temp_json = {
        meter_generated_filter_option: [
          {
            value: 'magnetic tamper',
            label: 'magnetic tamper',
            isFixed: 'true'
          },
          {
            value: 'cover open',
            label: 'cover open',
            isFixed: 'true'
          },
          {
            value: 'voltage fluctuation',
            label: 'voltage fluctuation',
            isFixed: 'true'
          }
        ],
        system_generated_filter_option: [
          {
            value: 'low credit balance',
            label: 'low credit balance',
            isFixed: 'true'
          },
          {
            value: 'recharge success',
            label: 'recharge success',
            isFixed: 'true'
          }
        ]
      }

      dispatch(handleAlertsFilter(temp_json))
    }
  }, [responseData])

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  return (
    <Card className='card-developer-meetup'>
      <CardHeader className='px-1 py-0'>
        {/* Header */}
        <h3 className='mb-0'>Recent alerts</h3>
        {/* Navigation tab */}
        <Nav className='m-0' tabs>
          <NavItem>
            <NavLink
              active={active === '1'}
              onClick={() => {
                toggle('1')
              }}>
              Meter generated
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={active === '2'}
              onClick={() => {
                toggle('2')
              }}>
              System generated
            </NavLink>
          </NavItem>
        </Nav>
      </CardHeader>
      <CardBody className='p-0'>
        <React.Fragment>
          <TabContent className='py-50' activeTab={active}>
            <TabPane tabId='1'>
              <MeterGeneratedAlert hierarchy={props.hierarchy} height={props.height} MGFilterOption={MGFilterOption} />
            </TabPane>
            <TabPane tabId='2'>
              <SystemGeneratedAlert hierarchy={props.hierarchy} height={props.height} SGFilterOption={SGFilterOption} />
            </TabPane>
          </TabContent>
        </React.Fragment>
      </CardBody>
    </Card>
  )
}

export default AlertCard
