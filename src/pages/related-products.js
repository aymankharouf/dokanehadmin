import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const RelatedProducts = props => {
  const { state } = useContext(StoreContext)
  const [product] = useState(() => state.products.find(p => p.id === props.id))
  const [relatedProducts, setRelatedProducts] = useState([])
  useEffect(() => {
    setRelatedProducts(() => {
      let relatedProducts = state.products.filter(p => p.id !== props.id && p.categoryId === product.categoryId)
      relatedProducts = relatedProducts.map(p => {
        const categoryInfo = state.categories.find(c => c.id === p.categoryId)
        return {
          ...p,
          categoryInfo
        }
      })
      return relatedProducts.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
    })
  }, [state.products, state.categories, product, props.id])
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
                    text={`${labels.productOf} ${p.trademark ? labels.company + ' ' + p.trademark + '-' : ''}${p.country}`}
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