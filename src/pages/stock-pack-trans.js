import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Button, Fab, Icon, Actions, ActionsButton } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import { addStockTrans, showMessage, showError, getMessage, quantityText } from '../data/actions'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import BottomToolbar from './bottom-toolbar'

const StockPackTrans = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const pack = useMemo(() => state.packs.find(p => p.id === props.id)
  , [state.packs, props.id])
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
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleAddTrans = (type, storeId, cost, price) => {
    f7.dialog.prompt(labels.enterQuantity, labels.quantity, async quantity => {
      try{
        if (storeId && !state.stores.find(s => s.id === storeId).allowReturn) {
          throw new Error('storeNotReturn')
        }
        if (Number(quantity) === 0 || Number(quantity) > stockPackInfo.quantity) {
          throw new Error('invalidValue')
        }
        setInprocess(true)
        await addStockTrans(type, pack.id, Number(quantity), cost || stockPackInfo.cost, price || stockPackInfo.price, state.storePacks, state.packs, storeId)
        setInprocess(false)
        showMessage(labels.addSuccess)
        props.f7router.back()
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }      
    })
  }
  return(
    <Page>
      <Navbar title={`${pack.productName} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {packTrans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : packTrans.map(t => 
              <ListItem
                title={`${t.stockTransTypeInfo.name} ${t.storeInfo?.name || ''}`}
                subtitle={`${labels.quantity}: ${quantityText(t.quantity)}`}
                text={`${labels.price}: ${(t.cost / 1000).toFixed(3)}`}
                footer={moment(t.time.toDate()).fromNow()}
                key={t.id}
              >
                {t.storeInfo?.allowReturn ?
                  <Button text={labels.return} slot="after" onClick={() => handleAddTrans('r', t.storeId, t.cost, t.price)} />
                : ''}
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => f7.actions.open('#actions')}>
        <Icon material="build"></Icon>
      </Fab>
      {stockPackInfo.quantity === 0 ? '' :
        <Actions id="actions">
          <ActionsButton onClick={() => handleAddTrans('g')}>{labels.donate}</ActionsButton>
          <ActionsButton onClick={() => handleAddTrans('d')}>{labels.destroy}</ActionsButton>
          <ActionsButton onClick={() => handleAddTrans('w')}>{labels.withdraw}</ActionsButton>
          <ActionsButton onClick={() => props.f7router.navigate(`/sell-store/${props.id}`)}>{labels.sell}</ActionsButton>
        </Actions>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StockPackTrans
