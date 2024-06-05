import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { caseInsensitiveSort } from '@src/views/utils.js'

const PssAnalytic = props => {
  const data = [
    {
      id: '1',
      site_name: 'xyz',
      substation: 2214,
      dt_installed: 'Yes',
      start_time: ' 05:01 PM, Feb 09, 2022',
      update_time: ' 05:02 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '231d1e9b-6862-4c82-a717-6ff2fgdfga0cad1b',
      site_name: 'abc',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 05:01 PM, Feb 09, 2022',
      update_time: ' 05:02 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: 'bd213607-03fc-413f-9b64-1dbd8gegdghgf38048cc',
      site_name: 'def',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 05:00 PM, Feb 09, 2022',
      update_time: ' 05:01 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: 'b179664d-e7c9-4ccb-8a22-cb19454564e864216d',
      site_name: 'ghi',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: '02:31 PM, Feb 09, 2022',
      update_time: '02:31 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '94d43de4-42e3-4eed-bedb-b66213ll;kc5a241',
      site_name: 'jkl',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 02:29 PM, Feb 09, 2022',
      update_time: ' 02:30 PM, Feb 09, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: 'ace88ab4-f1b0-4c46-a5f3-7185eqweew5ba748a9',
      site_name: 'mno',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 06:40 PM, Feb 08, 2022',
      update_time: ' 06:40 PM, Feb 08, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '48b05e14-4e99-4766-be04-88276sdddgfgfb66cad',
      site_name: 'pqr',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: '06:39 PM, Feb 08, 2022',
      update_time: '06:39 PM, Feb 08, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: 'ace88ab4-f1b0-4c46-a5f3-71855ba74gfhfhfg8a9',
      site_name: 'xyz',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: '06:40 PM, Feb 08, 2022',
      update_time: '06:40 PM, Feb 08, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    },
    {
      id: '48b05e14-4e99-4766-be04-88276fb66gfdfgdgfcad',
      site_name: 'xyz',
      substation: 2212,
      dt_installed: 'Yes',
      start_time: ' 06:39 PM, Feb 08, 2022',
      update_time: ' 06:39 PM, Feb 08, 2022',
      site_name_1: 'xyz',
      substation_1: 2214,
      dt_installed_1: 'Yes',
      site_name_2: 'xyz',
      substation_2: 2214,
      dt_installed_2: 'Yes'
    }
  ]

  const tblColumn = () => {
    const column = []

    for (const i in data[0]) {
      const col_config = {}
      if (i !== 'id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        // col_config.style = {
        //   width: '400px'
        // }
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span className='d-block font-weight-bold'>{row[i]}</span>
            </div>
          )
        }
        column.push(col_config)
      }
    }

    return column
  }

  return <SimpleDataTable columns={tblColumn()} tblData={data} tableName={props.tableName} />
}

export default PssAnalytic
