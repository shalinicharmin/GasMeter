import React, { useState, useEffect } from "react"
import { DownloadCloud, Inbox, Search, Share } from "react-feather"
import { Button, Card, Col, Input, Row } from "reactstrap"
// import { uploadFile, deleteFile } from "react-s3"

import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import "@src/views/project/commonModules/meterConfigDashboard/upload.css"
import useJwt from "@src/auth/jwt/useJwt"
import jwt_decode from "jwt-decode"
import { useHistory } from "react-router-dom"
import { useDispatch } from "react-redux"
import authLogout from "../../../../auth/jwt/logoutlogic"

// // React S3 configuration
// const S3_BUCKET = "gpsurvey"
// const REGION = "us-east-1"
// const ACCESS_KEY = process.env.REACT_APP_ACCESS_KEY
// const SECRET_ACCESS_KEY = process.env.REACT_APP_SECRET_ACCESS_KEY

// const config = {
//   bucketName: S3_BUCKET,
//   region: REGION,
//   dirName: "avdhaan/meter-configuration-data",
//   accessKeyId: ACCESS_KEY,
//   secretAccessKey: SECRET_ACCESS_KEY
// }

const UploadDataCsv = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  // a local state to store the currently selected file.
  const [selectedFile, setSelectedFile] = useState(null)

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

  const name = jwt_decode(localStorage.getItem("accessToken")).userData.name

  const dirName = "avdhaan/meter-configuration-data/"
  //  the name will be changed while upload
  const changedFileName = `${dirName}${name}_${date_time}.csv`

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  //  Post request
  const postUploadFile = async (params) => {
    // console.log("File URL .....")
    // console.log(params)
    try {
      const param = {
        csv_file: params
      }
      const res = await useJwt.postUploadFile(param)
      // console.log('responses', res)
      if (res.status === 201) {
        setSelectedFile(selectedFile)
        toast.success(<Toast msg={"File Uploaded  Succesfully."} type='success' />, {
          hideProgressBar: true
        })
      } else if (res.status === 202) {
        // ondelete()
        toast.warning(<Toast msg={"File Already Exist."} type='warning' />, {
          hideProgressBar: true
        })
      } else if (res.status === 401 || res.status === 403) {
        setLogout(true)
      }
    } catch (error) {
      if (error.response.status === 406) {
        // ondelete()
        toast.warning(<Toast msg={"File Format Wrong."} type='warning' />, {
          hideProgressBar: true
        })
      } else if (error.response.status === 401 || error.response.status === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg={"Something went wrong please retry ."} type='danger' />, {
          hideProgressBar: true
        })
      }
    }
  }

  // To upload the file through react s3
  const handleUpload = async (file, changedFileName) => {
    if (file) {
      const url = `https://gpsurvey.s3.amazonaws.com/${changedFileName}`
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        body: new File([file.files[0]], changedFileName)
      }
      try {
        const response = await fetch(url, options)
        if (response.ok) {
          console.log("Upload successful")
          // const data = await response.json() // Assuming your response returns JSON data with the file location
          // console.log(data)
          await postUploadFile(url) // Call postUploadFile function with the response data
        } else {
          console.error("Upload failed")
          // Handle failed upload
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        // Handle error
      }
      file.value = null // Clear input value
    } else {
      toast.warning(<Toast msg={"Select a file to upload ."} type='warning' />, {
        hideProgressBar: true
      })
    }
  }

  // on handle change file
  const handleFileSelect = (event) => {
    setSelectedFile(event.target)
  }

  return (
    <>
      <Card style={{ borderStyle: "dashed", borderColor: "#948bf4", backgroundColor: "#f5f5f0" }}>
        <label className='container text-center py-4' htmlFor='multiplefileupload'>
          <div className='row'>
            <div className='col-md-12'>
              <Button.Ripple className='btn-icon rounded-circle' outline color=''>
                <DownloadCloud size={60} />
              </Button.Ripple>
              <p>Choose File (Csv *) to Upload </p>
              <input
                className='uploadFile'
                id='multiplefileupload'
                color='primary'
                type='file'
                accept='.csv'
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </label>
      </Card>
      <div className='mx-2 mt-0 '>
        <Row>
          <Col lg='6'>
            <div className='d-flex flex-row '>
              <p> Dummy Csv File Format : </p>
              <a
                href='https://gpsurvey.s3.amazonaws.com/avdhaan/survey-configuration-data/csvData.csv'
                className='pl_5'
              >
                {" "}
                Download
              </a>
            </div>
          </Col>

          <Col lg='6'>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpload(selectedFile, changedFileName)
                // ondelete(selectedFile)
              }}
            >
              <Button.Ripple outline color='success' className='float-right' type='submit'>
                Upload File
              </Button.Ripple>
            </form>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default UploadDataCsv
