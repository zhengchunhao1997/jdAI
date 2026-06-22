import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const brandGreen = '#0F8F74';
const warmYellow = '#F3C247';
const ink = '#10231F';

const Panel: React.FC<{
  children: React.ReactNode;
  delay: number;
  top: number;
}> = ({children, delay, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {damping: 18, stiffness: 120},
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 76,
        right: 76,
        top,
        opacity: interpolate(entrance, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(entrance, [0, 1], [34, 0])}px)`,
        background: 'rgba(255,255,255,0.9)',
        border: '2px solid rgba(16,35,31,0.08)',
        borderRadius: 8,
        padding: '32px 34px',
        boxShadow: '0 24px 80px rgba(16,35,31,0.16)',
      }}
    >
      {children}
    </div>
  );
};

const Bubble: React.FC<{
  text: string;
  delay: number;
  top: number;
  align?: 'left' | 'right';
}> = ({text, delay, top, align = 'left'}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        position: 'absolute',
        top,
        [align]: 78,
        maxWidth: 720,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 18}px) scale(${0.98 + progress * 0.02})`,
        background: align === 'left' ? '#FFFFFF' : brandGreen,
        color: align === 'left' ? ink : '#FFFFFF',
        padding: '24px 30px',
        borderRadius: 8,
        fontSize: 34,
        lineHeight: 1.35,
        boxShadow: '0 20px 56px rgba(16,35,31,0.14)',
      }}
    >
      {text}
    </div>
  );
};

export const JidahPromoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const titleProgress = interpolate(frame, [8, 42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const pulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.85, 1]);

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #F7FBF8 0%, #EAF4EF 52%, #F8F2E4 100%)',
        color: ink,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 18% 15%, rgba(15,143,116,0.15), transparent 28%), radial-gradient(circle at 88% 5%, rgba(243,194,71,0.16), transparent 26%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 76,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          opacity: titleProgress,
        }}
      >
        <Img src={staticFile('brand-logo.svg')} style={{width: 74, height: 74}} />
        <div style={{fontSize: 38, fontWeight: 800}}>即答 AI 客服</div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 190,
          left: 76,
          right: 76,
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 28}px)`,
        }}
      >
        <div style={{fontSize: 74, lineHeight: 1.08, fontWeight: 900}}>
          把每一次咨询
          <br />
          变成可成交的对话
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            lineHeight: 1.45,
            color: 'rgba(16,35,31,0.72)',
          }}
        >
          7x24 小时接待、智能回复、线索沉淀，让销售从重复问答里解放出来。
        </div>
      </div>

      <Panel delay={62} top={540}>
        <div style={{fontSize: 30, color: 'rgba(16,35,31,0.62)'}}>
          客户正在问
        </div>
        <div style={{marginTop: 12, fontSize: 48, fontWeight: 850}}>
          “你们怎么收费？能先试用吗？”
        </div>
      </Panel>

      <Bubble delay={116} top={828} text="您好，可以先试用。根据咨询量和接入渠道选择套餐，我先发您适合小团队的方案。" />
      <Bubble
        delay={154}
        top={1010}
        align="right"
        text="自动识别意向，补齐需求，留下微信"
      />

      <Panel delay={206} top={1215}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
          }}
        >
          {[
            ['响应速度', '秒级'],
            ['接待时间', '全天候'],
            ['线索记录', '自动沉淀'],
            ['转人工', '无缝交接'],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{fontSize: 26, color: 'rgba(16,35,31,0.56)'}}>
                {label}
              </div>
              <div style={{marginTop: 8, fontSize: 42, fontWeight: 850}}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div
        style={{
          position: 'absolute',
          left: 76,
          right: 76,
          bottom: 74,
          height: 106,
          borderRadius: 8,
          background: ink,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 34px',
          fontSize: 32,
          fontWeight: 800,
          opacity: interpolate(frame, [270, 300], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <span>立即配置你的 AI 客服</span>
        <span style={{color: warmYellow, transform: `scale(${pulse})`}}>
          即刻开聊
        </span>
      </div>
    </AbsoluteFill>
  );
};
