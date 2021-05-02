import {useContext, useState} from 'react'
import {Page, Block, Navbar, List, ListItem} from 'framework7-react'
import moment from 'moment'
import 'moment/locale/ar'
import {StateContext} from '../data/state-provider'
import labels from '../data/labels'

const PasswordRequests = () => {
  const {state} = useContext(StateContext)
  const [passwordRequests] = useState(() => state.passwordRequests.sort((r1, r2) => r1.time > r2.time ? -1 : 1))

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
                text={moment(r.time).fromNow()}
                key={r.id}
              />
            )
          }
        </List>
      </Block>
    </Page>
  )
}

export default PasswordRequests
