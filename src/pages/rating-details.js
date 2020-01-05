import React, { useContext, useMemo, useEffect, useState } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { approveRating, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { ratingValues } from '../data/config'

const RatingDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const rating = useMemo(() => state.ratings.find(r => r.id === props.id)
  , [state.ratings, props.id])
  const product = useMemo(() => state.products.find(p => p.id === rating.productId)
  , [state.products, rating])
  const customerInfo = useMemo(() => state.customers.find(c => c.id === rating.userId)
  , [state.customers, rating])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleApprove = async () => {
    try{
      await approveRating(rating, product, state.users.find(u => u.id === rating.userId))
      showMessage(labels.approveSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }

  return (
    <Page>
      <Navbar title={labels.ratingDetails} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleApprove()}>
        <Icon material="done"></Icon>
      </Fab>
      <List form>
        <ListInput 
          name="product" 
          label={labels.product}
          value={product.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="user" 
          label={labels.user}
          value={customerInfo.name}
          type="text"
          readonly
        />
        <ListInput 
          name="value" 
          label={labels.ratingValue}
          value={ratingValues.find(v => v.id === rating.value).name}
          type="text"
          readonly
        />
        <ListInput 
          name="comment" 
          label={labels.comment}
          value={rating.comment}
          type="text"
          readonly
        />
      </List>
      <Toolbar bottom>
        <BottomToolbar />
      </Toolbar>
    </Page>
  )
}
export default RatingDetails
