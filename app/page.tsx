import Link from 'next/link';
import type {Metadata} from 'next';
import {fetchMetadata} from 'frames.js/next';

import {createDebugUrl, currentURL, vercelURL} from './utils';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Readwise Cast Action Frame',
    description: 'This is a frame for installing the Readwise cast action.',
    other: {
      ...(await fetchMetadata(
        new URL('/frames', vercelURL() || 'http://localhost:3000')
      )),
    },
  };
}

export default async function Home() {
  const url = currentURL('/');

  return (
    <div>
      New api cast actions example.{' '}
      <Link href={createDebugUrl(url)} className="underline">
        Debug
      </Link>
    </div>
  );
}
