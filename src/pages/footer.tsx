import { useContext, useState, useEffect } from 'react'
import { Icon, Link, Badge } from 'framework7-react'
import { StoreContext } from '../data/store'

const Footer = () => {
  const { state } = useContext(StoreContext)
  const [basketLink, setBasketLink] = useState('')
  const [basketCount, setBasketCount] = useState<any>()
  useEffect(() => {
    const basketCount = state.basket.packs?.length || 0
    setBasketLink(() => {
      if (basketCount > 0) return '/basket/'
      return ''
    })
    setBasketCount(() => {
      if (basketCount > 0) return basketCount
      return ''
    })
  }, [state.basket])
  return (
    <>
      <Link href="/home/" iconMaterial="home" />
      <Link href={basketLink}>
        <Icon material='shopping_cart' >
          {basketCount > 0 ? <Badge color="red">{basketCount}</Badge> : ''}
        </Icon>
      </Link>
    </>
  )
}

export default Footer
