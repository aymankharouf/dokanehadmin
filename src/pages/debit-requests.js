import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { approveDebitRequest, showMessage, showError, getMessage } from '../data/actions'
import moment from 'moment'
import 'moment/locale/ar'

const DebitRequests = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [debitRequests, setDebitRequests] = useState([])
  useEffect(() => {
    setDebitRequests(() => state.users.filter(u => u.debitRequestStatus === 'n'))
  }, [state.users])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleApprove = userId => {
    try{
      approveDebitRequest(userId)
      showMessage(labels.approveSuccess)
    } catch(err) {
			setError(getMessage(props, err))
		}
  }
  return(
    <Page>
      <Navbar title={labels.debitRequests} backLink={labels.back} />
      <Block>
        <List mediaList>
          {debitRequests.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : debitRequests.map(r => 
              <ListItem
                title={`${r.name}:${r.mobile}`}
                subtitle={moment(r.debitRequestTime.toDate()).fromNow()}
                key={r.id}
              >
                <Button text={labels.approve} slot="after" onClick={() => handleApprove(r.id)} />
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

export default DebitRequests
