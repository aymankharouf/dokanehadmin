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
    let ratings = state.ratings.filter(r => r.status === 'n')
    ratings = ratings.map(r => {
      const productInfo = state.products.find(p => p.id === r.productId)
      const userInfo = state.users.find(u => u.id === r.userId)
      return {
        ...r,
        productInfo,
        userInfo
      }
    })
    return ratings.sort((r1, r2) => r1.time.seconds - r2.time.seconds)
  }, [state.ratings, state.products, state.users])
  return(
    <Page>
      <Navbar title={labels.approveRatings} backLink={labels.back} />
      <Block>
        <List mediaList>
          {ratings.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : ratings.map(r => 
              <ListItem
                link={`/rating-details/${r.id}`}
                title={r.productInfo.name}
                subtitle={r.userInfo.name}
                text={moment(r.time.toDate()).fromNow()}
                key={r.id}
              >
                <img slot="media" src={r.productInfo.imageUrl} className="img-list" alt={r.productInfo.name} />
              </ListItem>
            )
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
