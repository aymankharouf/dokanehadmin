import React, { useContext, useMemo, useEffect, useState } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { approveInvitation, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const InvitationDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const invitation = useMemo(() => state.invitations.find(i => i.id === props.id)
  , [state.invitations, props.id])
  const userInfo = useMemo(() => state.users.find(u => u.id === invitation.userId)
  , [state.users, invitation])
  const customerInfo = useMemo(() => state.customers.find(c => c.id === invitation.userId)
  , [state.customers, invitation])
  const mobileCheck = useMemo(() => {
    if (state.users.find(u => u.mobile === invitation.friendMobile)) {
      return false
    }
    if (state.customers.find(c => c.otherMobile === invitation.friendMobile)) {
      return false
    }
    return true
  }, [state.users, state.customers, invitation])
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
      await approveInvitation({...invitation, status: mobileCheck ? 'a' : 'r'})
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
          value={customerInfo.fullName || `${userInfo.name}:${userInfo.mobile}`}
          type="text"
          readonly
        />
        <ListInput 
          name="friendName" 
          label={labels.friendName}
          value={invitation.friendName}
          type="text"
          readonly
        />
        <ListInput 
          name="friendMobile" 
          label={labels.mobile}
          value={invitation.friendMobile}
          type="text"
          readonly
        />
        <ListInput 
          name="mobileCheck" 
          label={labels.mobileCheck}
          value={mobileCheck ? labels.notUsedMobile : labels.otherUserMobile}
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
