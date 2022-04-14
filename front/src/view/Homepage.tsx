import React, { FormEvent } from "react";
import { Button, Chip, Box, Card } from "@mui/material";
import { ChangeEvent, FC } from "react";
import uniqid from "uniqid";
import socket from "../utils/socket.utils";
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Layout from "../components/layout/Layout";
import axios from "../utils/axios.utils";
import "../styles/homepage.scss";

const LinearProgressWithLabel: FC<LinearProgressProps & { value: number }> = (
  props
) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
};

interface StateHomePage {
  files: FileList | null;
  requestId: string;
  progressCompression: number;
  progressUpload: number;
  uploadDone: boolean;
  compressionDone: boolean;
  disableBtnUpload: boolean;
  resultCompression: any;
}

export default class Homepage extends React.Component {
  constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state: Readonly<StateHomePage> = {
    files: null,
    disableBtnUpload: true,
    requestId: "",
    progressCompression: 0,
    progressUpload: 0,
    uploadDone: false,
    compressionDone: false,
    resultCompression: null,
  };

  async handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (this.state.files?.length) {
      this.setState({
        disableBtnUpload: true,
        compressionDone: false,
        uploadDone: false,
        progressUpload: false,
      });

      const formData = new FormData();
      if (this.state.files) {
        formData.append("file", this.state.files[0] as any);
      }

      const response = await axios.post(
        `/upload?request_id=${this.state.requestId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            this.setState({
              progressUpload: Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              ),
            });
          },
        }
      );
      if (response.data) {
        this.setState({ uploadDone: true });
      }
    }
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event && event.target.files?.length) {
      this.setState({ files: event.target.files, disableBtnUpload: false });
    } else {
      this.setState({ disableBtnUpload: true });
    }
  }

  componentDidMount() {
    if (socket) {
      const currentRequestId = localStorage.getItem("request_id") || uniqid();
      localStorage.setItem("request_id", currentRequestId);
      this.setState({ requestId: currentRequestId });
      socket.on(`on-progress-compression-${currentRequestId}`, (value) => {
        this.setState({ progressCompression: value });
      });
      socket.on(`on-end-compression-${currentRequestId}`, (value) => {
        this.setState({
          disableBtnUpload: false,
          files: null,
          compressionDone: true,
          resultCompression: {
            ...value,
            newSize: Math.ceil(value.newSize / 1000000),
            oldSize: Math.ceil(value.oldSize / 1000000),
          },
        });
      });
    }
  }

  render() {
    return (
      <Layout title="homepage">
        <Card className="homepage">
          <form className="form-upload-video" onSubmit={this.handleSubmit}>
            <Box className="form-control">
              <label>Selectionnez votre vidéo :</label>
              <input
                type="file"
                id="file"
                onChange={this.handleChange}
                accept="video/*"
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              disabled={this.state.disableBtnUpload}
            >
              UPLOAD
            </Button>
          </form>
          {this.state.progressUpload > 0 && (
            <Box className="compression-progression-container">
              <Box>
                Progression de l'upload{" "}
                {this.state.uploadDone && (
                  <Chip
                    label="success"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              <LinearProgressWithLabel value={this.state.progressUpload} />
            </Box>
          )}
          {this.state.progressCompression > 0 && (
            <Box className="compression-progression-container">
              <Box>
                Progression de la compression{" "}
                {this.state.compressionDone && (
                  <Chip
                    label="success"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              <LinearProgressWithLabel value={this.state.progressCompression} />
            </Box>
          )}
          {this.state.compressionDone && (
            <Box className="result-container">
              Avant: {this.state.resultCompression?.oldSize}MB - Après{" "}
              {this.state.resultCompression?.newSize}MB
            </Box>
          )}
        </Card>
      </Layout>
    );
  }
}
