import React, { useContext, useMemo } from 'react'
import { StoreContext } from '../data/store'

const PackImage = props => {
  const { state } = useContext(StoreContext)
  const bonusPack = useMemo(() => props.pack.bonusPackId ? state.packs.find(p => p.id === props.pack.bonusPackId) : ''
  , [state.packs, props.pack])
  return (
    <div className="relative">
      <img src={props.pack.imageUrl} className={`img-${props.type}`} alt={props.pack.productName} />
      {props.pack.subQuantity > 1 ? 
        <span className={`offer-quantity-${props.type}`}>{`× ${props.pack.subQuantity}`}</span> 
      : ''}
      {props.pack.bonusPackId ? 
        <div>
          <img src={bonusPack.imageUrl} className={`bonus-img-${props.type}`} alt={bonusPack.productName} />
          {props.pack.bonusQuantity > 1 ? 
            <span className={`bonus-quantity-${props.type}`}>{`× ${props.pack.bonusQuantity}`}</span> 
          : ''}
        </div>
      : ''}
    </div>
  )
}
export default PackImage