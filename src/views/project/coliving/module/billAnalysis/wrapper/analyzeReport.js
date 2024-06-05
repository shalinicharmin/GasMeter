import { ArrowRight } from "react-feather"
import {
  Row,
  Col,
  Badge,
  Form,
  FormGroup,
  Label,
  CustomInput,
  Button,
  Input,
  Spinner
} from "reactstrap"
import useJwt from "@src/auth/jwt/useJwt"
import jwt_decode from "jwt-decode"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import { useDispatch, useSelector } from "react-redux"
import { handleBillAnalysis } from "@store/actions/coliving/billAnalysis"
import { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import authLogout from "../../../../../../auth/jwt/logoutlogic"
// import { uploadFile } from 'react-s3'

// // React S3 configuration
// const S3_BUCKET = 'gpsurvey'
// const REGION = 'us-east-1'
// const ACCESS_KEY = process.env.REACT_APP_ACCESS_KEY
// const SECRET_ACCESS_KEY = process.env.REACT_APP_SECRET_ACCESS_KEY

// const config = {
//   bucketName: S3_BUCKET,
//   region: REGION,
//   dirName: 'avdhaan/meter-configuration-data',
//   accessKeyId: ACCESS_KEY,
//   secretAccessKey: SECRET_ACCESS_KEY
// }

const UpdateAnalysis = (props) => {
  console.log("hello")
  const dispatch = useDispatch()
  const history = useHistory()
  const [selectedFile, setSelectedFile] = useState(null)

  console.log(selectedFile)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [load, setLoad] = useState(false)
  const responseSelector = useSelector((state) => state.BillAnalysisReducer)

  const uploadAnalysisReport = async (params) => {
    return await useJwt
      .uploadAnalysisReport(props.id, params)
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

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoad(true)

      let url = ""

      // To get current date
      const date = new Date()
      const year = date.getFullYear().toString().substr(-2)
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const newDate = String(date.getDate()).padStart(2, "0")
      const current_date = `${year}${month}${newDate}`

      // To get current time
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      const seconds = String(date.getSeconds()).padStart(2, "0")

      const current_time = `${hours}${minutes}${seconds}`

      const date_time = `${current_date}${current_time}`
      const file_name = selectedFile.name.split(".")
      const dirName = "avdhaan/meter-configuration-data/"
      const _file_name = `${dirName}${file_name[0]}_${date_time}.${file_name[1]}`

      if (selectedFile) {
        // const newFileName = new File([selectedFile], _file_name)
        // await uploadFile(newFileName, config)
        //   .then(data => {
        //     url = data.location
        //   })
        //   .catch(err => console.error(err))
        // selectedFile.value = null

        url = `https://gpsurvey.s3.amazonaws.com/${_file_name}`
        const options = {
          method: "PUT",
          headers: {
            "Content-Type": "multipart/form-data"
          },
          body: new File([selectedFile], _file_name)
        }
        try {
          const response = await fetch(url, options)
          if (response.ok) {
            // console.log("Upload successful")
            // const data = await response.json() // Assuming your response returns JSON data with the file location
            // console.log(data)
          } else {
            // console.error("Upload failed")
            // Handle failed upload
          }
        } catch (error) {
          // console.error("Error uploading file:", error)
          // Handle error
        }
        selectedFile.value = null
      } else {
        toast.warning(<Toast msg={"Select a file to upload ."} type='warning' />, {
          hideProgressBar: true
        })
        return
      }

      if (!url) {
        toast.warning(<Toast msg={"File is not uploaded successfully."} type='warning' />, {
          hideProgressBar: true
        })
        return
      }

      const params = { solution_report: url }

      // const getUserData = JSON.parse(localStorage.getItem('userData'))

      const getUserData = localStorage.getItem("accessToken")
        ? jwt_decode(localStorage.getItem("accessToken")).userData
        : null

      params["solved_by"] = getUserData.name
      params["report_detail"] = document.getElementById("reportDetail").value

      // if (!params.get("report_file").name) {
      //   toast.warning(<Toast msg='Please insert report file.' type='warning' />, {
      //     hideProgressBar: true
      //   })
      //   return false
      // }

      const [status, res] = await uploadAnalysisReport(params)

      if (status === 200) {
        toast.success(<Toast msg='Bill analysis report updated successfully.' type='success' />, {
          hideProgressBar: true
        })
        dispatch(handleBillAnalysis(!responseSelector.responseData))
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Fail to Upload the report file.' type='danger' />, {
          hideProgressBar: true
        })
      }
    } finally {
      setLoad(false)
    }
  }

  return (
    <Form id='fileUpload'>
      <Row>
        {/* <Col sm='12'>
          <FormGroup>
            <Label for='title'>Analysis title</Label>
            <Input type='text' id='title' name='title' />
          </FormGroup>
        </Col> */}
        <Col sm='12'>
          <FormGroup>
            <Label for='uploadReport'>Upload report file</Label>
            <CustomInput
              type='file'
              id='uploadReport'
              name='report_file'
              accept='application/pdf'
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </FormGroup>
        </Col>
        <Col sm='12'>
          <FormGroup>
            <Label for='reportDetail'>Report detail</Label>
            <Input
              type='textarea'
              name='report_detail'
              id='reportDetail'
              rows='2'
              placeholder='Report detail'
            />
          </FormGroup>
        </Col>
        <Col sm='12' className='mt-2 text-center'>
          <Button.Ripple
            className='mr-1'
            color='primary'
            size='sm'
            type='submit'
            onClick={handleFormSubmit}
          >
            Submit &nbsp; {load && <Spinner size='sm' color='light' />}
          </Button.Ripple>
        </Col>
      </Row>
    </Form>
  )
}

export default UpdateAnalysis
