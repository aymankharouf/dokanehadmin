import React, { useContext, useMemo } from 'react'
import {Page, Navbar, NavLeft, NavTitle, NavTitleLarge, Link, Block, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const HomePage = props => {
  const { state } = useContext(StoreContext)
  const mainPages = useMemo(() => [
    {id: '1', name: 'الطلبات', path: 'orders'},
    {id: '2', name: 'اﻻسعار', path: 'stores'},
    {id: '3', name: 'المنتجات', path: 'products'},
    {id: '4', name: 'المشتريات', path: 'purchases'},
    {id: '5', name: 'العملاء', path: 'customers'},
    {id: '6', name: 'المستودع', path: 'stock'},
    {id: '7', name: 'المصاريف', path: 'costs'}
  ], [])

  let i = 0
  return (
    <Page className="page-home">
      <Navbar large>
        <NavLeft>
          <Link iconIos="f7:bars" iconMd="material:menu" panelOpen="right"></Link>
        </NavLeft>
        <NavTitle sliding><img src="/logo.png" alt="" className="logo" /></NavTitle>
        <NavTitleLarge><img src="/logo.png" alt="" className="logo" /></NavTitleLarge>
      </Navbar>
      <Block>
        {mainPages.map(page => {
          return (
            <Button large fill className="sections" color={state.randomColors[i++ % 13].name} href={`/${page.path}/`} key={page.id}>
              <span className="section-label">{page.name}</span>
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
