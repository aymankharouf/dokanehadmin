import { useContext, useState, useEffect } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon } from 'framework7-react'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const ProductDetails = (props: any) => {
  const { state } = useContext(StoreContext)
  const [product, setProduct] = useState(() => state.products.find((p: any) => p.id === props.id))
  useEffect(() => {
    setProduct(() => state.products.find((p: any) => p.id === props.id))
  }, [state.products, props.id])
  return (
    <Page>
      <Navbar title={labels.productDetails} backLink={labels.back} />
      <List form inlineLabels>
        <ListInput 
          name="name" 
          label={labels.name}
          type="text" 
          value={product.name}
          readonly
        />
        <ListInput 
          name="ename" 
          label={labels.ename}
          type="text" 
          value={product.ename}
          readonly
        />
        <ListInput 
          name="description" 
          label={labels.description}
          type="text" 
          value={product.description}
          readonly
        />
        <ListInput 
          name="categoryId" 
          label={labels.category}
          type="text" 
          value={state.categories.find((c: any) => c.id === product.categoryId).name}
          readonly
        />
        <ListInput 
          name="trademarkId" 
          label={labels.trademark}
          type="text" 
          value={state.trademarks.find((t: any) => t.id === product.trademarkId).name}
          readonly
        />
        <ListInput 
          name="countryId" 
          label={labels.country}
          type="text" 
          value={state.countries.find((c: any) => c.id === product.countryId).name}
          readonly
        />
        <img src={product.imageUrl} className="img-card" alt={labels.noImage} />
      </List>
      <Fab position="left-top" slot="fixed" color="red" className="top-fab" href={`/edit-product/${props.id}`}>
        <Icon material="edit"></Icon>
      </Fab>
    </Page>
  )
}
export default ProductDetails