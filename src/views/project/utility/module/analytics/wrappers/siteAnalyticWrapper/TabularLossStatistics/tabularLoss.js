import React, { useState } from 'react'
import Chart from 'react-apexcharts'
import TableWithoutSearch from '../../../../../../../ui-elements/dtTable/tableWithoutSearch'
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  Row,
  Col,
  UncontrolledButtonDropdown,
  CardHeader,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CardBody,
  CardTitle,
  Button,
  ListGroup,
  ListGroupItem
} from 'reactstrap'
import { Download } from 'react-feather'
import { caseInsensitiveSort } from '@src/views/utils.js'

const TabularLoss = props => {
  const [active, setActive] = useState('1')
  const [data1, setData] = useState(null)
  const data = [
    {
      id: '1',
      Date: 'xyz',
      'Total Outage[Hrs]': 2214,
      outage_time: 'Yes'
    },
    {
      id: '231d1e9b-6862-4c82-a717-6ff2fa0cad1b',
      Date: 'abc',
      'Total Outage[Hrs]': 2212,
      outage_time: 'Yes'
    },
    {
      id: 'bd213607-03fc-413f-9b64-1dbd838048cc',
      Date: 'def',
      'Total Outage[Hrs]': 2212,
      outage_time: 'Yes'
    },
    {
      id: 'b179664d-e7c9-4ccb-8a22-cb19e864216d',
      Date: 'ghi',
      'Total Outage[Hrs]': 'I2212t',
      outage_time: 'Yes'
    },
    {
      id: '94d43de4-42e3-4eed-bedb-b66213c5a241',
      Date: 'jkl',
      'Total Outage[Hrs]': 2212,
      outage_time: 'Yes'
    },
    {
      id: 'ace88ab4-f1b0-4c46-a5f3-71855ba748a9',
      Date: 'mno',
      'Total Outage[Hrs]': 2212,
      outage_time: 'Yes'
    },
    {
      id: '48b05e14-4e99-4766-be04-88276fb66cad',
      Date: 'pqr',
      'Total Outage[Hrs]': 'I2212t',
      outage_time: 'Yes'
    },
    {
      id: 'ace88ab4-f1b0-4c46-a5f3-71855ba748a9',
      Date: 'xyz',
      'Total Outage[Hrs]': 2212,
      outage_time: 'Yes'
    },
    {
      id: '48b05e14-4e99-4766-be04-88276fb66cad',
      Date: 'xyz',
      'Total Outage[Hrs]': 'I2212t',
      outage_time: 'Yes'
    }
  ]
  const tblColumn = () => {
    const column = []

    for (const i in data[0]) {
      const col_config = {}
      if (i !== 'id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = i === 'outage_time' && true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span className='d-block font-weight-bold text-truncate'>
                {row[i] !== '' ? row[i].toString().substring(0, 15) : '-'} {row[i] !== '' ? (row[i].toString().length > 15 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    return column
  }

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  const budgetSeries = [
      {
        data: [61, 48, 69, 52, 60, 40, 79, 60, 59, 43, 62]
      },
      {
        data: [20, 10, 30, 15, 23, 0, 25, 15, 20, 5, 27]
      }
    ],
    budgetOptions = {
      chart: {
        toolbar: { show: false },
        zoom: { enabled: false },
        type: 'line',
        sparkline: { enabled: true }
      },
      stroke: {
        curve: 'smooth',
        dashArray: [0, 5],
        width: [2]
      },
      colors: [props.primary, '#dcdae3'],
      tooltip: {
        enabled: false
      }
    }
  return (
    <React.Fragment>
      <Row>
        <Col xl='4'>
          <h4 className='mb-0 mt_15'>Tabular Loss Statistics</h4>
        </Col>
        <Col xl='8'>
          <Nav className='justify-content-end' tabs>
            <NavItem>
              <NavLink
                active={active === '1'}
                onClick={() => {
                  toggle('1')
                }}>
                Power Outage
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={active === '2'}
                onClick={() => {
                  toggle('2')
                }}>
                Potential Loss
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={active === '3'}
                onClick={() => {
                  toggle('3')
                }}>
                MD Defaulters
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={active === '4'}
                onClick={() => {
                  toggle('4')
                }}>
                Power Factor Loss
              </NavLink>
            </NavItem>
          </Nav>
        </Col>
      </Row>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <Card className='card-revenue-budget p-0 bg-img-top cardHover'>
            <CardBody className='p-0'>
              <Row className='mx-0'>
                <Col className='budget-wrapper border-right border-3 pb-0' md='4' xs='12'>
                  <h2 className='mb-25'>
                    <span style={{ fontSize: '35px' }}>57.4 </span> Hours
                  </h2>
                  <div className='d-flex justify-content-center'>
                    <h2 className='font-weight-bolder  me-25 text-danger mt-1 '>Power Outage</h2>
                  </div>
                  <Chart id='budget-chart' type='line' height='80' options={budgetOptions} series={budgetSeries} />
                  <h3 className='font-weight-bolder '>92.1%[Uptime]</h3>
                </Col>

                <Col md='8' xs='12' className='p-0'>
                  <TableWithoutSearch columns={tblColumn()} tblData={data} rowCount={9} tableName='Power outage' />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </TabPane>

        <TabPane tabId='2'>
          <Card className='card-revenue-budget p-0 bg-img-top cardHover'>
            <CardBody className='p-0'>
              <Row className='mx-0'>
                <Col className='budget-wrapper border-right border-3 pb-0' md='4' xs='12'>
                  <h2 className='mb-20'>
                    <span style={{ fontSize: '35px' }}>57.4 </span> Hours
                  </h2>
                  <div className='d-flex justify-content-center'>
                    <h3 className='font-weight-bolder  me-25 text-danger mt-1 '>Potential Revenue Loss</h3>
                  </div>
                  <Chart id='budget-chart' type='line' height='80' options={budgetOptions} series={budgetSeries} />
                  <h3 className='font-weight-bolder '>92.1%[Uptime]</h3>
                </Col>

                <Col md='8' xs='12' className='p-0'>
                  <TableWithoutSearch columns={tblColumn()} tblData={data} rowCount={9} tableName='Power outage' />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </TabPane>

        <TabPane tabId='3'>
          <Card className='card-revenue-budget p-0 bg-img-top cardHover'>
            <CardBody className='p-0'>
              <Row className='mx-0'>
                <Col className='budget-wrapper border-right border-3 pb-0' md='4' xs='12'>
                  <h2 className='mb-25'>
                    <span style={{ fontSize: '35px' }}>57.4 </span> Hours
                  </h2>
                  <div className='d-flex justify-content-center'>
                    <h2 className='font-weight-bolder  me-25 text-danger mt-1 '>MD Defaulters </h2>
                  </div>
                  <Chart id='budget-chart' type='line' height='80' options={budgetOptions} series={budgetSeries} />
                  <h3 className='font-weight-bolder '>92.1%[Uptime]</h3>
                </Col>

                <Col md='8' xs='12' className='p-0'>
                  <TableWithoutSearch columns={tblColumn()} tblData={data} rowCount={90} tableName='Power outage' />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </TabPane>

        <TabPane tabId='4'>
          <Card className='card-revenue-budget p-0 bg-img-top cardHover'>
            <CardBody className='p-0'>
              <Row className='mx-0'>
                <Col className='budget-wrapper border-right border-3 pb-0' md='4' xs='12'>
                  <h2 className='mb-25'>
                    <span style={{ fontSize: '35px' }}>57.4 </span> Hours
                  </h2>
                  <div className='d-flex justify-content-center'>
                    <h2 className='font-weight-bolder  me-25 text-danger mt-1 '>Power Factor Loss</h2>
                  </div>
                  <Chart id='budget-chart' type='line' height='80' options={budgetOptions} series={budgetSeries} />
                  <h3 className='font-weight-bolder '>92.1%[Uptime]</h3>
                </Col>

                <Col md='8' xs='12' className='p-0'>
                  <TableWithoutSearch columns={tblColumn()} tblData={data} rowCount={90} tableName='Power outage' />
                </Col>
              </Row>
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>
    </React.Fragment>
  )
}

export default TabularLoss
