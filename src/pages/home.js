import React, { useState } from 'react'
import {Page, Navbar, NavLeft, NavTitle, NavTitleLarge, Link, Block, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { randomColors } from '../data/config'


const Home = props => {
  const [mainPages] = useState(() => [
    {id: '1', name: 'الطلبات', path: '/orders/'},
    {id: '2', name: 'المحلات', path: '/stores/'},
    {id: '3', name: 'المنتجات', path: '/products/'},
    {id: '4', name: 'المشتريات', path: '/purchases/'},
    {id: '5', name: 'العملاء', path: '/customers/'},
    {id: '6', name: 'المستودع', path: '/stock/'},
    {id: '7', name: 'المصاريف', path: '/spendings/'},
    {id: '8', name: 'التنبيهات', path: '/notifications/'}
  ])
  let i = 0
  return (
    <Page className="page-home">
      <Navbar large>
        <NavLeft>
          <Link iconMaterial="menu" panelOpen="right" />
        </NavLeft>
        <NavTitle sliding><img src="/dokaneh_logo.png" alt="logo" className="logo" /></NavTitle>
        <NavTitleLarge><img src="/dokaneh_logo.png" alt="logo" className="logo" /></NavTitleLarge>
      </Navbar>
      <Block>
        {mainPages.map(p => 
          <Button
            text={p.name}
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={p.path} 
            key={p.id}
          />
        )}
      </Block>
      <Toolbar bottom>
        <BottomToolbar isHome="1"/>
      </Toolbar>

    </Page>
  )
}

export default Home
