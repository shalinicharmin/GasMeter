import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardText, CardTitle, Col, Row, Button, CardHeader, CardFooter, Modal, ModalHeader, ModalBody } from 'reactstrap'
import useJwt from '@src/auth/jwt/useJwt'
import { ArrowRight, File, Plus, Star } from 'react-feather'
import { Link, useHistory } from 'react-router-dom'
import NewIssueForm from './newIssueForm'
import { useDispatch, useSelector } from 'react-redux'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
// import { useState, useEffect } from 'react'
// import { useHistory } from 'react-router-dom'
import authLogout from '../../../../../auth/jwt/logoutlogic'

const IssuesCard = props => {
  const dispatch = useDispatch()
  const history = useHistory()
  const [fetchingData, setFetchingData] = useState(true)
  const [response, setResponse] = useState([])
  const [formPopup, setFormPopup] = useState(false)

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const fetchData = async params => {
    return await useJwt
      .getColivingIssueCategories(params)
      .then(res => {
        // console.log(res)
        const status = res.status
        setResponse(res.data)
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
  useEffect(async () => {
    if (fetchingData || retry) {
      let params = undefined
      params = {}
      const [statusCode, responseData] = await fetchData(params)

      if (statusCode === 200) {
        try {
          setResponse(responseData.data)
          setFetchingData(false)
          setRetry(false)
        } catch (error) {
          setRetry(false)
          setError(true)
          setErrorMessage('Something went wrong, please retry')
        }
        // console.log(responseData.data)
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage('Network Error, please retry')
      }
    }
  }, [fetchingData, retry])

  const handleformpopup = () => setFormPopup(!formPopup)

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <>
      <Row>
        <Col>
          <h4>Coliving Issues Management</h4>
        </Col>
        <Col>
          <Button.Ripple
            color='danger'
            className='float-right btn btn-sm mb-1'
            onClick={() => {
              handleformpopup()
            }}>
            <Plus size={16} />
            <span className='align-middle ml-25'> New Issue</span>
          </Button.Ripple>
        </Col>
      </Row>

      <Modal isOpen={formPopup} toggle={handleformpopup} className={`modal-lg modal-dialog-centered`}>
        <ModalHeader toggle={handleformpopup}>Prepaid Smart Meter Issues</ModalHeader>
        <ModalBody className=''>
          <NewIssueForm data={response} handleformpopup={handleformpopup} />
        </ModalBody>
      </Modal>

      <Row className='match-height'>
        {hasError ? (
          <Col lg='12' className='p-2'>
            <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
          </Col>
        ) : (
          <>
            {response.map(item => {
              return (
                <Col md='6' key={item.id}>
                  <Card className='cardhover'>
                    {/* <CardHeader tag='h<Col xl="6" md="6" xs="12" key={card.id}>
                <IssueCategoryCard card={card} />
              </Col>4'>{item.issue_title}</CardHeader> */}
                    <CardBody>
                      <CardTitle tag='h4'>{item.categoryTitle}</CardTitle>
                      <CardText>{item.categoryDescription}</CardText>
                    </CardBody>
                    <CardFooter className='border-top-0 mt-0'>
                      <Row>
                        <Col>
                          <div className='d-flex justify-content-between align-items-center'>
                            <div className=''>
                              <h6 className='text-primary font-weight-bolder  '>Pending: </h6>
                              <h3 className='mb-0  bg-light-warning rounded-pill text-center'>{item.issuesCount['pending']}</h3>
                            </div>
                            <div className='mx-1'>
                              <h6 className='text-primary font-weight-bolder'>InProgress: </h6>
                              <h3 className='mb-0 text-center  bg-light-primary rounded-pill'>{item.issuesCount['inProgress']}</h3>
                            </div>
                            <div className=' '>
                              <h6 className='text-primary font-weight-bolder'>Resolved: </h6>
                              <h3 className='mb-0 text-center  bg-light-success rounded-pill'>{item.issuesCount['resolved']}</h3>
                            </div>
                          </div>
                        </Col>

                        <Col>
                          <Button.Ripple
                            color='primary'
                            className='float-right px-1 py_8 mt_10'
                            onClick={() => {
                              props.click(true)
                              props.issueId(item.id)
                            }}>
                            Issues
                            <ArrowRight className='font-medium-5  mx_4' />
                          </Button.Ripple>
                        </Col>
                      </Row>
                    </CardFooter>
                  </Card>
                </Col>
              )
            })}
          </>
        )}
      </Row>
    </>
  )
}

export default IssuesCard
