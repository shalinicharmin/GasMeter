import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDAS'
import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'

import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import Error from '@src/views/Error'
import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'
import { caseInsensitiveSort } from '@src/views/utils.js'

import { ThinkGasMeterInstalledInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/MeterInstalled'

const MeterInstalled = props => {
  const dispatch = useDispatch()
  const responseData = useSelector(state => state.ThinkGasMeterInstalledReducer)

  const [loadNextPage, setLoadNextPage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [centeredModal, setCenteredModal] = useState(false)

  const handleRedirection = row => {
    const additionalInfoTemp = { ...row, ...props.additionalInfo }
    props.redirection(2, additionalInfoTemp)
  }

  const fetchData = async params => {
    return await useJwt
      .getThinkGasMeterInstalledInfo(params)
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
        dispatch(ThinkGasMeterInstalledInfo(response.data.data.result))
      }
    } else {
      // setMdmsFlow(responseData.responseData.user_flag)
    }
  }, [responseData, loadNextPage])

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
                onClick={() => handleRedirection(row)}
                style={{ width: '200px' }}
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
        <SimpleDataTableMDAS
          columns={tblColumn()}
          tblData={responseData.responseData.results}
          rowCount={1000}
          tableName={'Meter Installed'}
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

        {/* <SimpleDataTable columns={tblColumn()} tblData={responseData.responseData.results} rowCount={10} tableName={'Meter Installed'} /> */}

        <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal-xl '>
          <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Applicant Form</ModalHeader>
          <ModalBody>
            <h1>Hlw</h1>
          </ModalBody>
        </Modal>
      </>
    )
  }
}

export default MeterInstalled
