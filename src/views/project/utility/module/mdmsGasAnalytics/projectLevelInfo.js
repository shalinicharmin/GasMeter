import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

// import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import Error from '@src/views/Error'
import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'

import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDAS'
import { caseInsensitiveSort } from '@src/views/utils.js'

import { handleThinkGasProjectInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/ProjectInfo'

const ProjectLevelInfo = props => {
  const dispatch = useDispatch()
  const responseData = useSelector(state => state.ThinkGasProjectInfoReducer)

  const [loadNextPage, setLoadNextPage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const handleRowClick = row => {
    // console.log(row)
    props.redirection(1, row)
  }

  const fetchData = async params => {
    return await useJwt
      .getThinkGasProjectInfo(params)
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

      // console.log('Calling API to understand flow ...')

      const params = {
        page: currentPage,
        page_size: 1000
      }

      const [statusCode, response] = await fetchData(params)

      if (statusCode === 200) {
        setLoadNextPage(false)
        dispatch(handleThinkGasProjectInfo(response.data.data.result))
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
        col_config.selector = row => row[i]
        col_config.sortable = true
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
                onClick={() => handleRowClick(row)}
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
    // return <SimpleDataTable columns={tblColumn()} tblData={responseData.responseData} tableName={props.tableName} />
    return (
      <SimpleDataTableMDAS
        columns={tblColumn()}
        tblData={responseData.responseData.results}
        rowCount={1000}
        tableName={'Project Information'}
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
    )
  }
}

export default ProjectLevelInfo
