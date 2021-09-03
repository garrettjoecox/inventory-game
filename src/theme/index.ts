import { extendTheme } from '@chakra-ui/react';

export default extendTheme({
  styles: {
    global: {
      '*': {
        userSelect: 'none',
      },
      'body, #__next': {
        height: '100vh',
      },
    },
  },
});
