import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const Ratings = props => {
  const { state } = useContext(StoreContext)
  const ratings = useMemo(() => {
    const ratings = state.ratings.filter(r => r.status === 'n')
    return ratings.sort((r1, r2) => r1.time.seconds - r2.time.seconds)
  }, [state.ratings])
  return(
    <Page>
      <Navbar title={labels.approveRatings} backLink={labels.back} />
      <Block>
        <List mediaList>
          {ratings.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : ratings.map(r => {
              const product = state.products.find(p => p.id === r.productId)
              return (
                <ListItem
                  link={`/rating-details/${r.id}`}
                  title={product.name}
                  subtitle={state.users.find(u => u.id === r.userId).name}
                  text={moment(r.time.toDate()).fromNow()}
                  key={r.id}
                >
                  <img slot="media" src={product.imageUrl} className="img-list" alt={product.name} />
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

export default Ratings
