import React, { useContext } from 'react'
import { Icon, Link, Badge} from 'framework7-react'
import { StoreContext } from '../data/Store';

const BottomToolbar = props => {
  const { state } = useContext(StoreContext)
  const badge = state.basket.length > 0 ? <Badge color="red">{state.basket.length}</Badge> : ''
  const href = state.basket.length > 0 ? '/basket/' : null
  const searchHome = props.isHome === '1' ? 'search' : 'home'
  return (
    <React.Fragment>
      <Link href={`/${searchHome}/`}><Icon material={searchHome}></Icon></Link>
      <Link href={href}><Icon material="shopping_cart">{badge}</Icon></Link>
    </React.Fragment>
  )
}

export default BottomToolbar
