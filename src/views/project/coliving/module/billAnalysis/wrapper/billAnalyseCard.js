import Avatar from '@components/avatar'
import { Activity, AlignLeft, Calendar, Eye, MapPin, User, Zap } from 'react-feather'
import { Card, CardTitle, CardBody, CardText, Media, Row, Col, Button, Modal, ModalHeader, ModalBody } from 'reactstrap'
import BillDetailModal from './viewBillDetail'
import { useState, useEffect } from 'react'
import UpdateAnalysis from './analyzeReport'
import useJwt from '@src/auth/jwt/useJwt'
// import { useSelector } from 'react-redux'
import no_data from '@src/assets/images/svg/no_data.svg'
import { useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'
import { useDispatch, useSelector } from 'react-redux'

const CardBillAnalysis = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [billData, setBillData] = useState(false)
  const [centeredModal, setCenteredModal] = useState(false)
  const [analyzeId, setAnalyzeId] = useState(false)
  const responseSelector = useSelector(state => state.BillAnalysisReducer)

  const getBillAnalysisDetail = async id => {
    return await useJwt
      .getBillAnalysisDetail(id)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const showBill = async id => {
    const [statusCode, response] = await getBillAnalysisDetail(id)

    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        setBillData(response.data.data.result)
        setCenteredModal(true)
      }
    }
  }

  const analyzeBill = id => {
    setAnalyzeId(id)
    setBillData(false)
    setCenteredModal(true)
  }

  useEffect(() => {
    setCenteredModal(false)
  }, [responseSelector])

  return (
    <>
      <Row>
        {props.data.length === 0 ? (
          <div className='super-center min-height-400'>
            <div>
              <img src={no_data} style={{ height: '150px', width: '150px' }} />
              <p className='mt-1 ml-3'>No data found</p>
            </div>
          </div>
        ) : (
          props.data.map((item, index) => {
            return item.analysis_status === 'Pending' ? (
              <Col lg='4' md='6' key={index}>
                <Card className='card-developer-meetup'>
                  {/* <div className='meetup-img-wrapper rounded-top text-center'>
                <img src={illustration} height='170' />
              </div> */}
                  <CardBody>
                    <div className='meetup-header d-flex align-items-center'>
                      <div className='meetup-day'>
                        <h6 className='mb-0'>{item.issue_raise_date}</h6>
                      </div>
                      <div className='my-auto'>
                        <CardTitle tag='h6' className='mb-25 pt_5'>
                          {item.user}
                        </CardTitle>
                      </div>
                    </div>
                    <Media>
                      <Avatar color='light-primary' className='rounded mr-1' icon={<AlignLeft size={18} />} />
                      <Media body>
                        <h6 className='mt_8' style={{ wordBreak: 'break-all' }}>
                          {item.site_name}
                        </h6>
                      </Media>
                    </Media>
                    <Media className='mt-2'>
                      <Avatar color='light-primary' className='rounded mr-1' icon={<Calendar size={18} />} />
                      <Media body>
                        <h6 className='mb-0'>Start date - End date</h6>
                        <small>
                          {item.start_date} to {item.end_date}
                        </small>
                      </Media>
                    </Media>
                    <Media className='mt-2'>
                      <Avatar color='light-primary' className='rounded mr-1' icon={<Zap size={18} />} />
                      <Media body>
                        <h6 className='mb-0'>Bill amount / Unit (KWh)</h6>
                        <small>
                          Rs. {item.total_amount} / {item.total_units}
                        </small>
                      </Media>
                    </Media>
                    <Col className='mt-2 text-center'>
                      <Button.Ripple color='primary' className='px-2' outline size='sm' onClick={() => showBill(item.id)}>
                        <Eye size={15} /> View
                      </Button.Ripple>
                      {item.analysis_status === 'Pending' && (
                        <Button.Ripple color='success' outline size='sm' className='ml-1' onClick={() => analyzeBill(item.id)}>
                          <Activity size={15} /> Analyze
                        </Button.Ripple>
                      )}
                    </Col>
                  </CardBody>
                </Card>
              </Col>
            ) : null
          })
        )}
      </Row>
      <Modal
        isOpen={centeredModal}
        toggle={() => setCenteredModal(!centeredModal)}
        scrollable
        className={billData ? 'modal_size h-100' : 'modal-md modal-dialog-centered'}>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>{billData ? 'Bill issue report' : 'Update analysis report'}</ModalHeader>
        <ModalBody>{billData ? <BillDetailModal data={billData} /> : <UpdateAnalysis id={analyzeId} modal={centeredModal} />}</ModalBody>
      </Modal>
    </>
  )
}

export default CardBillAnalysis
