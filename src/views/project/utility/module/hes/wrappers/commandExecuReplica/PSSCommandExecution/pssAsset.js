import {
  Col,
  CardHeader,
  CardBody,
  CardTitle,
  Card,
  Button,
  Row,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Spinner,
} from 'reactstrap';
import Select from 'react-select';
import useJwt from '@src/auth/jwt/useJwt';
import { selectThemeColors } from '@utils';

import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import Flatpickr from 'react-flatpickr';
// import { useSelector } from 'react-redux'
import { useState, useEffect, forwardRef } from 'react';

import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import authLogout from '../../../../../../../../auth/jwt/logoutlogic';
import DataTable from '@src/views/ui-elements/dataTableUpdated';
import { ArrowLeft, ArrowRight, Eye, Trash2 } from 'react-feather';
import MeterDetailsModal from '../selectedMeterDetailsModal';
import { caseInsensitiveSort } from '@src/views/utils.js';

const PssAsset = (props) => {
  const location = useLocation();
  const meter_command_execution_allowed = 250;
  const { tableData, setTableData } = props;

  // console.log(tableData)
  const dispatch = useDispatch();
  const history = useHistory();

  const [retry, setRetry] = useState(false);
  // Logout User
  const [logout, setLogout] = useState(false);
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  // to get pss list
  const responseData = useSelector(
    (state) => state.UtilityMDASAssetListReducer
  );

  // console.log('Asset list Reducer ......')
  // console.log(responseData)

  // Use State for pss list
  const [pss, setPss] = useState(undefined);
  // Local State to maintain meter Selected
  const [meter, setMeter] = useState(undefined);
  const [params, setParams] = useState({});
  const [showPssDropwDown, setShowPssDropdown] = useState(false);
  // Use State for Meter List
  const [meterList, setMeterList] = useState(undefined);
  const [selectedMeter, setSelectedMeter] = useState(null);
  // Use State for Selected pss List for command execution
  const [selectedPss, setSelectedPss] = useState([]);
  // Local State to maintain total pss Count
  const [pssCount, setPssCount] = useState(undefined);

  const [meterModal, setMeterModal] = useState(false);

  // To get Meter Row Id
  const [meterRowId, setMeterRowId] = useState();
  // To get Selected Row
  const [selectedPssRow, setSelectedPssRow] = useState();

  // local state to show loader
  const [loader, setLoader] = useState(false);

  const [totalSelectedMeterCount, setTotalSelectedMeterCount] = useState(0);

  const fetchMeterListForSelectedPss = async (params) => {
    // API Call to fetch Meter List
    return await useJwt
      .getGISDTRMeterList(params)
      .then((res) => {
        const status = res.status;
        return [status, res];
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status;
          return [status, err];
        } else {
          return [0, err];
        }
      });
  };

  // UseEffect to fetch Meter List for Selected pss from Dropdown
  useEffect(async () => {
    if (selectedPss.length > 0) {
      setLoader(true);
      const params = {
        project:
          location.pathname.split('/')[2] === 'sbpdcl'
            ? 'ipcl'
            : location.pathname.split('/')[2],
        pss_id: selectedPss[0]['value'],
      };

      // Fetch Meter List
      const [statusCode, response] = await fetchMeterListForSelectedPss(params);

      if (statusCode) {
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true);
        } else if (statusCode === 200) {
          setLoader(false);
          // Construct Meter List for DropDown
          const temp_meter_list = response.data.data.result.stat.meters;

          const meter_list = [];
          for (let i = 0; i < temp_meter_list.length; i++) {
            // const temp_meter = {}
            temp_meter_list[i]['value'] = temp_meter_list[i]['meter_number'];
            temp_meter_list[i]['label'] = temp_meter_list[i]['meter_number'];
            temp_meter_list[i]['isFixed'] = 'true';
            if (
              temp_meter_list[i]['grid_id'] === undefined ||
              temp_meter_list[i]['grid_id'] === '' ||
              temp_meter_list[i]['grid_id'] === null
            ) {
              // Don't Add Meter to dropdown
            } else if (
              temp_meter_list[i]['meter_sw_version'] === undefined ||
              temp_meter_list[i]['meter_sw_version'] === '' ||
              temp_meter_list[i]['meter_sw_version'] === null
            ) {
              // Don't Add Meter to Dropdown
            } else if (
              temp_meter_list[i]['meter_address'] === undefined ||
              temp_meter_list[i]['meter_address'] === '' ||
              temp_meter_list[i]['meter_address'] === null
            ) {
              // Don't Add Meter to Dropdown
            } else {
              meter_list.push(temp_meter_list[i]);
            }
          }
          setMeterList(meter_list);
        } else {
          setLoader(false);
        }
      }
    }
  }, [selectedPss]);

  // If pss Count undefined set pss Count Value
  if (!pssCount) {
    if (responseData.responseData.pss_list.length > 0) {
      setPssCount(responseData.responseData.pss_list.length);
    }
  }

  useEffect(() => {
    setShowPssDropdown(true);

    const temp_dtr = [];
    const pss_list = responseData.responseData.pss_list;

    if (pss_list.length > 0) {
      for (const ele of pss_list) {
        const temp = {};
        temp['value'] = ele['pss_id'];
        temp['label'] = ele['pss_name'];
        // temp['pss_id'] = ele['pss_id']
        // temp['feeder_id'] = ele['feeder_id']
        temp['isFixed'] = 'true';
        temp_dtr.push(temp);
      }
      setPss(temp_dtr);
    }

    // Condition to check whether to show pss DropDown or not
    // if (pssCount && pssCount === 1) {
    //   // Donot Show pss DropDown
    //   setShowPssDropdown(false)

    //   // Set only pss as selected pss
    //   const temp_dtr = responseData.responseData.pss_list

    //   const temp = {}
    //   temp['value'] = temp_dtr[0]['pss_id']
    //   temp['label'] = temp_dtr[0]['pss_name']
    //   // temp['pss_id'] = temp_dtr[0]['pss_id']
    //   // temp['feeder_id'] = temp_dtr[0]['feeder_id']
    //   temp['isFixed'] = 'true'

    //   const temp_selected_dtr = []
    //   temp_selected_dtr.push(temp)

    //   setSelectedPss(temp_selected_dtr)
    // } else if (pssCount && !pss) {
    //   // Show pss DropDown
    //   setShowPssDropdown(true)

    //   const temp_dtr = []
    //   const pss_list = responseData.responseData.pss_list

    //   if (pss_list.length > 0) {
    //     for (const ele of pss_list) {
    //       const temp = {}
    //       temp['value'] = ele['pss_id']
    //       temp['label'] = ele['pss_name']
    //       // temp['pss_id'] = ele['pss_id']
    //       // temp['feeder_id'] = ele['feeder_id']
    //       temp['isFixed'] = 'true'
    //       temp_dtr.push(temp)
    //     }
    //     setPss(temp_dtr)
    //   }
    // }
  }, [pssCount]);

  //  Pss on Change function
  const onPssSelected = (selectedOption) => {
    if (selectedOption) {
      setMeter([]);
      setMeterList([]);

      const temp_selected_pss = [];
      temp_selected_pss.push(selectedOption);
      setSelectedPss(temp_selected_pss);
      // setDTRSelected(selectedOption)
      setSelectedMeter(null);
    } else {
      setLoader(false);
      setSelectedPss([]);
      setSelectedMeter(null);
      setMeter([]);
      setMeterList([]);
    }
  };

  // Meter  on change function
  const onMeterSelected = (selectedOption) => {
    if (selectedOption.length) {
      const meter_list = [];
      for (let i = 0; i < selectedOption.length; i++) {
        meter_list.push(selectedOption[i]);
      }
      // const meter_list_string = meter_list.join(',')
      setMeter(meter_list);
    } else {
      setMeter([]);
    }
  };

  const NumberInput = forwardRef((props, ref) => {
    const handleChange = (event) => {
      const { value } = event.target;
      // Only allow numbers to be entered
      if (/^\d*$/.test(value)) {
        props.onChange(event);
      }
    };

    return (
      <input
        className="no-style"
        placeholder={meter?.length > 0 ? '' : 'Select meter...'}
        {...props}
        ref={ref}
        onChange={handleChange}
        autoFocus={meter?.length > 0}
      />
    );
  });

  // On Add button
  const Submitresponse = () => {
    if (totalSelectedMeterCount <= meter_command_execution_allowed) {
      if (selectedPss.length > 0) {
        let exists = false;
        tableData.forEach((ele) => {
          if (ele.pss_id === selectedPss[0].value) {
            exists = true;
          }
        });
        if (meterList && meterList.length > 0) {
          if (meter && meter.length > 0) {
            const temp_total_selected_meter_count =
              totalSelectedMeterCount + meter.length;

            if (
              temp_total_selected_meter_count <= meter_command_execution_allowed
            ) {
              if (exists) {
                setSelectedPss([]);
                setMeter([]);
                toast.warning(
                  <Toast msg={'Pss Already Exists'} type="warning" />,
                  { hideProgressBar: true }
                );
                return false;
              } else {
                const newObj = {
                  pss_id: selectedPss[0].value,
                  pss_name: selectedPss[0].label,
                  meters: meter,
                  total_Meters_Count: meter.length,
                };
                const processData = [...tableData, newObj];
                setTableData(processData);
              }
              setTotalSelectedMeterCount(
                totalSelectedMeterCount + meter.length
              );
              setSelectedPss([]);
              setMeter([]);
            } else {
              setSelectedPss([]);
              setMeter([]);
              toast.warning(
                <Toast
                  msg={'Command Execution more than 30 meters are not allowed'}
                  type="warning"
                />,
                { hideProgressBar: true }
              );
              return false;
            }
          } else {
            const temp_total_selected_meter_count =
              totalSelectedMeterCount + meterList.length;

            if (
              temp_total_selected_meter_count <= meter_command_execution_allowed
            ) {
              if (exists) {
                setSelectedPss([]);
                setMeterList([]);
                toast.warning(
                  <Toast msg={'Pss Already Exists'} type="warning" />,
                  { hideProgressBar: true }
                );
                return false;
              } else {
                const newObj = {
                  pss_id: selectedPss[0].value,
                  pss_name: selectedPss[0].label,
                  // meters: meterList,
                  meters: meterList.map((meter) => {
                    return meter;
                  }),
                  total_Meters_Count: meterList.length,
                };
                const processData = [...tableData, newObj];
                setTableData(processData);
              }

              setTotalSelectedMeterCount(
                totalSelectedMeterCount + meterList.length
              );
              setSelectedPss([]);
              setMeterList([]);
            } else {
              setSelectedPss([]);
              setMeterList([]);
              toast.warning(
                <Toast
                  msg={'Command Execution more than 30 meters are not allowed'}
                  type="warning"
                />,
                { hideProgressBar: true }
              );
              return false;
            }
          }
        } else {
          setSelectedPss([]);
          toast.warning(
            <Toast
              msg={'In Selected Pss not any Meter exist'}
              type="warning"
            />,
            { hideProgressBar: true }
          );
          return false;
        }
      } else {
        toast.warning(<Toast msg={'select Pss'} type="warning" />, {
          hideProgressBar: true,
        });
        return false;
      }
    } else {
      setSelectedPss([]);
      setMeterList([]);
      setMeter([]);
      toast.warning(
        <Toast
          msg={'Command Execution more than 30 meters are not allowed'}
          type="warning"
        />,
        { hideProgressBar: true }
      );
      return false;
    }
  };

  // Meter modal
  const MeterDataModal = () => {
    setMeterModal(!meterModal);
  };

  // To update Meter LIst
  const updateMeterList = (updatedTableData) => {
    let temp_total_selected_meter_count = 0;
    updatedTableData.forEach((ele) => {
      temp_total_selected_meter_count += ele.total_Meters_Count;
    });
    setTotalSelectedMeterCount(temp_total_selected_meter_count);

    setMeterModal(false);
    setTableData(updatedTableData);
  };

  // on delte function to delete the table row
  const onDelete = (deletable) => {
    const temp_total_selected_meter_count =
      totalSelectedMeterCount - deletable.total_Meters_Count;
    const response = tableData.filter((i) => i !== deletable);
    setTotalSelectedMeterCount(temp_total_selected_meter_count);
    setTableData(response);
  };

  // table columns
  const tblColumn = () => {
    const column = [];
    for (const i in tableData[0]) {
      const col_config = {};
      if (i !== 'meters') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.sortable = true;
        col_config.selector = (row) => row[i];
        col_config.width = '250px';
        col_config.sortFunction = (rowA, rowB) =>
          caseInsensitiveSort(rowA, rowB, i);
        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              <span
                className="d-block font-weight-bold "
                title={
                  row[i]
                    ? row[i] !== ''
                      ? row[i].toString().length > 20
                        ? row[i]
                        : ''
                      : '-'
                    : '-'
                }
              >
                {row[i] && row[i] !== ''
                  ? row[i].toString().substring(0, 30)
                  : '-'}
                {row[i] && row[i] !== ''
                  ? row[i].toString().length > 30
                    ? '...'
                    : ''
                  : '-'}
              </span>
            </div>
          );
        };
        column.push(col_config);
      }
    }
    column.push({
      name: 'Action',
      width: '120px',
      cell: (row, index) => {
        return (
          <>
            <Eye
              size="15"
              className=" cursor-pointer"
              onClick={() => {
                setMeterRowId(index);
                setSelectedPssRow(row);
                MeterDataModal();
              }}
            />
            <Trash2
              size="15"
              className=" ml-1 cursor-pointer"
              onClick={(i) => onDelete(row)}
            />
          </>
        );
      },
    });
    return column;
  };

  return (
    <>
      <Row>
        {/*Pss  Dropdown */}
        {showPssDropwDown && (
          <Col lg="4" sm="6" className="mb-1">
            <Select
              onChange={onPssSelected}
              isClearable={true}
              value={selectedPss}
              isSearchable
              options={pss}
              className="react-select rounded zindex_1003"
              classNamePrefix="select"
              placeholder="Select Pss ..."
            />
          </Col>
        )}

        {/* Meter DropDown */}
        {!loader ? (
          <>
            <Col lg="4" sm="6" className="mb-1">
              <Select
                isClearable={true}
                closeMenuOnSelect={false}
                theme={selectThemeColors}
                onChange={onMeterSelected}
                value={meter}
                options={meterList}
                isSearchable
                isMulti={true}
                components={{ Input: NumberInput }} // Use the custom input component
                className="react-select border-secondary rounded"
                classNamePrefix="select"
                placeholder=""
              />
            </Col>

            {/* Add Button */}
            <Col lg="2" sm="5">
              <Button
                color="primary"
                className="btn-block "
                onClick={Submitresponse}
              >
                Add
              </Button>
            </Col>
          </>
        ) : (
          <>
            <Col lg="6" sm="5">
              <Button.Ripple
                color="primary"
                className=" mb-0 "
                outline
                disabled
              >
                <Spinner color="primary" size="sm" />
                <span className="ml-50">Loading...</span>
              </Button.Ripple>
            </Col>
          </>
        )}
      </Row>
      <DataTable
        height={true}
        columns={tblColumn()}
        tblData={tableData}
        tableName={'Added pss and Meter '}
        donotShowDownload={true}
        rowCount={5}
      />

      {/* Next Button */}
      <div className="d-flex justify-content-end">
        <Button.Ripple
          color="primary"
          outline
          className="mr-2"
          onClick={() => {
            setTableData([]);
          }}
        >
          Reset
        </Button.Ripple>
        <Button.Ripple
          color="primary"
          className="btn-next"
          onClick={() => {
            if (tableData.length > 0) {
              props.stepper.next();
            } else {
              toast.warning(
                <Toast
                  msg={
                    'Select PSS and Please insert at least one data in table.'
                  }
                  type="warning"
                />,
                { hideProgressBar: true }
              );
            }
          }}
        >
          <span className="align-middle d-sm-inline-block d-none">Next</span>
          <ArrowRight
            size={14}
            className="align-middle ml-sm-25 ml-0"
          ></ArrowRight>
        </Button.Ripple>
      </div>

      {/* Modal for Meter Data Table */}
      <Modal
        isOpen={meterModal}
        toggle={MeterDataModal}
        className="modal-dialog-centered modal-xl"
      >
        <ModalHeader toggle={MeterDataModal}>Meter Details</ModalHeader>
        <ModalBody>
          <MeterDetailsModal
            MeterTblData={tableData}
            rowIndex={meterRowId}
            updateMeterList={updateMeterList}
            selectedPssRow={selectedPssRow}
            assetType={'pss'}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default PssAsset;
