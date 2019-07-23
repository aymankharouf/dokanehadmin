import React from 'react'
import { Icon, Link } from 'framework7-react'
import { rateProduct } from '../data/Actions'

const RateProduct = props => {
  const handleRate = (rating) => {
    rateProduct(props.product, rating)
  }
  return(
    <React.Fragment>
      <Link onClick={() => handleRate(1)}><Icon material="thumb_up" color="green"></Icon></Link>
      <Link onClick={() => handleRate(-1)}><Icon material="thumb_down" color="red"></Icon></Link>
    </React.Fragment>
  )
}


export default RateProduct

