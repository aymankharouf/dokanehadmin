import React, { useContext, useMemo, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Link, Actions, ActionsButton } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { updateAdvertStatus, showMessage, showError, getMessage, deleteAdvert } from '../data/actions'
import { advertType } from '../data/config'

const Adverts = props => {
  const { state } = useContext(StoreContext)
  const [currentAdvert, setCurrentAdvert] = useState('')
  const [error, setError] = useState('')
  const [inprocess, setInprocess] = useState(false)
  const adverts = useMemo(() => [...state.adverts].sort((a1, a2) => a2.time.seconds - a1.time.seconds)
  , [state.adverts])
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
  const handleAction = advert => {
    setCurrentAdvert(advert)
    f7.actions.open('#advert-actions')
  }
  const handleUpdate = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        setInprocess(true)
        await updateAdvertStatus(currentAdvert, state.adverts)
        setInprocess(false)
        showMessage(labels.editSuccess)
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })  
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, async () => {
      try{
        setInprocess(true)
        await deleteAdvert(currentAdvert)
        setInprocess(false)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setInprocess(false)
        setError(getMessage(props, err))
      }
    })  
  }
  return (
    <Page>
      <Navbar title={labels.adverts} backLink={labels.back} />
      <Block>
        <List mediaList>
          {adverts.length === 0 ? 
            <ListItem title={labels.noData} />
          : adverts.map(a =>
              <ListItem
                title={advertType.find(t => t.id === a.type).name}
                subtitle={a.title}
                text={a.text}
                footer={moment(a.time.toDate()).fromNow()}
                key={a.id}
                className={currentAdvert && currentAdvert.id === a.id ? 'selected' : ''}
              >
                <div className="list-subtext1">{a.isActive ? labels.isActive : labels.inActive}</div>
                <Link slot="after" iconMaterial="more_vert" onClick={()=> handleAction(a)}/>
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-advert/">
        <Icon material="add"></Icon>
      </Fab>
      <Actions id="advert-actions">
        <ActionsButton onClick={() => props.f7router.navigate(`/advert-details/${currentAdvert.id}`)}>{labels.details}</ActionsButton>
        <ActionsButton onClick={() => handleDelete()}>{labels.delete}</ActionsButton>
        <ActionsButton onClick={() => handleUpdate()}>{currentAdvert.isActive ? labels.stop : labels.activate}</ActionsButton>
      </Actions>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Adverts
