import {useContext, useState, useEffect} from 'react'
import {Page, Navbar, List, ListInput, Fab, Icon, FabBackdrop, FabButtons, FabButton, f7, Card, CardContent} from 'framework7-react'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'
import {showMessage, showError, getMessage, rejectPackRequest} from '../data/actions'

type Props = {
  id: string
}
const PackRequestDetails = (props: Props) => {
  const {state} = useContext(StateContext)
  const [error, setError] = useState('')
  const [packRequest, setPackRequest] = useState(() => state.packRequests.find(p => p.id === props.id))
  useEffect(() => {
    setPackRequest(() => state.packRequests.find(p => p.id === props.id))
  }, [state.packRequests, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleRejection = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        await rejectPackRequest(packRequest!, state.packRequests, state.users)
        showMessage(labels.rejectSuccess)
        f7.views.current.router.back()
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })
  }
  return (
    <Page>
      <Navbar title={packRequest?.name} backLink={labels.back} />
      <Card>
        <CardContent>
          <img src={packRequest?.specialImage ? packRequest.imageUrl : state.packs.find(p => p.id === packRequest?.siblingPackId)?.imageUrl} className="img-card" alt={labels.noImage} />
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
          value={state.packs.find(p => p.id === packRequest?.siblingPackId)?.product.name}
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
      <FabBackdrop slot="fixed" />
      <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
        <Icon material="keyboard_arrow_down"></Icon>
        <Icon material="close"></Icon>
        <FabButtons position="bottom">
          <FabButton color="green" onClick={() => f7.views.current.router.navigate(`/add-${packRequest?.subCount ? 'group' : 'pack'}/${state.packs.find(p => p.id === packRequest?.siblingPackId)?.product.id}/${props.id}`)}>
            <Icon material="done"></Icon>
          </FabButton>
          <FabButton color="red" onClick={handleRejection}>
            <Icon material="delete"></Icon>
          </FabButton>
          <FabButton onClick={() => f7.views.current.router.navigate(`/product-packs/${state.packs.find(p => p.id === packRequest?.siblingPackId)?.product.id}/n`)}>
            <Icon material="history"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>
    </Page>
  )
}
export default PackRequestDetails
