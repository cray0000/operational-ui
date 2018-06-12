import * as React from "react"
import glamorous, { GlamorousComponent } from "glamorous"
import { Theme } from "@operational/theme"
import { CardHeader } from "../index"

import { WithTheme, Css, CssStatic } from "../types"

export interface Props {
  /** DOM id attribute, useful for hash linking */
  id?: string
  /** `css` prop as expected in a glamorous component */
  css?: Css
  className?: string
  children?: React.ReactNode
  /** buttons/links/actions assigned to the card */
  actionComponents?: React.ComponentType
  /** shortcut for adding a title to the card header */
  title?: string
}

const Container = glamorous.div(
  ({ theme }: WithTheme): CssStatic => ({
    label: "card",
    borderTop: "1px solid #e0e0e0",
    padding: theme.spacing,
    boxShadow: theme.shadows.card,
    backgroundColor: theme.colors.white,
    "& > img": {
      maxWidth: "100%",
    },
  }),
)

const Card = (props: Props) => (
  <Container id={props.id} css={props.css} className={props.className}>
    {(props.title || props.actionComponents) && (
      <CardHeader>
        {props.title && props.title}
        {props.actionComponents && <div>{<props.actionComponents />}</div>}
      </CardHeader>
    )}
    {props.children}
  </Container>
)

export default Card
