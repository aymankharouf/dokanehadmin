import React, { useContext, useMemo } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const StorePacks = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(s => s.id === props.id)
  , [state.stores, props.id])
  let storePacks = useMemo(() => {
    let storePacks = state.storePacks.filter(p => p.storeId === props.id)
    return storePacks.sort((p1, p2) => p2.time.seconds - p1.time.seconds)
  }, [state.storePacks, props.id])
  return(
    <Page>
      <Navbar title={`${store.name}`} backLink={state.labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-title, .item-subtitle"
          clearButton
          expandable
          placeholder={state.labels.search}
        ></Searchbar>
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={state.labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {storePacks.map(p => {
            const packInfo = state.packs.find(pa => pa.id === p.packId)
            const productInfo = state.products.find(pr => pr.id === packInfo.productId)
            return (
              <ListItem
                link={`/storePack/${p.id}`}
                title={productInfo.name}
                after={(p.price / 1000).toFixed(3)}
                subtitle={packInfo.name}
                text={moment(p.time.toDate()).fromNow()}
                key={p.id}
              >
                <img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
                {productInfo.isNew ? <Badge slot="title" color='red'>{state.labels.new}</Badge> : ''}
                {packInfo.isOffer || packInfo.hasOffer ? <Badge slot="title" color='green'>{state.labels.offer}</Badge> : ''}
              </ListItem>
            )
          })}
          {storePacks.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      {store.id === 's' ? '' : 
        <Fab position="left-top" slot="fixed" color="orange" className="top-fab">
          <Icon material="keyboard_arrow_down"></Icon>
          <Icon material="close"></Icon>
          <FabButtons position="bottom">
            <FabButton color="blue" onClick={() => props.f7router.navigate(`/editStore/${props.id}`)}>
              <Icon material="edit"></Icon>
            </FabButton>
            <FabButton color="green" onClick={() => props.f7router.navigate(`/addStorePack/${props.id}`)}>
              <Icon material="add"></Icon>
            </FabButton>
          </FabButtons>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StorePacks
