import { Component } from '@angular/core';
import {AlertController, Platform} from 'ionic-angular';
import {Camera, CameraOptions} from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import {CaptureVideoOptions, MediaCapture} from "@ionic-native/media-capture";

declare const VideoEditor: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  progression: number;

  compressionError: boolean;
  compressionErrorText: string;

  constructor(private camera: Camera, private platform: Platform,
              private file: File, private mediaCapture: MediaCapture, private alertCtrl: AlertController) {}

  videoFromGalery() {
      const camOptions: CameraOptions = {
        quality: 50,
        allowEdit: true,
        mediaType: 1,
        destinationType: 1,
        sourceType: 0,
        saveToPhotoAlbum: false
      };

      this.camera.getPicture(camOptions).then((videoData) => {

        let videoPath = 'file://'+videoData;
        /*videoPath = videoPath.substring(0, videoPath.lastIndexOf("/") + 1);*/
        let fileName = videoData.split('/').pop();

        /*console.log(videoPath + ' || ' + fileName);
        this.toBase64(videoPath, fileName);*/

        this.skunk(videoPath, fileName);

           }, (err) => {
        // Handle error for galerie fetch
        console.log(err);
      });
    }

  videoFromCamera() {
    const camOptions: CaptureVideoOptions = {
      quality: 50,
      duration: 10
    };

    this.mediaCapture.captureVideo(camOptions).then((videoData) => {

      let fileName = videoData[0].fullPath.split('/').pop();
      this.skunk(videoData[0].fullPath, fileName);

    }).catch((e) => {
      console.log(e);
    });
  }

  skunk(fullPath, fileName) {

    this.platform.ready().then(() => {

      this.progression = 0;
      let me = this;

      VideoEditor.transcodeVideo(
        videoTranscodeSuccess,
        videoTranscodeError,
        {
          fileUri: fullPath, // the path to the video on the device
          outputFileName: 'compressed'+fileName, // the file name for the transcoded video
          outputFileType: 1, // android is always mp4
          optimizeForNetworkUse: 1, // ios only
          saveToLibrary: false, // optional, defaults to true
          deleteInputFile: false, // optional (android only), defaults to false
          maintainAspectRatio: true, // optional (ios only), defaults to true
          width: 640, // optional, see note below on width and height
          height: 640, // optional, see notes below on width and height
          videoBitrate: 1000000, // optional, bitrate in bits, defaults to 1 megabit (1000000)
          fps: 24, // optional (android only), defaults to 24
          audioChannels: 2, // optional (ios only), number of audio channels, defaults to 2
          audioSampleRate: 44100, // optional (ios only), sample rate for the audio, defaults to 44100
          audioBitrate: 128000, // optional (ios only), audio bitrate for the video in bits, defaults to 128 kilobits (128000)
          progress: function(info) {
            console.log('transcodeVideo progress callback, info: ' + info);
            console.log('no');
            me.setProgression(info);
          } // info will be a number from 0 to 100
        }
      );

      function videoTranscodeSuccess(convertedFilePath) {
        // result is the path to the transcoded video on the device
        me.progression = 100;
        console.log('videoTranscodeSuccess, result: ' + convertedFilePath);
        convertedFilePath = 'file://'+convertedFilePath;
        let name = convertedFilePath.split('/').pop();
        convertedFilePath = convertedFilePath.substring(0, convertedFilePath.lastIndexOf("/") + 1);
         me.toBase64(convertedFilePath ,name);
      }

      function videoTranscodeError(err) {
        if (me.progression != 100)
        {
          me.compressionError = true;
          me.compressionErrorText = err;
        }
        console.log('videoTranscodeError, err: ' + err);
      }
    });
  }

  setProgression(progress) {
    console.log('yes');
    (progress > 0.2 && progress < 0.4) ? this.progression = 20 : 1==1;
    (progress > 0.4 && progress < 0.6) ? this.progression = 40 : 1==1;
    (progress > 0.6 && progress < 0.8) ? this.progression = 60 : 1==1;
    (progress > 0.8) ? this.progression = 80 : 1==1;
  }

  toBase64(path, fileName) {
    console.time('file64');
    this.file.readAsDataURL(path, fileName)
      .then(base64File => {
        console.log("here is encoded file :  ", base64File);
        console.timeEnd('file64');
      })
      .catch((e) => {
        console.log(e);
        console.timeEnd('file64');
      });
  }

  videoRadioAlert() {
    let me = this;
      let alert = me.alertCtrl.create();
      alert.setTitle('Redirection');

      alert.addInput({
        type: 'radio',
        label: 'Camera',
        value: 'camera'
      });

      alert.addInput({
        type: 'radio',
        label: 'Galery',
        value: 'galerie'
      });

      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: (data: string) => {
          data == 'camera' ? me.videoFromCamera() : me.videoFromGalery();
        }
      });
      alert.present().catch((error) => {
        console.error(error);
      });
  }

}
