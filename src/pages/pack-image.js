import React, { useContext, useMemo } from 'react'
import { StoreContext } from '../data/store'

const PackImage = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(p => p.id === props.pack.productId)
  , [state.products, props.pack])
  const bonusProduct = useMemo(() => props.pack.bonusPackId ? state.products.find(p => p.id === state.packs.find(pa => pa.id === props.pack.bonusPackId).productId) : ''
  , [state.products, state.packs, props.pack])
  return (
    <div className="relative">
      <img src={product.imageUrl} className={`img-${props.type}`} alt={product.name || product.engName} />
      {props.pack.subQuantity > 1 ? 
        <span className={`offer-quantity-${props.type}`}>{`× ${props.pack.subQuantity}`}</span> 
      : ''}
      {props.pack.bonusPackId ? 
        <div>
          <img src={bonusProduct.imageUrl} className={`bonus-img-${props.type}`} alt={bonusProduct.name || bonusProduct.engName} />
          {props.pack.bonusQuantity > 1 ? 
            <span className={`bonus-quantity-${props.type}`}>{`× ${props.pack.bonusQuantity}`}</span> 
          : ''}
        </div>
      : ''}
    </div>
  )
}
export default PackImage