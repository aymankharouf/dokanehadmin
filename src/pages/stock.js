import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link } from 'framework7-react'
import { StoreContext } from '../data/store'
import PackImage from './pack-image'
import { quantityText } from '../data/actions'
import labels from '../data/labels'

const Stock = props => {
  const { state, user } = useContext(StoreContext)
  const [stockPacks, setStockPacks] = useState([])
  useEffect(() => {
    setStockPacks(() => {
      let stockPacks = state.packPrices.filter(p => p.storeId === 's')
      stockPacks = stockPacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        return {
          ...p,
          packInfo
        }
      })
      return stockPacks.sort((p1, p2) => p1.time.seconds - p2.time.seconds)
    })
  }, [state.packPrices, state.packs])

  if (!user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.stock} backLink={labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search" />
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
          {stockPacks.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : stockPacks.map(p => 
              <ListItem
                link={`/stock-pack-trans/${p.packId}`}
                title={p.packInfo.productName}
                subtitle={p.packInfo.productAlias}
                text={p.packInfo.name}
                footer={`${labels.quantity}: ${quantityText(p.quantity)}`}
                after={(p.cost / 1000).toFixed(3)}
                key={p.id}
              >
                <PackImage slot="media" pack={p.packInfo} type="list" />
              </ListItem>
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link href="/stock-trans/" iconMaterial="layers" />
      </Toolbar>
    </Page>
  )
}

export default Stock
