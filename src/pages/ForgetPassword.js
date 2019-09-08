import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';
import { resolveForgetPassword } from '../data/Actions'

const ForgetPassword = props => {
  const { state } = useContext(StoreContext)
  let forgetPassword = state.forgetPassword.filter(rec => rec.resolved === false)
  forgetPassword.sort((forgetPassword1, forgetPassword2) => forgetPassword1.time.seconds - forgetPassword2.time.seconds)
  const handleResolveForgetPassword = trans => {
    resolveForgetPassword(trans).then(() => {
      props.f7router.back()
    })
  }
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
                  onClick={() => handleResolveForgetPassword(trans)}
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
