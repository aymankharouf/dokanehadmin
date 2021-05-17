import {useContext, useState, useEffect} from 'react'
import {Page, Navbar, List, ListInput, Fab, Icon, FabBackdrop, FabButtons, FabButton, f7, Card, CardContent} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {rejectProductRequest, getMessage} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonLoading, useIonToast } from '@ionic/react'

type Params = {
  id: string
}
const ProductRequestDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const [productRequest, setProductRequest] = useState(() => state.productRequests.find(p => p.id === params.id))
  useEffect(() => {
    setProductRequest(() => state.productRequests.find(p => p.id === params.id))
  }, [state.productRequests, params.id])
  const handleRejection = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        loading()
        await rejectProductRequest(productRequest!, state.productRequests, state.users)
        dismiss()
        message(labels.rejectSuccess, 3000)
        history.goBack()
      } catch(err) {
        message(getMessage(location.pathname, err), 3000)
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
          value={state.stores.find(s => s.id === productRequest?.storeId)?.name}
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
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/add-product/${params.id}`)}>
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
