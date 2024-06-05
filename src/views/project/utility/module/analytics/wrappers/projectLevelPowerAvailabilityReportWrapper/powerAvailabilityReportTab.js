import { ArrowRight, Download } from 'react-feather'

import {
    Card,
    Col,
    Row,
    Modal,
    ModalBody,
    ModalHeader,
    CardBody
} from 'reactstrap'

import { useState } from 'react'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'

const PowerAvailabilityReport = () => {
    const [centeredModal, setCenteredModal] = useState(false)

    const response = [
        {
            title: 'DT-Wise power outage Report',
            color: 'warning'
        },
        {
            title: 'Power Outage Raw Data Report',
            color: 'success'
        },
        {
            title: 'Power Outage Raw Data Report',
            color: 'success'
        },
        {
            title: 'Power Outage Raw Data Report',
            color: 'success'
        }
    ]

    return (
        <>
            <Col md='6' xs='12' lg='4' className=' '>
                <StatsHorizontal
                    icon={<ArrowRight size={21} />}
                    color='secondary'
                    stats='power Availability Report'
                    statTitle=''
                    clas='h4'
                    click={() => setCenteredModal(true)}
                />
            </Col>
            <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal-xl '>
                <ModalHeader toggle={() => setCenteredModal(!centeredModal)}></ModalHeader>
                <ModalBody className='height-600'>
                    <h4>power Availability Report </h4>
                    <Row className='mt-2'>
                        {response.map((value, index) => {
                            return (
                                <Col lg='3' key={index}>
                                    <Card className='card-statistics bg-transparent'>
                                        <CardBody className=''>
                                            <StatsHorizontal
                                                icon={<Download size={21} />}
                                                color={value.color}
                                                stats={value.title}
                                                className='pb-0 px-0'
                                                issubstring={true}
                                                strLen={25}
                                                statTitle=''
                                                clas='h5'
                                                click={() => setCenteredModal(true)}
                                            />
                                        </CardBody>
                                    </Card>
                                </Col>
                            )
                        })}
                    </Row>
                </ModalBody>
            </Modal>
        </>
    )
}

export default PowerAvailabilityReport
