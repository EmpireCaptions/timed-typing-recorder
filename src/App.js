import React, { Component } from "react";
import "./App.css";
/* eslint-disable */
import { isEmpty } from "lodash";
import Button from "@material-ui/core/Button";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";

import Plyr from 'plyr';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      playSeconds: 0.0,
      playMedia: false,
      fileName: "",
      showTimer: false,
      playbackRate: 1,
    };
    this.main_result = [];
    this.current_result = [];
    this.index = 0;
    this.input = React.createRef();
    this.last_time = 0;
    this.text = "";
    this.final_result = { name: "", transcript: [] };
    this.plyr;
  }

  /**
   *
   * function to upload audio or video type file and store base64 value in state
   */

  fileSelectHandler = (e) => {
    this.setState({ fileName: e.target.files[0].name.split(".")[0] });
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (e) => {
        this.setState({ url: e.target.result, showFirstTimer: true }, () => {
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  makeResult = (e) => {
    this.text = e.target.value.trim().replace(/\s\s+/g, " ");
    if (this.text.lastIndexOf("\n") != -1) {
      this.text = this.text.substring(this.text.lastIndexOf("\n") + 1);
    }
    if (isEmpty(this.current_result)) {
      this.current_result.push({ start_time: this.plyr.currentTime });
    } else {
      let words_in_line = this.text.split(" ");
      if (words_in_line.length > this.current_result.length) {
        let second_last_word = words_in_line[words_in_line.length - 2];
        let id = this.current_result.length - 1; //zero based index

        this.current_result[id]["text"] = second_last_word;
        this.current_result[id]["end_time"] = this.plyr.currentTime;
        this.current_result[id]['highlight'] = false
        this.current_result[id]['strikethrough'] = false

        this.current_result.push({ start_time: this.plyr.currentTime });
      }
    }
  };

  onEnterPress = () => {
    this.text = this.text.trim();
    if (this.text.lastIndexOf("\n") != -1) {
      this.text = this.text.substring(this.text.lastIndexOf("\n"));
    }
    if (this.current_result.length == this.text.split(" ").length) {
      let words_in_line = this.text.split(" ");
      let last_word = words_in_line[words_in_line.length - 1];
      let id = this.current_result.length - 1; //zero based index

      this.current_result[id]["text"] = last_word;
      this.current_result[id]["end_time"] = this.plyr.currentTime;
      this.current_result[id]['highlight'] = false
      this.current_result[id]['strikethrough'] = false
      this.main_result.push(JSON.parse(JSON.stringify(this.current_result)));
    }
    // push copy of current result
    this.current_result = [];
  };

  onExportJson = () => {
    this.plyr.pause()
    if (this.current_result.length == this.text.split(" ").length) {
      let words_in_line = this.text.split(" ");
      let last_word = words_in_line[words_in_line.length - 1];
      let id = this.current_result.length - 1; //zero based index

      this.current_result[id]["text"] = last_word;
      this.current_result[id]["end_time"] = this.plyr.currentTime;
      this.current_result[id]['highlight'] = false
      this.current_result[id]['strikethrough'] = false
      this.main_result.push(JSON.parse(JSON.stringify(this.current_result)));
    }
    this.setState({ playMedia: false })
    let final_result = {};
    let arr
    final_result["name"] = this.state.fileName;
    final_result["transcript"] = []

    for (arr of this.main_result) {
      final_result['transcript'].push({
        "speaker": "",
        "start_time": arr[0]['start_time'],
        "end_time": arr[arr.length - 1]['end_time'],
        "words": arr
      })
    }
    this.download(
      JSON.stringify(final_result),
      this.state.fileName + ".json",
      "text/plain"
    );
  };

  download = (content, fileName, contentType) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  onClickStartRecord = () => {
    if (!this.state.playMedia) {
      // this.plyr.play();
      this.setState({ showTimer: true });
    }
    else
      this.plyr.pause();
    this.setState({ playMedia: this.plyr.playing }, () => {

      this.state.showTimer
        ? this.setState({ playMedia: !this.state.playMedia })
        : this.setState({ playMedia: false })
      this.setState({ playSeconds: this.plyr.currentTime });
    })
  };

  onCompleteTimer = (first) => {
    first
      ? this.setState({ showPlayer: true, showFirstTimer: false })
      : this.setState({ playMedia: true, showPlayer: true, showTimer: false, });
    if (!first) this.plyr.play()
    if (first) {
      this.plyr = new Plyr('#player');
      this.plyr.source = {
        type: 'video',
        title: 'myTitle',
        sources: [
          {
            src: this.state.url,
            type: 'video/mp4',
            size: 300,
          }
        ],
        speed: this.state.playbackRate
      };
      this.plyr.on('playing', event => {
        const instance = event.detail.plyr;
        console.log(instance);
        console.log(instance.currentTime, instance.currentTrack);
      });
    }
  };

  render() {
    return (
      <div>
        <div className="App">
          <div className="App1">
            {!this.state.showPlayer && (
              <div className="loadMediaButton">
                <Button className="button" variant="contained" color="primary">
                  <input
                    className=""
                    type="file"
                    accept="video/*,audio/*"
                    onChange={(e) => this.fileSelectHandler(e)}
                  />
                </Button>
              </div>
            )}
            {this.state.showTimer && (
              <div className="timerStyle1">
                <div className="timersubStyle">
                  <CountdownCircleTimer
                    isPlaying
                    duration={3}
                    size={150}
                    onComplete={() => this.onCompleteTimer()}
                    colors={[
                      ["#004777", 0.33],
                      ["#F7B801", 0.33],
                      ["#A30000", 0.33],
                    ]}>
                    {({ remainingTime }) => remainingTime}
                  </CountdownCircleTimer>
                </div>
              </div>
            )}
          </div>

          <div className="App2">
            <>
              {this.state.showPlayer ? (
                <div className="player">

                  <video id="player" width={500} height={500}></video>

                </div>
              ) : null}
              {this.state.showPlayer && (
                <div className="Button">
                  <Button
                    className="startRecord"
                    disabled={
                      this.state.url && this.state.showPlayer ? false : true
                    }
                    onClick={() => this.onClickStartRecord()}
                    variant="contained"
                    color="primary"
                  >
                    {this.state.playMedia
                      ? "Stop Recording"
                      : "Start Recording"}
                  </Button>

                  <Button
                    className="startRecord"
                    onClick={this.onExportJson}
                    // disabled={
                    //   Object.keys(this.current_result).length > 0 ? false : true
                    // }
                    variant="contained"
                    color="primary"
                  >
                    Export to JSON
                  </Button>
                  <Button
                    className="startRecord"
                    onClick={() => window.location.reload()}
                    variant="contained"
                    color="primary"
                  >
                    Upload new file
                  </Button>
                </div>
              )}
            </>
          </div>
          {this.state.showPlayer && (
            <div className="buttonStyle">
              {this.state.showPlayer && (
                <TextareaAutosize
                  rowsMax={6}
                  rowsMin={6}
                  className="textareastyle"
                  aria-label="maximum height"
                  placeholder="Enter text here"
                  disabled={this.state.playMedia ? false : true}
                  onChange={(e) => this.makeResult(e)}
                  onKeyPress={(event) => {
                    var code = event.keyCode || event.which;
                    if (code === 13) {
                      this.onEnterPress();
                      //13 is the enter keycode
                    }
                  }}
                  ref={(input) => {
                    if (this.state.showTimer == false) {
                      input && input.focus();
                    }
                  }}
                />
              )}

            </div>
          )}
          {this.state.showFirstTimer && (
            <div className="timerStyle">
              <div className="timersubStyle1">
                <CountdownCircleTimer
                  isPlaying
                  duration={3}
                  size={150}
                  onComplete={() => this.onCompleteTimer("first")}
                  colors={[
                    ["#004777", 0.33],
                    ["#F7B801", 0.33],
                    ["#A30000", 0.33],
                  ]}
                >
                  {({ remainingTime }) => remainingTime}
                </CountdownCircleTimer>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
