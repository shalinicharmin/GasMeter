import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDAS'
import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'

import { Modal, ModalBody, ModalHeader, Card, CardHeader, CardTitle, CardBody, Row, Col, Input, Form, Button, Label } from 'reactstrap'
import { useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import Error from '@src/views/Error'
import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'
import { caseInsensitiveSort } from '@src/views/utils.js'

import { ThinkGasApplicantApprovalPendingInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/ApplicantApprovalPending'

const ApplicantAppPending = props => {
  // console.log(props.additionalInfo)

  const [loadNextPage, setLoadNextPage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const dispatch = useDispatch()
  const responseData = useSelector(state => state.ThinkGasApplicantApprovalPendingReducer)

  const [centeredModal, setCenteredModal] = useState(false)
  // const data = [
  //   {
  //     id: '1',
  //     Consummer_Name: 'xyz',
  //     father_name: 2214,
  //     dt_installed: 'Yes',
  //     start_time: ' 05:01 PM, Feb 09, 2022',
  //     update_time: ' 05:02 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: '231d1e9b-6862-4c82-a717-6ff2fgdfga0cad1b',
  //     Consummer_Name: 'abc',
  //     father_name: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 05:01 PM, Feb 09, 2022',
  //     update_time: ' 05:02 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: 'bd213607-03fc-413f-9b64-1dbd8gegdghgf38048cc',
  //     Consummer_Name: 'def',
  //     father_name: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 05:00 PM, Feb 09, 2022',
  //     update_time: ' 05:01 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: 'b179664d-e7c9-4ccb-8a22-cb19454564e864216d',
  //     Consummer_Name: 'ghi',
  //     father_name: 2212,
  //     dt_installed: 'Yes',
  //     start_time: '02:31 PM, Feb 09, 2022',
  //     update_time: '02:31 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: '94d43de4-42e3-4eed-bedb-b66213ll;kc5a241',
  //     Consummer_Name: 'jkl',
  //     father_name: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 02:29 PM, Feb 09, 2022',
  //     update_time: ' 02:30 PM, Feb 09, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: 'ace88ab4-f1b0-4c46-a5f3-7185eqweew5ba748a9',
  //     Consummer_Name: 'mno',
  //     father_name: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 06:40 PM, Feb 08, 2022',
  //     update_time: ' 06:40 PM, Feb 08, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: '48b05e14-4e99-4766-be04-88276sdddgfgfb66cad',
  //     Consummer_Name: 'pqr',
  //     father_name: 2212,
  //     dt_installed: 'Yes',
  //     start_time: '06:39 PM, Feb 08, 2022',
  //     update_time: '06:39 PM, Feb 08, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: 'ace88ab4-f1b0-4c46-a5f3-71855ba74gfhfhfg8a9',
  //     Consummer_Name: 'xyz',
  //     father_name: 2212,
  //     dt_installed: 'Yes',
  //     start_time: '06:40 PM, Feb 08, 2022',
  //     update_time: '06:40 PM, Feb 08, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   },
  //   {
  //     id: '48b05e14-4e99-4766-be04-88276fb66gfdfgdgfcad',
  //     Consummer_Name: 'xyz',
  //     father_name: 2212,
  //     dt_installed: 'Yes',
  //     start_time: ' 06:39 PM, Feb 08, 2022',
  //     update_time: ' 06:39 PM, Feb 08, 2022',
  //     site_name_1: 'xyz',
  //     substation_1: 2214,
  //     dt_installed_1: 'Yes',
  //     site_name_2: 'xyz',
  //     substation_2: 2214,
  //     dt_installed_2: 'Yes'
  //   }
  // ]

  const meterresponse = [
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    },
    {
      title: 'First Name'
    }
  ]

  const tblColumn = () => {
    const column = []

    for (const i in responseData.responseData.results[0]) {
      const col_config = {}
      if (i !== 'id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        // col_config.style = {
        //   width: '400px'
        // }
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold '
                // style={{ width: '18vh' }}
                // onClick={() => handleRowClick(row.id, row.feeder_id, row.pss_id)}
                onClick={() => setCenteredModal(true)}
                style={{ width: '20vh' }}
                title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 10) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 10 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }

    return column
  }

  const fetchData = async params => {
    return await useJwt
      .getThinkGasApplicantApprovalPendingInfo(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        const status = 0
        return [status, err]
      })
  }

  useEffect(async () => {
    // console.log('MDMS UserFlow existing response')
    // console.log(responseData)

    if (!responseData || !responseData.responseData || loadNextPage) {
      //Call API to understand flow

      const params = {
        page: currentPage,
        page_size: 1000,
        CHARGED_AREA: props.additionalInfo.CHARGED_AREA,
        CITY: props.additionalInfo.CITY,
        GEOGRAPHICAL_AREA: props.additionalInfo.GEOGRAPHICAL_AREA
      }

      const [statusCode, response] = await fetchData(params)

      if (statusCode === 200) {
        setLoadNextPage(false)
        dispatch(ThinkGasApplicantApprovalPendingInfo(response.data.data.result))
      }
    } else {
      // setMdmsFlow(responseData.responseData.user_flag)
    }
  }, [responseData, loadNextPage])

  const refresh = () => {
    setLoadNextPage(true)
  }

  const onNextPageClicked = page => {
    setCurrentPage(page + 1)
    setLoadNextPage(true)
  }

  if (!responseData || !responseData.responseData) {
    return <Loader hight='min-height-158' />
  } else {
    return (
      <>
        {/* <SimpleDataTable columns={tblColumn()} tblData={responseData.responseData.results} rowCount={10} tableName={'Applicant Approval Pending'} /> */}

        <SimpleDataTableMDAS
          columns={tblColumn()}
          tblData={responseData.responseData.results}
          rowCount={1000}
          tableName={'Applicant Approval Pending'}
          refresh={refresh}
          // filter={handleFilter}
          status={loadNextPage}
          currentPage={currentPage}
          totalCount={responseData.responseData.count}
          onNextPageClicked={onNextPageClicked}
          // protocolSelected={protocolSelected}
          // protocol={protocol}
          // extras={generateBill}
        />

        {/* modal */}

        <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal-xl '>
          <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Applicant Form</ModalHeader>
          <ModalBody>
            <Form>
              <Row>
                {meterresponse.map((value, index) => {
                  return (
                    <Col md='4' sm='12' className='mb-1'>
                      <Label className='form-label' for='nameMulti'>
                        First Name
                      </Label>
                      <Input type='text' name='name' id='nameMulti' value={value.title} disabled />
                    </Col>
                  )
                })}
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      </>
    )
  }
}

export default ApplicantAppPending
