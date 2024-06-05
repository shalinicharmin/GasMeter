import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable';
import { useState } from 'react';
const CreateTable = (props) => {
  const [page, setpage] = useState(0);
  // console.log('Table Data for Billing History ...')
  // console.log(props.data)

  const tblColumn = () => {
    const column = [];
    const custom_width = ['manufacturer_name', 'exec_datetime'];

    for (const i in props.data[0]) {
      const col_config = {};
      if (
        i !== 'id' &&
        i !== 'SM_device_id' &&
        i !== 'MD_W_TOD_1' &&
        i !== 'MD_W_TOD_2' &&
        i !== 'MD_W_TOD_3' &&
        i !== 'MD_W_TOD_4' &&
        i !== 'MD_W_TOD_1' &&
        i !== 'MD_VA_TOD_1' &&
        i !== 'MD_VA_TOD_2' &&
        i !== 'MD_VA_TOD_3' &&
        i !== 'MD_VA_TOD_4' &&
        i !== 'MD_W_TOD_1_datetime' &&
        i !== 'MD_W_TOD_2_datetime' &&
        i !== 'MD_W_TOD_3_datetime' &&
        i !== 'MD_W_TOD_4_datetime' &&
        i !== 'MD_VA_TOD_1_datetime' &&
        i !== 'MD_VA_TOD_2_datetime' &&
        i !== 'MD_VA_TOD_3_datetime' &&
        i !== 'MD_VA_TOD_4_datetime' &&
        i !== 'exec_datetime' &&
        i !== 'cumm_VARH_lead' &&
        i !== 'MD_W_datetime' &&
        i !== 'MD_VA_datetime'
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(
          1
        )}`.replaceAll('_', ' ');
        col_config.serch = i;
        col_config.selector = (row) => row[i];
        col_config.sortable = true;

        col_config.width = '190px';
        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              <span className="d-block font-weight-bold ">{row[i]}</span>
            </div>
          );
        };
        column.push(col_config);
      }
    }
    column.unshift({
      name: 'Sr',
      width: '90px',
      cell: (row, i) => {
        return (
          <div className="d-flex  justify-content-center">
            {page * props.rowCount + 1 + i}
          </div>
        );
      },
    });
    return column;
  };
  console.log(props.data, 'this is data');
  return (
    <SimpleDataTable
      columns={tblColumn()}
      tblData={props.data}
      currentpage={page}
      ispagination
      selectedPage={setpage}
      height={props.height ? props.height : ''}
      rowCount={props.rowCount ? props.rowCount : 8}
      tableName={props.tableName}
      refresh={props.refresh && props.refresh}
      extras={props.extras}
      smHeading={props.smHeading}
    />
  );
};

export default CreateTable;
