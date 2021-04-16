import { useState } from 'react'
import { Page, Navbar, NavLeft, NavTitle, NavTitleLarge, Link, Block, Button, Toolbar } from 'framework7-react'
import Footer from './footer'
import { randomColors } from '../data/config'
import labels from '../data/labels'

const Home = () => {
  const [mainPages] = useState(() => [
    {id: '1', name: labels.stores, path: '/stores/'},
    {id: '2', name: labels.products, path: '/products/0'},
    {id: '3', name: labels.customers, path: '/customers/'},
    {id: '4', name: labels.notifications, path: '/notifications/'}
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
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Home
