import React, { useContext } from 'react'
import { Page, Block, Link, Navbar} from 'framework7-react'
import { StoreContext } from '../data/Store';

const ReLogin = props => {
  const { state } = useContext(StoreContext)
  return(
    <Page>
      <Navbar title={state.labels.reloginTitle} backLink={state.labels.back} />
      <Block>
        <h3 className="center">
          You have to login first <br/>
          <Link className="center" href={`/login/${props.callingPage}`}>{state.labels.login}</Link>
        </h3>
      </Block>
    </Page>
  )
}
export default ReLogin