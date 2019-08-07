import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const Purchases = props => {
  const { state } = useContext(StoreContext)
  let purchases = state.purchases
  purchases.sort((purchase1, purchase2) => purchase2.time.seconds - purchase1.time.seconds)
  return(
    <Page>
      <Navbar title='Purchases' backLink="Back" />
      <Block>
          <List mediaList>
            {purchases && purchases.map(purchase => {
              return (
                <ListItem
                  link={`/purchase/${purchase.id}`}
                  title={moment(purchase.time.toDate()).fromNow()}
                  after={purchase.total}
                  text={state.stores.find(rec => rec.id === purchase.store).name}
                  key={purchase.id}
                >
                </ListItem>
              )}
            )}
            { purchases.length === 0 ? <ListItem title={state.labels.not_found} /> : null }
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Purchases
