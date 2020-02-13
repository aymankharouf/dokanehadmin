import React, { useContext, useEffect, useState } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { approveInvitation, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const InvitationDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const [userInfo] = useState(() => state.users.find(u => u.id === props.userId))
  const [mobileCheck, setMobileCheck] = useState('')
  useEffect(() => {
    setMobileCheck(() => {
      if (state.users.find(u => u.mobile === props.mobile)) {
        return 'r'
      }
      if (state.customers.find(c => c.otherMobile === props.mobile)) {
        return 'r'
      }
      if (state.users.find(u => u.id !== props.userId && u.friends?.find(f => f.mobile === props.mobile))) {
        return 'o'
      }
      return 's'
    })
  }, [state.users, state.customers, props.mobile, props.userId])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (inprocess) {
      f7.dialog.preloader(labels.inprocess)
    } else {
      f7.dialog.close()
    }
  }, [inprocess])

  const handleApprove = async () => {
    try{
      setInprocess(true)
      await approveInvitation(userInfo, props.mobile, mobileCheck)
      setInprocess(false)
      showMessage(labels.approveSuccess)
      props.f7router.back()
    } catch(err) {
      setInprocess(false)
			setError(getMessage(props, err))
		}
  }

  return (
    <Page>
      <Navbar title={labels.invitationDetails} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleApprove()}>
        <Icon material="done"></Icon>
      </Fab>
      <List form>
        <ListInput 
          name="userName" 
          label={labels.user}
          value={`${userInfo.name}: ${userInfo.mobile}`}
          type="text"
          readonly
        />
        <ListInput 
          name="friendName" 
          label={labels.friendName}
          value={userInfo.friends.find(f => f.mobile === props.mobile).name}
          type="text"
          readonly
        />
        <ListInput 
          name="friendMobile" 
          label={labels.mobile}
          value={props.mobile}
          type="text"
          readonly
        />
        <ListInput 
          name="mobileCheck" 
          label={labels.mobileCheck}
          value={mobileCheck === 's' ? labels.notUsedMobile : (mobileCheck === 'r' ? labels.alreadyUser : labels.invitedByOther)}
          type="text"
          readonly
        />
      </List>
      <Toolbar bottom>
        <BottomToolbar />
      </Toolbar>
    </Page>
  )
}
export default InvitationDetails
