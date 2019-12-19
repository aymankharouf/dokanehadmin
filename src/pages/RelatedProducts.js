import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const RelatedProducts = props => {
  const { state } = useContext(StoreContext)
  const product = useMemo(() => state.products.find(p => p.id === props.id)
  , [state.products, props.id])
  const relatedProducts = useMemo(() => {
    const relatedProducts = state.products.filter(p => p.id !== props.id && p.tagId === product.tagId)
    return relatedProducts.sort((p1, p2) => p1.name > p2.name ? 1 : -1)
  }, [state.products, product, props.id])
  return(
    <Page>
      <Navbar title={state.labels.relatedProducts} backLink={state.labels.back} />
        <Block>
          <List mediaList>
            {relatedProducts && relatedProducts.map(p => {
              return (
                <ListItem
                  link={`/product/${p.id}`}
                  title={p.name}
                  subtitle={state.categories.find(c => c.id === p.categoryId).name}
                  text={`${state.labels.productOf} ${state.countries.find(c => c.id === p.countryId).name}`}
                  key={p.id}
                >
                  <img slot="media" src={p.imageUrl} className="img-list" alt={p.name} />
                  {p.isNew ? <Badge slot="title" color='red'>{state.labels.new}</Badge> : ''}
                </ListItem>
              )
            }
            )}
            {relatedProducts.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default RelatedProducts