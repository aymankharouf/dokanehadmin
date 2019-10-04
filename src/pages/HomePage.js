import React, { useContext } from 'react'
import {Page, Navbar, NavLeft, NavTitle, NavTitleLarge, Link, Block, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import logo from '../coollogo_com-18673500.png'
import { StoreContext } from '../data/Store';


const HomePage = props => {
  const { state } = useContext(StoreContext)
  const mainPages = [
    {id: '1', name: 'الطلبات', path: 'orders'},
    {id: '2', name: 'اﻻسعار', path: 'stores'},
    {id: '3', name: 'المنتجات', path: 'products'},
    {id: '4', name: 'المشتريات', path: 'purchases'},
    {id: '5', name: 'العملاء', path: 'customers'},
    {id: '6', name: 'المستودع', path: 'stock'},
    {id: '7', name: 'المصاريف', path: 'costs'}
  ]

  let i = 0
  return (
    <Page>
      <Navbar large largeTransparent sliding={false}>
        <NavLeft>
          <Link iconIos="f7:menu" iconMd="material:menu" panelOpen="right"></Link>
        </NavLeft>
        <NavTitle sliding>test</NavTitle>
        <NavTitleLarge>test</NavTitleLarge>
      </Navbar>
      <Block>
        {mainPages.map(page => {
          return (
            <Button large fill className="sections" color={state.randomColors[i++ % 13].name} href={`/${page.path}/`} key={page.id}>
              {page.name}
            </Button>
          )
        })}
      </Block>
      <Toolbar bottom>
        <BottomToolbar isHome="1"/>
      </Toolbar>

    </Page>
  )
}

export default HomePage
