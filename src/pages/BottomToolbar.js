import React, { useContext } from 'react'
import { Icon, Link, Badge} from 'framework7-react'
import { StoreContext } from '../data/Store';

const BottomToolbar = props => {
  const { state } = useContext(StoreContext)
  const searchHome = props.isHome === '1' ? 'search' : 'home'

  return (
    <React.Fragment>
      <Link href={`/${searchHome}/`} iconMaterial={searchHome} />
      <Link href={state.basket.packs ? '/basket/' : ''}>
        <Icon material='shopping_cart' >
          {state.basket.packs ? <Badge color="red">{state.basket.packs.length}</Badge> : ''}
        </Icon>
      </Link>
    </React.Fragment>
  )
}

export default BottomToolbar
