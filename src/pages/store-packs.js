import React, { useContext, useState, useEffect, useRef } from 'react'
import { f7, Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge, Actions, ActionsButton } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import moment from 'moment'
import 'moment/locale/ar'
import PackImage from './pack-image'
import labels from '../data/labels'
import { deleteStorePack, haltOffer, getCategoryName, showMessage, getMessage, showError } from '../data/actions'

const StorePacks = props => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [currentStorePack, setCurrentStorePack] = useState('')
  const [store] = useState(() => state.stores.find(s => s.id === props.id))
  const [storePacks, setStorePacks] = useState([])
  const actionsList = useRef('')
  useEffect(() => {
    setStorePacks(() => {
      let storePacks = state.packPrices.filter(p => p.storeId === props.id)
      storePacks = storePacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        const categoryInfo = state.categories.find(c => c.id === packInfo.categoryId)
        const categoryName = getCategoryName(categoryInfo, state.categories)
        return {
          ...p,
          packInfo,
          categoryName
        }
      })
      return storePacks.sort((p1, p2) => p1.packInfo.categoryId === p2.packInfo.categoryId ? p2.time.seconds - p1.time.seconds : (p1.categoryName > p2.categoryName ? 1 : -1))
    })
  }, [state.packPrices, state.packs, state.categories, props.id])
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

  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        setInprocess(true)
        await deleteStorePack(currentStorePack, state.packPrices, state.packs)
        setInprocess(false)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })
  }
  const handleHaltOffer = async () => {
    try{
      const offerEndDate = new Date(currentStorePack.offerEnd)
      const today = (new Date()).setHours(0, 0, 0, 0)
      if (offerEndDate > today) {
        f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
          try{
            setInprocess(true)
            await haltOffer(currentStorePack, state.packPrices, state.packs)
            setInprocess(false)
            showMessage(labels.haltSuccess)
            props.f7router.back()  
          } catch(err) {
            setInprocess(false)
            setError(getMessage(props, err))
          }
        })
      } else {
        setInprocess(true)
        await haltOffer(currentStorePack, state.packPrices, state.packs)
        setInprocess(false)
        showMessage(labels.haltSuccess)
      }
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }
  const handlePurchase = () => {
		try{
      if (currentStorePack.offerEnd && new Date() > currentStorePack.offerEnd.toDate()) {
        throw new Error('offerEnded')
      }
			if (state.basket.storeId && state.basket.storeId !== currentStorePack.storeId){
				throw new Error('twoDiffStores')
      }
      if (state.basket.packs?.find(p => p.packId === currentStorePack.packId)) {
        throw new Error('alreadyInBasket')
      }
      const packInfo = state.packs.find(p => p.id === currentStorePack.packId)
      let params
      if (packInfo.byWeight) {
        f7.dialog.prompt(labels.enterWeight, labels.actualWeight, async weight => {
          params = {
            pack: packInfo,
            packStore: currentStorePack,
            quantity : packInfo.isDivided ? Number(weight) : 1,
            price: currentStorePack.price,
            orderId: props.orderId,
            weight: Number(weight),
          }
          dispatch({type: 'ADD_TO_BASKET', params})
          showMessage(labels.addToBasketSuccess)
          props.f7router.back()
        })
      } else {
        params = {
          pack: packInfo, 
          packStore: currentStorePack,
          quantity: 1,
          price: currentStorePack.price,
          orderId: props.orderId,
        }
        dispatch({type: 'ADD_TO_BASKET', params})
        showMessage(labels.addToBasketSuccess)
        props.f7router.back()
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
	}
  const handleActions = storePack => {
    setCurrentStorePack(storePack)
    actionsList.current.open()
  }
  return(
    <Page>
      <Navbar title={`${store.name}`} backLink={labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-inner"
          clearButton
          expandable
          placeholder={labels.search}
        ></Searchbar>
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {storePacks.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : storePacks.map(p => 
              <ListItem
                title={p.packInfo.productName}
                subtitle={p.packInfo.name}
                text={(p.price / 1000).toFixed(3)}
                footer={moment(p.time.toDate()).fromNow()}
                key={p.id}
                className={currentStorePack && currentStorePack.id === p.id ? 'selected' : ''}
              >
                <div className="list-subtext1">{p.categoryName}</div>
                <div className="list-subtext2">{p.offerEnd ? `${labels.offerUpTo}: ${moment(p.offerEnd.toDate()).format('Y/M/D')}` : ''}</div>
                <PackImage slot="media" pack={p.packInfo} type="list" />
                {p.packInfo.isOffer ? <Badge slot="title" color='green'>{labels.offer}</Badge> : ''}
                <Link slot="after" iconMaterial="more_vert" onClick={()=> handleActions(p)}/>
              </ListItem>
            )
          }
        </List>
      </Block>
      {store.id === 's' ? '' : 
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" href={`/add-store-pack/${props.id}`}>
          <Icon material="add"></Icon>
        </Fab>
      }
      <Actions ref={actionsList}>
        <ActionsButton onClick={() =>props.f7router.navigate(`/pack-details/${currentStorePack.packId}`)}>{labels.details}</ActionsButton>
        {store.id === 's' && currentStorePack.quantity === 0 ? '' : 
          <ActionsButton onClick={() => props.f7router.navigate(`/edit-price/${currentStorePack.packId}/store/${currentStorePack.storeId}`)}>{labels.editPrice}</ActionsButton>
        }
        {store.id === 's' ? '' :
          <ActionsButton onClick={() => handleDelete()}>{labels.delete}</ActionsButton>
        }
        {store.id === 's' ? '' :
          <ActionsButton onClick={() => handlePurchase()}>{labels.purchase}</ActionsButton>
        }
        {currentStorePack.offerEnd && currentStorePack.price > 0 ?
          <ActionsButton onClick={() => handleHaltOffer()}>{labels.haltOffer}</ActionsButton>
        : ''}
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StorePacks
