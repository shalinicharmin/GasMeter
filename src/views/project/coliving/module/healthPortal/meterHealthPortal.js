import React, { useState } from 'react'
import Chart from 'react-apexcharts'
import { Card, CardBody, CardText, CardTitle, Col, Row } from 'reactstrap'
import MeterHealthTableReoprt from './siteHealthTableReport'

const MeterHealthPortal = props => {
  const { response, active } = props

  const options = {
    legend: {
      show: false,
      position: 'bottom'
    },
    labels: ['UP', 'DOWN'],
    stroke: { width: 0 },
    colors: ['#826bf8', '#FF5C5C'],
    dataLabels: {
      enabled: false,
      formatter(val, opt) {
        return `${parseInt(val)}%`
      }
    },
    grid: {
      padding: {
        right: -20,
        bottom: -8,
        left: -20
      }
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          labels: {
            show: true,
            name: {
              offsetY: 15
              // fontSize: '2rem'
              // fontFamily: 'Montserrat'
            },
            value: {
              offsetY: -15,
              // fontFamily: 'Montserrat',
              formatter(val) {
                return `${parseInt(val)}`
              }
            },
            total: {
              show: true,
              offsetY: 15,

              label: 'UP',
              formatter(w) {
                return `${response.meters.up}`
              }
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 1325,
        options: {
          chart: {
            height: 120
          }
        }
      },
      {
        breakpoint: 1200,
        options: {
          chart: {
            height: 120
          }
        }
      },
      {
        breakpoint: 1065,
        options: {
          chart: {
            height: 100
          }
        }
      },
      {
        breakpoint: 992,
        options: {
          chart: {
            height: 120
          }
        }
      }
    ]
  }

  const series = [response.meters.up, response.meters.down]

  return (
    <>
      <Card className={` earnings-card ${active === '2' && 'tab_active'}`} id='activeMeter'>
        <CardBody>
          <Row>
            <Col xs='6'>
              <CardTitle className={`${active === '2' && 'text-primary'}`}>Site Health</CardTitle>
              <div className={`font-small-2 ${active === '2' && 'text-primary'}`}>Total Meter</div>
              <h5 className='mb-1'>{`${parseFloat(response.meters.up) + parseFloat(response.meters.down)}`}</h5>
              <CardText className='text-secondary font-small-2'>
                <span className='font-weight-bolder'>Up :</span>
                <span> {response.meters.up}</span>
                <span className='font-weight-bolder ml-2'>Down :</span>
                <span>{response.meters.down}</span>
              </CardText>
            </Col>
            <Col xs='6'>
              <Chart options={options} series={series} type='donut' height={130} />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  )
}

export default MeterHealthPortal
