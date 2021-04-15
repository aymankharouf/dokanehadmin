import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Fab, Icon, Actions, ActionsButton, Toolbar } from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import { showMessage, showError, getMessage, quantityText, unfoldStockPack } from '../data/actions'
import labels from '../data/labels'
import { stockTransTypes } from '../data/config'
import Footer from './footer'

const StockPackTrans = (props: any) => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find((p: any) => p.id === props.id))
  const [stockPackInfo] = useState(() => state.packPrices.find((p: any) => p.storeId === 's' && p.packId === props.id))
  const [packTrans, setPackTrans] = useState([])
  const [lastPurchase] = useState(() => {
    let purchases = state.purchases.filter((p: any) => p.basket.find((bp: any) => bp.packId === pack.id))
    purchases = purchases.map((p: any) => {
      const transPack = p.basket.find((bp: any) => bp.packId === pack.id)
      const storeInfo = state.stores.find((s: any) => s.id === p.storeId)
      return {
        ...transPack,
        storeInfo,
        storeId: p.storeId,
        purchaseId: p.id,
        time: p.time
      }
    })
    purchases.sort((t1: any, t2: any) => t2.time.seconds - t1.time.seconds)
    return purchases[0]
  })
  const [actionOpened, setActionOpened] = useState(false);
  useEffect(() => {
    setPackTrans(() => {
      let packTrans = state.stockTrans.filter((t: any) => t.basket.find((p: any) => p.packId === pack.id))
      packTrans = packTrans.map((t: any) => {
        const transPack = t.basket.find((p: any) => p.packId === pack.id)
        const storeInfo = state.stores.find((s: any) => s.id === t.storeId)
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
      return packTrans.sort((t1: any, t2: any) => t2.time.seconds - t1.time.seconds)
    })
  }, [state.stockTrans, state.stores, pack])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleAddTrans = (type: any) => {
    f7.dialog.prompt(labels.enterQuantity, labels.quantity, quantity => {
      try{
        if (state.returnBasket?.packs?.find((p: any) => p.packId === pack.id)) {
          throw new Error('alreadyInBasket')
        }
        if (Number(quantity) > stockPackInfo.quantity) {
          throw new Error('invalidValue')
        }
        if (state.returnBasket && state.returnBasket.type !== type) {
          throw new Error('diffTypeInReturnBasket')
        }
        if (type === 'r' && state.returnBasket && state.returnBasket.purchaseId !== lastPurchase.purchaseId) {
          throw new Error('diffPurchaseInReturnBasket')
        }
        const params: any = {
          type,
          packId: pack.id,
          cost: type === 'r' ? lastPurchase.cost : stockPackInfo.cost,
          price: type === 'r' ? lastPurchase.price : stockPackInfo.price,
          quantity: Number(quantity),
          storeId: type === 'r' ? lastPurchase.storeId : '',
          purchaseId: type === 'r' ? lastPurchase.purchaseId : ''
        }
        if (pack.byWeight) params['weight'] = Number(quantity)
        dispatch({type: 'ADD_TO_RETURN_BASKET', payload: params})
        showMessage(labels.addToBasketSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }      
    })
  }
  const handleOpen = () => {
    try{
      unfoldStockPack(stockPackInfo, state.packPrices, state.packs)
      showMessage(labels.executeSuccess)
      f7.views.current.router.back()
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }      
  }
  return(
    <Page>
      <Navbar title={`${pack.productName} ${pack.name}`} backLink={labels.back} />
      <Block>
        <List mediaList>
          {packTrans.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : packTrans.map((t: any) => 
              <ListItem
                title={`${t.stockTransTypeInfo.name} ${t.storeInfo?.name || ''}`}
                subtitle={`${labels.quantity}: ${quantityText(t.quantity, t.weight)}`}
                text={`${labels.price}: ${(t.cost / 100).toFixed(2)}`}
                footer={moment(t.time.toDate()).fromNow()}
                key={t.id}
              />
            )
          }
        </List>
      </Block>
      {stockPackInfo.quantity === 0 ? '' :
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => setActionOpened(true)}>
          <Icon material="build"></Icon>
        </Fab>
      }
      <Actions opened={actionOpened} onActionsClosed={() => setActionOpened(false)}>
        {pack.subPackId ? 
          <ActionsButton onClick={() => handleOpen()}>{labels.open}</ActionsButton>
        : ''}
        {lastPurchase?.storeInfo?.allowReturn ? 
          <ActionsButton onClick={() => handleAddTrans('r')}>{labels.return}</ActionsButton>
        : ''}
        <ActionsButton onClick={() => handleAddTrans('g')}>{labels.donate}</ActionsButton>
        <ActionsButton onClick={() => handleAddTrans('d')}>{labels.destroy}</ActionsButton>
        <ActionsButton onClick={() => handleAddTrans('s')}>{labels.sell}</ActionsButton>
      </Actions>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default StockPackTrans
