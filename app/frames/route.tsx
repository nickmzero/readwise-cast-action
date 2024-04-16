/* eslint-disable react/jsx-key */
import {Button} from 'frames.js/next';
import {frames} from './frames';
import {constructCastActionUrl} from '../utils';
import {db} from '@vercel/postgres';
import {farcasterHubContext} from 'frames.js/middleware';

const handleRequest = frames(async (ctx) => {
  const currentUrl = new URL(ctx.url.toString());
  currentUrl.pathname = '/frames/action';

  const {inputText, requesterFid} = ctx.message || {};

  if (inputText && requesterFid) {
    // check valid readwise key
    const isValidKey = await isValidReadwiseKey(inputText);

    if (isValidKey) {
      // TODO: try catch this
      await upsertKey(requesterFid, inputText);

      const installActionUrl = constructCastActionUrl({
        actionType: 'post',
        icon: 'book',
        name: 'Save to Readwise',
        postUrl: currentUrl.toString(),
      });

      return {
        image: <div>{`Install the "Save to Readwise" action`}</div>,
        buttons: [
          <Button action="link" target={installActionUrl}>
            Install
          </Button>,
        ],
      };
    } else {
      return {
        image: <div>Invalid Readwise key, double check your key</div>,
        textInput: 'Input Readwise key',
        buttons: [<Button action="post">Submit</Button>],
      };
    }
  } else {
    return {
      image: (
        <div
          className="flex"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <div>Save to Readwise: input your readwise key to get started</div>
          <div>(it will be encrypted)</div>
        </div>
      ),
      textInput: 'Input Readwise key',
      buttons: [<Button action="post">Submit</Button>],
    };
  }
});

const isValidReadwiseKey = async (key: string) => {
  try {
    const response = await fetch('https://readwise.io/api/v2/auth/', {
      method: 'GET',
      headers: {
        Authorization: `Token ${key}`,
      },
    });

    return response.ok;
  } catch (err) {
    console.log(`Error checking Readwise key: ${err}`);
    return false;
  }
};

const upsertKey = async (fid: number, key: string) => {
  const client = await db.connect();

  return client.sql`INSERT INTO readwise (fid, readwise_key)
  VALUES (${fid}, pgp_sym_encrypt(${key}, ${process.env.SECRET}))
  ON CONFLICT (fid) DO UPDATE 
  SET readwise_key = EXCLUDED.readwise_key;`;
};

export const GET = handleRequest;
export const POST = handleRequest;
