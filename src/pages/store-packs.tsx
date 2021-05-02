import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Fab, Icon, Navbar, List, ListItem, Searchbar, NavRight, Link } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { Category, Pack, PackPrice } from '../data/types'

type Props = {
  id: string
}
type ExtendedPackPrice = PackPrice & {
  packInfo: Pack,
  categoryInfo: Category
}
const StorePacks = (props: Props) => {
  const { state } = useContext(StateContext)
  const [store] = useState(() => state.stores.find(s => s.id === props.id)!)
  const [storePacks, setStorePacks] = useState<ExtendedPackPrice[]>([])
  useEffect(() => {
    setStorePacks(() => {
      const storePacks = state.packPrices.filter(p => p.storeId === props.id)
      const results = storePacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)!
        const categoryInfo = state.categories.find(c => c.id === packInfo.product.categoryId)!
        return {
          ...p,
          packInfo,
          categoryInfo
        } 
      })
      return results.sort((p1, p2) => p1.packInfo.product.categoryId === p2.packInfo.product.categoryId ? (p2.time > p1.time ? -1 : 1) : (p1.categoryInfo.name > p2.categoryInfo.name ? 1 : -1))
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
          : storePacks.map(p => 
              <ListItem
                link={`/pack-details/${p.packId}`}
                title={p.packInfo.product.name}
                subtitle={p.packInfo.product.alias}
                text={p.packInfo.name}
                footer={moment(p.time).fromNow()}
                key={i++}
              >
                <div className="list-subtext1">{`${labels.price}: ${p.price.toFixed(2)}`}</div>
                <div className="list-subtext2">{p.categoryInfo.name}</div>
                <img src={p.packInfo.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href={`/add-store-pack/${props.id}`}>
        <Icon material="add"></Icon>
      </Fab>
    </Page>
  )
}

export default StorePacks
