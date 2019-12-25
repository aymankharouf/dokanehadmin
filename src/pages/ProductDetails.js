import React, { useContext, useMemo } from 'react'
import { Page, Navbar, List, ListItem, ListInput, Fab, Icon, Toggle } from 'framework7-react';
import { StoreContext } from '../data/Store';


const ProductDetails = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  return (
    <Page>
      <Navbar title={state.labels.productDetails} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          floatingLabel 
          type="text" 
          value={product.name}
          readonly
        />
        <ListInput 
          name="categoryId" 
          label={state.labels.category}
          floatingLabel 
          type="text" 
          value={state.categories.find(c => c.id === product.categoryId).name}
          readonly
        />
        <ListInput 
          name="trademarkId" 
          label={state.labels.trademark}
          floatingLabel 
          type="text" 
          value={product.trademarkId ? state.trademarks.find(t => t.id === product.trademarkId).name : ''}
          readonly
        />
        <ListInput 
          name="countryId" 
          label={state.labels.country}
          floatingLabel 
          type="text" 
          value={state.countries.find(c => c.id === product.countryId).name}
          readonly
        />
        <ListInput 
          name="tagId" 
          label={state.labels.tag}
          floatingLabel 
          type="text" 
          value={product.tagId ? state.tags.find(t => t.id === product.tagId).name : ''}
          readonly
        />
        <ListInput 
          name="storageId" 
          label={state.labels.storage}
          floatingLabel 
          type="text" 
          value={product.storageId ? state.storageTypes.find(t => t.id === product.storageId).name : ''}
          readonly
        />
        <ListItem>
          <span>{state.labels.isNew}</span>
          <Toggle 
            name="isNew" 
            color="green" 
            checked={product.isNew}
            disabled
          />
        </ListItem>
        <img src={product.imageUrl} className="img-card" alt={product.name} />
      </List>
      <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/editProduct/${props.id}`}>
        <Icon material="edit"></Icon>
      </Fab>
    </Page>
  )
}
export default ProductDetails
