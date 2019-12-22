import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';

const Ratings = props => {
  const { state } = useContext(StoreContext)
  const ratings = useMemo(() => {
    const ratings = state.ratings.filter(r => r.status === 'n')
    return ratings.sort((r1, r2) => r1.time.seconds - r2.time.seconds)
  }, [state.ratings])
  return(
    <Page>
      <Navbar title={state.labels.approveRatings} backLink={state.labels.back} className="page-title" />
      <Block>
        <List mediaList>
          {ratings.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : ratings.map(r => {
              const product = state.products.find(p => p.id === r.productId)
              const userInfo = state.users.find(u => u.id === r.userId)
              return (
                <ListItem
                  link={`/rating/${r.id}`}
                  title={product.name}
                  key={r.id}
                  className= "list-title"
                >
                  <img slot="media" src={product.imageUrl} className="img-list" alt={product.name} />
                  <div className="list-line1">{userInfo.name}</div>
                  <div className="list-line2">{moment(r.time.toDate()).fromNow()}</div>
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
