import { useContext, useState, useEffect } from 'react'
import { Icon, Link, Badge, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'

const Footer = () => {
  const { state } = useContext(StoreContext)
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
    <Toolbar bottom>
      <Link href="/home/" iconMaterial="home" />
      <Link href={basketLink}>
        <Icon material='shopping_cart' >
          {basketCount > 0 ? <Badge color="red">{basketCount}</Badge> : ''}
        </Icon>
      </Link>
    </Toolbar>
  )
}

export default Footer
