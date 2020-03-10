import React, { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Actions, ActionsButton } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import { showMessage, showError, getMessage, quantityText, openStockPack } from '../data/actions'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import BottomToolbar from './bottom-toolbar'

const StockPackTrans = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [stockPackInfo] = useState(() => state.packPrices.find(p => p.storeId === 's' && p.packId === props.id))
  const [packTrans, setPackTrans] = useState([])
  const actionsList = useRef('')
  useEffect(() => {
    setPackTrans(() => {
      let packTrans = state.stockTrans.filter(t => t.basket.find(p => p.packId === pack.id))
      packTrans = packTrans.map(t => {
        const transPack = t.basket.find(p => p.packId === pack.id)
        const storeInfo = state.stores.find(s => s.id === t.storeId)
        const stockTransTypeInfo = stockTransTypes.find(ty => ty.id === t.type)
        return {
          ...transPack,
          id: t.id,
          storeId: t.storeId,
          purchaseId: t.purchaseId,
          type: t.type,
          time: t.time,
          storeInfo,
          stockTransTypeInfo
        }
      })
      return packTrans.sort((t1, t2) => t2.time.seconds - t1.time.seconds)
    })
  }, [state.stockTrans, state.stores, pack])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAddTrans = type => {
    f7.dialog.prompt(labels.enterQuantity, labels.quantity, quantity => {
      try{
        if (state.returnBasket?.packs?.find(p => p.packId === pack.id)) {
          throw new Error('alreadyInBasket')
        }
        if (Number(quantity) === 0 || (type === 'r' && Number(quantity) !== packTrans[0].quantity) || (type !== 'r' && Number(quantity) > stockPackInfo.quantity)) {
          throw new Error('invalidValue')
        }
        if (state.returnBasket && state.returnBasket.type !== type) {
          throw new Error('diffTypeInReturnBasket')
        }
        if (type === 'r' && state.returnBasket && state.returnBasket.purchaseId !== packTrans[0].purchaseId) {
          throw new Error('diffPurchaseInReturnBasket')
        }
        const params = {
          type,
          packId: pack.id,
          cost: type === 'r' ? packTrans[0].cost : stockPackInfo.cost,
          price: type === 'r' ? packTrans[0].price : stockPackInfo.price,
          quantity: Number(quantity),
          storeId: type === 'r' ? packTrans[0].storeId : '',
          purchaseId: type === 'r' ? packTrans[0].purchaseId : ''
        }
        if (pack.byWeight) params['weight'] = Number(quantity)
        dispatch({type: 'ADD_TO_RETURN_BASKET', params})
        showMessage(labels.addToBasketSuccess)
      } catch(err) {
        setError(getMessage(props, err))
      }      
    })
  }
  const handleOpen = () => {
    try{
      openStockPack(stockPackInfo, state.packPrices, state.packs)
      showMessage(labels.executeSuccess)
      props.f7router.back()
    } catch(err) {
      setError(getMessage(props, err))
    }      
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
              />
            )
          }
        </List>
      </Block>
      {stockPackInfo.quantity === 0 ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => actionsList.current.open()}>
          <Icon material="build"></Icon>
        </Fab>
      }
      <Actions ref={actionsList}>
        {pack.subPackId ? 
          <ActionsButton onClick={() => handleOpen()}>{labels.open}</ActionsButton>
        : ''}
        {packTrans[0]?.storeInfo?.allowReturn ? 
          <ActionsButton onClick={() => handleAddTrans('r')}>{labels.return}</ActionsButton>
        : ''}
        <ActionsButton onClick={() => handleAddTrans('g')}>{labels.donate}</ActionsButton>
        <ActionsButton onClick={() => handleAddTrans('d')}>{labels.destroy}</ActionsButton>
        <ActionsButton onClick={() => handleAddTrans('s')}>{labels.sell}</ActionsButton>
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StockPackTrans
