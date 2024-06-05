import { useEffect, useState, useRef } from "react"
import { Button, Form, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap"
import Select from "react-select"
import { toast } from "react-toastify"
import useJwt from "@src/auth/jwt/useJwt"
import authLogout from "@src/auth/jwt/logoutlogic"
import Toast from "@src/views/ui-elements/cards/actions/createToast"

function ConfigurationForm({
  siteList,
  values,
  loadingSites,
  configurationFormModal,
  setConfigurationFormModal,
  modalType,
  setModalType,
  setRefresh,
  refresh
}) {
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [viewOnly, setViewOnly] = useState(false)
  const [monthlyRent, setMonthlyRent] = useState()
  const [transactionCharges, setTransactionCharges] = useState()
  const selectSiteRef = useRef()

  useEffect(() => {
    setFormData(values)
    if (values.transactionCharges) {
      setTransactionCharges((Number(values.transactionCharges) / 1.18).toFixed(2))
    }
    if (values.monthlyRent) {
      setMonthlyRent((Number(values.monthlyRent) / 1.18).toFixed(2))
    }

    if (modalType === "VIEW") {
      setViewOnly(true)
    } else {
      setViewOnly(false)
    }
    return () => {
      setMonthlyRent()
      setTransactionCharges()
    }
  }, [values, modalType])

  function onSiteChange(site) {
    if (site) {
      formData.siteId = site.value
      formData.siteName = site.label
    } else {
      delete formData.siteId
      delete formData.siteName
    }
    setFormData(formData)
  }

  function validateFormData(formData) {
    let isValid = true
    const fields = [
      "accountId",
      "beneficiaryName",
      "branchName",
      "monthlyRent",
      "siteId",
      "siteName",
      "transactionCharges"
    ]
    for (const field of fields) {
      if (!formData.hasOwnProperty(field)) {
        toast.error(<Toast msg={`Please enter valid ${field}`} type='danger' />, {
          hideProgressBar: true
        })
        isValid = false
      }
    }
    return isValid
  }

  async function postConfig(formData) {
    setIsLoading(true)
    if (!formData.siteId || !formData.siteName) {
      selectSiteRef.current.focus()
      setIsLoading(false)
      return
    }

    if (validateFormData(formData)) {
      try {
        const res = await useJwt.postRentDeductionConfigurations(formData)
        toast.success(<Toast msg={"Submitted Succussfully"} type='success' />, {
          hideProgressBar: true
        })
        setConfigurationFormModal(false)
        setRefresh(!refresh)
      } catch (err) {
        if ([401, 403].includes(err.response?.status)) {
          authLogout(history, dispatch)
        } else {
          toast.error(
            <Toast msg={err.response?.data?.message || "Something went wrong!"} type='danger' />,
            {
              hideProgressBar: true
            }
          )
        }
      }
    }

    setIsLoading(false)
  }

  async function putConfig(formData) {
    setIsLoading(true)
    if (validateFormData(formData)) {
      try {
        const res = await useJwt.putRentDeductionConfigurations(formData)
        toast.success(<Toast msg={"Updated Succussfully"} type='success' />, {
          hideProgressBar: true
        })
        setConfigurationFormModal(false)
        setRefresh(!refresh)
      } catch (err) {
        if ([401, 403].includes(err.response?.status)) {
          authLogout(history, dispatch)
        } else {
          toast.error(
            <Toast msg={err.response?.data?.message || "Something went wrong!"} type='danger' />,
            {
              hideProgressBar: true
            }
          )
        }
      }
    }

    setIsLoading(false)
  }

  return (
    <>
      <Modal
        isOpen={configurationFormModal}
        toggle={() => setConfigurationFormModal(!configurationFormModal)}
        className='modal-dialog-centered'
      >
        <ModalHeader toggle={() => setConfigurationFormModal(!configurationFormModal)}>
          Configuration Form
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={(event) => {
              event.preventDefault()
              if (modalType === "NEW") {
                postConfig(formData)
              }
              if (modalType === "EDIT") {
                putConfig(formData)
              }
            }}
          >
            <Label className='w-100 mb-1' aria-required={true}>
              Select site
              <Select
                isClearable
                isSearchable
                onChange={onSiteChange}
                options={siteList}
                defaultValue={{
                  label: formData.siteName,
                  value: formData.siteId
                }}
                isDisabled={modalType !== "NEW" || loadingSites}
                className='react-select rounded'
                classNamePrefix='select'
                placeholder={loadingSites ? "Loading sites..." : "Select site..."}
                ref={selectSiteRef}
                required
              />
            </Label>
            <div className='d-flex'>
              <Label className='w-100 mb-1'>
                Transaction charges (%)
                <Input
                  type='number'
                  value={transactionCharges}
                  onChange={(event) => {
                    setTransactionCharges(event.target.value)
                    formData.transactionCharges = Number(event.target.value) * 1.18
                    setFormData({ ...formData })
                  }}
                  placeholder=''
                  disabled={viewOnly}
                  required
                />
              </Label>
              <Label className='w-100 mb-1'>
                + 18% GST
                <Input
                  type='number'
                  value={formData.transactionCharges}
                  placeholder=''
                  disabled={true}
                  required
                />
              </Label>
            </div>
            <div className='d-flex'>
              <Label className='w-100 mb-1'>
                Monthly Rent
                <Input
                  type='number'
                  value={monthlyRent}
                  onChange={(event) => {
                    setMonthlyRent(event.target.value)
                    formData.monthlyRent = Number(event.target.value) * 1.18
                    setFormData({ ...formData })
                  }}
                  placeholder=''
                  disabled={viewOnly}
                  required
                />
              </Label>
              <Label className='w-100 mb-1'>
                + 18% GST
                <Input
                  type='number'
                  value={formData.monthlyRent}
                  placeholder=''
                  disabled={true}
                  required
                />
              </Label>
            </div>

            <Label className='w-100 mb-1'>
              Account Id
              <Input
                type='text'
                value={formData.accountId}
                onChange={(event) => {
                  // if (/^[a-zA-Z0-9]*$/.test(event.target.value)) {
                  formData.accountId = event.target.value
                  setFormData({ ...formData })
                  // }
                }}
                placeholder=''
                disabled={viewOnly}
                required
              />
            </Label>
            <Label className='w-100 mb-1'>
              Beneficiary Name
              <Input
                type='text'
                value={formData.beneficiaryName}
                onChange={(event) => {
                  // if (/^[a-zA-Z0-9 ]*$/.test(event.target.value)) {
                  formData.beneficiaryName = event.target.value
                  setFormData({ ...formData })
                  // }
                }}
                placeholder=''
                disabled={viewOnly}
                required
              />
            </Label>
            <Label className='w-100 mb-1'>
              Branch Name
              <Input
                type='text'
                value={formData.branchName}
                onChange={(event) => {
                  // if (/^[a-zA-Z0-9\/\- ]*$/.test(event.target.value)) {
                  formData.branchName = event.target.value
                  setFormData({ ...formData })
                  // }
                }}
                placeholder=''
                disabled={viewOnly}
                required
              />
            </Label>
            {modalType === "VIEW" ? (
              <Button
                type='submit'
                color='primary'
                className='w-100'
                disabled={loadingSites}
                onClick={(event) => {
                  event.preventDefault()
                  setModalType("EDIT")
                }}
              >
                {isLoading ? (
                  <span
                    className='spinner-border spinner-border-sm'
                    role='status'
                    aria-hidden='true'
                  ></span>
                ) : (
                  "Edit"
                )}
              </Button>
            ) : (
              <Button
                type='submit'
                color='primary'
                className='w-100'
                disabled={loadingSites || isLoading}
              >
                {isLoading ? (
                  <span
                    className='spinner-border spinner-border-sm'
                    role='status'
                    aria-hidden='true'
                  ></span>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </Form>
        </ModalBody>
      </Modal>
    </>
  )
}

export default ConfigurationForm
