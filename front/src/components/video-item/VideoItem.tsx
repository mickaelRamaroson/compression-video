/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Box } from "@mui/material";
import { FC, useRef } from "react";
import moment from "moment";
import "./styles.scss";

interface VideoItemProps {
  filename: string;
  name: string;
  size: number;
  last_modified: string;
  onClick: (object: any) => void;
}

const VideoItem: FC<VideoItemProps> = ({
  filename,
  name,
  size,
  last_modified,
  onClick,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseOver = () => {
    const el = videoRef.current;
    if (el) {
      el.play();
    }
  };

  const handleMouseLeave = () => {
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  };

  const handleClickVideoItem = () => {
    onClick({ filename, name });
  };

  return (
    <Card
      className="video-item"
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onClick={handleClickVideoItem}
    >
      <Box className="video-container">
        <video muted disablePictureInPicture ref={videoRef}>
          <source
            src={`${process.env.REACT_APP_API_URL}/files/${filename}`}
            type="video/mp4"
          />
        </video>
      </Box>
      <Box className="info-video-container">
        <Box className="name">{name}</Box>
        <Box className="taille">
          <span>Taille :&nbsp;</span>
          <span>{Math.ceil(size / 1000000)}MB</span>
        </Box>
        <Box className="taille">
          Ajoutée le {moment(last_modified).format("DD-MM-YYYY HH:mm")}
        </Box>
      </Box>
    </Card>
  );
};

export default VideoItem;
