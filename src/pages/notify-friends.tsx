import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Button, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { approveNotifyFriends, showMessage, showError, getMessage } from '../data/actions'

const NotifyFriends = () => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [notifyFriends, setNotifyFriends] = useState<any>([])
  useEffect(() => {
    setNotifyFriends(() => {
      let notifyFriends: any = []
      let users = state.users.filter((u: any) => u.notifyFriends)
      users.forEach((u: any) => {
        u.notifyFriends.forEach((n: any) => {
          notifyFriends.push({
            userInfo: u,
            packInfo: state.packs.find((p: any) => p.id === n),
          })
        })
      })
      return notifyFriends
    })
  }, [state.users, state.packs])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleApprove = (userInfo: any, pack: any) => {
    try{
      approveNotifyFriends(userInfo, pack, state.users)
      showMessage(labels.approveSuccess)
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  let i = 0
  return(
    <Page>
      <Navbar title={labels.notifyFriends} backLink={labels.back} />
      <Block>
        <List mediaList>
          {notifyFriends.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : notifyFriends.map((n: any) => 
              <ListItem
                title={n.packInfo.productName}
                subtitle={`${n.userInfo.name}:${n.userInfo.mobile}`}
                key={i++}
              >
                <img slot="media" src={n.packInfo.imageUrl} className="img-list" alt={n.packInfo.productName} />
                <Button text={labels.approve} slot="after" onClick={() => handleApprove(n.userInfo, n.packInfo)} />
              </ListItem>
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default NotifyFriends
