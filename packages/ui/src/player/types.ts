/**
 * A caption / subtitle track to attach to the player.
 */
export type LoomixCaption = {
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
};

export type LoomixPlayerProps = {
  /** Optional poster image shown before playback. */
  poster?: string;
  /** Optional title rendered in the top-left of the player chrome. */
  title?: string;
  /** Optional YouTube URL; when set, a "Watch on YouTube" button appears in the top-right. */
  youtubeUrl?: string;
  /** Optional close handler; when set, an X button appears in the top-right. */
  onClose?: () => void;
  /** Optional caption / subtitle tracks. */
  captions?: LoomixCaption[];
  /** Optional accessible label for the player. */
  ariaLabel?: string;
  /** Auto-play on mount. Defaults to false. */
  autoPlay?: boolean;
  /** Move keyboard focus to the player on mount so its shortcuts work immediately. Defaults to false. */
  autoFocus?: boolean;
  /** Start muted. Defaults to false. */
  muted?: boolean;
  /** Loop video. Defaults to false. */
  loop?: boolean;
  /** Hide the picture-in-picture button. */
  disablePictureInPicture?: boolean;
  /** Hide the skip backward / forward (±15s) buttons. */
  disableSkip?: boolean;
  /** Hide the volume / mute control. */
  disableVolume?: boolean;
  /** Hide the playback speed control. */
  disableSpeed?: boolean;
  /** Hide the fullscreen button. */
  disableFullscreen?: boolean;
  /** Class name applied to the player root. */
  className?: string;
  /** Class name applied to the underlying <video> element. */
  videoClassName?: string;
  /** Called whenever play / pause state changes. */
  onPlayingChange?: (isPlaying: boolean) => void;
} & (
  | {
      /** Video source URL. */
      src: string;
      /** Render a shimmer loading skeleton instead of the video. */
      loading?: boolean;
    }
  | {
      /** Video source URL. Optional while `loading`. */
      src?: undefined;
      /** Render a shimmer loading skeleton instead of the video. */
      loading: true;
    }
);
