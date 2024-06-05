import "../../App.css"
// import Drawer from "./components/Drawer"
// import Navbar from "./components/Navbar"
// import SideBar from "./components/Navigator"
import "../../styles/layout.scss"
// import Footer from "../../@core/layouts/components/footer"

import React, { useState } from "react"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined
} from "@ant-design/icons"
import { Button, Layout, Menu, theme } from "antd"
import { Award, Circle } from "react-feather"
import { useSelector } from "react-redux"
import { convertData } from "../../utils/commonFunction"
import logo from "../../assets/images/logo/Group.svg"
const { Header, Sider, Content } = Layout

const LayoutWrapper = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const data = useSelector((state) => convertData(state.userSession.userSession))

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed} theme='light'>
        <div className='demo-logo-vertical  d-flex flex-row'>
          <img src={logo} alt='Login V2' />
          {!collapsed && <h2 className='brand-text mx-1'>AVDHAAN</h2>}
        </div>
        <Menu theme='light' mode='inline' defaultSelectedKeys={["1"]} items={data} />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer
          }}
        >
          <Button
            type='text'
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: "calc(100vh-80px)",
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
        >
          <div className='m-2'>
            <div> {children}</div>
            {/* <Footer /> */}
          </div>
        </Content>
      </Layout>
    </Layout>
    // <div className='App'>
    //   {/* <Drawer SideBar={SideBar} /> */}
    //   <div className='layout'>
    //     {/* <div className='aside border'>
    //       <SideBar />
    //     </div>
    //     <Navbar /> */}
    //     {/* <main> */}
    //     <div className='m-2'>
    //       <div> {children}</div>
    //       {/* <Footer /> */}
    //     </div>
    //     {/* </main> */}
    //   </div>
    // </div>
  )
}

export default LayoutWrapper

// const Home = () => {
//   const [collapsed, setCollapsed] = useState(false)
//   const {
//     token: { colorBgContainer, borderRadiusLG }
//   } = theme.useToken()

//   const data = useSelector((state) => convertData(state.userSession.userSession))

//   return (
//     <Layout>
//       <Sider trigger={null} collapsible collapsed={collapsed} theme='light'>
//         <div className='demo-logo-vertical  d-flex flex-row'>
//           <img src={logo} alt='Login V2' />
//           <h2 className='brand-text mx-1'>AVDHAAN</h2>
//         </div>
//         <Menu theme='light' mode='inline' defaultSelectedKeys={["1"]} items={data} />
//       </Sider>

//       <Layout>
//         <Header
//           style={{
//             padding: 0,
//             background: colorBgContainer
//           }}
//         >
//           <Button
//             type='text'
//             icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//             onClick={() => setCollapsed(!collapsed)}
//             style={{
//               fontSize: "16px",
//               width: 64,
//               height: 64
//             }}
//           />
//         </Header>
//         <Content
//           style={{
//             margin: "24px 16px",
//             padding: 24,
//             minHeight: "calc(100vh-80px)",
//             background: colorBgContainer,
//             borderRadius: borderRadiusLG
//           }}
//         >
//           Content
//         </Content>
//       </Layout>
//     </Layout>
//   )
// }
// export default Home
