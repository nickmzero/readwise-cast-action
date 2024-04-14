import {headers} from 'next/headers';

type CastActionParams = {
  /** The action name. Must be less than 30 characters. */
  name: string;
  /** An [Octicons](https://primer.style/foundations/icons) icon name. */
  icon: string;
  /** The action type. (Same type options as frame buttons). Only post is accepted in V1. */
  actionType: 'post';
  postUrl: string;
};

export function constructCastActionUrl(params: CastActionParams): string {
  // Validate the input parameters
  if (params.name.length > 30) {
    throw new Error('The action name must be less than 30 characters.');
  }

  if (params.actionType.toLowerCase() !== 'post') {
    throw new Error('The action type must be "post" in V1.');
  }

  // Construct the URL
  const baseUrl = 'https://warpcast.com/~/add-cast-action';
  const urlParams = new URLSearchParams({
    name: params.name,
    icon: params.icon,
    actionType: params.actionType,
    postUrl: params.postUrl,
  });

  return `${baseUrl}?${urlParams.toString()}`;
}

const DEFAULT_DEBUGGER_URL =
  process.env.DEBUGGER_URL ?? 'http://localhost:3010/';

export const DEFAULT_DEBUGGER_HUB_URL =
  process.env.NODE_ENV === 'development'
    ? new URL('/hub', DEFAULT_DEBUGGER_URL).toString()
    : undefined;

export function createDebugUrl(frameURL: string | URL): string {
  try {
    const url = new URL('/', DEFAULT_DEBUGGER_URL);

    url.searchParams.set('url', frameURL.toString());

    return url.toString();
  } catch (error) {
    return '#';
  }
}

export function currentURL(pathname: string): URL {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'http';

  try {
    return new URL(pathname, `${protocol}://${host}`);
  } catch (error) {
    return new URL('http://localhost:3000');
  }
}

export function vercelURL() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;
}
