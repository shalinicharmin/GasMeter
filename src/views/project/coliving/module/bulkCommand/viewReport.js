import { useEffect, useState } from 'react';
import DataTableV1 from '../../../../ui-elements/datatable/DataTableV1';
import { Eye, User, AlertCircle } from 'react-feather';
import { DownloadCSV } from '../../../../ui-elements/dtTable/downloadTableData';
import {
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Form,
  Button,
  Input,
  Card,
  CardBody,
  FormGroup,
  Label,
  Tooltip,
} from 'reactstrap';
import { useLocation, useHistory } from 'react-router-dom';
import Select from 'react-select';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import useJwt from '@src/auth/jwt/useJwt';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ViewStatus from './viewStatus';

function ViewReport(props) {
  const location = useLocation();
  const uri = location.pathname.split('/');
  const [data, setData] = useState([]);
  const [scNo, setScNo] = useState([]);
  const [commandList, setCommandList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [showConsumersList, setshowConsumersList] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [siteName, setSiteName] = useState([]);
  const [updatedSiteName, setUpdatedSiteName] = useState(null);
  const [updatedScNo, setUpdatedScNo] = useState([]);
  const [updatedCommand, setUpdatedCommand] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [updatedParameter, setUpdatedParameter] = useState('');
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logout, setLogout] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [postMessage, setPostMessage] = useState('');
  const [clear, setClear] = useState(false);
  const [loader, setLoader] = useState(false);
  const MySwal = withReactContent(Swal);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isparams, setIsparams] = useState(false);
  const [download, setDownload] = useState([]);

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const changePage = (page) => {
    setPage(page + 1);
    setRefresh(!refresh);
  };

  useEffect(async () => {
    if (updatedSiteName) {
      try {
        const scNoResponse = await useJwt.getScNo(updatedSiteName.value);
        setScNo(scNoResponse.data.data.results);

        const commandListResponse = await useJwt.getCommandList();
        setCommandList(commandListResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    } else {
      setScNo([]);
      setCommandList([]);
    }
  }, [updatedSiteName]);

  useEffect(async () => {
    setLoader(true);
    try {
      const res = await useJwt.getBulkExecutedTable(page, 10);
      setData(res.data.data);
      const totalPagesFromAPI = +res.data.pagination.total;
      setTotalPages(totalPagesFromAPI);
      setError(false);
      //setRetry(false);
      setLoader(false);
      if (res.status === 401 || res.status === 403) {
        setLogout(true);
      }
    } catch (error) {
      setLoader(false);
      setError(true);
      setRetry(false);
      setErrorMessage('Something went wrong, please retry');
    }
  }, [retry, postMessage, page]);

  function showModal(row) {
    setSelectedRow(row);
    setshowConsumersList(true);
  }
  async function saveData(e) {
    e.preventDefault();
    if (!updatedSiteName || !updatedCommand) {
      if (!updatedSiteName) {
        toast.error(<Toast msg="Select Site Name" type="warning" />, {
          hideProgressBar: true,
        });
      } else if (!updatedCommand) {
        toast.error(<Toast msg="Select Command" type="warning" />, {
          hideProgressBar: true,
        });
      }
    } else {
      const confirmed = await MySwal.fire({
        text: `These changes can not be revert`,
        title: 'Please note!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-danger ml-1',
        },
        buttonsStyling: false,
      });

      if (confirmed.isConfirmed) {
        if (updatedScNo?.length === 0) {
          // If updatedScNo is empty, set it to all sc_no options
          setUpdatedScNo(
            scNo.map((sc) => ({
              label: sc.sc_no,
              value: sc.sc_no,
            }))
          );
        }

        setUpdatedScNo((prevUpdatedScNo) => {
          const scNoList = prevUpdatedScNo.map((sc) => sc.value);
          useJwt
            .postCommandHistoryTable({
              site_id: updatedSiteName.value,
              sc_no: scNoList,
              cmd_id: updatedCommand.value,
              parameter: updatedParameter,
            })
            .then((res) => {
              setPostMessage('Successfully Saved Data');
              setShowForm(false);
              toast.success(<Toast msg={res.data.message} type="success" />, {
                hideProgressBar: true,
              });
            });
          return prevUpdatedScNo;
        });
      }
    }
  }

  const fetchSites = async (params) => {
    return await useJwt
      .getGISAssetsTillDTR(params)
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

  useEffect(async () => {
    if (showForm) {
      const params = {
        project: uri[2],
        vertical: uri[1],
        site_type: 'tower',
      };
      const [statusCode, response] = await fetchSites(params);

      if (statusCode === 200) {
        const _sites = [];
        for (const i of response.data.data.result.stat.dt_list) {
          _sites.push({ label: i.site_name, value: i.site_id });
        }
        setSiteName(_sites);
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true);
      } else {
        try {
          toast.warning(<Toast msg={response.data.detail} type="warning" />, {
            hideProgressBar: true,
          });
        } catch (err) {
          toast.warning(
            <Toast
              msg={`Something went wrong to get all sites for ${uri[1]} - ${uri[2]}, Please reload the page`}
              type="warning"
            />,
            { hideProgressBar: true }
          );
        }
      }
    }
  }, [location.pathname, showForm]);
  const toggle = () => setTooltipOpen(!tooltipOpen);

  useEffect(() => {
    DownloadCSV(download, 'Command List');
  }, [download]);

  async function onDownload() {
    const res = await useJwt.getBulkExecutedTable(page, totalPages);
    setDownload(res.data.data);
  }

  function onReset() {
    setClear(true);
    setUpdatedSiteName('');
    setUpdatedScNo([]);
    setUpdatedCommand('');
    setUpdatedParameter('');
  }
  function createColumns() {
    const columns = [];
    const ignoreColumns = ['id', 'sc_no', 'parameter'];
    const disableSortings = [
      'site id',
      'Parameter',
      'Command',
      'Current status',
      'Created at',
    ];

    if (data?.length > 0) {
      for (const i in data[0]) {
        const column = {};
        if (!ignoreColumns.includes(i)) {
          column.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll(
            '_',
            ' '
          );
          column.sortable = !disableSortings.includes(i);
          //column.sortFunction = !disableSortings.includes(i)
          //? (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
          //: null;
          column.selector = (row) => row[i];
          column.reorder = true;
          //column.position = customPositions[i] || 1000;
          column.minWidth = '200px';
          column.wrap = true;

          column.cell = (row) => {
            if (row[i] || [0, '0'].includes(row[i])) {
              if (Array.isArray(row[i])) {
                row[i] = row[i].join(' , ');
              }
              if (row[i].toString()?.length > 25) {
                return (
                  <span
                    onClick={(event) => {
                      if (event.target.textContent.toString()?.length <= 29) {
                        event.target.textContent = row[i];
                        event.target.style.overflowY = 'scroll';
                      } else {
                        event.target.textContent = `${row[i]
                          .toString()
                          .substring(0, 25)}...`;
                        event.target.style.overflowY = 'visible';
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      maxHeight: '200px',
                    }}
                    className="webi_scroller"
                    title={'click to expand text'}
                  >
                    {row[i].toString().substring(0, 25)}...
                  </span>
                );
              }
            } else {
              return '-';
            }
            return row[i];
          };
          columns.push(column);
        }
      }
      columns.push({
        name: 'Actions',
        cell: (row) => (
          <a className="d-flex w-100 pr-1">
            <Eye
              onClick={() => showModal(row)}
              style={{ marginRight: '5px', cursor: 'pointer' }}
            />
          </a>
        ),
      });
    }
    const sortedColumns = columns.sort((a, b) => {
      if (a.position < b.position) {
        return -1;
      } else if (a.position > b.position) {
        return 1;
      }
      return 0;
    });
    sortedColumns.unshift({
      name: 'Sr No',
      width: '70px',
      cell: (row, i) => {
        return (
          <div className="d-flex w-100 justify-content-center">
            {i + 1 + 10 * (page - 1)}
          </div>
        );
      },
    });
    return sortedColumns;
  }
  const retryAgain = () => {
    setError(false);
    setRetry(true);
  };
  return (
    <>
      {showForm && (
        <Modal
          isOpen={showForm}
          toggle={() => setShowForm(!showForm)}
          className="modal-dialog modal_sm"
          onExit={onReset}
        >
          <ModalHeader toggle={() => setShowForm(!showForm)} className="mb-2">
            Add Bulk Command
          </ModalHeader>
          <ModalBody>
            <Card>
              <CardBody>
                <Form onSubmit={saveData}>
                  <FormGroup>
                    <Label className="ml-1" for="siteName">
                      Site Name
                    </Label>
                    <Col>
                      <Select
                        isClearable
                        isSearchable
                        options={
                          siteName?.length === 0
                            ? [{ label: 'Loading...', value: null }]
                            : siteName
                        }
                        value={updatedSiteName}
                        onChange={(selectedOption) => {
                          setUpdatedSiteName(selectedOption);
                          setUpdatedScNo('');
                          setUpdatedCommand('');
                          setUpdatedParameter('');
                        }}
                        className="react-select rounded"
                        classNamePrefix="select"
                        placeholder="Select siteName..."
                        id="siteName"
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Label className="ml-1" for="scNo">
                      Sc No.
                    </Label>
                    <Col>
                      <Select
                        isClearable
                        isSearchable
                        isMulti
                        options={scNo.map((sc) => ({
                          label: sc.sc_no,
                          value: sc.sc_no,
                        }))}
                        value={clear ? null : updatedScNo}
                        onChange={(selectedOptions) => {
                          setUpdatedScNo(selectedOptions);
                          setClear(false);
                        }}
                        className="react-select rounded"
                        classNamePrefix="select"
                        placeholder="Select ScNo..."
                        id="scNo"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            height: '40px',
                            overflowY: 'auto',
                          }),
                          multiValue: (provided) => ({
                            ...provided,
                            backgroundColor: 'blue',
                          }),
                        }}
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup>
                    <Label className="ml-1" for="command">
                      Command
                    </Label>
                    <Col>
                      <Select
                        isClearable
                        isSearchable
                        options={commandList.map((command) => ({
                          value: command.cmd_id,
                          label: command.cmd_name,
                        }))}
                        value={clear ? null : updatedCommand}
                        onChange={(selectedOption) => {
                          setUpdatedCommand(selectedOption);
                          setClear(false);

                          const hasParams = commandList.some((command) => {
                            return (
                              command.cmd_id === selectedOption?.value &&
                              command.is_params === 1
                            );
                          });
                          setIsparams(hasParams);
                        }}
                        className="react-select rounded"
                        classNamePrefix="select"
                        placeholder="Select Command..."
                        id="command"
                      />
                    </Col>
                  </FormGroup>
                  {isparams && (
                    <FormGroup>
                      <Label
                        className="ml-1 d-flex align-items-center"
                        for="parameter"
                      >
                        Parameter{' '}
                        <AlertCircle
                          size={14}
                          id="tooltipTarget"
                          style={{ marginLeft: '0.125rem' }}
                        />
                        <Tooltip
                          placement="top"
                          isOpen={tooltipOpen}
                          target="tooltipTarget"
                          toggle={toggle}
                        >
                          Please insert the parameter only in the command that
                          requires it.
                        </Tooltip>
                      </Label>
                      <Col>
                        <Input
                          type="text"
                          name="parameter"
                          value={clear ? '' : updatedParameter}
                          onChange={(e) => {
                            const value = e.target.value;
                            setUpdatedParameter((prevValue) => {
                              if (clear) {
                                return ''; // Clear the value if clear is true
                              } else {
                                return value; // Otherwise, set the updated value
                              }
                            });
                            setClear(false);
                          }}
                          id="parameter"
                          placeholder="Insert Parameter"
                        />
                      </Col>
                    </FormGroup>
                  )}

                  <FormGroup row>
                    <Col sm={{ size: 9, offset: 3 }}>
                      <Button type="submit" color="primary" className="mr-2">
                        Submit
                      </Button>
                      <Button color="primary" onClick={onReset}>
                        Reset
                      </Button>
                    </Col>
                  </FormGroup>
                </Form>
              </CardBody>
            </Card>
          </ModalBody>
        </Modal>
      )}
      {error ? (
        <CardInfo
          props={{
            message: { errorMessage },
            retryFun: { retryAgain },
            retry: { loader },
          }}
        />
      ) : (
        <>
          <DataTableV1
            columns={createColumns()}
            data={data}
            rowCount={10}
            tableName={'Command List'}
            showDownloadButton={true}
            showRefreshButton={true}
            refreshFn={() => {
              setRefresh(!refresh);
              setError(false);
              setRetry(!retry);
            }}
            showAddButton={true}
            currentPage={page}
            totalRowsCount={totalPages}
            onPageChange={changePage}
            isLoading={loader}
            setShowForm={setShowForm}
            pointerOnHover={true}
            onDownload={onDownload}
          />
        </>
      )}

      {showConsumersList && (
        <Modal
          isOpen={showConsumersList}
          toggle={() => setshowConsumersList(!showConsumersList)}
          className="modal-dialog-centered modal_size"
          style={{ marginTop: '100px', minHeight: '200px', maxHeight: '600px' }}
        >
          <ModalHeader toggle={() => setshowConsumersList(!showConsumersList)}>
            Consumer List Status
          </ModalHeader>
          <ModalBody>
            <ViewStatus id={selectedRow?.id} />
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
export default ViewReport;
