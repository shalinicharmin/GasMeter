// // import React from "react"

// // const LPDDUtility = () => {
// //   return <div>LPDDUtility</div>
// // }

// // export default LPDDUtility

// import React, { useState } from "react"
// import { Tabs } from "antd"
// // import CommandHistory from "./CommandHistoryWrapper/commandHistory"
// // import PushData from "./PushDataWrapper/pushData"
// // import MeterProfile from "./MeterProfilewrapper/meterProfile"
import "../../../styles/tabs.scss"
// import DataTable from "../../CustomComponent/DataTable"

// const { TabPane } = Tabs

// const LPDDUtility = () => {
//   const [activeKey, setActiveKey] = useState("1")

//   const handleChange = (key) => {
//     setActiveKey(key)
//   }

//   return (
//     <Tabs activeKey={activeKey} onChange={handleChange} type='card'>
//       <TabPane tab='Command History' key='1'>
//         <p>hello 1</p>
//         <DataTable />
//         {/* {activeKey === "1" && <CommandHistory />} */}
//       </TabPane>
//       <TabPane tab='Push Data' key='2'>
//         <p>hello 2</p>
//         {/* {activeKey === "2" && <PushData />} */}
//       </TabPane>
//       <TabPane tab='Meter Profile' key='3'>
//         <p>hello 3</p>
//         {/* {activeKey === "3" && <MeterProfile />} */}
//       </TabPane>
//     </Tabs>
//   )
// }

// export default LPDDUtility

import React from "react"
import { Tabs } from "antd"
// import "./App.css" // Import the CSS file

const LPDDUtility = () => (
  <Tabs
    defaultActiveKey='1'
    centered
    tabBarExtraContent={{ left: <div className='custom-tab-bar' /> }} // Add a custom tab bar class
    items={new Array(3).fill(null).map((_, i) => {
      const id = String(i + 1)
      return {
        label: `Tab ${id}`,
        key: id,
        children: `Content of Tab Pane ${id}`
      }
    })}
  />
)

export default LPDDUtility
