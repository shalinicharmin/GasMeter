import Chart from "react-apexcharts"
import { Card, CardHeader, CardTitle, CardBody, CardSubtitle, Row, Col, CardText } from "reactstrap"

const DcuHealthPortal = (props) => {
  const { response, active } = props

  const options = {
    legend: {
      show: false,
      position: "bottom"
    },
    labels: ["UP", "DOWN"],
    stroke: { width: 0 },
    colors: ["#826bf8", "#FF5C5C"],
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

              label: "UP",
              formatter(w) {
                return `${response.dcus.up}`
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

  const series = [response.dcus.up, response.dcus.down]

  return (
    <Card className={` earnings-card ${active === "1" && "tab_active"}`} id='activeMeter'>
      <CardBody>
        <Row>
          <Col xs='6'>
            <CardTitle className={`${active === "1" && "text-primary"}`}>DCU Health</CardTitle>
            <div className={`font-small-3 ${active === "1" && "text-primary"}`}>Total DCU </div>
            <h5 className='mb-1'>{`${
              parseFloat(response.dcus.up) + parseFloat(response.dcus.down)
            }`}</h5>
            <CardText className='text-secondary font-small-2'>
              <span className='font-weight-bolder'>Up :</span>
              <span> {response.dcus.up}</span>
              <span className='font-weight-bolder ml-2'>Down :</span>
              <span> {response.dcus.down}</span>
            </CardText>
          </Col>

          <Col xs='6'>
            <Chart options={options} series={series} type='donut' height={130} />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default DcuHealthPortal
