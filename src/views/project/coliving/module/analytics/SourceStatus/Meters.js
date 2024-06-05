import React, { useEffect, useState } from 'react';
import useJwt from '@src/auth/jwt/useJwt';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import DataTableV1 from '@src/views/ui-elements/datatable/DataTableV1';
import { Badge, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import authLogout from '@src/auth/jwt/logoutlogic';
import { formatDateTime, caseInsensitiveSort } from '@src/views/utils.js';

function Meters(props) {
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSetSelectedRow] = useState({});
  const [centeredModal, setCenteredModal] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(async () => {
    setIsLoading(true);
    try {
      const res = await useJwt.getSourceStatusMeters({
        siteId: props.site.site_id,
        siteCurrentSource: props.site.running_source
      });
      setData(res.data.data.result);
    } catch (err) {
      if (err.response) {
        if (err.response.status && [401, 403].includes(err.response.status)) {
          toast.error(
            <Toast
              msg={'User access updated. Please login again'}
              type="warning"
            />,
            {
              hideProgressBar: true
            }
          );
          authLogout(history, dispatch);
        } else if (err.response.status && [400].includes(err.response.status)) {
          toast.error(
            <Toast
              msg={JSON.stringify(err.response.data.data.error)
                .toString()
                .substring(0, 100)
                .concat('...')}
              type="danger"
            />,
            {
              hideProgressBar: true
            }
          );
          setData([]);
        } else {
          toast.error(<Toast msg={'Something went wrong!'} type="danger" />, {
            hideProgressBar: true
          });
        }
      } else {
        toast.error(<Toast msg={'Something went wrong!'} type="danger" />, {
          hideProgressBar: true
        });
      }
    }
    setIsLoading(false);
  }, [refresh]);

  function createColumns() {
    const columns = [];
    const ignoreColumns = ['id', 'siteId', 'siteName'];
    const customMinWidths = {
      scNo: '240px',
      ldp: '240px'
    };
    const customFixWidths = {
      currentSource: '150px'
    };
    const customMaxWidths = {};
    const customPositions = { scNo: 1 };
    const renameColumns = {};
    const alignCenter = ['currentSource'];
    const alignRight = [];

    if (data.length > 0) {
      for (const i in data[0]) {
        const column = {};
        if (!ignoreColumns.includes(i)) {
          column.name =
            renameColumns[i] ||
            `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ');
          column.sortable = true;
          column.selector = (row) => row[i];
          column.reorder = true;
          column.position = customPositions[i] || 1000;
          column.minWidth = customMinWidths[i];
          column.maxWidth = customMaxWidths[i];
          column.width = customFixWidths[i];
          column.center = alignCenter.includes(i);
          column.right = alignRight.includes(i);
          column.wrap = true;
          column.sortFunction = (rowA, rowB) =>
            caseInsensitiveSort(rowA, rowB, i);
          column.conditionalCellStyles = [
            {
              when: (row) => true,
              style: {
                '&:hover': {}
              }
            }
          ];
          column.cell = (row) => {
            if (i === 'currentSource') {
              if (row.currentSource === 'EB') {
                return (
                  <Badge
                    pill
                    data-tag="allowRowEvents"
                    color="light-primary"
                    className="w-50"
                  >
                    {row.currentSource}
                  </Badge>
                );
              } else if (row.currentSource === 'DG') {
                return (
                  <Badge
                    pill
                    color="light-warning"
                    data-tag="allowRowEvents"
                    className="w-50"
                  >
                    {row.currentSource}
                  </Badge>
                );
              } else {
                return (
                  <Badge
                    pill
                    color="light-secondary"
                    data-tag="allowRowEvents"
                    className="w-50"
                  >
                    {row.currentSource}
                  </Badge>
                );
              }
            }

            if (row[i] || [0, '0'].includes(row[i])) {
              if (Array.isArray(row[i])) {
                row[i] = row[i].join(' , ');
              }

              if (row[i].toString().length > 25) {
                return (
                  <span
                    onClick={(event) => {
                      if (event.target.textContent.toString().length <= 28) {
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
                      maxHeight: '200px'
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

            return row[i].toString();
          };
          columns.push(column);
        }
      }
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
      }
    });
    return sortedColumns;
  }

  const customStyles = {
    headCells: {
      style: {
        paddingLeft: '12px !important',
        backgroundColor: 'inherit',
        '&:nth-child(1)': {
          position: 'sticky',
          left: 0,
          zIndex: 1
        },
        '&:nth-child(2)': {
          position: 'sticky',
          left: 70,
          zIndex: 1,
          borderRight: '1px solid rgba(0, 0, 0, 0.11)'
        }
      }
    },
    cells: {
      style: {
        paddingLeft: '12px !important',
        backgroundColor: 'inherit',
        '&:nth-child(1)': {
          position: 'sticky',
          left: 0,
          zIndex: 1
        },
        '&:nth-child(2)': {
          position: 'sticky',
          left: 70,
          zIndex: 1,
          borderRight: '1px solid rgba(0, 0, 0, 0.11)'
        }
      }
    }
  };

  function changePage(page) {
    setPage(page + 1);
    setRefresh(!refresh);
  }

  return (
    <div>
      <DataTableV1
        columns={createColumns()}
        data={data}
        rowCount={10}
        tableName={props.site.site_name
          .replaceAll('_', ' ')
          .split(' ')
          .map((i) => {
            return i.charAt(0).toUpperCase() + i.slice(1);
          })
          .join(' ')}
        showDownloadButton={true}
        showRefreshButton={true}
        refreshFn={() => {
          setRefresh(!refresh);
        }}
        currentPage={page}
        totalRowsCount={data.length}
        onPageChange={changePage}
        isLoading={isLoading}
        pointerOnHover={true}
        onRowClicked={(row) => {
          setSetSelectedRow(row);
        }}
        customStyles={customStyles}
        extraTextToShow={
          props.site.running_source === 'EB' ? (
            <h4 className="mb-0">
              Current Site Source{' '}
              <Badge
                pill
                data-tag="allowRowEvents"
                color="light-primary"
                className="pl-1 pr-1"
              >
                {props.site.running_source}
              </Badge>
            </h4>
          ) : props.site.running_source === 'DG' ? (
            <h4 className="mb-0">
              Current Site Source{' '}
              <Badge
                pill
                data-tag="allowRowEvents"
                color="light-warning"
                className="pl-1 pr-1"
              >
                {props.site.running_source}
              </Badge>
            </h4>
          ) : (
            ''
          )
        }
      />
    </div>
  );
}

export default Meters;
