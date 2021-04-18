import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Button } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { approveRating, showMessage, showError, getMessage } from '../data/actions'

const Ratings = () => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [ratings, setRatings] = useState([])
  useEffect(() => {
    setRatings(() => {
      const ratings = state.ratings.filter((r: any) => r.status === 'n')
      return ratings.map((r: any) => {
        const userInfo = state.users.find((u: any) => u.id === r.userId)
        const productInfo = state.products.find((p: any) => p.id === r.productId)
        return {
          ...r,
          userInfo,
          productInfo
        }
      })
    })
  }, [state.users, state.products, state.ratings])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleApprove = (rating: any) => {
    try{
      approveRating(rating, state.packs)
      showMessage(labels.approveSuccess)
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  let i = 0
  return(
    <Page>
      <Navbar title={labels.ratings} backLink={labels.back} />
      <Block>
        <List mediaList>
          {ratings.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : ratings.map((r: any) => 
              <ListItem
                title={r.productInfo.name}
                subtitle={`${r.userInfo.name}:${r.userInfo.mobile}`}
                key={i++}
              >
                <img slot="media" src={r.productInfo.imageUrl} className="img-list" alt={r.productInfo.name} />
                <Button text={labels.approve} slot="after" onClick={() => handleApprove(r)} />
              </ListItem>
            )
          }
        </List>
      </Block>
    </Page>
  )
}

export default Ratings
