import React, { useContext, useMemo, useEffect, useState } from 'react'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react'
import { StoreContext } from '../data/store'
import BottomToolbar from './bottom-toolbar'
import { approveInvitation, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'

const InvitationDetails = props => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
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

  const handleApprove = async () => {
    try{
      await approveInvitation({...invitation, status: mobileCheck ? 'a' : 'r'})
      showMessage(labels.approveSuccess)
      props.f7router.back()
    } catch(err) {
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
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="friendName" 
          label={labels.friendName}
          value={invitation.friendName}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="friendMobile" 
          label={labels.mobile}
          value={invitation.friendMobile}
          floatingLabel 
          type="text"
          readonly
        />
        <ListInput 
          name="mobileCheck" 
          label={labels.mobileCheck}
          value={mobileCheck ? labels.notUsedMobile : labels.otherUserMobile}
          floatingLabel 
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
