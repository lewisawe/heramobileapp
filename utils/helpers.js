import {ar, enUS, tr} from 'date-fns/locale';

export function getActionError(action, defError) {
  if (
    action.payload &&
    action.payload.message &&
    action.payload.message.length
  ) {
    return action.payload.message;
  }

  if (action.payload && action.payload.error && action.payload.error.length) {
    return action.payload.error;
  }

  if (action.errors && action.errors.length) {
    return action.errors[0];
  }

  return defError;
}

export function languageSwitcher(language) {
  switch (language) {
    case 'English':
      return enUS;
    case 'Arabic':
      return ar;
    case 'Turkish':
      return tr;
    default:
      return enUS;
  }
}
