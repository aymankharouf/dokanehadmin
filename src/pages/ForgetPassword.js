import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const ForgetPassword = props => {
  const { state } = useContext(StoreContext)
  let forgetPassword = state.forgetPassword.filter(rec => rec.resolved === false)
  forgetPassword.sort((forgetPassword1, forgetPassword2) => forgetPassword2.time.seconds - forgetPassword1.time.seconds)
  return(
    <Page>
      <Navbar title={state.labels.forgetPassword} backLink="Back" />
      <Block>
          <List mediaList>
            {forgetPassword && forgetPassword.map(trans => {
              const userInfo = state.users.find(rec => rec.mobile === trans.mobile)
              if (!userInfo) return ''
              return (
                <ListItem
                  link='#'
                  title={`${userInfo.name} - ${userInfo.mobile}`}
                  subtitle={moment(trans.time.toDate()).fromNow()}
                  key={trans.id}
                />
              )
            }
            )}
            { forgetPassword.length === 0 ? <ListItem title={state.labels.noData} /> : null }
          </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default ForgetPassword
