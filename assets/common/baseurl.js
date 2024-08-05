import { Platform } from 'react-native'


let baseURL = '';

{Platform.OS == 'android'
? baseURL = 'https://petmobile-1.onrender.com/api/'
: baseURL = 'https://petmobile-1.onrender.com/api/'
}

export default baseURL;