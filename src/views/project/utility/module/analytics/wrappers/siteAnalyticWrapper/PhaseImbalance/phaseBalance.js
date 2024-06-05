// ** React Imports
import { useContext, useEffect, useState } from 'react'

// ** Third Party Components
import axios from 'axios'
import classnames from 'classnames'
import * as Icon from 'react-feather'
import Chart from 'react-apexcharts'

// ** Reactstrap Imports
import {
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  CardTitle,
  CardHeader,
  Row,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  Col
} from 'reactstrap'
// ** Context
import { ThemeColors } from '@src/utility/context/ThemeColors'

// ** Styles
import '@styles/react/libs/charts/apex-charts.scss'

const PhaseBalance = props => {
  const context = useContext(ThemeColors)
  // ** State
  const [data, setData] = useState(null)

  useEffect(() => {
    // axios.get('/card/card-analytics/customers').then(res => setData(res.data))
    setData({
      last_days: ['Last 28 Days', 'Last Month', 'Last Year'],
      listData: [
        {
          icon: 'Circle',
          iconColor: 'text-primary',
          text: 'New',
          result: 690
        },
        {
          icon: 'Circle',
          iconColor: 'text-warning',
          text: 'Returning',
          result: 258
        },
        {
          icon: 'Circle',
          iconColor: 'text-danger',
          text: 'Referrals',
          result: 149
        }
      ]
    })
  }, [])

  const options = {
      chart: {
        toolbar: {
          show: false
        }
      },
      labels: ['New', 'Returning', 'Referrals'],
      dataLabels: {
        enabled: false
      },
      legend: { show: false },
      stroke: {
        width: 4
      },
      colors: [context.colors.primary.main, context.colors.warning.main, context.colors.danger.main]
    },
    series = [690, 258, 149]

  const renderChartInfo = () => {
    return data.listData.map((item, index) => {
      const IconTag = Icon[item.icon]

      return (
        <div
          key={index}
          className={classnames('d-flex justify-content-between', {
            'mb-1': index !== data.listData.length - 1
          })}>
          <div className='d-flex align-items-center'>
            <IconTag
              size={15}
              className={classnames({
                [item.iconColor]: item.iconColor
              })}
            />
            <span className='fw-bold ms-75'>{item.text}</span>
          </div>
          <span>{item.result}</span>
        </div>
      )
    })
  }

  return data !== null ? (
    <Card className='cardHover'>
      <CardHeader className='justify-content-center'>
        <h4>Phase Balance</h4>
      </CardHeader>
      <CardBody className='pb-0'>
        <Row>
          <Col md='6'>
            <Chart options={options} series={series} type='pie' height={325} />
          </Col>
          <Col md='6'>
            <ListGroup className='mx-sm-2 mt-sm-4 mt-md-1 height-280 border-top border-bottom mb-2 text-center webi_scroller'>
              <ListGroupItem>5.0.48.42 from R to B</ListGroupItem>
              <ListGroupItem>Dapibus ac facilisis in</ListGroupItem>
              <ListGroupItem>Morbi leo risus</ListGroupItem>
              <ListGroupItem>Porta ac consectetur ac</ListGroupItem>
              <ListGroupItem>Vestibulum at eros</ListGroupItem>
              <ListGroupItem>Cras justo odio</ListGroupItem>
              <ListGroupItem>Dapibus ac facilisis in</ListGroupItem>
              <ListGroupItem>Morbi leo risus</ListGroupItem>
              <ListGroupItem>Porta ac consectetur ac</ListGroupItem>
              <ListGroupItem>Vestibulum at eros</ListGroupItem>
              <ListGroupItem>5.0.48.42 from R to B</ListGroupItem>
              <ListGroupItem>Dapibus ac facilisis in</ListGroupItem>
              <ListGroupItem>Morbi leo risus</ListGroupItem>
              <ListGroupItem>Porta ac consectetur ac</ListGroupItem>
              <ListGroupItem>Vestibulum at eros</ListGroupItem>
              <ListGroupItem>Cras justo odio</ListGroupItem>
              <ListGroupItem>Dapibus ac facilisis in</ListGroupItem>
              <ListGroupItem>Morbi leo risus</ListGroupItem>
              <ListGroupItem>Porta ac consectetur ac</ListGroupItem>
              <ListGroupItem>Vestibulum at eros</ListGroupItem>
            </ListGroup>
          </Col>
        </Row>
      </CardBody>
    </Card>
  ) : null
}
export default PhaseBalance
