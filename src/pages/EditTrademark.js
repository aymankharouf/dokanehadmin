import React, { useState, useContext, useMemo } from 'react'
import { editTrademark, showMessage } from '../data/Actions'
import { Page, Navbar, List, ListInput, Fab, Icon, Toolbar } from 'framework7-react';
import { StoreContext } from '../data/Store';
import BottomToolbar from './BottomToolbar';


const EditTrademark = props => {
  const { state } = useContext(StoreContext)
  const trademark = useMemo(() => state.trademarks.find(rec => rec.id === props.id)
  , [state.trademarks, props.id])
  const [name, setName] = useState(trademark.name)
  const handleEdit = () => {
    editTrademark({
      id: trademark.id,
      name
    }).then(() => {
      showMessage(props, 'success', state.labels.editSuccess)
      props.f7router.back()
    })
  }
  return (
    <Page>
      <Navbar title={state.labels.editTrademark} backLink={state.labels.back} />
      <List form>
        <ListInput 
          name="name" 
          label={state.labels.name}
          value={name}
          floatingLabel 
          type="text" 
          onChange={(e) => setName(e.target.value)}
        />
      </List>
      {!name || (name === trademark.name)
      ? ''
      : <Fab position="left-top" slot="fixed" color="green" onClick={() => handleEdit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>

    </Page>
  )
}
export default EditTrademark
