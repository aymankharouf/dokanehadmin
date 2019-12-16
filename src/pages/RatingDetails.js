import React, { useContext, useMemo, useEffect, useState } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';
import { approveRating, showMessage, showError, getMessage } from '../data/Actions'

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
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleApprove = async () => {
    try{
      await approveRating(rating, product, customerInfo)
      showMessage(props, state.labels.approveSuccess)
      props.f7router.back()
    } catch(err) {
			setError(getMessage(props, err))
		}
  }

  return (
    <Page>
      <Navbar title={state.labels.ratingDetails} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => handleApprove()}>
        <Icon material="done"></Icon>
      </Fab>
      <List form>
        <ListInput 
          name="product" 
          label={state.labels.product}
          value={product.name}
          floatingLabel 
          type="text" 
          readonly
        />
        <ListInput 
          name="user" 
          label={state.labels.user}
          value={customerInfo.name}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="value" 
          label={state.labels.ratingValue}
          value={state.ratingValues.find(v => v.id === rating.value).name}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="comment" 
          label={state.labels.comment}
          value={rating.comment}
          floatingLabel 
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
