// src/theme.ts
import { createTheme } from '@mui/material/styles'

// palette minimal: sfondi bianchi, superfici e testi in grigio
const theme = createTheme({
  palette: {
    background: {
      default: '#fafafa', // leggero grigio
      paper: '#ffffff',   // bianco puro
    },
    text: {
      primary: 'rgba(0,0,0,0.87)',
      secondary: 'rgba(0,0,0,0.6)',
    },
    divider: 'rgba(0,0,0,0.12)',
  },
  components: {
    MuiAppBar: { defaultProps: { elevation: 0 } },
    MuiPaper:  { defaultProps: { elevation: 0 } },
  },
})

export default theme
