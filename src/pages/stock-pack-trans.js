import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Popover, Link, Button } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import { addStockTrans, showMessage, showError, getMessage, quantityText } from '../data/actions'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'

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
    let packTrans = state.stockTrans.filter(t => t.basket.find(p => p.packId === pack.id))
    packTrans = packTrans.map(t => {
      const transPack = t.basket.find(p => p.packId === pack.id)
      const storeInfo = state.stores.find(s => s.id === t.storeId)
      const stockTransTypeInfo = stockTransTypes.find(ty => ty.id === t.type)
      return {
        ...transPack,
        id: t.id,
        storeId: t.storeId,
        type: t.type,
        time: t.time,
        storeInfo,
        stockTransTypeInfo
      }
    })
    return packTrans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
  }, [state.stockTrans, state.stores, pack])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleAddTrans = (type, storeId, cost, price) => {
    f7.dialog.prompt(labels.enterQuantity, labels.quantity, async quantity => {
      try{
        if (storeId && !state.stores.find(s => s.id === storeId).canReturn) {
          throw new Error('storeNotReturn')
        }
        if (Number(quantity) === 0 || Number(quantity) > stockPackInfo.quantity) {
          throw new Error('invalidValue')
        }
        await addStockTrans(type, pack.id, Number(quantity), cost || stockPackInfo.cost, price || stockPackInfo.price, state.storePacks, state.packs, storeId)
        showMessage(labels.addSuccess)
        props.f7router.back()
      } catch(err) {
        setError(getMessage(props, err))
      }      
    })
  }
  return(
    <Page>
      <Navbar title={`${product.name} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {packTrans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : packTrans.map(t => 
              <ListItem
                title={`${t.stockTransTypesInfo.name} ${t.storeInfo?.name || ''}`}
                subtitle={moment(t.time.toDate()).fromNow()}
                text={`${labels.quantity}: ${quantityText(t.quantity)}`}
                footer={`${labels.price}: ${(t.cost / 1000).toFixed(3)}`}
                key={t.id}
              >
                {t.storeInfo?.canReturn ?
                  <Button slot="after" onClick={() => handleAddTrans('c', t.storeId, t.cost, t.price)}>{labels.returnPacks}</Button>
                : ''}
              </ListItem>
            )
          }
        </List>
      </Block>
      <Popover className="popover-menu">
        <List>
          {stockPackInfo.quantity === 0 ? '' :
            <ListItem 
              link="#"
              popoverClose 
              title={labels.donate} 
              onClick={() => handleAddTrans('g')}
            />
          }
          {stockPackInfo.quantity === 0 ? '' :
            <ListItem 
              link="#"
              popoverClose 
              title={labels.destroy} 
              onClick={() => handleAddTrans('d')}
            />
          }
          {stockPackInfo.quantity === 0 ? '' :
            <ListItem 
              link="#"
              popoverClose 
              title={labels.withdraw} 
              onClick={() => handleAddTrans('w')}
            />
          }
          {stockPackInfo.quantity === 0 ? '' :
            <ListItem 
              link={`/sell-store/${props.id}`}
              popoverClose 
              title={labels.sell} 
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
