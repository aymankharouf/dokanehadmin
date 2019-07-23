import React from 'react'
import {Page, Navbar, NavLeft, NavTitle, Link, Block, BlockTitle,
        List, ListItem, Toolbar, Row, Col, Button} from 'framework7-react'
import Sections from './Sections'
import BottomToolbar from './BottomToolbar';
import logo from '../coollogo_com-18673500.png'


const HomePage = props => (
  <Page>
    <Navbar>
      <NavLeft>
        <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="right"></Link>
      </NavLeft>
      <NavTitle><img src={logo} className="logo" alt=""/></NavTitle>
    </Navbar>
    <Block strong>
      <p>Here is your blank Framework7 app what we have here.</p>
    </Block>
    <BlockTitle>Navigation</BlockTitle>
    <Sections/>
    <List>
      <ListItem link="/about/" title="About"></ListItem>
      <ListItem link="/form/" title="Form"></ListItem>
      <ListItem link="/addProduct/1/category/1" title="Add Product"></ListItem>
    </List>
    <BlockTitle>Modals</BlockTitle>
    <Block strong>
      <Row>
        <Col width="50">
          <Button fill raised popupOpen="#popup">Popup</Button>
        </Col>
      </Row>
    </Block>
    <List>
      <ListItem link="/load-something-that-doesnt-exist/" title="Default Route (404)"></ListItem>
    </List>
    <Toolbar bottom>
      <BottomToolbar isHome="1"/>
    </Toolbar>

  </Page>
)


export default HomePage
