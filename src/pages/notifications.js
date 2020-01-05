import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { deleteNotification, showMessage, showError, getMessage } from '../data/actions'

const Notifications = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const notifications = useMemo(() => {
    const notifications = state.notifications.map(n => {
      const customerInfo = n.toCustomerId === '0' ? '' : state.customers.find(c => c.id === n.toCustomerId)
      return {
        ...n,
        customerInfo
      }
    })
    return notifications.sort((n1, n2) => n2.time.seconds - n1.time.seconds)
  }, [state.notifications, state.customers])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleDelete = notification => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        await deleteNotification(notification)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(props, err))
      }
    })  
  }
  return (
    <Page>
      <Navbar title={labels.notifications} backLink={labels.back} />
      <Block>
        <List mediaList>
          {notifications.length === 0 ? 
            <ListItem title={labels.noData} />
          : notifications.map(n =>
              <ListItem
                title={n.customerInfo?.fullName || labels.allCustomers}
                subtitle={n.status === 'n' ? labels.notRead : labels.read}
                text={n.message}
                footer={moment(n.time.toDate()).fromNow()}
                key={n.id}
              >
                <Button slot="after" onClick={() => handleDelete(n)}>{labels.delete}</Button>
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-notification/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Notifications
