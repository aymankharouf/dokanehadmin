import {useContext, useState} from 'react'
import {sendNotification, getMessage} from '../data/actions'
import {f7, Page, Navbar, List, ListInput, Fab, Icon, ListItem} from 'framework7-react'
import labels from '../data/labels'
import {StateContext} from '../data/state-provider'
import { useIonToast } from '@ionic/react'
import { useHistory, useLocation } from 'react-router'


const AddNotification = () => {
  const {state} = useContext(StateContext)
  const [message] = useIonToast()
  const location = useLocation()
  const history = useHistory()
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [messageText, setMessageText] = useState('')
  const [users] = useState(() => [...state.users].sort((u1, u2) => u1.mobile > u2.mobile ? 1 : -1))
  const handleSubmit = () => {
    try{
      sendNotification(userId, title, messageText)
      message(labels.addSuccess, 3000)
      history.goBack()
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return (
    <Page>
      <Navbar title={labels.addNotification} backLink={labels.back} />
      <List form inlineLabels>
        <ListItem
          title={labels.toUser}
          smartSelect
          // @ts-ignore
          smartSelectParams={{
            // el: '#users', 
            openIn: "popup",
            closeOnSelect: true, 
            searchbar: true, 
            searchbarPlaceholder: labels.search,
            popupCloseLinkText: labels.close
          }}
        >
          <select name="userId" value={userId} onChange={e => setUserId(e.target.value)}>
            <option value=""></option>
            {users.map(u => 
              <option key={u.id} value={u.id}>{u.name}</option>
            )}
          </select>
        </ListItem>
        <ListInput 
          name="title" 
          label={labels.title} 
          clearButton
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onInputClear={() => setTitle('')}
        />
        <ListInput 
          name="message" 
          label={labels.message} 
          clearButton
          type="text"
          value={message}
          onChange={e => setMessageText(e.target.value)}
          onInputClear={() => setMessageText('')}
        />
      </List>
      {userId && title && message &&
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
    </Page>
  )
}
export default AddNotification
