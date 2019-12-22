import React, { useContext, useMemo } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

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
              const bonusProduct = packInfo.bonusPackId ? state.products.find(pr => pr.id === state.packs.find(pa => pa.id === packInfo.bonusPackId).productId) : ''
              return (
                <ListItem
                  link={`/storePack/${p.id}`}
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  text={(p.time.toDate()).fromNow()}
                  after={(p.price / 1000).toFixed(3)}
                  key={p.id}
                >
                  <div slot="media" className="relative">
                    <img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
                    {packInfo.offerQuantity > 1 ? <span slot="media" className="offer-quantity-list">{`× ${packInfo.offerQuantity}`}</span> : ''}
                    {packInfo.bonusPackId ? 
                      <div>
                        <img slot="media" src={bonusProduct.imageUrl} className="bonus-img-list" alt={bonusProduct.name} />
                        {packInfo.bonusQuantity > 1 ? <span slot="media" className="bonus-quantity-list">{`× ${packInfo.bonusQuantity}`}</span> : ''}
                      </div>
                    : ''}
                  </div>
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
