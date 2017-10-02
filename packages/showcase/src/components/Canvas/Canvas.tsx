import * as React from "react"
import glamorous from "glamorous"

import { Card } from "contiamo-ui-components"

type Props = { className?: string; children: React.ReactNode }

const Container = glamorous.div(({ theme }: { theme: Theme }): any => ({
  display: "flex",
  alignItems: "flex-start",
  flexBasis: "100%",
  marginLeft: theme.spacing * 4 / 3,
  maxHeight: "100%",

  "& > *": {
    maxWidth: 670,
  },

  "& a:link, & a:visited": {
    color: theme.colors.palette.info,
  },

  "& a:hover": {
    color: theme.colors.palette.success,
  },

  "& .playground": {
    display: "flex",
    width: "80vw",
    maxWidth: 850,
    maxHeight: 320,
  },

  "& .playgroundCode, & .playgroundPreview": {
    flex: "1 1 50%",
  },
  "& .playgroundPreview": {
    marginLeft: 16,
  },
  "& .CodeMirror-wrap.CodeMirror": {
    minHeight: 320,
  },
}))

const Canvas = ({ children }: Props) => (
  <Container>
    <Card>{children}</Card>
  </Container>
)

export default Canvas
