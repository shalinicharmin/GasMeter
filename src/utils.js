import moment from 'moment';

// export const isAccessAllowed = (vertical, project, module) => {
//   const access = jwt_decode(localStorage.getItem("accessToken")).userData.access
//   //   console.log('Access .....')
//   //   console.log(access)
//   //   console.log(vertical)
//   //   console.log(project)
//   //   console.log(module)

//   for (let i = 0; i < access.length; i++) {
//     if (access[i].title.toLowerCase() === vertical) {
//       for (let j = 0; j < access[i].children.length; j++) {
//         if (access[i].children[j].id.toLowerCase() === project) {
//           for (let k = 0; k < access[i].children[j].children.length; k++) {
//             if (access[i].children[j].children[k].id.toLowerCase() === module) {
//               return true
//             }
//           }
//         }
//       }
//     }
//   }
//   return false
// }

export const selectThemeColors = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: '#7367f01a', // for option hover bg-color
    primary: '#7367f0', // for selected option bg-color
    neutral10: '#7367f0', // for tags bg-color
    neutral20: '#ededed', // for input border-color
    neutral30: '#ededed', // for input hover border-color
  },
});

export const caseInsensitiveSort = (rowA, rowB, column) => {
  // console.log("rowA", rowA, "rowB", rowB, "column", column)

  // console.log(rowA[column], rowB[column])
  // console.log(typeof rowA[column], typeof rowB[column])

  let a = '--';
  if (
    rowA[column] === null ||
    rowA[column] === '' ||
    rowA[column] === undefined
  ) {
    a = '--';
  } else {
    if (typeof rowA[column] === 'number') {
      a = rowA[column];
    } else {
      a = rowA[column]
        .toString()
        .toLowerCase()
        .replace(/^\s+|\s+$/gm, '');
    }
  }

  let b = '--';
  if (
    rowB[column] === null ||
    rowB[column] === '' ||
    rowB[column] === undefined
  ) {
    b = '--';
  } else {
    if (typeof rowB[column] === 'number') {
      b = rowB[column];
    } else {
      b = rowB[column]
        .toString()
        .toLowerCase()
        .replace(/^\s+|\s+$/gm, '');
    }
  }

  if (a > b) {
    return 1;
  }

  if (b > a) {
    return -1;
  }

  return 0;
};

export function formatDateTime(dateTimeStr, type) {
  const dateObj = new Date(dateTimeStr);
  if (type === 'DATE') {
    return moment(dateObj).format('YYYY-MM-DD');
  } else if (type === 'TIME') {
    return moment(dateObj).format('hh:mm:ss A');
  }
  return moment(dateObj).format('DD-MM-YYYY hh:mm:ss A');
}

export function csvTxtToJSON(txt) {
  txt = txt.trim();
  const raw = txt.split('\n');
  const keys = raw
    .shift()
    .split(',')
    .map((i) => i.trim());

  const rows = raw.map((rawRow) => {
    const rowValues = rawRow.split(',');
    const row = {};
    keys.map((key, index) => {
      row[key] = rowValues[index].trim();
    });
    return row;
  });
  return rows;
}

const eventCode = {
  51: 'Occurrence:Current Reverse',
  67: 'Occurrence:Over Current',
  69: 'Occurrence:Earth loading',
  101: 'Occurrence:Power Fail',
  151: 'Occurrence:RTC Configure',
  152: 'Occurrence:Demand Integration Period',
  153: 'Occurrence:Profile Capture Period',
  154: 'Occurrence:Single Action Schedule for Billing Date',
  155: 'Occurrence:Activity Calendar for Time Zones',
  157: 'Occurrence:New Firmware Activated',
  158: 'Occurrence:Load Limit (kW) Set',
  159: 'Occurrence:Enable-Load Limit Function',
  160: 'Occurrence:Disable - Load Limit Function',
  161: 'Occurrence:LLS Secrel (MR) Change',
  162: 'Occurrence:HLS Key (US) Change',
  163: 'Occurrence:HLS Key (FW) Change',
  164: 'Occurrence:Global Key Change (encryption and authentication)',
  165: 'Occurrence:ESWF Change',
  166: 'Occurrence:MD Reset',
  201: 'Occurrence:Abnormal external magnetic influence',
  203: 'Occurrence:Neutral Disturbance',
  207: 'Occurrence:Single Wire Operation',
  209: 'Occurrence:Plug in Communication module removal',
  211: 'Occurrence:Configuration change to post-paid mode',
  212: 'Occurrence:Configuration change to pre-paid mode',
  213: "Occurrence:Configuration change to 'Forward only' mode",
  214: "Occurrence:Configuration change to 'Imp. and (Exp.)' mode",
  215: 'Occurrence:Overload',
  251: 'Occurrence:Meter Cover Open',
  301: 'Occurrence:Load switch status-Disconnected',
  302: 'Occurrence:Load switch status-Connected',
  1: 'R Phase - Voltage missing for 3 phase meter',
  2: 'R Phase - Voltage missing for 3 phase meter',
  3: 'Y Phase - Voltage missing Common to 3 Phase and single phase meter',
  4: 'Y Phase - Voltage missing Common to 3 Phase and single-phase meter',
  5: 'B Phase - Voltage missing',
  6: 'B Phase - Voltage missing',
  7: 'Occurrence: Over Voltage',
  8: 'Restoration: Over Voltage',
  9: 'Occurrence: Low Voltage',
  10: 'Restoration: Low Voltage',
  11: 'Voltage unbalance',
  12: 'Voltage unbalance',
  53: 'Y Phase current reverse (Import type only)',
  55: 'B Phase current reverse (Import type only)',
  63: 'Current unbalance',
  65: 'Current bypass/short',
  205: 'Occurrence: Low PF',
  85: 'Occurrence: Last Gasp',
  86: 'Restoration: First Breath',
  87: 'Increment in billing counter (Manual/MRI reset)',
  102: 'Restoration: Power Fail',
  52: 'Restoration: Current Reverse',
  54: 'Y Phase current reverse (Import type only)',
  56: 'B Phase current reverse (Import type only)',
  64: 'Current unbalance',
  66: 'Current bypass/short',
  68: 'Restoration: Over Current',
  206: 'Restoration: Low PF',
  208: 'Restoration:Single Wire Operation',
  210: 'Restoration:Plug in Communication module removal',
  216: 'Restoration:Overload',
  70: 'Restoration: Earth loading',
  202: 'Restoration: Abnormal external magnetic influence',
  204: 'Restoration: Neutral Disturbance',
  252: 'Occurrence:Switch Weld ',
};

// console.log(eventCode)

const getUpdatedData = (
  command_sequence,
  data,
  key_sequence,
  keysToConvertWh,
  keysToConvertVAh
) => {
  const updated_data = [];

  for (let i = 0; i < data.length; i++) {
    const temp = {};

    const eventCodeKey = data[i]['event_code'];
    if (eventCode.hasOwnProperty(eventCodeKey)) {
      temp[command_sequence['event']] = eventCode[eventCodeKey];
    }

    for (const prop in data[i]) {
      // console.log(data[i])
      if (prop in command_sequence) {
        if (
          keysToConvertWh &&
          keysToConvertWh.includes(command_sequence[prop])
        ) {
          temp[command_sequence[prop]] = data[i][prop] / 1000; // Convert from Wh to kWh
          if (data[i][prop] !== 0) {
            temp[command_sequence[prop]] =
              temp[command_sequence[prop]]?.toFixed(4);
          }
        } else if (
          keysToConvertVAh &&
          keysToConvertVAh.includes(command_sequence[prop])
        ) {
          temp[command_sequence[prop]] = data[i][prop] / 1000; // Convert from VAh to kVAh
          if (data[i][prop] !== 0) {
            temp[command_sequence[prop]] =
              temp[command_sequence[prop]]?.toFixed(4);
          }
        } else {
          temp[command_sequence[prop]] = data[i][prop];
        }
      }
    }

    updated_data.push(temp);
  }

  const ordered_updated_data = [];
  for (let i = 0; i < updated_data.length; i++) {
    const temp = {};
    for (let j = 0; j < key_sequence.length; j++) {
      temp[key_sequence[j]] = updated_data[i][key_sequence[j]];
    }
    ordered_updated_data.push(temp);
  }

  return ordered_updated_data;
};

const getBlockLoadCommmandSequence = (data) => {
  const command_sequence = {
    blockload_datetime: 'RTC',
    avg_voltage: 'Average_Voltage_(V)',
    import_Wh: 'Block_Imp._Active_Energy_(kWh)',
    import_VAh: 'Block_Imp._Apparent_Energy_(kVAh)',
    export_Wh: 'Block_Exp._Active_Energy_(kWh)',
    export_VAh: 'Block_Exp._Apparent_Energy_(kVAh)',
    avg_current: 'Average_Current_(A)',
  };

  const key_sequence = [
    'RTC',
    'Average_Voltage_(V)',
    'Block_Imp._Active_Energy_(kWh)',
    'Block_Imp._Apparent_Energy_(kVAh)',
    'Block_Exp._Active_Energy_(kWh)',
    'Block_Exp._Apparent_Energy_(kVAh)',
    'Average_Current_(A)',
  ];
  const keysToConvertWh = [
    'Block_Imp._Active_Energy_(kWh)',
    'Block_Exp._Active_Energy_(kWh)',
  ]; // Specify the keys to convert from Wh to kWh dynamically
  const keysToConvertVAh = [
    'Block_Imp._Apparent_Energy_(kVAh)',
    'Block_Exp._Apparent_Energy_(kVAh)',
  ]; // Specify the keys to convert from VAh to kVAh dynamically

  return getUpdatedData(
    command_sequence,
    data,
    key_sequence,
    keysToConvertWh,
    keysToConvertVAh
  );
};

const getBlockLoadCommmandSequenceLTCT = (data) => {
  const command_sequence = {
    blockload_datetime: 'RTC',
    avg_voltage: 'Average_Voltage_(V)',
    import_Wh: 'Block_Imp._Active_Energy_(kWh)',
    import_VAh: 'Block_Imp._Apparent_Energy_(kVAh)',
    export_Wh: 'Block_Exp._Active_Energy_(kWh)',
    export_VAh: 'Block_Exp._Apparent_Energy_(kVAh)',
    avg_current: 'Average_Current_(A)',
    reactive_energy_Q1: 'reactive_energy_Q1',
    reactive_energy_Q2: 'reactive_energy_Q2',
    reactive_energy_Q3: 'reactive_energy_Q3',
    reactive_energy_Q4: 'reactive_energy_Q4',
  };

  const key_sequence = [
    'RTC',
    'Average_Voltage_(V)',
    'Block_Imp._Active_Energy_(kWh)',
    'Block_Imp._Apparent_Energy_(kVAh)',
    'Block_Exp._Active_Energy_(kWh)',
    'Block_Exp._Apparent_Energy_(kVAh)',
    'Average_Current_(A)',
    'reactive_energy_Q1',
    'reactive_energy_Q2',
    'reactive_energy_Q3',
    'reactive_energy_Q4',
  ];
  const keysToConvertWh = [
    'Block_Imp._Active_Energy_(kWh)',
    'Block_Exp._Active_Energy_(kWh)',
  ]; // Specify the keys to convert from Wh to kWh dynamically
  const keysToConvertVAh = [
    'Block_Imp._Apparent_Energy_(kVAh)',
    'Block_Exp._Apparent_Energy_(kVAh)',
  ]; // Specify the keys to convert from VAh to kVAh dynamically

  return getUpdatedData(
    command_sequence,
    data,
    key_sequence,
    keysToConvertWh,
    keysToConvertVAh
  );
};

const getDailyLoadCommandSequence = (data) => {
  const command_sequence = {
    dailyload_datetime: 'RTC',
    export_Wh: 'Cum._Active_Exp._Energy_(kWh)',
    export_VAh: 'Cum._Apparent_Exp._Energy_(kVAh)',
    import_Wh: 'Cum._Active_Imp._Energy_(kWh)',
    import_VAh: 'Cum._Apparent_Imp._Energy_(kVAh)',
  };
  const key_sequence = [
    'RTC',
    'Cum._Active_Exp._Energy_(kWh)',
    'Cum._Apparent_Exp._Energy_(kVAh)',
    'Cum._Active_Imp._Energy_(kWh)',
    'Cum._Apparent_Imp._Energy_(kVAh)',
  ];
  const keysToConvertWh = [
    'Cum._Active_Exp._Energy_(kWh)',
    'Cum._Active_Imp._Energy_(kWh)',
  ];
  const keysToConvertVAh = [
    'Cum._Apparent_Exp._Energy_(kVAh)',
    'Cum._Apparent_Imp._Energy_(kVAh)',
  ];
  return getUpdatedData(
    command_sequence,
    data,
    key_sequence,
    keysToConvertWh,
    keysToConvertVAh
  );
};

const getNamePlateCommandSequence = (data) => {
  const command_sequence = {
    meter_number: 'Meter_Serial_Number',
    SM_device_id: 'Device_ID',
    manufacturer_name: 'Manufacturer_Name',
    firmware_version: 'Firmware_Version_For_Meter',
    type: 'DLMS_Meter_Type',
    category: 'Category',
    current_rating: 'Current_Rating',
    manufacturing_year: 'Manufacture_Year',
  };
  const key_sequence = [
    'Meter_Serial_Number',
    'Device_ID',
    'Manufacturer_Name',
    'Firmware_Version_For_Meter',
    'DLMS_Meter_Type',
    'Category',
    'Current_Rating',
    'Manufacture_Year',
  ];
  return getUpdatedData(command_sequence, data, key_sequence);
};

const getProfileInstantCommandSequence = (data) => {
  const command_sequence = {
    meter_current_datetime: 'RTC',
    voltage: 'Voltage_(V)',
    phase_current: 'Phase_Current_(A)',
    neutral_current: 'Neutral_Current_(A)',
    PF: 'Signed_Power_Factor',
    frequency: 'Frequency_(Hz)',
    apparent_power_VA: 'Apparent_Power_KVA',
    active_power_W: 'Active_Power_kW',
    import_Wh: 'Cum._Active_Imp._Energy_(kWh)',
    import_VAh: 'Cum._Apparent_Imp._Energy_(kVAh)',
    MD_W: 'MD_KW',
    MD_W_datetime: 'MD_(kW)_Date_&_Time',
    MD_VA: 'MD_KVA',
    MD_VA_datetime: 'MD_(kVA)_Date_&_Time',
    cumm_power_on_dur_minute: 'Cumulative_Power_ON_Duration_(Minute)',
    cumm_tamper_count: 'Cumulative_Tamper_Count',
    cumm_billing_count: 'Cumulative_Billing_Count',
    cumm_programming_count: 'Cumulative_Programming_Count',
    export_Wh: 'Cum._Active_Exp._Energy_(kWh)',
    export_VAh: 'Cum._Apparent_Exp._Energy_(kVAh)',
    load_limit_func_status: 'Load_Limit_Function_Status_(1=Closed)_(0=Open)',
    load_limit_value: 'Load_Limit_Value_(kW)',
  };

  const key_sequence = [
    'RTC',
    'Voltage_(V)',
    'Phase_Current_(A)',
    'Neutral_Current_(A)',
    'Signed_Power_Factor',
    'Frequency_(Hz)',
    'Apparent_Power_KVA',
    'Active_Power_kW',
    'Cum._Active_Imp._Energy_(kWh)',
    'Cum._Apparent_Imp._Energy_(kVAh)',
    'MD_KW',
    'MD_(kW)_Date_&_Time',
    'MD_KVA',
    'MD_(kVA)_Date_&_Time',
    'Cumulative_Power_ON_Duration_(Minute)',
    'Cumulative_Tamper_Count',
    'Cumulative_Billing_Count',
    'Cumulative_Programming_Count',
    'Cum._Active_Exp._Energy_(kWh)',
    'Cum._Apparent_Exp._Energy_(kVAh)',
    'Load_Limit_Function_Status_(1=Closed)_(0=Open)',
    'Load_Limit_Value_(kW)',
  ];
  const keysToConvertWh = [
    'MD_KW',
    'Load_Limit_Value_(kW)',
    'Active_Power_kW',
    'Cum._Active_Imp._Energy_(kWh)',
    'Cum._Active_Exp._Energy_(kWh)',
  ];
  const keysToConvertVAh = [
    'MD_KVA',
    'Apparent_Power_KVA',
    'Cum._Apparent_Imp._Energy_(kVAh)',
    'Cum._Apparent_Exp._Energy_(kVAh)',
  ];
  return getUpdatedData(
    command_sequence,
    data,
    key_sequence,
    keysToConvertWh,
    keysToConvertVAh
  );
};

const getBillingCommandSequence = (data) => {
  const command_sequence = {
    billing_datetime: 'Billing_Date',
    avg_PF: 'Average_Power_Factor_For_Billing_Period',
    cumm_import_Wh: 'Cum._Active_Imp._Energy_(kWh)',
    import_Wh_TOD_1: 'Cum._Active_Imp._Energy_(kWh)_T1',
    import_Wh_TOD_2: 'Cum._Active_Imp._Energy_(kWh)_T2',
    import_Wh_TOD_3: 'Cum._Active_Imp._Energy_(kWh)_T3',
    import_Wh_TOD_4: 'Cum._Active_Imp._Energy_(kWh)_T4',
    cumm_import_VAh: 'Cum._Apparent_Imp._Energy_(kVAh)',
    import_VAh_TOD_1: 'Cum._Apparent_Imp._Energy_(kVAh)_T1',
    import_VAh_TOD_2: 'Cum._Apparent_Imp._Energy_(kVAh)_T2',
    import_VAh_TOD_3: 'Cum._Apparent_Imp._Energy_(kVAh)_T3',
    import_VAh_TOD_4: 'Cum._Apparent_Imp._Energy_(kVAh)_T4',
    MD_W: 'MD_kW',
    MD_W_datetime: 'MD_kW_with_Date/Time',
    MD_VA: 'MD_kVA',
    MD_VA_datetime: 'MD_kVA_with_Date/Time',
    total_poweron_duraion_min: 'Billing_Power_ON_Duration_(Minutes)',
    export_Wh: 'Cum._Active_Exp._Energy_(kWh)',
    export_VAh: 'Cum._Apparent_Exp._Energy_(kVAh)',
  };
  const key_sequence = [
    'Billing_Date',
    'Average_Power_Factor_For_Billing_Period',
    'Cum._Active_Imp._Energy_(kWh)',
    'Cum._Active_Imp._Energy_(kWh)_T1',
    'Cum._Active_Imp._Energy_(kWh)_T2',
    'Cum._Active_Imp._Energy_(kWh)_T3',
    'Cum._Active_Imp._Energy_(kWh)_T4',
    'Cum._Apparent_Imp._Energy_(kVAh)',
    'Cum._Apparent_Imp._Energy_(kVAh)_T1',
    'Cum._Apparent_Imp._Energy_(kVAh)_T2',
    'Cum._Apparent_Imp._Energy_(kVAh)_T3',
    'Cum._Apparent_Imp._Energy_(kVAh)_T4',
    'MD_kW',
    'MD_kW_with_Date/Time',
    'MD_kVA',
    'MD_kVA_with_Date/Time',
    'Billing_Power_ON_Duration_(Minutes)',
    'Cum._Active_Exp._Energy_(kWh)',
    'Cum._Apparent_Exp._Energy_(kVAh)',
  ];
  const keysToConvertWh = [
    'MD_kW',
    'Cum._Active_Imp._Energy_(kWh)',
    'Cum._Active_Imp._Energy_(kWh)_T1',
    'Cum._Active_Imp._Energy_(kWh)_T2',
    'Cum._Active_Imp._Energy_(kWh)_T3',
    'Cum._Active_Imp._Energy_(kWh)_T4',
    'Cum._Active_Exp._Energy_(kWh)',
  ];
  const keysToConvertVAh = [
    'MD_kVA',
    'Cum._Apparent_Imp._Energy_(kVAh)',
    'Cum._Apparent_Imp._Energy_(kVAh)_T1',
    'Cum._Apparent_Imp._Energy_(kVAh)_T2',
    'Cum._Apparent_Imp._Energy_(kVAh)_T3',
    'Cum._Apparent_Imp._Energy_(kVAh)_T4',
    'Cum._Apparent_Exp._Energy_(kVAh)',
  ];
  return getUpdatedData(
    command_sequence,
    data,
    key_sequence,
    keysToConvertWh,
    keysToConvertVAh
  );
};

const getBillingCommandSequenceUpdated = (data) => {
  const command_sequence = {
    billing_datetime: 'Billing_Date',
    systemPF: 'Average_Power_Factor_For_Billing_Period',
    kwhSnap: 'Cum._Active_Imp._Energy_(kWh)',
    import_Wh_TOD_1: 'Cum._Active_Imp._Energy_(kWh)_T1',
    import_Wh_TOD_2: 'Cum._Active_Imp._Energy_(kWh)_T2',
    import_Wh_TOD_3: 'Cum._Active_Imp._Energy_(kWh)_T3',
    import_Wh_TOD_4: 'Cum._Active_Imp._Energy_(kWh)_T4',
    kvahSnap: 'Cum._Apparent_Imp._Energy_(kVAh)',
    import_VAh_TOD_1: 'Cum._Apparent_Imp._Energy_(kVAh)_T1',
    import_VAh_TOD_2: 'Cum._Apparent_Imp._Energy_(kVAh)_T2',
    import_VAh_TOD_3: 'Cum._Apparent_Imp._Energy_(kVAh)_T3',
    import_VAh_TOD_4: 'Cum._Apparent_Imp._Energy_(kVAh)_T4',
    MDKwh: 'MD_kW',
    MDKwhTS: 'MD_kW_with_Date/Time',
    MDKvah: 'MD_kVA',
    MDKvahTS: 'MD_kVA_with_Date/Time',
    billingDuration: 'Billing_Power_ON_Duration_(Minutes)',
    kwhSnapExport: 'Cum._Active_Exp._Energy_(kWh)',
    kvahSnapExport: 'Cum._Apparent_Exp._Energy_(kVAh)',
  };
  const key_sequence = [
    'Billing_Date',
    'Average_Power_Factor_For_Billing_Period',
    'Cum._Active_Imp._Energy_(kWh)',
    'Cum._Active_Imp._Energy_(kWh)_T1',
    'Cum._Active_Imp._Energy_(kWh)_T2',
    'Cum._Active_Imp._Energy_(kWh)_T3',
    'Cum._Active_Imp._Energy_(kWh)_T4',
    'Cum._Apparent_Imp._Energy_(kVAh)',
    'Cum._Apparent_Imp._Energy_(kVAh)_T1',
    'Cum._Apparent_Imp._Energy_(kVAh)_T2',
    'Cum._Apparent_Imp._Energy_(kVAh)_T3',
    'Cum._Apparent_Imp._Energy_(kVAh)_T4',
    'MD_kW',
    'MD_kW_with_Date/Time',
    'MD_kVA',
    'MD_kVA_with_Date/Time',
    'Billing_Power_ON_Duration_(Minutes)',
    'Cum._Active_Exp._Energy_(kWh)',
    'Cum._Apparent_Exp._Energy_(kVAh)',
  ];
  const keysToConvertWh = [
    'MD_kW',
    'Average_Power_Factor_For_Billing_Period',
    'Cum._Active_Imp._Energy_(kWh)',
    'Cum._Active_Imp._Energy_(kWh)_T1',
    'Cum._Active_Imp._Energy_(kWh)_T2',
    'Cum._Active_Imp._Energy_(kWh)_T3',
    'Cum._Active_Imp._Energy_(kWh)_T4',
    'Cum._Active_Exp._Energy_(kWh)',
  ];
  const keysToConvertVAh = [
    'MD_kVA',
    'Cum._Apparent_Imp._Energy_(kVAh)',
    'Cum._Apparent_Imp._Energy_(kVAh)_T1',
    'Cum._Apparent_Imp._Energy_(kVAh)_T2',
    'Cum._Apparent_Imp._Energy_(kVAh)_T3',
    'Cum._Apparent_Imp._Energy_(kVAh)_T4',
    'Cum._Apparent_Exp._Energy_(kVAh)',
  ];
  return getUpdatedData(
    command_sequence,
    data,
    key_sequence,
    keysToConvertWh,
    keysToConvertVAh
  );
};

const getBillingCommandSequenceLTCT = (data) => {
  const command_sequence = {
    billing_datetime: 'Billing_Date',
    avg_PF: 'Average_Power_Factor_For_Billing_Period',
    cumm_import_Wh: 'Cum._Active_Imp._Energy_(kWh)',
    import_Wh_TOD_1: 'Cum._Active_Imp._Energy_(kWh)_T1',
    import_Wh_TOD_2: 'Cum._Active_Imp._Energy_(kWh)_T2',
    import_Wh_TOD_3: 'Cum._Active_Imp._Energy_(kWh)_T3',
    import_Wh_TOD_4: 'Cum._Active_Imp._Energy_(kWh)_T4',
    cumm_import_VAh: 'Cum._Apparent_Imp._Energy_(kVAh)',
    import_VAh_TOD_1: 'Cum._Apparent_Imp._Energy_(kVAh)_T1',
    import_VAh_TOD_2: 'Cum._Apparent_Imp._Energy_(kVAh)_T2',
    import_VAh_TOD_3: 'Cum._Apparent_Imp._Energy_(kVAh)_T3',
    import_VAh_TOD_4: 'Cum._Apparent_Imp._Energy_(kVAh)_T4',
    MD_W: 'MD_kW',
    MD_W_datetime: 'MD_kW_with_Date/Time',
    MD_VA: 'MD_kVA',
    MD_VA_datetime: 'MD_kVA_with_Date/Time',
    total_poweron_duraion_min: 'Billing_Power_ON_Duration_(Minutes)',
    export_Wh: 'Cum._Active_Exp._Energy_(kWh)',
    export_VAh: 'Cum._Apparent_Exp._Energy_(kVAh)',
    cumm_energy_KVARH_LAG: 'cumm_energy_KVARH_LAG',
  };
  const key_sequence = [
    'Billing_Date',
    'Average_Power_Factor_For_Billing_Period',
    'Cum._Active_Imp._Energy_(kWh)',
    'Cum._Active_Imp._Energy_(kWh)_T1',
    'Cum._Active_Imp._Energy_(kWh)_T2',
    'Cum._Active_Imp._Energy_(kWh)_T3',
    'Cum._Active_Imp._Energy_(kWh)_T4',
    'Cum._Apparent_Imp._Energy_(kVAh)',
    'Cum._Apparent_Imp._Energy_(kVAh)_T1',
    'Cum._Apparent_Imp._Energy_(kVAh)_T2',
    'Cum._Apparent_Imp._Energy_(kVAh)_T3',
    'Cum._Apparent_Imp._Energy_(kVAh)_T4',
    'MD_kW',
    'MD_kW_with_Date/Time',
    'MD_kVA',
    'MD_kVA_with_Date/Time',
    'Billing_Power_ON_Duration_(Minutes)',
    'Cum._Active_Exp._Energy_(kWh)',
    'Cum._Apparent_Exp._Energy_(kVAh)',
    'cumm_energy_KVARH_LAG',
  ];
  const keysToConvertWh = [
    'MD_kW',
    'Cum._Active_Imp._Energy_(kWh)',
    'Cum._Active_Imp._Energy_(kWh)_T1',
    'Cum._Active_Imp._Energy_(kWh)_T2',
    'Cum._Active_Imp._Energy_(kWh)_T3',
    'Cum._Active_Imp._Energy_(kWh)_T4',
    'Cum._Active_Exp._Energy_(kWh)',
  ];
  const keysToConvertVAh = [
    'MD_kVA',
    'Cum._Apparent_Imp._Energy_(kVAh)',
    'Cum._Apparent_Imp._Energy_(kVAh)_T1',
    'Cum._Apparent_Imp._Energy_(kVAh)_T2',
    'Cum._Apparent_Imp._Energy_(kVAh)_T3',
    'Cum._Apparent_Imp._Energy_(kVAh)_T4',
    'Cum._Apparent_Exp._Energy_(kVAh)',
  ];
  return getUpdatedData(
    command_sequence,
    data,
    key_sequence,
    keysToConvertWh,
    keysToConvertVAh
  );
};

const getEventCurrentCommandSequence = (data) => {
  const command_sequence = {
    event_datetime: 'Date_and_Time_Of_Events',
    event_code: 'Event_Code',
    measured_current: 'Current',
    voltage: 'Voltage',
    PF: 'Power_Factor',
    cumm_energy_Wh: 'Cumulative_Energy_(Kwh)',
    cumm_tamper_count: 'Cumulative_Tamper_count',
    exec_datetime: 'Exec_datetime',
  };
  const key_sequence = [
    'Date_and_Time_Of_Events',
    'Event_Code',
    'Current',
    'Voltage',
    'Power_Factor',
    'Cumulative_Energy_(Kwh)',
    'Cumulative_Tamper_count',
    'Exec_datetime',
  ];
  const keysToConvertWh = ['Cumulative_Energy_(Kwh)'];
  return getUpdatedData(command_sequence, data, key_sequence, keysToConvertWh);
};

const getEventVoltageComammandSequence = (data) => {
  const command_sequence = {
    event_datetime: 'Date_and_Time_Of_Events',
    event_code: 'Event_Code',
    measured_current: 'Current',
    voltage: 'Voltage',
    PF: 'Power_Factor',
    cumm_energy_Wh: 'Cumulative_Energy_(Kwh)',
    cumm_tamper_count: 'Cumulative_Tamper_count',
    exec_datetime: 'Exec_datetime',
  };
  const key_sequence = [
    'Date_and_Time_Of_Events',
    'Event_Code',
    'Current',
    'Voltage',
    'Power_Factor',
    'Cumulative_Energy_(Kwh)',
    'Cumulative_Tamper_count',
    'Exec_datetime',
  ];
  const keysToConvertWh = ['Cumulative_Energy_(Kwh)'];
  return getUpdatedData(command_sequence, data, key_sequence, keysToConvertWh);
};

const getAllEventsCommandSequence = (data) => {
  const command_sequence = {
    event_datetime: 'Date_and_Time_Of_Events',
    event_code: 'Event_Code',
    event: 'Event',
    measured_current: 'Current',
    voltage: 'Voltage',
    PF: 'Power_Factor',
    cumm_energy_Wh: 'Cumulative_Energy_(Kwh)',
    cumm_tamper_count: 'Cumulative_Tamper_count',
  };
  const key_sequence = [
    'Date_and_Time_Of_Events',
    'Event_Code',
    'Event',
    'Current',
    'Voltage',
    'Power_Factor',
    'Cumulative_Energy_(Kwh)',
    'Cumulative_Tamper_count',
  ];
  const keysToConvertWh = ['Cumulative_Energy_(Kwh)'];
  return getUpdatedData(command_sequence, data, key_sequence, keysToConvertWh);
};

const getEventPowerCommandSequence = (data) => {
  const command_sequence = {
    event_datetime: 'Date_and_Time_Of_Events',
    event_code: 'Event_Code',
    exec_datetime: 'Exec_datetime',
  };
  const key_sequence = [
    'Date_and_Time_Of_Events',
    'Event_Code',
    'Exec_datetime',
  ];
  return getUpdatedData(command_sequence, data, key_sequence);
};

const getEventNonRollOverCommandSequence = (data) => {
  const command_sequence = {
    event_datetime: 'Date_and_Time_Of_Events',
    event_code: 'Event_Code',
    exec_datetime: 'Exec_datetime',
  };
  const key_sequence = [
    'Date_and_Time_Of_Events',
    'Event_Code',
    'Exec_datetime',
  ];
  return getUpdatedData(command_sequence, data, key_sequence);
};

const getOtherEventCommandSequence = (data) => {
  const command_sequence = {
    event_datetime: 'Date_and_Time_Of_Events',
    event_code: 'Event_Code',
    measured_current: 'Current',
    voltage: 'Voltage',
    PF: 'Power_Factor',
    cumm_energy_Wh: 'Cumulative_Energy_(Kwh)',
    cumm_tamper_count: 'Cumulative_Tamper_count',
    exec_datetime: 'Exec_datetime',
  };
  const key_sequence = [
    'Date_and_Time_Of_Events',
    'Event_Code',
    'Current',
    'Voltage',
    'Power_Factor',
    'Cumulative_Energy_(Kwh)',
    'Cumulative_Tamper_count',
    'Exec_datetime',
  ];
  const keysToConvertWh = ['Cumulative_Energy_(Kwh)'];
  return getUpdatedData(command_sequence, data, key_sequence, keysToConvertWh);
};
export const DLMSCommandMapping = (commandName, DataForTable) => {
  if (commandName === 'BLOCK_LOAD') {
    const keysToCheck = [
      'reactive_energy_Q1',
      'reactive_energy_Q2',
      'reactive_energy_Q3',
      'reactive_energy_Q4',
    ];
    // Flag to check if all keys are present
    let allKeysExist = true;

    for (const item of DataForTable) {
      for (const key of keysToCheck) {
        if (!(key in item)) {
          allKeysExist = false;
          break; // Exit the inner loop if any key is missing
        }
      }
    }
    if (allKeysExist) {
      return getBlockLoadCommmandSequenceLTCT(DataForTable);
    } else {
      return getBlockLoadCommmandSequence(DataForTable);
    }
  }

  if (commandName === 'DAILY_LOAD') {
    return getDailyLoadCommandSequence(DataForTable);
  }
  if (commandName === 'NAME_PLATE_DETAIL') {
    return getNamePlateCommandSequence(DataForTable);
  }
  if (commandName === 'PROFILE_INSTANT') {
    return getProfileInstantCommandSequence(DataForTable);
  }
  if (commandName === 'BILLING') {
    for (const item of DataForTable) {
      // console.log(item)
      if ('cumm_energy_KVARH_LAG' in item) {
        return getBillingCommandSequenceLTCT(DataForTable);
      } else if ('systemPF' in item) {
        return getBillingCommandSequenceUpdated(DataForTable);
      } else {
        return getBillingCommandSequence(DataForTable);
      }
    }
  }

  if (commandName === 'EVENT_CURRENT') {
    return getEventCurrentCommandSequence(DataForTable);
  }

  if (commandName === 'EVENT_VOLTAGE') {
    return getEventVoltageComammandSequence(DataForTable);
  }

  if (commandName === 'EVENTS') {
    return getAllEventsCommandSequence(DataForTable);
  }

  if (commandName === 'EVENT_POWER') {
    return getEventPowerCommandSequence(DataForTable);
  }

  if (commandName === 'EVENT_OTHER') {
    return getOtherEventCommandSequence(DataForTable);
  }

  if (commandName === 'EVENT_NON_ROLLOVER') {
    return getEventNonRollOverCommandSequence(DataForTable);
  }
  return DataForTable;
};

export const getDefaultDateTimeRange = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = '0'.concat(dd);
  if (mm < 10) mm = '0'.concat(mm);

  let start_date = '';
  let end_date = '';

  start_date = start_date.concat(yyyy, '-', mm, '-', '01', ' 00:00:00');
  end_date = end_date.concat(yyyy, '-', mm, '-', dd, ' 23:59:59');

  return { startDateTime: start_date, endDateTime: end_date };
};
