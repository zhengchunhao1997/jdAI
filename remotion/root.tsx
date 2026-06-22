import React from 'react';
import {Composition} from 'remotion';
import {JidahPromoVideo} from './videos/jidah-promo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="jidah-promo"
      component={JidahPromoVideo}
      durationInFrames={360}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
