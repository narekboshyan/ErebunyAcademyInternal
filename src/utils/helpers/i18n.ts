import { IntlErrorCode } from 'next-intl';

export function getMessageFallback({ namespace, key, error }: any) {
  const path = [namespace, key].filter(part => part != null).join('.');

  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    return `${path} is not yet translated`;
  } else {
    return `Dear developer, please fix this message: ${path}`;
  }
}
