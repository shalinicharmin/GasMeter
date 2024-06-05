import { Button, Col, Form, Row, Spinner } from "reactstrap"
import CreateFormField from "@src/views/ui-elements/formElement/createForm"
import { useEffect, useState } from "react"
import useJwt from "@src/auth/jwt/useJwt"
import jwt_decode from "jwt-decode"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { uploadFile, deleteFile } from "react-s3"
import { useDispatch } from "react-redux"
import { useHistory } from "react-router-dom"
import authLogout from "@src/auth/jwt/logoutlogic"

const MySwal = withReactContent(Swal)

// React S3 configuration
// const S3_BUCKET = "gpsurvey"
// const REGION = "us-east-1"
// const ACCESS_KEY = process.env.REACT_APP_ACCESS_KEY
// const SECRET_ACCESS_KEY = process.env.REACT_APP_SECRET_ACCESS_KEY

// const config = {
//   bucketName: S3_BUCKET,
//   region: REGION,
//   dirName: "avdhaan/tower-config-logo",
//   accessKeyId: ACCESS_KEY,
//   secretAccessKey: SECRET_ACCESS_KEY
// }

const TowerConfForm = (props) => {
  const [spiner, setSpiner] = useState(false)
  const [siteIdSelected, setSiteIdSelected] = useState({})
  const [loadTypeSelected, setLoadTypeSelected] = useState({})
  const [loadTypeChange, setLoadTypeChange] = useState({})

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const postTowerConfig = async (params) => {
    return await useJwt
      .postTowerConfig(params)
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
  const putTowerConfig = async (params) => {
    return await useJwt
      .putTowerConfig(params)
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

  // useEffect(() => {
  //     const logo_label = document.getElementById('id_dev_logo')

  //     logo_label.style.marginLeft = '-40px'
  // })

  useEffect(() => {
    if (props.type === "update") {
      setSiteIdSelected({
        value: {
          label: props.selected.site_name,
          value: `${props.selected.site_name}##${props.selected.site_id}`
        },
        isDisabled: true
      })
      setLoadTypeSelected({
        value: { label: props.selected.load_type, value: props.selected.load_type }
      })
    }
  }, [])

  useEffect(() => {
    if (loadTypeChange && Object.keys(loadTypeChange).length) {
      setLoadTypeSelected({ value: loadTypeChange })
    }
  }, [loadTypeChange])

  const viewLogo = (link) => (
    <a href={link} target='_blank'>
      View previous logo
    </a>
  )

  const fields = {
    "select#site_id": { label: "Select site*", options: props.sites, extras: siteIdSelected },
    "select#load_type": {
      label: "Select load type*",
      options: { kWh: "kWh", kVAh: "kVAh" },
      extras: loadTypeSelected,
      onchange: setLoadTypeChange
    },
    "text#tower_name": { label: "Tower name*", value: props.selected.tower_name },
    "text#email": { label: "Email*", value: props.selected.email },
    "number#contact": { label: "Mobile number*", value: props.selected.contact },
    "text#project": { label: "Project name*", value: props.selected.project },
    "text#gst_no": { label: "GST number*", value: props.selected.gst_no },
    "text#pan_no": { label: "PAN number*", value: props.selected.pan_no },
    "text#address": { label: "Tower address*", value: props.selected.address },
    "number#maintenance_charge": {
      label: "Maintenance charge",
      value: props.selected.maintenance_charge ? props.selected.maintenance_charge : 0
    },
    "number#maintenance_gst_charge": {
      label: "Maintenance GST charge",
      value: props.selected.maintenance_gst_charge ? props.selected.maintenance_gst_charge : 0
    },
    "number#other_charges": {
      label: "Other charge",
      value: props.selected.other_charges ? props.selected.other_charges : 0
    },
    "number#other_gst_charge": {
      label: "Other GST charge",
      value: props.selected.other_gst_charge ? props.selected.other_gst_charge : 0
    },
    "file#dev_logo": {
      label: props.selected.dev_logo ? viewLogo(props.selected.dev_logo) : "Developer logo"
    },
    row: 6
  }

  let userEmail = "n/a"

  if (localStorage.getItem("accessToken")) {
    userEmail = jwt_decode(localStorage.getItem("accessToken")).userData.email
  }

  const handlePost = async (params) => {
    const [statusCode, response] =
      props.type === "update" ? await putTowerConfig(params) : await postTowerConfig(params)

    if (statusCode === 201 || statusCode === 200) {
      const resp = response.data.data.result

      MySwal.fire({
        icon: "success",
        title: "Success",
        text: resp,
        customClass: { confirmButton: "btn btn-success" }
      })
      props.retry()
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      try {
        MySwal.fire({
          icon: "error",
          title: "Please notice !",
          text: response.data.detail,
          customClass: {
            confirmButton: "btn btn-danger"
          }
        })
      } catch (err) {
        MySwal.fire({
          icon: "error",
          title: "Please notice !",
          text: "Something went wrong",
          customClass: {
            confirmButton: "btn btn-danger"
          }
        })
      }
    }
  }

  // To upload the file through react s3
  // const handleUpload = async (file, params) => {
  //     if (file) {
  //         uploadFile(file, config)
  //             .then(data => {
  //                 params['dev_logo'] = data.location
  //                 handlePost(params)
  //             })
  //             .catch(err => console.error(err))
  //         file.value = null
  //     }
  // }

  //  To upload the file through react s3
  const handleUpload = async (file, params) => {
    // console.log(file)
    // console.log(file.name)
    const dirName = "avdhaan/tower-config-logo/"
    const fileName = `${dirName}${file.name}`
    if (file) {
      const url = `https://gpsurvey.s3.amazonaws.com/${fileName}`
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data"
        },
        body: file
      }
      try {
        const response = await fetch(url, options)
        if (response.ok) {
          console.log("Upload successful")
          // const data = await response.json() // Assuming your response returns JSON data with the file location
          // console.log(data)
          params["dev_logo"] = url
          await handlePost(params) // Call postUploadFile function with the response data
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

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setSpiner(true)

    const formData = new FormData(document.getElementById("ebDgAllocationForm"))
    const selectedSite =
      props.type === "update"
        ? `${props.selected.site_name}##${props.selected.site_id}`.split("##")
        : formData.get("site_id").split("##")

    formData.set("site_id", selectedSite[1])
    formData.set("site_name", selectedSite[0])
    formData.set("created_by", userEmail)
    formData.set("edited_by", userEmail)

    const params = {}
    let flag = true

    formData.forEach((value, key) => {
      if (!flag) {
        return true
      }
      if (!value) {
        toast.warning(<Toast msg={`${key} should not be null.`} type='warning' />, {
          hideProgressBar: true
        })
        flag = false
      }
      if (key === "deduction_amount") {
        if (parseFloat(value) > 1000 || parseFloat(value) < -1000) {
          toast.warning(
            <Toast
              msg={`Deduction amount shoud not be greator then 1000 and less then -1000 Rs.`}
              type='warning'
            />,
            { hideProgressBar: true }
          )
          flag = false
        }
      } else if (key === "email") {
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
          toast.warning(<Toast msg={"Please insert correct email."} type='warning' />, {
            hideProgressBar: true
          })
          flag = false
        }
      } else if (key === "contact") {
        if (value.length !== 10) {
          toast.warning(
            <Toast msg={`${key} length must be equal to 10 digits.`} type='warning' />,
            { hideProgressBar: true }
          )
          flag = false
          return true
        }
        if (!/^[6789]\d{9}$/.test(value)) {
          toast.warning(<Toast msg={`Please insert a valid mobile number.`} type='warning' />, {
            hideProgressBar: true
          })
          flag = false
        }
      } else if (
        [
          "mmc_grid_charge",
          "mmc_grid_gst_charge",
          "mmc_dg_charge",
          "mmc_dg_gst_charge",
          "fixed_grid_charge",
          "fixed_dg_charge",
          "fixed_dg_gst_charge",
          "monthly_maintain",
          "monthly_maintain_gst",
          "cam_charge",
          "cam_gst_charge",
          "cs_charge",
          "cs_gst_charge",
          "other_charges",
          "other_gst_charge",
          "vending_charge",
          "vending_charge_gst"
        ].includes(key)
      ) {
        if (value < 0 || value > 1000) {
          toast.warning(
            <Toast
              msg={`${key} value should not be less then zero and not be greater then 999.`}
              type='warning'
            />,
            { hideProgressBar: true }
          )
          flag = false
        }
      }
      params[key] = value
    })

    if (!flag) {
      setSpiner(false)
      return false
    }

    try {
      if (formData.get("dev_logo").name) {
        await handleUpload(formData.get("dev_logo"), params)
      } else {
        params["dev_logo"] = null
        await handlePost(params)
      }
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Please notice !",
        text: "Tower logo not uploaded.",
        customClass: {
          confirmButton: "btn btn-danger"
        }
      })

      flag = false
    }

    setSpiner(false)
  }

  return (
    <>
      <Form id='ebDgAllocationForm'>
        <Row>
          <CreateFormField fields={fields} />

          <Col xs='12' className='text-center pb-1 pt-2'>
            <Button color='primary' onClick={handleFormSubmit} disabled={spiner && true}>
              Submit &nbsp; &nbsp; {spiner && <Spinner size='sm' />}
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default TowerConfForm
