import {useContext, useState, useEffect} from 'react'
import {Page, Navbar, List, ListInput, Fab, Icon, f7, Card, CardContent, Actions, ActionsButton} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {getMessage, rejectPackRequest} from '../data/actions'
import { useHistory, useLocation, useParams } from 'react-router'
import { useIonLoading, useIonToast } from '@ionic/react'

type Params = {
  id: string
}
const PackRequestDetails = () => {
  const {state} = useContext(StateContext)
  const params = useParams<Params>()
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [loading, dismiss] = useIonLoading()
  const [packRequest] = useState(() => state.packRequests.find(p => p.id === params.id))
  const [siblingPack] = useState(() => state.packs.find(p => p.id === packRequest?.siblingPackId))
  const [actionOpened, setActionOpened] = useState(false);
  const handleRejection = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        loading()
        await rejectPackRequest(packRequest!, state.packRequests, state.users)
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
      <Navbar title={packRequest?.name} backLink={labels.back} />
      <Card>
        <CardContent>
          <img src={packRequest?.imageUrl || siblingPack?.product.imageUrl} className="img-card" alt={labels.noImage} />
        </CardContent>
      </Card>
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.storeName}
          type="text" 
          value={state.stores.find(s => s.id === packRequest?.storeId)?.name}
          readonly
        />
        <ListInput 
          name="product" 
          label={labels.product}
          type="text" 
          value={siblingPack?.product.name}
          readonly
        />
        <ListInput 
          name="price" 
          label={labels.price}
          type="text" 
          value={packRequest?.price.toFixed(2)}
          readonly
        />
      </List>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => setActionOpened(true)}>
        <Icon material="build"></Icon>
      </Fab>
      <Actions opened={actionOpened} onActionsClosed={() => setActionOpened(false)}>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/product-packs/${siblingPack?.product.id}/n`)}>
          {labels.packs}
        </ActionsButton>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/add-${packRequest?.subCount ? 'group' : 'pack'}/${siblingPack?.product.id}/${params.id}`)}>
          {labels.addPack}
        </ActionsButton>
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/add-store-pack/${packRequest?.storeId}/${params.id}`)}>
          {labels.activatePack}
        </ActionsButton>
        <ActionsButton onClick={handleRejection}>
          {labels.rejection}
        </ActionsButton>
      </Actions>
    </Page>
  )
}
export default PackRequestDetails
