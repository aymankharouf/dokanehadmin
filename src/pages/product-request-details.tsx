import {useContext, useState, useEffect} from 'react'
import {Page, Navbar, List, ListInput, Fab, Icon, FabBackdrop, FabButtons, FabButton, f7, Card, CardContent} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {rejectProductRequest, showMessage, showError, getMessage} from '../data/actions'

type Props = {
  id: string
}
const ProductRequestDetails = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [productRequest, setProductRequest] = useState(() => state.productRequests.find(p => p.id === props.id))
  const [storeName, setStoreName] = useState('')
  useEffect(() => {
    setStoreName(() => {
      const user = state.users.find(u => u.id === productRequest?.userId)
      return state.stores.find(s => s.id === user?.storeId)?.name || ''
    })
  }, [productRequest, state.users, state.stores])
  useEffect(() => {
    setProductRequest(() => state.productRequests.find(p => p.id === props.id))
  }, [state.productRequests, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRejection = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        await rejectProductRequest(productRequest!)
        showMessage(labels.rejectSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }

  return (
    <Page>
      <Navbar title={productRequest?.name} backLink={labels.back} />
      <Card>
        <CardContent>
          <img src={productRequest?.imageUrl} className="img-card" alt={labels.noImage} />
        </CardContent>
      </Card>
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.storeName}
          type="text" 
          value={storeName}
          readonly
        />
        <ListInput 
          name="weight" 
          label={labels.weight}
          type="text" 
          value={productRequest?.weight}
          readonly
        />
        <ListInput 
          name="country" 
          label={labels.country}
          type="text" 
          value={productRequest?.country}
          readonly
        />
        <ListInput 
          name="price" 
          label={labels.price}
          type="text" 
          value={productRequest?.price.toFixed(2)}
          readonly
        />
      </List>
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/add-product/${props.id}`)}>
            <Icon material="done"></Icon>
          </FabButton>
          <FabButton color="red" onClick={handleRejection}>
            <Icon material="delete"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
    </Page>
  )
}
export default ProductRequestDetails
