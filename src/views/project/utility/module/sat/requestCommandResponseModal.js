import React, { useState, useEffect } from "react"
import { Download, Plus } from "react-feather"
import { Col, Row, Button, Badge } from "reactstrap"
import DataTabled from "../../../../ui-elements/dataTableUpdated"
import { caseInsensitiveSort } from "@src/views/utils.js"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"
import Loader from "@src/views/project/misc/loader"
import { useDispatch } from "react-redux"
import { useHistory } from "react-router-dom"
import useJwt from "@src/auth/jwt/useJwt"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
const RequestCommandResponseModal = (props) => {
  // Error Handling
  const [errorMessage, setErrorMessage] = useState("")
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)
  const [loader, setLoader] = useState(false)

  const [logout, setLogout] = useState(false)

  const [page, setpage] = useState(0)
  const [respose, setResponse] = useState([])
  const [fetchingData, setFetchingData] = useState(true)

  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const fetchData = async (params) => {
    return await useJwt
      .getCmdResData(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
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
      setLoader(true)
      let params = {}
      params = {}
      if (props.rowData?.id) {
        params.id = props.rowData.id
      } else {
        return
      }
      //   console.log(params)

      const [statusCode, response] = await fetchData(params)
      if (statusCode === 200) {
        try {
          setResponse(response.data)
          setFetchingData(false)
          setRetry(false)
        } catch (error) {
          setRetry(false)
          setError(true)
          setErrorMessage("Something went wrong, please retry")
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage("Network Error, please retry")
      }
      setLoader(false)
    }
  }, [fetchingData, retry])

  const onRequest = async () => {
    const params = {
      id: props.rowData?.id
    }
    try {
      const response = await useJwt.postCmdResReq(params)
      toast.success(<Toast msg={response.data?.message} type='success' />, {
        hideProgressBar: true
      })
      setRetry(true)
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setLogout(true)
      } else if (error?.response?.status === 400 || error?.response?.status === 500) {
        toast.error(<Toast msg={error.response.data.error} type='danger' />, {
          hideProgressBar: true
        })
      } else {
        toast.error(<Toast msg={"Request Failed"} type='danger' />, {
          hideProgressBar: true
        })
      }
    }
  }

  const tblColumn = () => {
    const column = []
    const custom_width = ["create_time"]
    for (const i in respose[0]) {
      const col_config = {}
      if (
        i !== "id" &&
        i !== "sampleCount" &&
        i !== "testCycleId" &&
        i !== "sampleMeters" &&
        i !== "cmdArgs" &&
        i !== "result" &&
        i !== "resultCalculations"
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
        col_config.serch = i
        col_config.sortable = true
        col_config.reorder = true
        // col_config.width = '150px'
        col_config.selector = (row) => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        col_config.cell = (row) => {
          if (i === "status") {
            if (row[i] === "Success") {
              return (
                <Badge pill color='light-success' data-tag='allowRowEvents'>
                  {row[i]}
                </Badge>
              )
            } else if (row[i] === "Processing") {
              return (
                <Badge pill color='light-warning' data-tag='allowRowEvents'>
                  {row[i]}
                </Badge>
              )
            } else if (row[i] === "Failed") {
              return (
                <Badge pill color='light-danger' data-tag='allowRowEvents'>
                  {row[i]}
                </Badge>
              )
            } else {
              return (
                <Badge pill color='light-secondary' data-tag='allowRowEvents'>
                  {row[i]}
                </Badge>
              )
            }
          }
          if (i === "fileLink") {
            return (
              <a href={row[i]}>
                <Download size={20} className='mx-2' />
              </a>
            )
          }
          return (
            <div className={`d-flex font-weight-bold w-100 `} data-tag='allowRowEvents'>
              {row[i]}
            </div>
          )
        }
        column.push(col_config)
      }
    }

    column.unshift({
      name: "Sr No.",
      width: "90px",
      cell: (row, i) => {
        return <div className='d-flex justify-content-center'>{page * 10 + 1 + i}</div>
      }
    })
    return column
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const refresh = () => {
    setpage(0)
    setError(false)
    setRetry(true)
  }
  return (
    <>
      <h5 className='mb-1'>Request Command Response</h5>
      <Row>
        <Col>
          <Button.Ripple color='primary' type='' onClick={onRequest} className='float-right mb-1'>
            {/* < size={14} /> */}
            <span className='align-middle ml-25 ' id='new_cyclw'>
              New Request
            </span>
          </Button.Ripple>
        </Col>
      </Row>

      {loader ? (
        <Loader hight='min-height-475' />
      ) : hasError ? (
        <CardInfo
          props={{
            message: { errorMessage },
            retryFun: { retryAgain },
            retry: { retry }
          }}
        />
      ) : (
        !retry && (
          <DataTabled
            rowCount={10}
            currentpage={page}
            ispagination
            selectedPage={setpage}
            columns={tblColumn()}
            tblData={respose}
            tableName={"Requests"}
            pointerOnHover
            refresh={refresh}
            donotShowDownload={true}
          />
        )
      )}
    </>
  )
}

export default RequestCommandResponseModal
