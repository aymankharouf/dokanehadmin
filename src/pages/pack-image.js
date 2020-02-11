import React from 'react'
import labels from '../data/labels'

const PackImage = props => {
  return (
    <div className="relative">
      <img src={props.pack.imageUrl} className={`img-${props.type}`} alt={labels.noImage} />
      {props.pack.subQuantity > 1 ? 
        <span className={`offer-quantity-${props.type}`}>{`× ${props.pack.subQuantity}`}</span> 
      : ''}
      {props.pack.bonusPackId ? 
        <div>
          <img src={props.pack.bonusImageUrl} className={`bonus-img-${props.type}`} alt={labels.noImage} />
          {props.pack.bonusQuantity > 1 ? 
            <span className={`bonus-quantity-${props.type}`}>{`× ${props.pack.bonusQuantity}`}</span> 
          : ''}
        </div>
      : ''}
    </div>
  )
}
export default PackImage