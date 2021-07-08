import { IonIcon } from '@ionic/react'
import { star, starHalfOutline, starOutline } from 'ionicons/icons'

type Props = {
  rating: number,
  count: number,
  size: string
}
const RatingStars = (props: Props) => {
  const fill = Math.floor(props.rating)
  const fillArray = Array.from(Array(fill).keys())
  const half = props.rating - fill >= 0.5 ? 1 : 0
  const outline = 5 - fill - half
  const outlineArray = Array.from(Array(outline).keys())
  const color = props.rating === 0 ? 'warning' : props.rating < 2.5 ? 'danger' : props.rating < 4 ? 'primary' : 'success'
  return (
    <>
      {props.count > 0 ? '(' + props.count + ')' : ''}
      {outlineArray.map(i => <IonIcon key={i} style={{fontSize: props.size === 's' ? '10px' : '20px'}} ios={starOutline} color={color} />)}
      {half === 0 ? '' : <IonIcon style={{fontSize: props.size === 's' ? '10px' : '20px'}} ios={starHalfOutline} color={color} />}
      {fillArray.map(i => <IonIcon key={i} style={{fontSize: props.size === 's' ? '10px' : '20px'}} ios={star} color={color} />)}
    </>
  )
}

export default RatingStars