import { useContext, useState, useEffect } from 'react'
import { f7, Page, Block, Navbar, List, ListItem, Button, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { deleteLog, showMessage, showError, getMessage } from '../data/actions'


const Logs = () => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<any>([])
  useEffect(() => {
    setLogs(() => {
      const logs = state.logs.map((l: any) => {
        const userInfo = state.users.find((u: any) => u.id === l.userId)
        return {
          ...l,
          userInfo
        }
      })
      return logs.sort((l1: any, l2: any) => l2.time.seconds - l1.time.seconds)
    })
  }, [state.logs, state.users])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = (log: any) => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        deleteLog(log)
        showMessage(labels.deleteSuccess)
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })  
  }

  return(
    <Page>
      <Navbar title={labels.logs} backLink={labels.back} />
      <Block>
        <List mediaList>
          {logs.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : logs.map((l: any) => 
              <ListItem
                title={`${labels.user}: ${l.userInfo?.name || l.userId}`}
                subtitle={l.userInfo?.mobile ? `${labels.mobile}: ${l.userInfo.mobile}` : ''}
                text={l.page}
                footer={moment(l.time.toDate()).fromNow()}
                key={l.id}
              >
                <div className="list-subtext1">{l.error}</div>
                <Button text={labels.delete} slot="after" onClick={() => handleDelete(l)} />
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

export default Logs
