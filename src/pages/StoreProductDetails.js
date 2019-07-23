import React, { useContext, useState } from 'react'
import { editPrice, deleteProduct } from '../data/Actions'
import { Block, Page, Navbar, Card, CardContent, CardFooter, Row, Col, Icon, List, ListItem, Input, Link, Toolbar, Button} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';

const StoreProductDetails = props => {
  const { state, products } = useContext(StoreContext)
  const [price, setPrice] = useState(null)
  const [priceVisible, setPriceVisible] = useState(false)
  const product = products.find(product => product.id === props.productId)
  let stores = [...product.stores]
  stores = stores.sort((productStorea, productStoreb) => productStoreb.time.seconds - productStorea.time.seconds)
  stores = stores.map(productStore => {
    const currentStore = state.stores.find(store => store.id === productStore.id)
    const storeName = currentStore.name
    return {...productStore, name: storeName}
  })
  const handleSubmit = () => {
    if (price > 0) {
      editPrice(props.storeId, product, price)
      setPriceVisible(false)
    }
  }
  const handleEdit = () => {
    setPriceVisible(true)
  }
  const handleCancelEdit = () => {
    setPriceVisible(false)
    setPrice('')
  }
  const handleDelete = () => {
    deleteProduct(props.storeId, product)
  }

  const storesTag = stores.map(store => <ListItem header={store.name} title={moment(store.time.toDate()).fromNow()} after={store.price} key={store.id} className={store.id === props.storeId ? 'current-store' : ''}/>)
  return (
    <Page>
      <Navbar title={product.name} backLink="Back" />
      <Block>
        <Card className="test">
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
            {product.price}
            <Row>
              <Col>
                <List>
                  {storesTag}
                </List>
              </Col>
            </Row>
          </CardContent>
          <CardFooter>
            {priceVisible ? null : <Link onClick={() => handleEdit()}><Icon material="create" color="green"></Icon></Link>}
            {priceVisible ? null : <Link onClick={() => handleDelete()}><Icon material="clear" color="red"></Icon></Link>}
            {priceVisible ? <Input name="price" placeholder="Price" type="number" onChange={(e) => setPrice(e.target.value)} className="price"/> : null}
            {priceVisible ? <Button onClick={() => handleSubmit()}><Icon material="done" color="green"></Icon></Button> : null}
            {priceVisible ? <Button onClick={() => handleCancelEdit()}><Icon material="clear" color="red"></Icon></Button> : null}
          </CardFooter>
        </Card>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StoreProductDetails
