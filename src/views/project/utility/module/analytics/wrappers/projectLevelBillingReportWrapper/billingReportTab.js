import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'

import { FileText, Download } from 'react-feather'
import { Card, Col, Row, Modal, ModalBody, ModalHeader, CardHeader, CardTitle, CardBody } from 'reactstrap'
import { useState } from 'react'
import CommonSelector from '../Selector/commonSelector'

const BillingReport = () => {
  const [centeredModal, setCenteredModal] = useState(false)
  const response = [
    {
      subtitle: 'Billing Improvement  Report',
      data: [
        {
          title: 'Monthly billing',
          color: 'primary'
        },
        {
          title: 'Billing Improvement  Report',
          color: 'danger'
        },
        {
          title: 'Billing Improvement  Report',
          color: 'primary'
        }
      ]
    },
    {
      subtitle: 'Collection Efficiency Report',
      data: [
        {
          title: 'Collection Efficiency Report',
          color: 'primary'
        },
        {
          title: 'Collection Efficiency Report',
          color: 'primary'
        },
        {
          title: 'Collection Efficiency Report',
          color: 'primary'
        }
      ]
    }
  ]

  return (
    <>
      <Col md='6' xs='12' lg='4' className=' '>
        <StatsHorizontal
          icon={<FileText size={21} />}
          color='info'
          stats='Billing & Collection efficiency Report'
          statTitle=''
          clas='h4'
          click={() => setCenteredModal(true)}
        />
      </Col>
      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal_size'>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Billing & Collection efficiency Report</ModalHeader>
        <ModalBody className='pt-3'>
          <CommonSelector />

          <Row className='mt-3'>
            {response.map((value, index) => {
              return value.data.map((item, index) => {
                return (
                  <Col lg='4' key={index}>
                    <Card className='card-statistics bg-transparent'>
                      <CardBody className=''>
                        <StatsHorizontal
                          icon={<Download size={21} />}
                          color={item.color}
                          stats={item.title}
                          className='pb-0 px-0'
                          issubstring={true}
                          strLen={20}
                          statTitle={value.subtitle}
                          clas='h4'
                          click={() => setCenteredModal(true)}
                        />
                      </CardBody>
                    </Card>
                  </Col>
                )
              })
            })}
          </Row>
        </ModalBody>
      </Modal>
    </>
  )
}

export default BillingReport
