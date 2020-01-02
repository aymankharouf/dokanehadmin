import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const RelatedProducts = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  const relatedProducts = useMemo(() => {
    let relatedProducts = state.products.filter(p => p.id !== props.id && p.tagId === product.tagId)
    relatedProducts = relatedProducts.map(p => {
      const categoryInfo = state.categories.find(c => c.id === p.categoryId)
      const countryInfo = state.countries.find(c => c.id === p.countryId)
      return {
        ...p,
        categoryInfo,
        countryInfo
      }
    })
    return relatedProducts.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [state.products, state.categories, state.countries, product, props.id])
  return(
    <Page>
      <Navbar title={labels.relatedProducts} backLink={labels.back} />
        <Block>
          <List mediaList>
            {relatedProducts.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : relatedProducts.map(p => {
                return (
                  <ListItem
                    link={`/product-packs/${p.id}`}
                    title={p.name}
                    subtitle={p.categoryInfo.name}
                    text={`${labels.productOf} ${p.countryInfo.name}`}
                    key={p.id}
                  >
                    <img slot="media" src={p.imageUrl} className="img-list" alt={p.name} />
                  </ListItem>
                )
              })
            }
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RelatedProducts