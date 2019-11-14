import React, { useContext, useMemo } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const StorePacks = props => {
  const { state } = useContext(StoreContext)
  const store = useMemo(() => state.stores.find(rec => rec.id === props.id), [state.stores, props.id])
  let storePacks = useMemo(() => {
    let storePacks = state.packs.filter(pack => pack.stores.find(store => store.id === props.id))
    storePacks = storePacks.map(pack => {
      const productInfo = state.products.find(rec => rec.id === pack.productId)
      return {
        id: pack.id,
        productName: productInfo.name,
        name: pack.name,
        isNew: productInfo.isNew,
        isOffer: pack.isOffer,
        price: pack.stores.find(rec => rec.id === props.id).price,
        time: pack.stores.find(rec => rec.id === props.id).time,
        imageUrl: productInfo.imageUrl
      }
    })
    return storePacks.sort((rec1, rec2) => rec2.time.seconds - rec1.time.seconds)
  }, [state.packs, state.products, props.id])
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
          {storePacks.map(pack => 
            <ListItem
              link={`/storePack/${store.id}/pack/${pack.id}`}
              title={pack.productName}
              after={(pack.price / 1000).toFixed(3)}
              subtitle={pack.name}
              text={moment(pack.time.toDate()).fromNow()}
              key={pack.id}
            >
              <img slot="media" src={pack.imageUrl} className="lazy lazy-fadeIn avatar" alt=""/>
              {pack.isNew ? <Badge slot="title" color='red'>{state.labels.new}</Badge> : null}
              {pack.isOffer ? <Badge slot="title" color='green'>{state.labels.offer}</Badge> : null}
            </ListItem>
          )}
          {storePacks.length === 0 ? <ListItem title={state.labels.noData} /> : null}
        </List>
      </Block>
      {store.id === 's' ? '' : 
        <Fab position="left-top" slot="fixed" color="orange">
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
