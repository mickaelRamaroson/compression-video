import { Grid, Box } from "@mui/material";
import { FC, useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import axios from "../utils/axios.utils";
import VideoItem from "../components/video-item/VideoItem";
import socket from "../utils/socket.utils";
import VideoPlayer from "../components/video-player/VideoPlayer";
import "../styles/videosList.scss";
import useSWR from "swr";

const fetchVideos = async (url: string) => {
  const response = await axios.get(url);
  return (response.data || []).filter((item: any) => item.name);
};

const VideosList: FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [videoPlayerProps, setVideoPlayerProps] = useState<any>({
    open: false,
    filename: "",
    name: "",
  });
  const { data } = useSWR("/files", fetchVideos);

  // get videos from API
  useEffect(() => {
    if (data) {
      setVideos(data);
    }
    // update list when a video is uploaded anywhere
    socket &&
      socket.on("update-list", async () => {
        const data = await fetchVideos("/files");
        setVideos(data);
      });
  }, [data]);

  const handleClickVideoItem = (object: any) => {
    setVideoPlayerProps({
      filename: object.filename,
      open: true,
      name: object.name,
    });
  };

  const handleOnClose = () => {
    setVideoPlayerProps({
      filename: "",
      open: false,
    });
  };

  return (
    <Layout title="Les videos">
      <Box padding={3}>
        <Box display="flex" justifyContent="center">
          <h1 className="title">Voici les vidéos uploadées</h1>
        </Box>
        <Grid spacing={2} container>
          {(videos || []).map((video) => (
            <Grid key={video.filename} item xs={12} md={6} lg={6}>
              <VideoItem {...video} onClick={handleClickVideoItem} />
            </Grid>
          ))}
        </Grid>
        {videoPlayerProps.open && (
          <VideoPlayer {...videoPlayerProps} onClose={handleOnClose} />
        )}
      </Box>
    </Layout>
  );
};

export default VideosList;
