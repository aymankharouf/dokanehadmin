import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge, Popover } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import moment from 'moment'
import 'moment/locale/ar'
import PackImage from './pack-image'
import labels from '../data/labels'
import { deleteStorePack, haltOffer, showMessage, getMessage, showError } from '../data/actions'

const StorePacks = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [currentStorePack, setCurrentStorePack] = useState('')
  const store = useMemo(() => state.stores.find(s => s.id === props.id)
  , [state.stores, props.id])
  let storePacks = useMemo(() => {
    let storePacks = state.storePacks.filter(p => p.storeId === props.id)
    storePacks = storePacks.map(p => {
      const packInfo = state.packs.find(pa => pa.id === p.packId)
      const productInfo = state.products.find(pr => pr.id === packInfo.productId)
      return {
        ...p,
        packInfo,
        productInfo
      }
    })
    return storePacks.sort((p1, p2) => p2.time.seconds - p1.time.seconds)
  }, [state.storePacks, state.packs, state.products, props.id])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = storePack => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        await deleteStorePack(storePack, state.storePacks, state.packs)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(props, err))
      }
    })
  }
  const handleHaltOffer = async storePack => {
    try{
      const offerEndDate = new Date(storePack.offerEnd)
      const today = (new Date()).setHours(0, 0, 0, 0)
      if (offerEndDate > today) {
        f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
          try{
            await haltOffer(storePack, state.storePacks, state.packs)
            showMessage(labels.haltSuccess)
            props.f7router.back()  
          } catch(err) {
            setError(getMessage(props, err))
          }
        })
      } else {
        await haltOffer(storePack, state.storePacks, state.packs)
        showMessage(labels.haltSuccess)
      }
    } catch(err) {
			setError(getMessage(props, err))
		}
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
          searchIn=".item-title, .item-subtitle"
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
                title={p.productInfo.name}
                subtitle={p.packInfo.name}
                text={(p.price / 1000).toFixed(3)}
                footer={p.packInfo.offerEnd ? `${labels.offerUpTo}: ${moment(p.packInfo.offerEnd.toDate()).format('Y/M/D')}` : ''}
                key={p.id}
              >
                <div className="list-subtext1">{moment(p.time.toDate()).fromNow()}</div>
                <PackImage slot="media" pack={p.packInfo} type="list" />
                {p.packInfo.isOffer ? <Badge slot="title" color='green'>{labels.offer}</Badge> : ''}
                <Link slot="after" popoverOpen=".store-packs-menu" iconMaterial="more_vert" onClick={()=> setCurrentStorePack(p)}/>
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
      <Popover className="store-packs-menu">
        <List>
          {store.id === 's' && currentStorePack.quantity === 0 ? '' : 
            <ListItem 
              link={`/edit-price/${currentStorePack.id}`} 
              popoverClose 
              title={labels.editPrice}
            />
          }
          {store.id === 's' ? '' : 
            <ListItem 
              link="#" 
              popoverClose 
              title={labels.delete} 
              onClick={() => handleDelete(currentStorePack)}
            />
          }
          {currentStorePack.offerEnd ? 
            <ListItem 
              link="#" 
              popoverClose 
              title={labels.haltOffer} 
              onClick={() => handleHaltOffer(currentStorePack)}
            /> 
          : ''}
        </List>
      </Popover>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StorePacks
