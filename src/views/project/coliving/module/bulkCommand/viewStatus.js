import { useEffect, useState } from 'react';
import DataTableV1 from '../../../../ui-elements/datatable/DataTableV1';
import useJwt from '@src/auth/jwt/useJwt';
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo';
import { DownloadCSV } from '../../../../ui-elements/dtTable/downloadTableData';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
function ViewStatus(params) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(false);
  const [loader, setLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rowHeight] = useState(50);
  const [download, setDownload] = useState([]);

  useEffect(async () => {
    setLoader(true);
    try {
      const ScNoStatusResponse = await useJwt.getScNoStatus(
        params.id,
        page,
        10
      );
      if (ScNoStatusResponse.status === 204) {
        setData([]);
        setError(false);
      } else {
        setData(ScNoStatusResponse.data.data);
        const totalPagesFromAPI = +ScNoStatusResponse.data.pagination.total;
        setTotalPages(totalPagesFromAPI);
        setError(false);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
      setError(true);
      setRetry(false);
      setErrorMessage('Something went wrong, please retry');
    }
  }, [retry, page]);

  useEffect(() => {
    DownloadCSV(download, 'Consumer List');
  }, [download]);

  async function onDownload() {
    if (data?.length === 0) {
      toast.error(
        <Toast msg="No entries available for download." type="warning" />,
        {
          hideProgressBar: true,
        }
      );
      return;
    }

    try {
      const res = await useJwt.getScNoStatus(params.id, page, totalPages);
      setDownload(res.data.data);
    } catch (error) {
      toast.error(
        <Toast msg="Something went wrong, please try again" type="warning" />,
        {
          hideProgressBar: true,
        }
      );
    }
  }

  const calculateModalHeight = () => {
    const rowsCount = data.length;
    const minHeight = 200;
    return Math.min(minHeight + rowsCount * rowHeight, 750);
  };
  const changePage = (page) => {
    setPage(page + 1);
    setRefresh(!refresh);
  };
  function createColumns() {
    const columns = [];
    const ignoreColumns = ['id'];
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
          column.selector = (row) => row[i];
          column.reorder = true;
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
          <div
            style={{ height: `${calculateModalHeight()}px`, overflowY: 'auto' }}
          >
            <DataTableV1
              columns={createColumns()}
              data={data}
              rowCount={10}
              tableName={'Consumer List'}
              showDownloadButton={true}
              showRefreshButton={true}
              refreshFn={() => {
                setRefresh(!refresh);
                setError(false);
                setRetry(!retry);
              }}
              currentPage={page}
              totalRowsCount={totalPages}
              onPageChange={changePage}
              isLoading={loader}
              pointerOnHover={true}
              onDownload={onDownload}
            />
          </div>
        </>
      )}
    </>
  );
}
export default ViewStatus;
