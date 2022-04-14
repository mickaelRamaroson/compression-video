/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useRef, useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Slider,
  IconButton,
} from "@mui/material";
import formatDuration from "format-duration";
import {
  PauseRounded,
  PlayArrowRounded,
  FastForwardRounded,
  FastRewindRounded,
  VolumeUpRounded,
  VolumeDownRounded,
  Close,
} from "@mui/icons-material";
import "./styles.scss";

export interface VideoPlayerProps {
  open: boolean;
  filename: string;
  name: string;
  onClose: () => void;
}

const VideoPlayer: FC<VideoPlayerProps> = ({
  open,
  filename,
  onClose,
  name,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [play, setPlay] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [setIntervalInstance, setSetIntervalInstance] =
    useState<NodeJS.Timer | null>(null);
  const [seekerValue, setSeekerValue] = useState<number | undefined>(0);

  const handleClickPlayPause = () => {
    setPlay((state) => !state);
  };

  const handleChangeVolume = (
    _event: any,
    newValue: number | number[],
    _: any
  ) => {
    setVolume(newValue as number);
  };

  const handleChangeSeeker = (_e: any, newValue: number | number[], _: any) => {
    if (videoRef.current) {
      // change current time video
      videoRef.current.currentTime =
        ((newValue as number) * videoRef.current.duration) / 100;
    }
    setSeekerValue(newValue as number);
  };

  const handleClickForwardAndRewind = useCallback(
    (type: "FORWARD" | "REWIND") => {
      const videoEl = videoRef.current;
      if (videoEl) {
        if (type === "FORWARD") {
          videoEl.currentTime += 2;
        } else {
          videoEl.currentTime -= 2;
        }

        if (!play) {
          setSeekerValue((videoEl.currentTime * 100) / videoEl.duration);
        }
      }
    },
    [videoRef.current, play]
  );

  useEffect(() => {
    if (videoRef.current) {
      if (play) {
        videoRef.current.play();

        // setup seeker
        !setIntervalInstance &&
          setSetIntervalInstance(
            setInterval(() => {
              videoRef.current &&
                setSeekerValue(
                  (videoRef.current.currentTime * 100) /
                    videoRef.current.duration
                );
            }, 500)
          );
      } else {
        videoRef.current.pause();

        // to stop setInterval callback
        setSetIntervalInstance(null);
        setIntervalInstance && clearInterval(setIntervalInstance);
      }

      // change value volume
      videoRef.current.volume = volume / 100;
    }
  }, [play, videoRef, volume]);

  useEffect(() => {
    setPlay(true); // play video afer openning
    if (videoRef.current) {
      videoRef.current.addEventListener("ended", () => {
        setSeekerValue(0);
        if (videoRef.current) videoRef.current.currentTime = 0;
        setPlay(false);
      });
    }
    // when whe close the player
    return () => {
      videoRef.current &&
        videoRef.current.removeEventListener("ended", (ev) => {});
      seekerValue && clearInterval(seekerValue);
    };
  }, [videoRef.current]);

  return (
    <Dialog maxWidth="xl" open={open} onClose={onClose}>
      <DialogTitle className="header-modal">
        <span>{name}</span>
        <span className="btn-close" onClick={onClose}>
          <Close />
        </span>
      </DialogTitle>
      <DialogContent>
        <Box className="player-container">
          <video disablePictureInPicture ref={videoRef}>
            <source
              src={`${process.env.REACT_APP_API_URL}/files/${filename}`}
              type="video/mp4"
            />
          </video>
          <Box className="control-container">
            <Box className="slider-container">
              <span>
                {videoRef.current &&
                  formatDuration(videoRef.current.currentTime * 1000)}
              </span>
              <Slider
                defaultValue={50}
                aria-label="Default"
                value={seekerValue}
                onChange={handleChangeSeeker}
              />
              <span>
                -
                {videoRef.current &&
                  formatDuration(
                    (videoRef.current.duration - videoRef.current.currentTime) *
                      1000
                  )}
              </span>
            </Box>
            <Box className="button-control-container">
              <Box className="video-control-container">
                <IconButton
                  onClick={() => handleClickForwardAndRewind("REWIND")}
                >
                  <FastRewindRounded />
                </IconButton>
                <IconButton size="large" onClick={handleClickPlayPause}>
                  {play ? (
                    <PauseRounded fontSize="large" color="success" />
                  ) : (
                    <PlayArrowRounded fontSize="large" color="success" />
                  )}
                </IconButton>
                <IconButton
                  onClick={() => handleClickForwardAndRewind("FORWARD")}
                >
                  <FastForwardRounded />
                </IconButton>
              </Box>
              <Box className="volume-container">
                <VolumeDownRounded fontSize="small" />
                <Slider
                  className="silder-volume"
                  aria-label="Volume"
                  size="small"
                  value={volume}
                  onChange={handleChangeVolume}
                />
                <VolumeUpRounded fontSize="small" />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;
