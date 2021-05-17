import {useState} from 'react'
import {IonIcon} from '@ionic/react'
import { star, starHalfOutline, starOutline } from 'ionicons/icons'

type Props = {
  rating: number,
  count: number
}
const RatingStars = (props: Props) => {
  const [stars] = useState(() => {
    const rating_int = props.rating
    const rating_fraction = Number(props.rating) - rating_int
    let color
    switch(rating_int){
      case 1:
      case 2:
        color = 'danger'
        break
      case 4:
      case 5:
        color = 'success'
        break
      default:
        color = 'warning'
    }
    let stars = []
    let i = 0
    while (++i <= rating_int) {
      stars.push(<IonIcon key={i} style={{fontSize: '20px'}} ios={star} color={color}></IonIcon>)
    }
    if (rating_fraction > 0) {
      stars.unshift(<IonIcon key={i} style={{fontSize: '20px'}} ios={starHalfOutline} color={color}></IonIcon>)
      i++
    }
    while (i++ <= 5) {
      stars.unshift(<IonIcon key={i} style={{fontSize: '20px'}} ios={starOutline} color={color}></IonIcon>)
    }
    return stars
  })
  return(
    <>
      {props.count > 0 ? '(' + props.count + ')' : ''}{stars}
    </>
  )
}

export default RatingStars