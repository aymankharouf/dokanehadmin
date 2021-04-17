import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Fab, Icon, Navbar, List, ListItem, Searchbar, NavRight, Link, Badge, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'

interface Props {
  id: string
}
const StorePacks = (props: Props) => {
  const { state } = useContext(StoreContext)
  const [store] = useState(() => state.stores.find((s: any) => s.id === props.id))
  const [storePacks, setStorePacks] = useState([])
  useEffect(() => {
    setStorePacks(() => {
      let storePacks = state.packPrices.filter((p: any) => p.storeId === props.id && !p.isAuto)
      storePacks = storePacks.map((p: any) => {
        const packInfo = state.packs.find((pa: any) => pa.id === p.packId)
        const categoryInfo = state.categories.find((c: any) => c.id === packInfo.categoryId)
        return {
          ...p,
          packInfo,
          categoryInfo
        } 
      })
      return storePacks.sort((p1: any, p2: any) => p1.packInfo.categoryId === p2.packInfo.categoryId ? p2.time.seconds - p1.time.seconds : (p1.categoryInfo.name > p2.categoryInfo.name ? 1 : -1))
    })
  }, [state.packPrices, state.packs, state.categories, props.id])
  useEffect(() => {
    if (storePacks.length === 0) {
      f7.dialog.preloader('')
    } else {
      f7.dialog.close()
    }
  }, [storePacks])

  let i = 0
  return(
    <Page>
      <Navbar title={store.name} backLink={labels.back}>
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
          : storePacks.map((p: any) => 
              <ListItem
                link={`/pack-details/${p.packId}`}
                title={p.packInfo.productName}
                subtitle={p.packInfo.productAlias}
                text={p.packInfo.name}
                footer={moment(p.time.toDate()).fromNow()}
                key={i++}
              >
                <div className="list-subtext1">{`${labels.cost}: ${(p.cost / 100).toFixed(2)}`}</div>
                <div className="list-subtext2">{`${labels.price}: ${(p.price / 100).toFixed(2)}`}</div>
                <div className="list-subtext3">{p.categoryInfo.name}</div>
                <div className="list-subtext4">{p.offerEnd ? `${labels.offerUpTo}: ${moment(p.offerEnd.toDate()).format('Y/M/D')}` : ''}</div>
                <img src={p.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
                {p.packInfo.isOffer ? <Badge slot="title" color='green'>{labels.offer}</Badge> : ''}
                {p.packInfo.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
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
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default StorePacks
