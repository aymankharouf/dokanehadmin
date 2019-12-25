import React, { useContext, useMemo } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'
import PackImage from './PackImage'

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
          {storePacks.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : storePacks.map(p => {
              const packInfo = state.packs.find(pa => pa.id === p.packId)
              const productInfo = state.products.find(pr => pr.id === packInfo.productId)
              return (
                <ListItem
                  link={`/storePackDetails/${p.id}`}
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  text={moment(p.time.toDate()).fromNow()}
                  after={(p.price / 1000).toFixed(3)}
                  key={p.id}
                >
                  <PackImage slot="media" pack={packInfo} type="list" />
                  {productInfo.isNew ? <Badge slot="title" color='red'>{state.labels.new}</Badge> : ''}
                  {packInfo.isOffer || packInfo.hasOffer ? <Badge slot="title" color='green'>{state.labels.offer}</Badge> : ''}
                </ListItem>
              )
            })
          }
        </List>
      </Block>
      {store.id === 's' ? '' : 
        <Fab position="left-top" slot="fixed" color="green" href={`/addStorePack/${props.id}`}>
          <Icon material="add"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StorePacks
