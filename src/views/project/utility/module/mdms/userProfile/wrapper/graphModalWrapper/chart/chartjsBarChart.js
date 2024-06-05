import Flatpickr from 'react-flatpickr'
import { Calendar } from 'react-feather'
import { Bar } from 'react-chartjs-2'
import { Card, CardHeader, CardTitle, CardBody } from 'reactstrap'

const ChartjsBarChart = ({
  tooltipShadow,
  gridLineColor,
  labelColor,
  successColorShade,
  labels,
  values,
  height,
  barChartClickHandler,
  label,
  unitType,
  title
}) => {
  const options = {
      onClick: (e, element) => {
        if (element.length > 0) {
          barChartClickHandler(element[0]._index)
        }
      },
      elements: {
        rectangle: {
          borderWidth: 2,
          borderSkipped: 'bottom'
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      responsiveAnimationDuration: 500,
      legend: {
        display: false
      },
      tooltips: {
        // Updated default tooltip UI
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        shadowBlur: 8,
        shadowColor: tooltipShadow,
        backgroundColor: '#fff',
        titleFontColor: '#000',
        bodyFontColor: '#000'
      },
      scales: {
        xAxes: [
          {
            display: true,
            gridLines: {
              display: true,
              color: gridLineColor,
              zeroLineColor: gridLineColor
            },
            scaleLabel: {
              display: false
            },
            ticks: {
              fontColor: labelColor
            }
          }
        ],
        yAxes: [
          {
            display: true,
            gridLines: {
              color: gridLineColor,
              zeroLineColor: gridLineColor
            },
            ticks: {
              stepSize: Math.max(...values) / 10,
              min: 0,
              max: Math.max(...values),
              fontColor: labelColor,
              callback: value => {
                return `${value.toFixed(2)} ${unitType}`
              }
            }
          }
        ]
      }
    },
    data = {
      labels,
      datasets: [
        {
          label,
          data: values,
          backgroundColor: successColorShade,
          borderColor: 'transparent',
          barThickness: 15
        }
      ]
    }

  return (
    <Card>
      <CardHeader className='d-flex justify-content-between align-items-sm-center align-items-start flex-sm-row flex-column'>
        <CardTitle tag='h4'>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        <div style={{ height: `${height}px` }}>
          <Bar data={data} options={options} height={height} />
        </div>
      </CardBody>
    </Card>
  )

  // return (
  //   <Card>
  //     <CardHeader className='d-flex justify-content-between align-items-sm-center align-items-start flex-sm-row flex-column'>
  //       <CardTitle tag='h4'>Consumption Statistics bar chart</CardTitle>
  //       <div className='d-flex align-items-center'>
  //         <Calendar size={14} />
  //         <Flatpickr
  //           options={{
  //             mode: 'range',
  //             defaultDate: ['2019-05-01', '2019-05-10']
  //           }}
  //           className='form-control flat-picker bg-transparent border-0 shadow-none'
  //         />
  //       </div>
  //     </CardHeader>
  //     <CardBody>
  //       <div style={{ height: `${height}px` }}>
  //         <Bar data={data} options={options} height={height} />
  //       </div>
  //     </CardBody>
  //   </Card>
  // )
}

export default ChartjsBarChart
