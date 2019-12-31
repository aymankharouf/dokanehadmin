import React from 'react'
import { Page, Navbar, Block } from 'framework7-react'
import labels from '../data/labels'

const NotFoundPage = props => {
  return (
    <Page>
      <Navbar title={labels.notFoundPageTitle} backLink={labels.back} />
      <Block strong>
        <p>{labels.notFoundPageError}</p>
      </Block>
    </Page>
  )
}

export default NotFoundPage
