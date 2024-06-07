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
  VideoCameraOutlined,
  SettingOutlined,
  PoweroffOutlined
} from "@ant-design/icons"
import { Button, Layout, Menu, theme, Dropdown, Avatar } from "antd"
const { Header, Sider, Content } = Layout

import { Award, Circle } from "react-feather"
import { useSelector } from "react-redux"
import { convertData } from "../../utils/commonFunction"
import logo from "../../assets/images/logo/Group.svg"
import Footer from "../../pages/footer"

const LayoutWrapper = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const acessData = useSelector((state) => convertData(state.userSession.userSession.access))
  const avtarData = useSelector((state) => state.userSession.userSession.avatar)

  const userMenu = (
    <Menu>
      <Menu.Item key='1' icon={<UserOutlined />}>
        User Profile
      </Menu.Item>

      <Menu.Item key='3' icon={<PoweroffOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  )

  return (
    <Layout className='background_image'>
      <Sider trigger={null} collapsible collapsed={collapsed} theme='light'>
        <div className='demo-logo-vertical  d-flex flex-row p-3'>
          <img src={logo} alt='Login V2' />
          {!collapsed && (
            <h5 className='brand-text mx-2 mt-3 font-weight-bold' style={{ color: "#382b72" }}>
              AVDHAAN
            </h5>
          )}
        </div>
        <Menu theme='light' mode='inline' defaultSelectedKeys={["1"]} items={acessData} />
      </Sider>

      {/* <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 0,
            background: "#fff"
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
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            {/* <span style={{ marginRight: 8 }}>John Doe</span> */}
      {/* <SettingOutlined />
          </div>
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <span style={{ marginRight: 8 }}>John Doe</span>
              <Avatar src='https://via.placeholder.com/40' />
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            padding: 24,
            // background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
        >
          <div className='m-2'>
            <div> {children}</div>
          </div>
        </Content>
        <Footer /> */}
      {/* </Layout> */}

      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 0,
            paddingRight: "40px",
            background: "#fff"
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <SettingOutlined style={{ fontSize: "20px", marginRight: "16px" }} />
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <span style={{ marginRight: 8 }}>John Doe</span>
                <Avatar src={avtarData} />
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            // minHeight: 280,
            background: "#fff"
          }}
        >
          <div className='m-2'>
            <div> {children}</div>
          </div>
        </Content>
        <Footer />
      </Layout>
    </Layout>
  )
}

export default LayoutWrapper
