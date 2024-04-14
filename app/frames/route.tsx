/* eslint-disable react/jsx-key */
import {Button} from 'frames.js/next';
import {frames} from './frames';
import {constructCastActionUrl} from '../utils';

export const GET = frames(async (ctx) => {
  const currentUrl = new URL(ctx.url.toString());
  currentUrl.pathname = '/frames';

  const {inputText} = ctx.message || {};

  if (inputText) {
    // check valid readwise key
    const isValidKey = await isValidReadwiseKey(inputText);

    if (isValidKey) {
      // jwt encode, store in postgres, return frame to install action
    } else {
      return {
        image: <div>Invalid Readwise key, double check your key</div>,
        textInput: 'Input Readwise key',
        buttons: [<Button action="post">Submit</Button>],
      };
    }
  } else {
    return {
      image: <div>Save to Readwise: input readwise key to get started</div>,
      textInput: 'Input Readwise key',
      buttons: [<Button action="post">Submit</Button>],
    };
  }

  const installActionUrl = constructCastActionUrl({
    actionType: 'post',
    icon: 'number',
    name: 'Check FID',
    postUrl: currentUrl.toString(),
  });

  return {
    image: <div>FID Action</div>,
    buttons: [
      <Button action="link" target={installActionUrl}>
        Install
      </Button>,
    ],
  };
});

export const POST = frames(async (ctx) => {
  const castHash = ctx.message?.castId?.hash;
  console.log({castHash, fid: ctx.message?.castId?.fid});

  return Response.json({
    message: `The user's FID is ${ctx.message?.castId?.fid}`,
  });
});

const isValidReadwiseKey = async (key: string) => {
  try {
    const response = await fetch('https://readwise.io/api/v2/auth/', {
      headers: {
        Authorization: `Token ${key}`,
      },
    });

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(`Error checking Readwise key: ${err}`);
    return false;
  }
};
