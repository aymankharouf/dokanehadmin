import React, { useContext, useMemo } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import moment from 'moment'
import 'moment/locale/ar'
import PackImage from './pack-image'
import labels from '../data/labels'

const StorePacks = props => {
  const { state } = useContext(StoreContext)
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
                link={`/store-pack-details/${p.id}`}
                title={p.productInfo.name}
                subtitle={p.packInfo.name}
                text={moment(p.time.toDate()).fromNow()}
                footer={p.packInfo.offerEnd ? `${labels.offerUpTo}: ${moment(p.packInfo.offerEnd.toDate()).format('Y/M/D')}` : ''}
                after={(p.price / 1000).toFixed(3)}
                key={p.id}
              >
                <PackImage slot="media" pack={p.packInfo} type="list" />
                {p.packInfo.isOffer ? <Badge slot="title" color='green'>{labels.offer}</Badge> : ''}
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
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StorePacks
