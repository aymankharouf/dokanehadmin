import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const PasswordRequests = () => {
  const { state } = useContext(StoreContext)
  const [passwordRequests, setPasswordRequests] = useState([])
  useEffect(() => {
    setPasswordRequests(() => state.passwordRequests.sort((r1, r2) => r1.time.seconds - r2.time.seconds))
  }, [state.passwordRequests])

  return(
    <Page>
      <Navbar title={labels.passwordRequests} backLink={labels.back} />
      <Block>
          <List mediaList>
            {passwordRequests.length === 0 ? 
              <ListItem title={labels.noData} /> 
            : passwordRequests.map(r => 
                <ListItem
                  link={`/retreive-password/${r.id}`}
                  title={r.mobile}
                  subtitle={r.status === 'n' ? labels.new : labels.resolved}
                  text={moment(r.time.toDate()).fromNow()}
                  key={r.id}
                />
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

export default PasswordRequests
