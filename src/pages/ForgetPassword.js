import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';
import { resolveForgetPassword, showMessage } from '../data/Actions'

const ForgetPassword = props => {
  const { state } = useContext(StoreContext)
  const forgetPassword = useMemo(() => {
    const forgetpassword = state.forgetPassword.filter(rec => rec.resolved === false)
    return forgetpassword.sort((rec1, rec2) => rec1.time.seconds - rec2.time.seconds)
  } , [state.forgetPassword])
  const handleResolveForgetPassword = trans => {
    resolveForgetPassword(trans).then(() => {
      showMessage(props, 'success', state.labels.resolveSuccess)
      props.f7router.back()
    })
  }
  return(
    <Page>
      <Navbar title={state.labels.forgetPassword} backLink={state.labels.back} />
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
