import React, { useContext, useMemo } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { storageTypes } from '../data/config'

const ProductDetails = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  return (
    <Page>
      <Navbar title={labels.productDetails} backLink={labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={labels.name}
          floatingLabel 
          type="text" 
          value={product.name}
          readonly
        />
        <ListInput 
          name="categoryId" 
          label={labels.category}
          floatingLabel 
          type="text" 
          value={state.categories.find(c => c.id === product.categoryId).name}
          readonly
        />
        <ListInput 
          name="trademark" 
          label={labels.trademark}
          floatingLabel 
          type="text" 
          value={product.trademark}
          readonly
        />
        <ListInput 
          name="countryId" 
          label={labels.country}
          floatingLabel 
          type="text" 
          value={product.country}
          readonly
        />
        <ListInput 
          name="tagId" 
          label={labels.tag}
          floatingLabel 
          type="text" 
          value={product.tagId ? state.tags.find(t => t.id === product.tagId).name : ''}
          readonly
        />
        <ListInput 
          name="storageId" 
          label={labels.storage}
          floatingLabel 
          type="text" 
          value={product.storageId ? storageTypes.find(t => t.id === product.storageId).name : ''}
          readonly
        />
        <img src={product.imageUrl} className="img-card" alt={product.name} />
      </List>
      <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/edit-product/${props.id}`}>
        <Icon material="edit"></Icon>
      </Fab>
    </Page>
  )
}
export default ProductDetails
