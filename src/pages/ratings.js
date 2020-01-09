import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { approveRating, showMessage, showError, getMessage } from '../data/actions'

const Ratings = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const ratings = useMemo(() => {
    let ratings = state.ratings.filter(r => r.status === 'n')
    ratings = ratings.map(r => {
      const productInfo = state.products.find(p => p.id === r.productId)
      const userInfo = state.users.find(u => u.id === r.userId)
      const customerInfo = state.customers.find(c => c.id === r.userId)
      return {
        ...r,
        productInfo,
        userInfo,
        customerInfo
      }
    })
    return ratings.sort((r1, r2) => r1.time.seconds - r2.time.seconds)
  }, [state.ratings, state.products, state.users, state.customers])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleApprove = async rating => {
    try{
      await approveRating(rating, state.products)
      showMessage(labels.approveSuccess)
    } catch(err) {
			setError(getMessage(props, err))
		}
  }

  return(
    <Page>
      <Navbar title={labels.approveRatings} backLink={labels.back} />
      <Block>
        <List mediaList>
          {ratings.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : ratings.map(r => 
              <ListItem
                title={r.productInfo.name}
                subtitle={r.customerInfo.fullName || `${r.userInfo.name}:${r.userinfo.mobile}`}
                text={moment(r.time.toDate()).fromNow()}
                key={r.id}
              >
                <img slot="media" src={r.productInfo.imageUrl} className="img-list" alt={r.productInfo.name} />
                <Button slot="after" onClick={() => handleApprove(r)}>{labels.approve}</Button>
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
