import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import DataTableV1 from '@src/views/ui-elements/datatable/DataTableV1';
import { formatDateTime, caseInsensitiveSort } from '@src/views/utils.js';

function ViewReport({ selectedRow, centeredModal, setCenteredModal }) {
  const [page, setPage] = useState(1);
  const data = selectedRow.data;

  function createColumns() {
    const columns = [];
    const ignoreColumns = [];
    const customWidths = {
      siteId: '250px',
      siteName: '240px',
      cmdReply: '240px',
      scNo: '220px',
      executionTime: '200px',
      ldpTime: '180px'
    };
    const customPositions = {};
    const renameColumns = {};
    const disableSortings = [];

    if (data.length > 0) {
      for (const i in data[0]) {
        const column = {};
        if (!ignoreColumns.includes(i)) {
          column.name =
            renameColumns[i] ||
            `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ');
          column.sortable = !disableSortings.includes(i);
          column.sortFunction = !disableSortings.includes(i)
            ? (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
            : null;
          column.selector = (row) => row[i];
          column.reorder = true;
          column.position = customPositions[i] || 1000;
          column.width = customWidths[i];
          column.minWidth = customWidths[i] || '100px';
          column.wrap = true;
          column.cell = (row) => {
            if (row[i] || [0, '0'].includes(row[i])) {
              if (Array.isArray(row[i])) {
                row[i] = row[i].join(' , ');
              }
              if (row[i].toString().length > 25) {
                return (
                  <span
                    onClick={(event) => {
                      if (event.target.textContent.toString().length <= 29) {
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
      }
    });

    return sortedColumns;
  }

  return (
    <Modal
      isOpen={centeredModal}
      toggle={() => setCenteredModal(!centeredModal)}
      className="modal-dialog-centered modal_size"
    >
      <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
        The Report Was Created On : {selectedRow.createdAt}
      </ModalHeader>
      <ModalBody>
        <DataTableV1
          columns={createColumns()}
          data={selectedRow.data}
          rowCount={10}
          tableName={<>Showing Report As On : {selectedRow.asOn}</>}
          downloadFileName={`froci-${selectedRow.createdAt}`}
          showDownloadButton={true}
          showRefreshButton={false}
          currentPage={page}
          totalRowsCount={selectedRow.data.length}
          onPageChange={(page) => {
            setPage(page + 1);
          }}
        />
      </ModalBody>
    </Modal>
  );
}

export default ViewReport;
