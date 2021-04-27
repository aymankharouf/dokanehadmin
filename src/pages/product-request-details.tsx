import { useContext, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'

type Props = {
  id: string
}
const ProductRequestDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [productRequest, setProductRequest] = useState(() => state.productRequests.find(p => p.id === props.id)!)
  console.log('price = ', productRequest)
  const [storeName, setStoreName] = useState('')
  useEffect(() => {
    setStoreName(() => {
      const user = state.users.find(u => u.id === productRequest.userId)!
      return state.stores.find(s => s.id === user.storeId)?.name || ''
    })
  }, [productRequest, state.users, state.stores])
  useEffect(() => {
    setProductRequest(() => state.productRequests.find(p => p.id === props.id)!)
  }, [state.productRequests, props.id])
  return (
    <Page>
      <Navbar title={labels.productRequestDetails} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          type="text" 
          value={productRequest.name}
          readonly
        />
        <ListInput 
          name="weight" 
          label={labels.weight}
          type="text" 
          value={productRequest.weight}
          readonly
        />
        <ListInput 
          name="country" 
          label={labels.country}
          type="text" 
          value={productRequest.country}
          readonly
        />
        <ListInput 
          name="price" 
          label={labels.price}
          type="text" 
          value={productRequest.price}
          readonly
        />
        <ListInput 
          name="storeName" 
          label={labels.storeName}
          type="text" 
          value={storeName}
          readonly
        />
        <img src={productRequest.imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/edit-product/${props.id}`}>
        <Icon material="done"></Icon>
      </Fab>
    </Page>
  )
}
export default ProductRequestDetails
