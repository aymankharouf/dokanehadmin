import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge, Popover, Link } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';
import { addStockTrans, showMessage, showError, getMessage } from '../data/Actions'


const StockPackTrans = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
  const product = useMemo(() => state.products.find(p => p.id === pack.productId)
  , [state.products, pack])
  const stockPackInfo = useMemo(() => state.storePacks.find(p => p.storeId === 's' && p.packId === props.id)
  , [state.storePacks, props.id])
  const packTrans = useMemo(() => {
    const stockTrans = state.stockTrans.filter(t => t.basket.find(p => p.packId === pack.id))
    const packTrans = stockTrans.map(t => {
      const transPack = t.basket.find(p => p.packId === pack.id)
      return {
        ...transPack,
        id: t.id,
        storeId: t.storeId,
        type: t.type,
        time: t.time
      }
    })
    return packTrans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
  }, [state.stockTrans, pack])
  useEffect(() => {
    if (error) {
      showError(props, error)
      setError('')
    }
  }, [error, props])

  const handleAddTrans = (type, storeId, purchasePrice, price) => {
    props.f7router.app.dialog.prompt(state.labels.enterQuantity, state.labels.quantity, async quantity => {
      try{
        if (storeId && !state.stores.find(s => s.id === storeId).canReturn) {
          throw new Error('storeNotReturn')
        }
        if (Number(quantity) === 0 || Number(quantity) > stockPackInfo.quantity) {
          throw new Error('invalidValue')
        }
        await addStockTrans(type, pack.id, Number(quantity), purchasePrice ? purchasePrice : stockPackInfo.purchasePrice, price ? price : stockPackInfo.price, state.storePacks, state.packs, storeId)
        showMessage(props, state.labels.addSuccess)
        props.f7router.back()
      } catch(err) {
        setError(getMessage(props, err))
      }      
    })
  }
  return(
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {packTrans && packTrans.map(t => 
            <ListItem
              title={`${state.stockTransTypes.find(ty => ty.id === t.type).name} ${t.storeId ? state.stores.find(s => s.id === t.storeId).name : ''}`}
              subtitle={moment(t.time.toDate()).fromNow()}
              after={(t.purchasePrice / 1000).toFixed(3)}
              key={t.id}
              link={t.storeId ? '#' : ''}
              onClick={() => t.storeId ? handleAddTrans('c', t.storeId, t.purchasePrice, t.price) : ''}
            >
              <Badge slot="title" color="red">{t.quantity}</Badge>
            </ListItem>
          )}
          {packTrans.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Popover className="popover-menu">
        <List>
          {stockPackInfo.quantity === 0 ? '' :
            <ListItem 
              link="#"
              popoverClose 
              title={state.labels.donate} 
              onClick={() => handleAddTrans('g')}
            />
          }
          {stockPackInfo.quantity === 0 ? '' :
            <ListItem 
              link="#"
              popoverClose 
              title={state.labels.destroy} 
              onClick={() => handleAddTrans('d')}
            />
          }
          {stockPackInfo.quantity === 0 ? '' :
            <ListItem 
              link="#"
              popoverClose 
              title={state.labels.withdraw} 
              onClick={() => handleAddTrans('w')}
            />
          }
          {stockPackInfo.quantity === 0 ? '' :
            <ListItem 
              link={`/sellStore/${props.id}`}
              popoverClose 
              title={state.labels.sell} 
            />
          }
        </List>
      </Popover>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link popoverOpen=".popover-menu" iconMaterial="more_vert" />
      </Toolbar>
    </Page>
  )
}

export default StockPackTrans
