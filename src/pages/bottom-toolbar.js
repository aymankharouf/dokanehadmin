import React, { useContext, useState, useEffect } from 'react'
import { Icon, Link, Badge} from 'framework7-react'
import { StoreContext } from '../data/store'

const BottomToolbar = props => {
  const { state } = useContext(StoreContext)
  const searchHome = props.isHome === '1' ? 'search' : 'home'
  const [basketLink, setBasketLink] = useState('')
  const [basketCount, setBasketCount] = useState('')
  useEffect(() => {
    const basketCount = state.basket.packs?.length || 0
    const returnBasketCount = state.returnBasket?.packs?.length || 0
    setBasketLink(() => {
      if (basketCount > 0) return '/basket/'
      if (returnBasketCount > 0 ) return '/return-basket/'
      return ''
    })
    setBasketCount(() => {
      if (basketCount > 0) return basketCount
      if (returnBasketCount > 0 ) return returnBasketCount
      return ''
    })
  }, [state.basket, state.returnBasket])
  return (
    <React.Fragment>
      <Link href={`/${searchHome}/`} iconMaterial={searchHome} />
      <Link href={basketLink}>
        <Icon material='shopping_cart' >
          {basketCount > 0 ? <Badge color="red">{basketCount}</Badge> : ''}
        </Icon>
      </Link>
    </React.Fragment>
  )
}

export default BottomToolbar
