import React, { useContext } from 'react'
import {Page, Navbar, NavLeft, NavTitle, Link, Block, BlockTitle,
        List, ListItem, Toolbar, Row, Col, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import logo from '../coollogo_com-18673500.png'
import { StoreContext } from '../data/Store';


const HomePage = props => {
  const { state } = useContext(StoreContext)
  const mainPages = [
    {id: '1', name: 'الطلبات', path: 'orders'},
    {id: '2', name: 'اﻻسعار', path: 'stores'},
    {id: '3', name: 'المنتجات', path: 'products'},
    {id: '4', name: 'العملاء', path: 'customers'},
    {id: '5', name: 'المستودع', path: 'inventory'}
  ]

  let i = 0
  return (
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
      <Block>
        {mainPages.map(page => {
          return (
            <Button large fill className="sections" color={state.randomColors[i++ % 13].name} href={`/${page.path}/`} key={page.id}>
              {page.name}
            </Button>
          )
        })}
      </Block>
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
}

export default HomePage
