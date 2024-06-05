import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardText,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap'
import { useSelector } from 'react-redux'
import { ChevronRight } from 'react-feather'
import { useState, useContext } from 'react'
import AssetCrousel from './wrapper/assetCrousel'
import { carouselBasic } from './wrapper/CarouselSourceCode'

const UserDetailCard = props => {
  const [active, setActive] = useState('1')
  const [centeredModal, setCenteredModal] = useState(false)

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }

  const basicInfo =
    props.data.primaryInformation &&
    props.data.primaryInformation.map((info, index) => (
      <Row key={index}>
        <Col xs='4' className='pr-0'>
          <CardText>{info.title}</CardText>
        </Col>
        <Col className='text-right pl-0' xs='8'>
          <h5 className='mb-1' title={info.value && info.value.toString().length > 35 ? info.value : ''}>
            {info.value && info.value.toString().length > 35 ? `${info.value.toString().substring(0, 35)} ...` : info.value}
          </h5>
        </Col>
      </Row>
    ))

  const fullInfo = () => {
    return (
      <div>
        <Nav className='justify-content-center' tabs>
          <NavItem>
            <NavLink
              active={active === '1'}
              onClick={() => {
                toggle('1')
              }}>
              Consumer info
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={active === '2'}
              onClick={() => {
                toggle('2')
              }}>
              General info
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={active === '3'}
              onClick={() => {
                toggle('3')
              }}>
              Existing meter info
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={active === '4'}
              onClick={() => {
                toggle('4')
              }}>
              Old meter info
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent className='py-50' activeTab={active}>
          {/* Consumer Full Information */}
          <TabPane tabId='1'>
            {props.data.ConsumerInformation &&
              props.data.ConsumerInformation.map((info, index) => (
                <Row key={index}>
                  <Col sm='5' xs='4' className='text-right border py-1'>
                    <h5 className='m-0'>{info.title}</h5>
                  </Col>
                  <Col sm='7' xs='8' className='border py-1'>
                    {info.value.toString().length > 50 ? `${info.value.toString().substring(0, 50)} ...` : info.value}
                  </Col>
                </Row>
              ))}
          </TabPane>

          {/* General Information */}
          <TabPane tabId='2'>
            {props.data.GeneralInformation &&
              props.data.GeneralInformation.map((info, index) => (
                <Row key={index}>
                  <Col sm='5' xs='4' className='text-right border py-1'>
                    <h5 className='m-0'>{info.title}</h5>
                  </Col>
                  <Col sm='7' xs='8' className='border py-1'>
                    {info.value.toString().length > 50 ? `${info.value.toString().substring(0, 50)} ...` : info.value}
                  </Col>
                </Row>
              ))}
          </TabPane>

          {/* Existing Meter Information */}
          <TabPane tabId='3'>
            {props.data.ExistingMeterInformation &&
              props.data.ExistingMeterInformation.map((info, index) => (
                <Row key={index}>
                  <Col sm='5' xs='4' className='text-right border py-1'>
                    <h5 className='m-0'>{info.title}</h5>
                  </Col>
                  <Col sm='7' xs='8' className='border py-1'>
                    {info.value.toString().length > 50 ? `${info.value.toString().substring(0, 50)} ...` : info.value}
                  </Col>
                </Row>
              ))}
          </TabPane>

          {/* Old Meter Information */}
          <TabPane tabId='4'>
            {props.data.OldMeterInformation &&
              props.data.OldMeterInformation.map((info, index) => (
                <Row key={index}>
                  <Col sm='5' xs='4' className='text-right border py-1'>
                    <h5 className='m-0'>{info.title}</h5>
                  </Col>
                  <Col sm='7' xs='8' className='border py-1'>
                    {info.value.toString().length > 50 ? `${info.value.toString().substring(0, 50)} ...` : info.value}
                  </Col>
                </Row>
              ))}
          </TabPane>
        </TabContent>
      </div>
    )
  }

  return (
    <Card className={`card-developer-meetup ${props.height} overflow-auto`}>
      <CardHeader className='py-1 mb-1 cursor-pointer' onClick={() => setCenteredModal(!centeredModal)}>
        <h3 className='text-center mb-0'>{props.data.consumerID}</h3>
        <Button.Ripple className='btn-icon rounded-circle m-0 p-0' color='flat-secondary'>
          <ChevronRight size={20} />
        </Button.Ripple>
      </CardHeader>
      <CardBody>{basicInfo}</CardBody>
      {/* Consumer detail modal */}
      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal_size'>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Consumer details</ModalHeader>
        <ModalBody>
          <Row>
            <Col xl='6'>
              <Card code={carouselBasic}>
                <AssetCrousel imgs={props.data.images} />
              </Card>
            </Col>
            <Col xl='6'>{fullInfo()}</Col>
          </Row>
        </ModalBody>
      </Modal>
    </Card>
  )
}

export default UserDetailCard
