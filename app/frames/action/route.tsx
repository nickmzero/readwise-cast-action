/* eslint-disable react/jsx-key */
import {Button} from 'frames.js/next';
import {frames} from '../frames';
import {constructCastActionUrl} from '../../utils';
import {db} from '@vercel/postgres';

export const POST = frames(async (ctx) => {
  const {requesterFid} = ctx.message || {};
  console.log(JSON.stringify(ctx, null, 2));
  const castId = ctx.message?.castId;

  if (requesterFid) {
    // get readwise api key for fid
    // const token = await getReadwiseKey(requesterFid);
    // await saveToReadwise(token, [
    //   {
    //     text: ctx.message.
    //   }
    // ])
  }

  const castHash = ctx.message?.castId?.hash;
  console.log({castHash, fid: ctx.message?.castId?.fid});

  return Response.json({
    message: `The user's FID is ${ctx.message?.castId?.fid}`,
  });
});

const getReadwiseKey = async (fid: number) => {
  const client = await db.connect();

  const row =
    await client.sql`SELECT fid, pgp_sym_decrypt(readwise_key::bytea, ${process.env.SECRET}) AS user_readwise_key FROM readwise WHERE fid=${fid};`;

  const readwiseKey = row.rows[0].user_readwise_key;
  return readwiseKey;
};

const getCast = async (fid: number, hash: string) => {
  const response = await fetch('https://hub.pinata.cloud/v1/castById', {
    method: 'GET',
  });
  const data = await response.json();
};

const saveToReadwise = async (
  token: string,
  highlights: Array<{
    text: string;
    title: string;
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
    console.log(result);
  } catch (error) {
    console.error('There was an error!', error);
  }
};
