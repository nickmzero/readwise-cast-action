/* eslint-disable react/jsx-key */
import {Button} from 'frames.js/next';
import {frames} from '../frames';
import {constructCastActionUrl} from '../../utils';
import {db} from '@vercel/postgres';
import {farcasterHubContext} from 'frames.js/middleware';

export const POST = frames(async (ctx) => {
  const {requesterFid} = ctx.message || {};
  const castId = ctx.message?.castId;

  if (requesterFid) {
    try {
      // Fetch the cast and turn into a readwise highlight object.
      const highlight = await getHighlight(castId?.fid!, castId?.hash!);

      // Fetch the readwise key by fid.
      const token = await getReadwiseKey(requesterFid);
      await saveToReadwise(token, [highlight]);

      return Response.json({
        message: `Saved cast to Readwise 👍`,
      });
    } catch (err) {
      console.error('Error saving to Readwise', err);
      return Response.json({
        message: `Error saving cast to Readwise`,
      });
    }
  } else {
    return Response.json({
      message: `Error saving cast to Readwise`,
    });
  }
});

const getReadwiseKey = async (fid: number) => {
  const client = await db.connect();

  const row =
    await client.sql`SELECT fid, pgp_sym_decrypt(readwise_key::bytea, ${process.env.SECRET}) AS user_readwise_key FROM readwise WHERE fid=${fid};`;

  const readwiseKey = row.rows[0].user_readwise_key;
  return readwiseKey;
};

// Fetches the cast using pinata's free hub
const getHighlight = async (fid: number, hash: string) => {
  const [response, username] = await Promise.all([
    fetch(`https://hub.pinata.cloud/v1/castById?fid=${fid}&hash=${hash}`),
    getUsernameByFid(fid.toString()),
  ]);
  const {
    data: {
      castAddBody: {text},
    },
  } = (await response.json()) as {data: {castAddBody: {text: string}}};

  return {
    text,
    author: `@${username}::${fid}`,
    highlighted_at: new Date().toISOString(),
    highlight_url: `https://warpcast.com/${username}/${hash}`,
    note: '.farcaster',
  };
};

const getUsernameByFid = async (fid: string) => {
  const response = await fetch(
    `https://fnames.farcaster.xyz/transfers/current?fid=${fid}`,
    {method: 'GET'}
  );
  const {
    transfer: {username},
  } = (await response.json()) as {transfer: {username: string}};

  return username;
};

const saveToReadwise = async (
  token: string,
  highlights: Array<{
    text: string;
    author: string;
    highlighted_at: string;
    highlight_url: string;
  }>
) => {
  try {
    const response = await fetch('https://readwise.io/api/v2/highlights/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        highlights,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
  } catch (error) {
    console.error('There was an error!', error);
  }
};
